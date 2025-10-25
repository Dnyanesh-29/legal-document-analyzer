
# Legal Document Analyzer

The Legal Document Analyzer is a Python-based application that helps make sense of complex legal documents. Designed primarily for students, individuals, and small organizations without easy access to legal professionals, it automates the analysis of legal text using natural language processing (NLP).
Here's what it does in a nutshell:
- Extracts key clauses like confidentiality and indemnification
- Identifies named entities such as companies, dates, and monetary amounts
- Summarizes the document to provide quick insights
- Evaluates risks and favorable terms to produce a signing recommendation
- Delivers all results via a simple web interface powered by Streamlit
It’s essentially a pocket-sized legal assistant for anyone who needs help reviewing contracts or understanding legal jargon—no law degree required.




## Tech Stack

 **Core Technologies:**- 
- Python 3 – The backbone language used for development.
- spaCy – For advanced NLP tasks like Named Entity Recognition and custom pattern matching.
- Sumy – Used for extractive summarization via Latent Semantic Analysis (LSA).
- PyPDF2 and python-docx – To handle document ingestion from PDF and DOCX formats.


**Additional Libraries & Tool:** - 
- re, unicodedata – For text normalization and regex-based processing.
- dataclasses – To structure data cleanly within the analyzer.
- Streamlit – Powers the web-based user interface for file upload and result visualization.



## Run Locally

Clone the project

```bash
  https://github.com/Dnyanesh-29/legal-document-analyzer
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  pip install
```

Start the server

```bash
  streamlit run legal_analyzer_ui.py
```
 

## Screenshots

## 🔍 Home Page
<img src="https://raw.githubusercontent.com/Dnyanesh-29/legal-document-analyzer/main/ss/home.png" width="700"/>

## 📄 Document Summary
<img src="https://raw.githubusercontent.com/Dnyanesh-29/legal-document-analyzer/main/ss/summary.png" width="700"/>

## 📌 Clause Detection
<img src="https://raw.githubusercontent.com/Dnyanesh-29/legal-document-analyzer/main/ss/clauses.png" width="700"/>

## 🧠 Entity Recognition
<img src="https://raw.githubusercontent.com/Dnyanesh-29/legal-document-analyzer/main/ss/entities.png" width="700"/>

## ✅ Signing Recommendation
<img src="https://raw.githubusercontent.com/Dnyanesh-29/legal-document-analyzer/main/ss/reccomendation.png" width="700"/>
