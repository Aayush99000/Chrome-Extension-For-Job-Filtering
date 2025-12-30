# 🎯 Problem

Job searching means drowning in irrelevant postings. You're a Python developer, but you're seeing "Senior Java Architect" roles. You have 2 years of experience, but "Director" positions keep appearing. Manually filtering hundreds of listings across multiple platforms wastes hours that should be spent on applications that actually matter.

# 💡 Solution

A browser extension that analyzes your resume once and automatically filters job listings across LinkedIn, Indeed, Glassdoor, and other platforms using semantic similarity matching. Unlike simple keyword filters that miss "Python Developer" when the posting says "Backend Engineer," this tool understands context—recognizing that your React experience makes you relevant for Frontend roles, even without exact word matches.

# ✨ Key Features

**Resume-Based Filtering:** Upload your resume once; the extension filters automatically across all job boards
**Semantic Matching:** RAG pipeline with embeddings understands context, not just keywords—matches "ML Engineer" experience to "Data Scientist" roles.
**Cross-Platform Support:** Single tool works across LinkedIn, Indeed, Glassdoor, and more.
**Privacy-Focused:** Your resume data stays local; no third-party storage.
**Customizable Thresholds:** Adjust relevance scoring to be more or less selective.
**Visual Indicators:** Color-coded relevance scores (green/yellow/red) and one-click filtering options.
**Smart Highlighting:** See exactly why a job matched—which skills and experiences aligned.

# 🛠️ Tech Stack

**Frontend:** JavaScript (Chrome Extension Manifest V3).
**Backend:** Python (Flask/FastAPI for API endpoints).
**ML Pipeline:** RAG with sentence transformers (HuggingFace/OpenAI embeddings).
**Document Parsing:** PDF/DOCX resume extraction with content scripts for DOM manipulation.
**Vector Storage:** ChromaDB/FAISS for efficient similarity search.
