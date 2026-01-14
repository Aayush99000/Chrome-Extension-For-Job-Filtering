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

## 📋 Prerequisites

Before you begin, ensure you have:

- **Python 3.11 or 3.12** (Python 3.14 not supported yet)
- **Google Chrome** browser
- **pip** (Python package manager)
- **Git** (optional, for cloning)

---

## 🔧 Installation & Setup

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/yourusername/job-filter-ai.git
cd job-filter-ai
```

---

### **Step 2: Set Up Python Backend**

#### **2.1: Create Virtual Environment**

**Mac/Linux:**

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
```

**Windows:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Verify activation** - you should see `(venv)` in your terminal:

```bash
(venv) your-computer:backend $
```

#### **2.2: Install Dependencies**

```bash
pip install -r requirements.txt
```

#### **2.3: Start the Backend Server**

```bash
python app.py
```

---

### **Step 3: Load Chrome Extension**

#### **3.1: Open Chrome Extensions Page**

Navigate to:

```
chrome://extensions/
```

#### **3.2: Enable Developer Mode**

Toggle the **"Developer mode"** switch in the top-right corner.

#### **3.3: Load Unpacked Extension**

1. Click **"Load unpacked"** button
2. Navigate to your project folder
3. Select the **root folder** (`job-filter-ai`)
4. Click **"Select"**

#### **3.4: Verify Extension Loaded**

You should see:

```
┌─────────────────────────────────┐
│ 🎯 Job Filter AI                │
│ Filter job postings using...    │
│ Version 1.0.0                   │
│ ✅ Enabled                       │
└─────────────────────────────────┘
```

The extension icon (🎯) should appear in your Chrome toolbar.

---

## 📱 How to Use

### **Step 1: Upload Your Resume**

1. **Click the extension icon** (🎯) in Chrome toolbar
2. **Click "Choose File"**
3. **Select your resume** (PDF or DOCX format)
4. **Click "Process Resume"**

**Expected result:**

- Status shows: "Processing resume..."
- Backend terminal shows: "✅ Resume processed successfully!"
- Popup shows: "✅ Resume processed successfully!"

### **Step 2: Browse Job Listings**

Visit any supported job board:

- LinkedIn: `https://www.linkedin.com/jobs/`
- Indeed: `https://www.indeed.com/`
- Glassdoor: `https://www.glassdoor.com/`

---

### **Step 3: See Match Scores**

**Automatic Scanning** (default):

- Extension automatically analyzes jobs as the page loads
- Each job card shows a **match score badge**
- Color-coded: 🟢 Green (high) | 🟡 Yellow (medium) | 🔴 Red (low)

**Manual Scanning:**

- Click extension icon → **"Scan Current Page"**

---

### **Step 4: Understand Match Scores**

| Score       | Meaning          | Action                |
| ----------- | ---------------- | --------------------- |
| **70-100%** | 🟢 Strong match  | Apply with confidence |
| **40-69%**  | 🟡 Partial match | Review carefully      |
| **0-39%**   | 🔴 Weak match    | Consider skipping     |

**Match Details** (if enabled in settings):

```
85% Match ✅
✓ Skills: Python, React, AWS
✓ Experience level aligns
✓ Location preference matches
```

---

### **Step 5: Customize Settings (Optional)**

Click **"Settings"** in the popup to customize:

- **Match Threshold**: Minimum score to show jobs (default: 70%)
- **Auto-filter**: Automatically scan on page load (default: ON)
- **Show Reasons**: Display why jobs matched (default: ON)
- **Hide Low Matches**: Completely hide jobs below threshold
- **Badge Style**: Percentage, score, or stars
- **Color Theme**: Default, colorblind-friendly, or monochrome

---

## 🔒 Privacy & Security

- ✅ **Local Processing**: Resume data never leaves your computer
- ✅ **No Cloud Storage**: Everything stored in browser local storage
- ✅ **No Tracking**: No analytics or user tracking
- ✅ **Open Source**: Full code transparency
