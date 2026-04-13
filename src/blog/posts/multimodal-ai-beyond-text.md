---
title: "Multimodal AI: Beyond Text"
date: 2026-04-13
author: Sai Sridhar Tarra
category: Deep Learning
tags: [Multimodal, Vision-Language Models, CLIP, Embeddings, LLMs, PyTorch]
featured: true
excerpt: Language models read. But humans see, hear, touch, and read simultaneously. Multimodal AI closes that gap — and the architecture behind it is more elegant than you'd expect.
---

# Multimodal AI: Beyond Text

For the first decade of deep learning's modern era, the field operated in silos. Vision researchers built CNNs. NLP researchers built transformers. Audio researchers built WaveNets. Each modality had its own architectures, its own datasets, its own benchmarks.

Then something shifted. Models started crossing the boundaries. GPT-4V could look at a chart and answer questions about it. Whisper could transcribe speech from any language. DALL-E 3 could take a sentence and generate a photorealistic image. Gemini could watch a video and write an essay about it.

The unifying insight: **all modalities can be mapped into a shared embedding space, and from there, the same transformer machinery takes over.**

This post goes deep on how that works — the architecture, the training objectives, and the engineering tradeoffs.

---

## What Does "Multimodal" Actually Mean?

A multimodal model takes inputs from more than one modality (text, images, audio, video, code, sensor data) and either:

1. **Generates** outputs in one or more modalities, or
2. **Reasons** across modalities in a shared representation

The critical distinction is between **late fusion** (process each modality separately, combine at the end) and **early fusion** (convert everything to tokens first, then process jointly). Modern multimodal systems overwhelmingly use early fusion via **tokenization**.

---

## The Core Trick: Everything Becomes Tokens

The transformer doesn't care what its inputs are — it processes sequences of vectors. The insight that unlocked multimodal AI is: **you can encode any modality as a sequence of embeddings, and the transformer treats them identically to text tokens**.

For an image:
- Split into a grid of `16x16` patches
- Flatten each patch into a vector
- Project through a linear layer to get patch embeddings

For audio:
- Convert to a mel spectrogram
- Split into frames
- Project frames to embeddings

For text:
- Tokenize with BPE
- Look up token embeddings

After this encoding step, the model sees a flat sequence of vectors — and has no fundamental reason to treat "a patch from an image" differently from "a word from a sentence."

---

## CLIP: The Architecture That Started It All

The model that made multimodal AI click for the field was **CLIP** (Contrastive Language–Image Pre-Training) from OpenAI in 2021.

CLIP's setup is deceptively simple:

1. A **vision encoder** (ViT or ResNet) maps images → embedding vectors
2. A **text encoder** (transformer) maps captions → embedding vectors
3. Train on 400M `(image, caption)` pairs from the internet
4. **Objective**: maximize similarity between matched pairs, minimize it for unmatched pairs

The training loss is **InfoNCE** (a contrastive loss):

```python
import torch
import torch.nn.functional as F

def clip_loss(image_embeddings, text_embeddings, temperature=0.07):
    """
    image_embeddings: (batch_size, embed_dim) — L2-normalized
    text_embeddings:  (batch_size, embed_dim) — L2-normalized
    """
    # Cosine similarity matrix: (batch_size, batch_size)
    logits = torch.matmul(image_embeddings, text_embeddings.T) / temperature

    # Each image's correct caption is on the diagonal
    labels = torch.arange(logits.shape[0], device=logits.device)

    # Symmetric: match image→text AND text→image
    loss_i2t = F.cross_entropy(logits, labels)
    loss_t2i = F.cross_entropy(logits.T, labels)

    return (loss_i2t + loss_t2i) / 2
```

After training, CLIP's embedding space has a remarkable property: **concepts cluster across modalities**. A photo of a dog, the word "dog," a sketch of a dog, and the caption "golden retriever playing fetch" all land near each other. The space is genuinely multimodal.

---

## Vision-Language Models: From CLIP to GPT-4V

CLIP tells you if an image and text match. But it can't reason, describe, or answer questions. The next step is connecting a vision encoder to a language model decoder.

The architecture has three parts:

```
Image → [Vision Encoder] → patch embeddings
                                  ↓
                          [Projection Layer]
                                  ↓
Text tokens → [LLM] ← visual tokens injected here
                  ↓
              Output tokens
```

The projection layer is crucial — it maps from the vision encoder's dimensionality to the LLM's embedding dimension, so visual tokens and text tokens live in the same space.

Here's a minimal implementation:

```python
import torch
import torch.nn as nn

class VisionLanguageModel(nn.Module):
    def __init__(self, vision_encoder, language_model, vision_dim: int, llm_dim: int):
        super().__init__()
        self.vision_encoder = vision_encoder
        self.language_model = language_model

        # Projects patch embeddings into the LLM's token space
        self.vision_projection = nn.Sequential(
            nn.Linear(vision_dim, llm_dim),
            nn.GELU(),
            nn.Linear(llm_dim, llm_dim),
        )

    def forward(self, images, input_ids, attention_mask=None):
        # 1. Encode image into patch embeddings
        # shape: (batch, num_patches, vision_dim)
        patch_embeddings = self.vision_encoder(images)

        # 2. Project to LLM token dimension
        # shape: (batch, num_patches, llm_dim)
        visual_tokens = self.vision_projection(patch_embeddings)

        # 3. Get text token embeddings
        text_embeddings = self.language_model.get_input_embeddings()(input_ids)

        # 4. Prepend visual tokens to text sequence
        # shape: (batch, num_patches + seq_len, llm_dim)
        combined = torch.cat([visual_tokens, text_embeddings], dim=1)

        # 5. Extend attention mask for visual tokens
        if attention_mask is not None:
            visual_mask = torch.ones(
                attention_mask.shape[0],
                visual_tokens.shape[1],
                device=attention_mask.device
            )
            attention_mask = torch.cat([visual_mask, attention_mask], dim=1)

        # 6. Forward through LLM
        return self.language_model(
            inputs_embeds=combined,
            attention_mask=attention_mask,
        )
```

This is essentially how LLaVA, InternVL, and many open-source VLMs work. GPT-4V and Gemini use more sophisticated variants, but the skeleton is the same.

---

## The Projection Layer: More Important Than It Looks

The vision projection isn't just a dimensional adapter — it's doing something conceptually significant: it's **translating between two different learned representations**.

The vision encoder has learned a representation optimized for visual recognition. The LLM has learned a representation optimized for language modeling. These are not the same space, even if they have the same dimension. The projection layer learns to bridge them — essentially teaching the LLM "when you see a vector that looks like this, it means the same thing as the text token that looks like that."

Different architectures handle this differently:

| Architecture | Projection Type | Notes |
|---|---|---|
| LLaVA-1.5 | Single linear layer | Surprisingly effective |
| InternVL | MLP with LayerNorm | Better for complex reasoning |
| Flamingo | Cross-attention layers | Visual tokens attend into LLM layers |
| BLIP-2 | Q-Former (learned queries) | Compresses many patches to few tokens |

The **Q-Former** in BLIP-2 is particularly clever: instead of passing all 256 patch tokens to the LLM (expensive), it uses a small set of 32 learned "query" vectors that attend to the patch tokens and summarize them. This reduces the visual token count significantly while retaining most of the information.

---

## Image Generation: The Other Direction

So far we've covered vision-to-language. The other direction — text-to-image — uses a different paradigm.

Modern text-to-image systems like **Stable Diffusion** and **DALL-E 3** are **diffusion models**: they learn to iteratively denoise random Gaussian noise into structured images, conditioned on a text prompt.

The conditioning mechanism is **cross-attention**:

```python
class CrossAttentionBlock(nn.Module):
    def __init__(self, query_dim: int, context_dim: int, num_heads: int):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = query_dim // num_heads

        # Queries come from the image (noisy latent)
        self.to_q = nn.Linear(query_dim, query_dim, bias=False)
        # Keys and values come from the text (CLIP embeddings)
        self.to_k = nn.Linear(context_dim, query_dim, bias=False)
        self.to_v = nn.Linear(context_dim, query_dim, bias=False)
        self.to_out = nn.Linear(query_dim, query_dim)

    def forward(self, x, context):
        """
        x:       (batch, spatial_tokens, query_dim)  — noisy image features
        context: (batch, text_tokens,   context_dim) — text embeddings
        """
        B, N, C = x.shape

        Q = self.to_q(x).view(B, N, self.num_heads, self.head_dim).transpose(1, 2)
        K = self.to_k(context).view(B, -1, self.num_heads, self.head_dim).transpose(1, 2)
        V = self.to_v(context).view(B, -1, self.num_heads, self.head_dim).transpose(1, 2)

        scale = self.head_dim ** -0.5
        attn = torch.softmax((Q @ K.transpose(-2, -1)) * scale, dim=-1)
        out = (attn @ V).transpose(1, 2).reshape(B, N, C)
        return self.to_out(out)
```

During denoising, image features "attend" to text token embeddings — allowing the text to directly steer which spatial regions get which content. Every spatial patch in the image can look at every word in the prompt and decide how much that word influences its generation.

---

## Audio: The Forgotten Modality

Audio gets less attention than vision-language, but it's just as important for real-world AI agents.

**Whisper** (OpenAI, 2022) shows the clean version: convert audio to a log-mel spectrogram, split into 30-second chunks, encode with a CNN + transformer encoder, decode with a transformer decoder that outputs text tokens. It's a standard sequence-to-sequence transformer — the only multimodal engineering is the spectrogram frontend.

**AudioPaLM** (Google, 2023) goes further: it merges a speech model (SoundStream tokens) with a language model (PaLM 2), enabling the model to both understand and generate speech *without any text intermediary*. Speech tokens and text tokens are drawn from the same vocabulary; the LLM learns to handle both.

The audio frontend that enables this:

```python
import torchaudio
import torchaudio.transforms as T

def audio_to_tokens(waveform, sample_rate=16000, n_mels=80, hop_length=160):
    """
    Convert raw audio waveform to mel spectrogram patches.
    Returns: (time_frames, n_mels) — each row is one time step
    """
    # Resample to 16kHz if needed
    if sample_rate != 16000:
        resampler = T.Resample(sample_rate, 16000)
        waveform = resampler(waveform)

    mel_transform = T.MelSpectrogram(
        sample_rate=16000,
        n_fft=400,
        hop_length=hop_length,
        n_mels=n_mels,
        normalized=True,
    )

    # (channels, n_mels, time) → (time, n_mels)
    mel = mel_transform(waveform).squeeze(0).T

    # Log-scale compression
    mel = torch.log(mel.clamp(min=1e-5))
    return mel
```

The mel spectrogram is then projected into the transformer's embedding space just like image patches — the same pattern all the way down.

---

## The Hard Problems

Building a multimodal model that actually works is harder than stitching together encoders. A few real challenges:

**1. Modality alignment at scale**
CLIP works because it has 400M pairs. Most modality combinations (video + audio + text, for example) don't have internet-scale paired datasets. You either use synthetic data, weak supervision, or accept degraded alignment.

**2. Visual hallucination**
VLMs regularly describe things that aren't in an image. The LLM has strong priors from language pretraining and overrides weak visual signals. This is an active research problem — approaches include RLHF-style feedback on visual grounding and higher-resolution encoding.

**3. Resolution vs. efficiency**
More image patches = more context tokens = more compute. A 1024×1024 image at 16×16 patches gives 4096 tokens, already longer than many text prompts. Dynamic resolution strategies (process at multiple scales, crop intelligently) are now standard in production VLMs.

**4. Interleaved multimodal generation**
Generating text that contains images (like a diagram in a document) requires the LLM to decide *when* to emit a visual token vs. a text token. This needs careful vocabulary design — image tokens need to be first-class citizens in the output vocabulary, not an afterthought.

---

## What's Next: Native Multimodality

First-generation multimodal models bolt a vision encoder onto a pretrained LLM. The limitation: the LLM's representations were built for text; visual tokens are guests in a text-native space.

The next generation trains from scratch on interleaved multimodal data — text, images, audio, video all mixed together from day one. **Gemini 1.5** is the clearest example: trained natively multimodal, with a 1M token context window that can hold hours of video.

The emerging belief is that native multimodality produces better representations in all modalities — the visual processing benefits from language structure, and language grounding benefits from perceptual anchoring. Perception and language, it turns out, are not separate modules. They co-constitute each other.

That's not just an architecture claim. It's a hypothesis about intelligence.

---

## Key Takeaways

1. **Tokenization is the universal interface** — any modality can become a sequence of embedding vectors, and the transformer takes it from there.

2. **Contrastive learning (CLIP-style) builds the bridge** — shared embedding spaces emerge from learning to align representations across modalities at scale.

3. **The projection layer is load-bearing** — it's not just a dimension adapter; it's the learned translation between two representation worlds.

4. **Cross-attention is how conditioning works** — in diffusion models, in Flamingo, in audio-conditioned generation, the structural answer is the same: query one modality while attending to the other.

5. **Native multimodal training > bolt-on** — the next generation doesn't add vision to language; it learns both simultaneously.

---

## Further Reading

### Foundational Papers

- **[Learning Transferable Visual Models From Natural Language Supervision (CLIP)](https://arxiv.org/abs/2103.00020)** — Radford et al., OpenAI (2021)
  The paper that made vision-language alignment practical at scale. The zero-shot evaluation results still hold up as one of the cleanest demonstrations in the field.

- **[An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (ViT)](https://arxiv.org/abs/2010.11929)** — Dosovitskiy et al., Google (2020)
  The patch-based image tokenization approach that enabled CLIP and every modern VLM. Pure transformers, no convolutions.

- **[Flamingo: a Visual Language Model for Few-Shot Learning](https://arxiv.org/abs/2204.14198)** — Alayrac et al., DeepMind (2022)
  Introduced cross-attention as the fusion mechanism between a frozen vision encoder and a frozen LLM. Hugely influential architecture.

### Vision-Language Models

- **[BLIP-2: Bootstrapping Language-Image Pre-training with Frozen Image Encoders and LLMs](https://arxiv.org/abs/2301.12597)** — Li et al., Salesforce (2023)
  The Q-Former architecture — a lightweight querying transformer that compresses visual patches before feeding them to the LLM. Very efficient.

- **[Visual Instruction Tuning (LLaVA)](https://arxiv.org/abs/2304.08485)** — Liu et al. (2023)
  Used GPT-4 to generate instruction-tuning data for visual question answering, showing that data quality > model complexity. LLaVA-1.5 is still a strong open-source baseline.

- **[InternVL: Scaling up Vision Foundation Models and Aligning for Generic Visual-Linguistic Tasks](https://arxiv.org/abs/2312.14238)** — Chen et al. (2023)
  State-of-the-art open-source VLM family. InternVL2 series outperforms many proprietary models on standard benchmarks.

### Image Generation

- **[Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239)** — Ho et al. (2020)
  The paper that made diffusion models the standard for generative image modeling. Mathematically dense but worth the investment.

- **[High-Resolution Image Synthesis with Latent Diffusion Models (Stable Diffusion)](https://arxiv.org/abs/2112.10752)** — Rombach et al. (2022)
  Moves diffusion to a compressed latent space, making generation tractable on consumer hardware. The architecture behind most open-source image generation.

### Audio

- **[Robust Speech Recognition via Large-Scale Weak Supervision (Whisper)](https://arxiv.org/abs/2212.04356)** — Radford et al., OpenAI (2022)
  Demonstrates that large-scale weakly supervised pretraining on internet audio produces remarkably robust ASR. The mel spectrogram + seq2seq transformer pipeline is clean and worth studying.

- **[AudioPaLM: A Large Language Model That Can Speak and Listen](https://arxiv.org/abs/2306.12925)** — Google (2023)
  Merges speech tokens into the PaLM 2 vocabulary. Shows that you can have one model that natively understands and produces both speech and text.

### Native Multimodal

- **[Gemini: A Family of Highly Capable Multimodal Models](https://arxiv.org/abs/2312.11805)** — Google DeepMind (2023)
  The clearest current example of native multimodal architecture at scale. The 1M context window results with video are particularly striking.

- **[Unified-IO: A Unified Model for Vision, Language, and Beyond](https://arxiv.org/abs/2206.08916)** — Lu et al. (2022)
  Early attempt at a single model that handles all modalities as sequences. Good intuition-builder for where the field is heading.

---

*Every few years, AI researchers tear down the walls between modalities and discover the wall was never load-bearing. Text and images, speech and language, video and reasoning — they were always one problem. We just didn't have the architecture to see it.*
