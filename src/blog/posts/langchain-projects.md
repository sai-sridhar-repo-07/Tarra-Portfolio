---
title: "LangChain Projects: From Hello World to Production AI Apps"
date: 2026-04-22
author: Sai Sridhar Tarra
category: AI Engineering
tags: [LangChain, RAG, Agents, LLMs, Python, ChromaDB, FAISS, OpenAI]
featured: true
excerpt: LangChain tutorials show you the basics. This post shows you the pattern behind every real AI app — chains, memory, retrieval, agents — with working code for 8 projects you can actually build and ship.
---

# LangChain Projects: From Hello World to Production AI Apps

Most LangChain tutorials end at "here's how to call an LLM with a prompt template." That's five lines of code. It's not an app.

Real AI apps do something harder: they remember previous conversations, search through documents, call external APIs, and chain multiple reasoning steps together. The gap between a chatbot demo and a product people use is exactly that gap — memory, retrieval, tools, and pipelines.

LangChain exists to close that gap. It's not magic — it's plumbing. And once you understand the plumbing, you can build almost anything.

This post covers the core LangChain primitives with real code, then walks through 8 projects that each teach a distinct pattern. By the end, you'll have the mental model to build any LLM app, not just the ones listed here.

---

## Setup

```bash
pip install langchain langchain-openai langchain-community chromadb faiss-cpu streamlit pypdf
```

Set your API key:

```bash
export OPENAI_API_KEY="sk-..."
```

---

## The Core Primitives

Before projects, understand the four building blocks everything composes from.

### 1. The Chain — Prompt → LLM → Output

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

prompt = ChatPromptTemplate.from_template(
    "Explain {topic} in simple terms. Give one concrete example."
)

# The pipe operator (|) wires prompt → model → parser
chain = prompt | llm | StrOutputParser()

response = chain.invoke({"topic": "vector embeddings"})
print(response)
```

`|` is LangChain's composition operator. Every component that accepts input and produces output can be piped. This is LCEL — LangChain Expression Language — and it's the backbone of everything that follows.

### 2. Memory — Conversations That Remember

Without memory, every message is a cold start. The LLM has no idea what you said three turns ago.

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

llm = ChatOpenAI(model="gpt-4o-mini")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

chain = prompt | llm | StrOutputParser()

# Session store: in production, swap for Redis or PostgreSQL
store: dict[str, InMemoryChatMessageHistory] = {}

def get_session_history(session_id: str) -> InMemoryChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

# Wrap chain with history management
chain_with_memory = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

config = {"configurable": {"session_id": "user_123"}}

print(chain_with_memory.invoke({"input": "My name is Sai."}, config=config))
print(chain_with_memory.invoke({"input": "What's my name?"}, config=config))
# → "Your name is Sai."
```

### 3. Retrieval — Search Before You Answer

RAG in four steps: load → split → embed → retrieve.

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

# Load
loader = PyPDFLoader("document.pdf")
pages = loader.load()

# Split
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(pages)

# Embed + store
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = FAISS.from_documents(chunks, embeddings)

# Retrieve
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
docs = retriever.invoke("What are the main findings?")
```

### 4. Agents — LLMs That Use Tools

An agent doesn't follow a fixed pipeline. It decides which tools to call based on the query.

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

@tool
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression. Input: a valid Python math expression."""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"Error: {e}"

@tool
def get_current_date() -> str:
    """Get today's date."""
    from datetime import date
    return str(date.today())

tools = [calculate, get_current_date]

llm = ChatOpenAI(model="gpt-4o", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Use tools when needed."),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({"input": "What is 2847 * 193? And what's today's date?"})
print(result["output"])
```

The agent decides on its own: "this needs calculation, call the tool; this needs the date, call the other tool." You don't hardcode the routing.

---

## 8 Projects — One Pattern Each

### Project 1: PDF Chatbot

**Pattern:** RAG + conversational memory over a document.

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

def build_pdf_chatbot(pdf_path: str):
    # Load and chunk the PDF
    loader = PyPDFLoader(pdf_path)
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(loader.load())

    # Build vector store
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = FAISS.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    prompt = ChatPromptTemplate.from_template("""
Answer the question using only the context below.
If the answer isn't in the context, say "I don't know based on this document."

Context:
{context}

Question: {question}
""")

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain

chatbot = build_pdf_chatbot("annual_report.pdf")
print(chatbot.invoke("What was the revenue in Q3?"))
```

**What you learn:** RAG pipeline end-to-end, context injection into prompts.

---

### Project 2: Resume Analyzer

**Pattern:** Structured output with Pydantic schemas.

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

class ResumeAnalysis(BaseModel):
    ats_score: int = Field(description="ATS compatibility score 0-100")
    strengths: list[str] = Field(description="Top 3 strengths")
    gaps: list[str] = Field(description="Top 3 gaps or missing skills")
    improvements: list[str] = Field(description="Specific actionable improvements")
    verdict: str = Field(description="One-sentence overall assessment")

llm = ChatOpenAI(model="gpt-4o", temperature=0)
structured_llm = llm.with_structured_output(ResumeAnalysis)

prompt = ChatPromptTemplate.from_template("""
Analyze this resume against the job description.
Be specific and critical — generic feedback is useless.

Job Description:
{job_description}

Resume:
{resume_text}
""")

chain = prompt | structured_llm

result = chain.invoke({
    "job_description": "Senior ML Engineer at a fintech startup...",
    "resume_text": "5 years experience in Python, PyTorch...",
})

print(f"ATS Score: {result.ats_score}/100")
print(f"Strengths: {result.strengths}")
print(f"Gaps: {result.gaps}")
print(f"Improvements: {result.improvements}")
```

**What you learn:** Structured output — getting JSON you can actually use from an LLM, not free-text you have to parse.

---

### Project 3: Customer Support Bot

**Pattern:** Knowledge base RAG + conversation history + fallback handling.

```python
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory

# Load all FAQ/policy docs from a folder
loader = DirectoryLoader("./knowledge_base/", glob="*.txt", loader_cls=TextLoader)
splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=40)
docs = splitter.split_documents(loader.load())

vectorstore = Chroma.from_documents(
    docs,
    OpenAIEmbeddings(model="text-embedding-3-small"),
    persist_directory="./chroma_db"
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a customer support agent for Acme Corp.
Answer only from the provided context. If unsure, offer to escalate to a human.
Be concise and friendly.

Context from knowledge base:
{context}"""),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

def get_context(input_dict):
    docs = retriever.invoke(input_dict["input"])
    return "\n\n".join(d.page_content for d in docs)

from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

chain = (
    RunnablePassthrough.assign(context=RunnableLambda(get_context))
    | prompt
    | llm
    | StrOutputParser()
)

store = {}
chain_with_memory = RunnableWithMessageHistory(
    chain,
    lambda sid: store.setdefault(sid, InMemoryChatMessageHistory()),
    input_messages_key="input",
    history_messages_key="history",
)
```

**What you learn:** Combining RAG and memory — the pattern behind every production support bot.

---

### Project 4: SQL Chatbot

**Pattern:** Text-to-SQL with schema awareness.

```python
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent

# Connect to your database
db = SQLDatabase.from_uri("sqlite:///sales.db")

llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Agent automatically inspects schema and writes SQL
agent = create_sql_agent(
    llm=llm,
    db=db,
    verbose=True,
    agent_type="openai-tools",
)

# Natural language → SQL → result → natural language answer
result = agent.invoke({
    "input": "Which product had the highest revenue last month, and how does it compare to the month before?"
})
print(result["output"])
```

Behind the scenes: the agent introspects your table schemas, writes a SQL query, executes it, interprets the result. No SQL knowledge required from the user.

**What you learn:** SQL agents, tool-calling agents, schema-aware reasoning.

---

### Project 5: Research Assistant

**Pattern:** Multi-step pipeline with web search + summarization + report generation.

```python
from langchain_openai import ChatOpenAI
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

search = DuckDuckGoSearchRun()
llm = ChatOpenAI(model="gpt-4o", temperature=0.3)

# Step 1: Search
def search_topic(topic: str, num_searches: int = 3) -> list[str]:
    queries = [
        f"{topic} latest research 2025",
        f"{topic} key findings experts",
        f"{topic} practical applications",
    ]
    return [search.run(q) for q in queries[:num_searches]]

# Step 2: Summarize each result
summarize_prompt = ChatPromptTemplate.from_template(
    "Summarize the key facts from this search result in 3 bullet points:\n\n{result}"
)
summarize_chain = summarize_prompt | llm | StrOutputParser()

# Step 3: Synthesize into a report
report_prompt = ChatPromptTemplate.from_template("""
Write a structured research report on: {topic}

Use these summaries as your sources:
{summaries}

Format: Executive Summary, Key Findings, Practical Implications, Open Questions.
Be specific. Cite facts from the summaries.
""")
report_chain = report_prompt | llm | StrOutputParser()

def research(topic: str) -> str:
    raw_results = search_topic(topic)
    summaries = [summarize_chain.invoke({"result": r}) for r in raw_results]
    combined = "\n\n---\n\n".join(summaries)
    return report_chain.invoke({"topic": topic, "summaries": combined})

print(research("mixture of experts in large language models"))
```

**What you learn:** Multi-step pipelines, chaining independent operations, web search integration.

---

### Project 6: YouTube Summarizer

**Pattern:** Transcript loading → chunked summarization → map-reduce.

```python
from langchain_community.document_loaders import YoutubeLoader
from langchain_openai import ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain
from langchain_core.prompts import PromptTemplate

def summarize_youtube(url: str) -> dict:
    # Load transcript
    loader = YoutubeLoader.from_youtube_url(url, add_video_info=True)
    docs = loader.load()

    # Split long transcripts
    splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    # Map prompt: summarize each chunk
    map_prompt = PromptTemplate.from_template(
        "Summarize this section of a video transcript. Extract key points and any code/technical details:\n\n{text}"
    )

    # Combine prompt: synthesize all chunk summaries
    combine_prompt = PromptTemplate.from_template("""
You have summaries of sections from a YouTube video.
Create a structured summary with:
- TL;DR (2 sentences max)
- Key Concepts (bullet points)
- Code/Tools Mentioned
- Main Takeaways

Summaries:
{text}
""")

    chain = load_summarize_chain(
        llm,
        chain_type="map_reduce",
        map_prompt=map_prompt,
        combine_prompt=combine_prompt,
    )

    result = chain.invoke({"input_documents": chunks})
    return {
        "title": docs[0].metadata.get("title", "Unknown"),
        "summary": result["output_text"],
    }

output = summarize_youtube("https://youtube.com/watch?v=...")
print(output["summary"])
```

**What you learn:** Map-reduce summarization — handles arbitrarily long transcripts by summarizing chunks then synthesizing.

---

### Project 7: Personal Knowledge Bot

**Pattern:** Multi-source ingestion + persistent vector store + semantic search over your own notes.

```python
import os
from pathlib import Path
from langchain_community.document_loaders import (
    DirectoryLoader, TextLoader, PyPDFLoader, UnstructuredMarkdownLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

NOTES_DIR = "./my_notes"
PERSIST_DIR = "./knowledge_db"

def ingest_notes():
    loaders = [
        DirectoryLoader(NOTES_DIR, glob="**/*.txt", loader_cls=TextLoader),
        DirectoryLoader(NOTES_DIR, glob="**/*.md", loader_cls=UnstructuredMarkdownLoader),
        DirectoryLoader(NOTES_DIR, glob="**/*.pdf", loader_cls=PyPDFLoader),
    ]

    all_docs = []
    for loader in loaders:
        try:
            all_docs.extend(loader.load())
        except Exception:
            pass

    splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=40)
    chunks = splitter.split_documents(all_docs)

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = Chroma.from_documents(
        chunks, embeddings, persist_directory=PERSIST_DIR
    )
    print(f"Ingested {len(chunks)} chunks from {len(all_docs)} documents.")
    return vectorstore

def build_knowledge_bot(vectorstore):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    prompt = ChatPromptTemplate.from_template("""
Answer using only the notes and documents provided.
Mention which document or note the info came from if possible.

Context:
{context}

Question: {question}
""")

    chain = (
        {"context": retriever | (lambda docs: "\n\n".join(
            f"[{d.metadata.get('source', 'unknown')}]\n{d.page_content}" for d in docs
        )), "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain

vectorstore = ingest_notes()
bot = build_knowledge_bot(vectorstore)
print(bot.invoke("What did I write about attention mechanisms?"))
```

**What you learn:** Multi-format ingestion, persistent ChromaDB, source attribution in responses.

---

### Project 8: AI Sales Assistant

**Pattern:** Structured data input → personalized output generation at scale.

```python
import csv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel

class Lead(BaseModel):
    name: str
    company: str
    role: str
    industry: str
    pain_point: str

def load_leads(csv_path: str) -> list[Lead]:
    leads = []
    with open(csv_path) as f:
        for row in csv.DictReader(f):
            leads.append(Lead(**row))
    return leads

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

prompt = ChatPromptTemplate.from_template("""
Write a personalized cold outreach email for this lead.

Lead Info:
- Name: {name}
- Company: {company}
- Role: {role}
- Industry: {industry}
- Pain Point: {pain_point}

Rules:
- Subject line under 8 words
- Email under 100 words
- Reference their specific pain point
- One clear CTA
- No generic openers like "I hope this finds you well"

Output format:
Subject: [subject]

[email body]
""")

chain = prompt | llm | StrOutputParser()

leads = load_leads("leads.csv")
for lead in leads:
    email = chain.invoke(lead.model_dump())
    print(f"\n--- {lead.name} @ {lead.company} ---")
    print(email)
```

**What you learn:** Batch processing, structured input from external data sources, constrained generation.

---

## The Pattern Behind All 8

Every project above is a variation on the same skeleton:

```
Input → [Retrieve or Transform] → Prompt → LLM → [Parse or Store] → Output
```

The retrieval step might be RAG, SQL, web search, or nothing. The parse step might be free text, structured JSON, or a tool call. The LLM is always in the middle. Once you internalize this, any new app is just choosing what goes in each slot.

---

## Production Upgrade Checklist

Before shipping any of these:

- [ ] **Auth** — API key validation on every endpoint
- [ ] **Persistent memory** — swap `InMemoryChatMessageHistory` for Redis or PostgreSQL
- [ ] **Streaming** — use `chain.astream()` for real-time token output in UI
- [ ] **Rate limiting** — protect against cost blowups from runaway agents
- [ ] **Logging** — log every LLM call: prompt, response, latency, token count
- [ ] **Fallbacks** — `.with_fallbacks([backup_llm])` for model outages
- [ ] **Evaluation** — track answer quality over time, not just "it works"

---

## Key Takeaways

1. **LCEL (`|`) is the right abstraction** — compose chains like Unix pipes. Readable, debuggable, parallelizable.

2. **Memory and RAG solve different problems** — memory handles conversation history; RAG handles external knowledge. Production apps need both.

3. **Structured output over free text** — use `with_structured_output(PydanticModel)` whenever you need parseable results. Don't regex-parse LLM output.

4. **Agents for variable workflows, chains for fixed ones** — if the steps are always the same, use a chain. If the LLM needs to decide what to do next, use an agent.

5. **The retriever is the most important component** — garbage retrieval → garbage context → garbage answers. Invest in chunking strategy and retrieval quality before prompt engineering.

---

## Further Reading

- **[LangChain LCEL Docs](https://python.langchain.com/docs/concepts/lcel/)** — Full reference for the pipe operator and runnable interface. Read this before writing complex chains.

- **[LangSmith](https://smith.langchain.com/)** — LangChain's observability platform. Traces every chain call with inputs, outputs, and latency. Essential for debugging agents in production.

- **[RAG From Scratch (LangChain YouTube)](https://youtube.com/playlist?list=PLfaIDFEXuae2LXbO1_PKyVJiQ23ZztA0x)** — 12-part video series by LangChain team. Goes from basic retrieval to advanced techniques like CRAG and Self-RAG.

- **[LangGraph](https://langchain-ai.github.io/langgraph/)** — LangChain's framework for stateful multi-agent workflows. The step up from `AgentExecutor` for complex, branching agent logic.

- **[Building Effective Agents (Anthropic)](https://www.anthropic.com/research/building-effective-agents)** — Framework-agnostic guide on when to use agents vs. chains, how to design tool interfaces, and how to avoid common failure modes.

---

*Every AI app in production is some combination of these eight patterns. The companies winning with AI aren't doing anything exotic — they built a retriever that works, a memory system that scales, and an agent that knows when to use tools. The primitives are public. The moat is execution.*
