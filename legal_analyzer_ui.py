import streamlit as st
from legal_analyzer import LegalDocumentAnalyzer
import tempfile
import os

st.set_page_config(page_title="Legal Document Analyzer", layout="wide")
st.title("📄 Legal Document Analyzer")
st.write("Upload a legal document to analyze its content, identify important clauses, and get signing recommendations.")

uploaded_file = st.file_uploader("Choose a document (.pdf, .docx, .txt)", type=["pdf", "docx", "txt"])

if uploaded_file:
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_file.name)[1]) as tmp_file:
        tmp_file.write(uploaded_file.read())
        file_path = tmp_file.name

    if st.button("Analyze Document"):
        analyzer = LegalDocumentAnalyzer(verbose=False)
        with st.spinner("Analyzing..."):
            results = analyzer.analyze(file_path)

        # Clean up temp file
        os.unlink(file_path)

        st.subheader("🔍 Summary")
        st.write(results.summary)

        st.subheader("📌 Clauses Found")
        for clause, matches in results.clauses.items():
            if matches:
                with st.expander(f"{clause.title()} ({len(matches)} occurrence{'s' if len(matches) > 1 else ''})"):
                    for m in matches[:3]:
                        st.markdown(f"> {m['text']}")

        st.subheader("🧠 Named Entities")
        for ent_type, ents in results.entities.items():
            st.markdown(f"**{ent_type}:** {', '.join(ents[:5])}")

        st.subheader("📊 Document Statistics")
        st.write(results.statistics)

        st.subheader("📝 Signing Recommendation")
        rec = results.signing_recommendation
        st.metric("Score", f"{rec['percentage']}%")
        st.success(rec["recommendation"] if rec["percentage"] >= 60 else "")
        st.warning(rec["recommendation"] if 40 <= rec["percentage"] < 60 else "")
        st.error(rec["recommendation"] if rec["percentage"] < 40 else "")

        with st.expander("🔎 Favorable Factors"):
            for factor in rec["findings"]["favorable_factors"]:
                st.markdown(f"- **{factor['description']}** (+{factor['weight']} points)")
                for ex in factor.get("examples", []):
                    st.code(ex.strip())

        with st.expander("⚠️ Risk Factors"):
            for factor in rec["findings"]["risk_factors"]:
                st.markdown(f"- **{factor['description']}** ({factor['weight']} points)")
                for ex in factor.get("examples", []):
                    st.code(ex.strip())

        if rec["missing_clauses"]:
            st.subheader("🚫 Missing Clauses")
            st.warning(", ".join([clause.replace("_", " ").title() for clause in rec["missing_clauses"]]))

        st.caption("Disclaimer: This tool is for informational purposes only and not a substitute for legal advice.")
