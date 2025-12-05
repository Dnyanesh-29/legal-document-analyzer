

---

# **AI-Powered Legal Document Analyzer**

This project is a comprehensive AI-assisted system designed to simplify the understanding, comparison, and generation of legal documents. It uses advanced NLP techniques, document processing pipelines, and an interactive UI to help users analyze contracts efficiently and accurately.

The system consists of:

* **Typescript Frontend** — for user interaction, file uploads, comparison views, and document generation forms.
* **FastAPI Backend** — for NLP processing, clause extraction, recommendation scoring, and document generation.
* **Ollama-based Chat Module** — for conversational legal assistance and contextual explanations.

---

## **Features**

### **1. Document Analysis**

* Extracts key clauses, legal entities, dates, monetary values, and obligations.
* Generates a concise summary using NLP-based text summarization.
* Computes a recommendation score based on favorable and risky clauses.
* Provides chatbot explanations using an Ollama LLM for contract-specific questions.

### **2. Document Comparison**

* Compares two legal documents side-by-side.
* Identifies added, removed, and modified clauses.
* Highlights differences in entities, obligations, and important terms.
* Displays summary and recommendation score comparison.

### **3. Document Generation**

* Provides a collection of legal templates (e.g., NDA, Freelancer Agreement, Service Contract).
* Dynamic forms generate a fully structured contract based on user inputs.
* Exports documents in DOCX or PDF format.

---

## **Tech Stack**

### **Frontend**

* **Next.js** (React framework)
* TailwindCSS 
* Axios for backend communication

### **Backend**

* **FastAPI**
* spaCy for NLP
* PyPDF2, python-docx for document processing
* Sumy for summarization
* Custom rule-based clause detection
* Regex-driven entity extraction
* Jinja2 / python-docx-template for document generation

### **LLM Integration**

* **Ollama** (local LLM) for chatbot responses and user queries.

---

## **Project Structure (High-Level)**

```
legal-document-analyzer/
│
├── frontend/          # Next.js application
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── utils/
│
├── backend/           # FastAPI backend
│   ├── legal_analyzer.py
│   ├── models/
│   ├── templates/     # DOCX templates for document generation
│   ├── routers/
│   └── main.py        # FastAPI entrypoint
│
└── README.md
```

---

## **API Endpoints (Backend)**

### **1. Analyze Document**

```
POST /analyze
```

**Request:** File (PDF/DOCX)
**Response:**

* summary
* clauses
* entities
* recommendation score
* cleaned text

### **2. Compare Documents**

```
POST /compare
```

**Request:** Two uploaded legal documents
**Response:** Differences in clauses, entities, summaries, and scores

### **3. Generate Document**

```
POST /generate
```

**Request:** Template name + form data
**Response:** Generated document (DOCX or PDF)

### **4. Chatbot**

```
POST /chat
```

**Request:** User query + context
**Response:** LLM (Ollama) generated answer

---

## **Installation**

### **1. Backend Setup**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Ensure Ollama is installed and running locally.

### **2. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`
The backend runs on `http://localhost:8000`

---

## **How Document Analysis Works**

1. The uploaded file is converted into raw text.
2. NLP pipeline extracts clauses using rule-based patterns and regex.
3. Entities such as dates, names, organizations, and monetary amounts are identified.
4. A summary is generated using LSA-based summarization.
5. A recommendation score evaluates contract safety and completeness.
6. Results are returned as structured JSON to the frontend.

---

## **Future Enhancements**

* Risk prediction model trained on legal datasets
* Multi-language support
* Smart clause suggestions during document generation
* Real-time collaboration for contract review
* Cloud-based versioning and storage


