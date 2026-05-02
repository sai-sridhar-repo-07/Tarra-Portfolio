---
title: "KV Cache Compression: How LLMs Handle Million-Token Contexts Without Running Out of Memory"
date: 2026-05-02
author: Sai Sridhar Tarra
category: Deep Learning
tags: [KV Cache, Attention, LLMs, Memory Optimization, GQA, Quantization, Long Context, PyTorch]
featured: true
excerpt: Every token you generate costs memory — permanently. At 1M token contexts, the KV cache alone can consume 100GB+ of VRAM. Here's how modern LLMs compress it without losing what matters.
---

# KV Cache Compression: How LLMs Handle Million-Token Contexts Without Running Out of Memory

Gemini 1.5 has a 1M token context window. Claude 3.5 handles 200K. GPT-4 Turbo runs 128K. These numbers sound like marketing — until you realize what they actually require in memory.

Every token the model processes stores two vectors in memory: a **key** and a **value** for every attention head in every layer. These stay resident in GPU VRAM for the entire generation. With a 70B model running at 128K context, the KV cache alone consumes **over 100GB of VRAM** — more than most GPU clusters have available.

Long context isn't free. It's a memory engineering problem. And the techniques that solve it — GQA, quantization, eviction policies, sparse attention — are what make modern LLMs practically deployable.

This post goes deep on the KV cache: what it is, why it explodes, and every major compression technique with working implementations.

---

## What Is the KV Cache?

During autoregressive generation, a transformer computes attention for each new token against all previous tokens. Without caching, you'd recompute the keys and values for every prior token at every step — O(n²) compute for an n-token sequence.

The KV cache stores those key and value projections so they never need to be recomputed:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class AttentionWithKVCache(nn.Module):
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model, bias=False)
        self.W_k = nn.Linear(d_model, d_model, bias=False)
        self.W_v = nn.Linear(d_model, d_model, bias=False)
        self.W_o = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x, kv_cache: dict | None = None):
        B, T, C = x.shape

        Q = self.W_q(x).view(B, T, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(B, T, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(B, T, self.num_heads, self.d_k).transpose(1, 2)

        # Append to cache if it exists, create it if not
        if kv_cache is not None:
            if "K" in kv_cache:
                K = torch.cat([kv_cache["K"], K], dim=2)  # concat along seq dim
                V = torch.cat([kv_cache["V"], V], dim=2)
            kv_cache["K"] = K
            kv_cache["V"] = V

        scale = self.d_k ** -0.5
        scores = torch.matmul(Q, K.transpose(-2, -1)) * scale
        weights = F.softmax(scores, dim=-1)
        out = torch.matmul(weights, V)

        out = out.transpose(1, 2).contiguous().view(B, -1, self.num_heads * self.d_k)
        return self.W_o(out), kv_cache
```

**The memory cost:** each cached token stores `2 × num_layers × num_heads × head_dim` floats. For Llama 3 70B (fp16):

```
2 × 80 layers × 64 heads × 128 head_dim × 2 bytes = 2,621,440 bytes ≈ 2.5 MB per token
```

At 128K tokens: **320 GB**. The model weights themselves are only ~140GB. The KV cache is the dominant memory consumer at long context.

---

## Technique 1: Multi-Query Attention (MQA)

The bluntest fix: all query heads share **one** set of keys and values. Instead of `num_heads` K/V projections, you have exactly one.

```python
class MultiQueryAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model, bias=False)        # full
        self.W_k = nn.Linear(d_model, self.d_k, bias=False)       # single head
        self.W_v = nn.Linear(d_model, self.d_k, bias=False)       # single head
        self.W_o = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x, kv_cache: dict | None = None):
        B, T, _ = x.shape

        # Full query: (B, heads, T, d_k)
        Q = self.W_q(x).view(B, T, self.num_heads, self.d_k).transpose(1, 2)

        # Single K and V: (B, 1, T, d_k)
        K = self.W_k(x).unsqueeze(1)
        V = self.W_v(x).unsqueeze(1)

        if kv_cache is not None:
            if "K" in kv_cache:
                K = torch.cat([kv_cache["K"], K], dim=2)
                V = torch.cat([kv_cache["V"], V], dim=2)
            kv_cache["K"] = K
            kv_cache["V"] = V

        # Broadcast single K/V across all query heads
        K = K.expand(-1, self.num_heads, -1, -1)
        V = V.expand(-1, self.num_heads, -1, -1)

        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        out = torch.matmul(F.softmax(scores, dim=-1), V)
        out = out.transpose(1, 2).contiguous().view(B, T, -1)
        return self.W_o(out), kv_cache
```

**Memory reduction:** `num_heads`× — a 64-head model goes from 64 K/V pairs to 1. Cache shrinks from 320GB to 5GB at 128K context for Llama 70B.

**Cost:** measurable quality degradation. MQA forces all heads to share the same key/value representation, which hurts tasks requiring different heads to attend to different information simultaneously.

Used by: **PaLM**, **Falcon**, **StarCoder**.

---

## Technique 2: Grouped Query Attention (GQA)

GQA is the middle ground — instead of one K/V group (MQA) or `num_heads` groups (standard), you have `num_groups` K/V groups. Each group serves `num_heads / num_groups` query heads.

```python
class GroupedQueryAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int, num_kv_heads: int):
        super().__init__()
        assert num_heads % num_kv_heads == 0
        self.num_heads = num_heads
        self.num_kv_heads = num_kv_heads
        self.num_queries_per_kv = num_heads // num_kv_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, num_heads * self.d_k, bias=False)
        self.W_k = nn.Linear(d_model, num_kv_heads * self.d_k, bias=False)
        self.W_v = nn.Linear(d_model, num_kv_heads * self.d_k, bias=False)
        self.W_o = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x, kv_cache: dict | None = None):
        B, T, _ = x.shape

        Q = self.W_q(x).view(B, T, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(B, T, self.num_kv_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(B, T, self.num_kv_heads, self.d_k).transpose(1, 2)

        if kv_cache is not None:
            if "K" in kv_cache:
                K = torch.cat([kv_cache["K"], K], dim=2)
                V = torch.cat([kv_cache["V"], V], dim=2)
            kv_cache["K"] = K
            kv_cache["V"] = V

        # Repeat each KV group for its assigned query heads
        K = K.repeat_interleave(self.num_queries_per_kv, dim=1)
        V = V.repeat_interleave(self.num_queries_per_kv, dim=1)

        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        out = torch.matmul(F.softmax(scores, dim=-1), V)
        out = out.transpose(1, 2).contiguous().view(B, T, -1)
        return self.W_o(out), kv_cache
```

**Real-world numbers (Llama 3 70B):**
- Standard MHA: 64 KV heads → 320GB at 128K context
- GQA with 8 KV heads: 8 KV heads → 40GB at 128K context (**8× reduction**)
- Quality loss vs MHA: minimal — GQA matches MHA on most benchmarks

Used by: **Llama 2/3**, **Mistral**, **Gemma**, **Falcon 180B**, virtually every modern open-source LLM.

**GQA is now the default.** If you're building a transformer from scratch today, use GQA.

---

## Technique 3: KV Cache Quantization

Keys and values are stored in fp16 by default (2 bytes per value). Quantizing them to int8 or int4 halves or quarters the memory with minimal accuracy impact.

```python
import torch

class QuantizedKVCache:
    def __init__(self, bits: int = 8):
        self.bits = bits
        self.cache_k: list[torch.Tensor] = []
        self.cache_v: list[torch.Tensor] = []
        self.scales_k: list[torch.Tensor] = []
        self.scales_v: list[torch.Tensor] = []

    def _quantize(self, x: torch.Tensor):
        """Per-token symmetric quantization."""
        # x: (batch, heads, seq, d_k)
        max_val = x.abs().amax(dim=-1, keepdim=True).clamp(min=1e-8)
        scale = max_val / (2 ** (self.bits - 1) - 1)

        if self.bits == 8:
            x_q = (x / scale).round().clamp(-128, 127).to(torch.int8)
        else:  # 4-bit: pack two values per byte in practice; simplified here
            x_q = (x / scale).round().clamp(-8, 7).to(torch.int8)

        return x_q, scale

    def _dequantize(self, x_q: torch.Tensor, scale: torch.Tensor):
        return x_q.float() * scale

    def append(self, K: torch.Tensor, V: torch.Tensor):
        K_q, scale_k = self._quantize(K)
        V_q, scale_v = self._quantize(V)

        self.cache_k.append(K_q)
        self.cache_v.append(V_q)
        self.scales_k.append(scale_k)
        self.scales_v.append(scale_v)

    def get(self):
        """Dequantize and return full cache."""
        K = torch.cat([
            self._dequantize(k, s)
            for k, s in zip(self.cache_k, self.scales_k)
        ], dim=2)
        V = torch.cat([
            self._dequantize(v, s)
            for v, s in zip(self.cache_v, self.scales_v)
        ], dim=2)
        return K, V

    @property
    def memory_bytes(self):
        total = sum(k.numel() for k in self.cache_k)
        total += sum(v.numel() for v in self.cache_v)
        bytes_per_el = self.bits // 8
        return total * bytes_per_el
```

**Memory savings vs fp16:**

| Precision | Bytes/value | Reduction |
|---|---|---|
| fp16 (baseline) | 2 | 1× |
| int8 | 1 | 2× |
| int4 | 0.5 | 4× |
| int2 | 0.25 | 8× |

**KVQuant** (2024) goes further — uses non-uniform quantization (NUQ) where the quantization grid is calibrated per-channel rather than uniform, matching fp16 perplexity at 2-bit precision.

Used by: **TurboQuant**, **KVQuant**, **LLM.int8()** for cache, **vLLM** (int8 KV), **llama.cpp**.

---

## Technique 4: Token Eviction — H2O

Not all tokens matter equally for future generation. **H2O** (Heavy-Hitter Oracle) tracks which tokens receive high cumulative attention scores — "heavy hitters" — and evicts the rest when the cache exceeds budget.

```python
import torch

class H2OKVCache:
    def __init__(self, max_cache_size: int, num_heads: int, d_k: int):
        self.max_cache_size = max_cache_size
        self.num_heads = num_heads
        self.d_k = d_k

        self.K: torch.Tensor | None = None
        self.V: torch.Tensor | None = None
        # Cumulative attention score per token per head
        self.attention_scores: torch.Tensor | None = None

    def update(self, K_new: torch.Tensor, V_new: torch.Tensor, attn_weights: torch.Tensor):
        """
        K_new:       (batch, heads, 1, d_k)       — new token's key
        V_new:       (batch, heads, 1, d_k)       — new token's value
        attn_weights:(batch, heads, 1, cache_len) — attention over cached tokens
        """
        if self.K is None:
            self.K = K_new
            self.V = V_new
            self.attention_scores = torch.zeros(
                K_new.shape[0], self.num_heads, 1, device=K_new.device
            )
            return

        # Accumulate importance: how much each cached token was attended to
        self.attention_scores += attn_weights.sum(dim=2, keepdim=True).transpose(2, 3)

        # Append new token
        self.K = torch.cat([self.K, K_new], dim=2)
        self.V = torch.cat([self.V, V_new], dim=2)
        new_score = torch.zeros(K_new.shape[0], self.num_heads, 1, device=K_new.device)
        self.attention_scores = torch.cat([self.attention_scores, new_score], dim=2)

        # Evict if over budget
        if self.K.shape[2] > self.max_cache_size:
            self._evict()

    def _evict(self):
        """Keep top-k tokens by cumulative attention score."""
        seq_len = self.K.shape[2]
        keep = self.max_cache_size

        # Average importance across heads
        importance = self.attention_scores.mean(dim=1).squeeze(1)  # (batch, seq)

        # Always keep the most recent token (recency bias)
        # + top (keep-1) by importance among earlier tokens
        recent_idx = seq_len - 1
        scores_no_recent = importance.clone()
        scores_no_recent[:, recent_idx] = float('-inf')

        _, top_indices = scores_no_recent.topk(keep - 1, dim=-1)
        keep_indices = torch.cat([
            top_indices,
            torch.tensor([[recent_idx]], device=top_indices.device).expand(top_indices.shape[0], -1)
        ], dim=-1)
        keep_indices, _ = keep_indices.sort(dim=-1)

        # Gather kept tokens
        idx = keep_indices.unsqueeze(1).unsqueeze(-1).expand(-1, self.num_heads, -1, self.d_k)
        self.K = torch.gather(self.K, 2, idx)
        self.V = torch.gather(self.V, 2, idx)
        self.attention_scores = torch.gather(
            self.attention_scores, 2,
            keep_indices.unsqueeze(1).expand(-1, self.num_heads, -1)
        )
```

**H2O results:** 20× cache compression with <1% accuracy degradation on most benchmarks. The insight — 80% of attention mass concentrates on <5% of tokens (the "heavy hitters").

---

## Technique 5: Sliding Window + Attention Sink (StreamingLLM)

**StreamingLLM** (2023) observed two things:
1. Most attention is local — recent tokens matter most
2. The first few tokens (position 0, 1, 2...) always get high attention regardless of content — **attention sinks**

This lets you run infinite-length generation with a fixed-size cache:

```python
class StreamingKVCache:
    def __init__(self, sink_size: int = 4, window_size: int = 1020):
        """
        sink_size:   number of initial tokens to always keep (attention sinks)
        window_size: rolling window of recent tokens to keep
        Total cache = sink_size + window_size
        """
        self.sink_size = sink_size
        self.window_size = window_size

        self.sink_K: torch.Tensor | None = None
        self.sink_V: torch.Tensor | None = None
        self.window_K: torch.Tensor | None = None
        self.window_V: torch.Tensor | None = None

    def update(self, K_new: torch.Tensor, V_new: torch.Tensor):
        # Fill sink first
        if self.sink_K is None:
            self.sink_K = K_new
            self.sink_V = V_new
            return self.get()

        if self.sink_K.shape[2] < self.sink_size:
            self.sink_K = torch.cat([self.sink_K, K_new], dim=2)
            self.sink_V = torch.cat([self.sink_V, V_new], dim=2)
            return self.get()

        # Sink full — append to rolling window
        if self.window_K is None:
            self.window_K = K_new
            self.window_V = V_new
        else:
            self.window_K = torch.cat([self.window_K, K_new], dim=2)
            self.window_V = torch.cat([self.window_V, V_new], dim=2)

            # Evict oldest window token if over budget
            if self.window_K.shape[2] > self.window_size:
                self.window_K = self.window_K[:, :, 1:, :]
                self.window_V = self.window_V[:, :, 1:, :]

        return self.get()

    def get(self):
        if self.window_K is None:
            return self.sink_K, self.sink_V
        return (
            torch.cat([self.sink_K, self.window_K], dim=2),
            torch.cat([self.sink_V, self.window_V], dim=2),
        )
```

**Why attention sinks exist:** the model learned during training to dump "nowhere to attend" probability mass onto early tokens. They act as soft no-ops. Removing them corrupts the attention distribution even for unrelated later tokens — hence keeping them is critical.

**StreamingLLM result:** infinite-length generation at constant memory. Llama 2 running on 4M token documents with a 1024-token cache, 22.2× memory reduction.

Used by: **Mistral** (sliding window attention), **Gemma**, **Longformer**.

---

## Technique 6: SnapKV — Compress at Prompt Ingestion

H2O evicts during generation. **SnapKV** (2024) takes a different approach: compress the KV cache **before** generation starts, at prompt ingestion time.

The key observation: attention patterns during the prefill (reading the prompt) predict which tokens will matter during decoding. SnapKV clusters tokens by their attention profile and keeps only representative tokens from each cluster.

```python
import torch
import torch.nn.functional as F

def snapkv_compress(K: torch.Tensor, V: torch.Tensor,
                    attn_weights: torch.Tensor,
                    compression_ratio: float = 0.3):
    """
    Compress KV cache after prefill using attention-guided clustering.

    K, V:         (batch, heads, seq_len, d_k)
    attn_weights: (batch, heads, seq_len, seq_len) — prefill attention matrix
    compression_ratio: fraction of tokens to keep
    """
    B, H, S, d_k = K.shape
    keep_count = max(1, int(S * compression_ratio))

    # Importance = column sum of attention weights
    # Tokens attended to by many other tokens = important
    importance = attn_weights.sum(dim=2)  # (B, H, S)

    # Average importance across heads
    avg_importance = importance.mean(dim=1)  # (B, S)

    # Select top-k most important tokens
    _, top_indices = avg_importance.topk(keep_count, dim=-1)  # (B, keep_count)
    top_indices, _ = top_indices.sort(dim=-1)  # maintain order

    # Gather selected tokens
    idx = top_indices.unsqueeze(1).unsqueeze(-1).expand(B, H, -1, d_k)
    K_compressed = torch.gather(K, 2, idx)
    V_compressed = torch.gather(V, 2, idx)

    return K_compressed, V_compressed


# Usage during prefill:
# 1. Run full attention on prompt → get K, V, attn_weights
# 2. Compress: K_small, V_small = snapkv_compress(K, V, attn_weights, 0.3)
# 3. Use K_small, V_small as starting cache for generation
```

**SnapKV results:** 3.6× cache size reduction, 3.8× generation speedup, <1% accuracy drop on LongBench. Works especially well for RAG and long-document QA where most of the prompt is context.

---

## The Full Picture: Combining Techniques

Production systems stack these:

```
GQA                    →  8× memory reduction (standard now)
    + INT8 quantization →  additional 2× reduction
    + H2O eviction      →  additional 5-20× reduction
    + Sliding window    →  bounded memory at infinite length
```

A practical serving stack for Llama 3 70B at 128K context:

| Technique | Cache Size |
|---|---|
| Baseline (MHA, fp16) | 320 GB |
| + GQA (8 KV heads) | 40 GB |
| + INT8 quantization | 20 GB |
| + H2O (20% budget) | 4 GB |

From 320GB to 4GB. Same model. Runs on a single A100.

---

## Why This Matters Beyond Memory

KV cache size isn't just a memory problem — it's a **latency** problem. Each generation step reads the entire KV cache from HBM (high-bandwidth memory). At 128K tokens:

- Cache read per step: ~40GB at fp16 (GQA 70B)
- A100 HBM bandwidth: 2 TB/s
- Time just to read cache: **20ms per token** → 50 tokens/second ceiling

Compress to 4GB with H2O + quantization → 1ms read → 1000 tokens/second ceiling. **20× latency improvement** from the same hardware.

This is why vLLM, TensorRT-LLM, and every production inference engine has invested heavily in KV cache management.

---

## Key Takeaways

1. **KV cache grows linearly with sequence length** — at long context it dominates VRAM, not model weights.

2. **GQA is table stakes** — every model built today uses it. 8× memory reduction with negligible quality loss.

3. **Quantization stacks on top of GQA** — INT8 adds 2× more. INT4 adds 4× more. KVQuant shows 2-bit is viable.

4. **Eviction policies (H2O, SnapKV) trade exact recall for budget** — valid because 80% of attention concentrates on <5% of tokens.

5. **Attention sinks are real** — first few tokens must be preserved regardless of content. Removing them breaks generation even at unrelated positions.

6. **The payoff is both memory and latency** — smaller cache = faster HBM reads = more tokens/second. Not just about fitting in VRAM.

---

## Further Reading

### KV Cache Fundamentals

- **[Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180)** — Kwon et al., UC Berkeley (2023)
  The vLLM paper. Introduces paged virtual memory for KV cache — eliminates fragmentation, enables dynamic batching. The production KV cache management standard.

- **[Fast Transformer Decoding: One Write-Head is All You Need (MQA)](https://arxiv.org/abs/1911.02150)** — Shazeer, Google (2019)
  Original MQA paper. Surprisingly readable. Shows that sharing KV heads barely hurts quality while massively reducing memory and improving decode speed.

- **[GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245)** — Ainslie et al., Google (2023)
  GQA paper. Shows how to convert existing MHA checkpoints to GQA via uptraining. The technique that made Llama 2 and Mistral practical.

### Quantization

- **[KVQuant: Towards 10 Million Context Length LLM Inference with KV Cache Quantization](https://arxiv.org/abs/2401.18079)** — Hooper et al., UC Berkeley (2024)
  Non-uniform quantization of KV cache. Per-channel calibration enables 2-bit KV with fp16-level perplexity. The paper that made INT2 cache viable.

- **[KIVI: A Tuning-Free Asymmetric 2-bit Quantization for KV Cache](https://arxiv.org/abs/2402.02750)** — Liu et al. (2024)
  Keys and values have different numerical distributions — quantize them differently. 2-bit KV cache with almost no accuracy loss.

### Eviction & Compression

- **[H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048)** — Zhang et al., Rice University (2023)
  The heavy-hitter insight: 20% of tokens get 80% of attention. Evict the rest. 20× compression with <1% accuracy drop on most tasks.

- **[SnapKV: LLM Knows What You are Looking for Before Generation](https://arxiv.org/abs/2404.14469)** — Li et al. (2024)
  Compress at prefill time using attention patterns. 3.6× compression, 3.8× speedup. Strong on long-context RAG tasks.

- **[Efficient Streaming Language Models with Attention Sinks (StreamingLLM)](https://arxiv.org/abs/2309.17453)** — Xiao et al., MIT (2023)
  Discovers attention sinks; shows that keeping just 4 sink tokens + recent window enables infinite-length generation. Clean and surprising result.

### Systems

- **[FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691)** — Dao (2023)
  The IO-aware attention algorithm that makes long-context attention practical. Reduces memory from O(n²) to O(n) by tiling computation to avoid materializing the full attention matrix.

- **[Sarathi-Serve: Efficient LLM Inference by Piggybacking Decodes with Chunked Prefills](https://arxiv.org/abs/2308.16369)** — Agrawal et al. (2023)
  Production serving paper showing how to pipeline prefill and decode efficiently when KV cache is bounded. The operational reality of long-context serving.

---

*The context window arms race isn't about model capability — it's about memory engineering. Every extra token you can fit in context at the same VRAM budget is a capability gain. The teams winning on long context aren't necessarily building smarter models. They're building smarter caches.*
