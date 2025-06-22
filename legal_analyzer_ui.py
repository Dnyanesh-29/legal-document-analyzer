import streamlit as st
import tempfile
import os
import sys
import re


current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from legal_analyzer import LegalDocumentAnalyzer


st.set_page_config(page_title="Legal Document Analyzer", layout="wide")
st.markdown("# 📄 Legal Document Analyzer")
st.markdown("Upload a legal document to analyze its content, extract clauses, and get signing insights.")


st.sidebar.header("Upload Document")
uploaded_file = st.sidebar.file_uploader("Choose a file", type=["pdf", "docx", "txt"])
analyze_button = st.sidebar.button("📊 Analyze Document")

# Custom CSS
st.markdown("""
    <style>
      .highlight {
        color: red;
        font-weight: bold;
        background: none;
    }
    .stMetric { font-size: 1.2em; }
    </style>
""", unsafe_allow_html=True)

if uploaded_file and analyze_button:
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_file.name)[1]) as tmp_file:
        tmp_file.write(uploaded_file.read())
        file_path = tmp_file.name

    analyzer = LegalDocumentAnalyzer(verbose=False)

    with st.spinner("🔎 Analyzing... Please wait."):
        try:
            results = analyzer.analyze(file_path)
            tabs = st.tabs(["🔍 Summary", "📌 Clauses", "🧠 Entities", "📊 Statistics", "📝 Recommendation"])

            # Tab 1: Summary
            with tabs[0]:
                st.subheader("🔍 Summary")
                st.info(results.summary)

            # Tab 2: Clauses
            with tabs[1]:
                st.subheader("📌 Detected Clauses")
                if results.clauses:
                    for clause_name, matches in results.clauses.items():
                        if matches:
                            unique_lines = sorted(set([m['line_number'] for m in matches]))
                            line_str = ", ".join(map(str, unique_lines))
                            st.markdown(f"**{clause_name.replace('_', ' ').title()}** found on line(s): `{line_str}` ({len(matches)} match(es))")
                            with st.expander(f"📄 Show matches for {clause_name.replace('_', ' ').title()}"):
                                doc = analyzer.nlp(results.cleaned_text)
                                for i, m in enumerate(matches):
                                    text = m['text']
                                    start, end = m['positions']
                                    sentence = None
                                    for sent in doc.sents:
                                        if sent.start_char <= start and end <= sent.end_char:
                                            sentence = sent.text
                                            break

                                    if not sentence or (len(sentence.split()) <= 10 and not re.search(r'[.!?]$', sentence.strip())):
                                        context_start = max(0, results.cleaned_text.rfind('\n\n', 0, start))
                                        context_end = min(len(results.cleaned_text), results.cleaned_text.find('\n\n', end))
                                        if context_end == -1: context_end = len(results.cleaned_text)
                                        sentence = results.cleaned_text[context_start:context_end].strip()
                                        sentence = re.sub(r'\s+', ' ', sentence)

                                    # Highlight clause
                                    highlighted = sentence.replace(text, f"<span class='highlight'>{text}</span>", 1)
                                    st.markdown(f"- **Match {i+1} (Line {m['line_number']}):**<br>{highlighted}", unsafe_allow_html=True)
                        else:
                            st.markdown(f"- **{clause_name.replace('_', ' ').title()}**: Not found.")
                else:
                    st.info("No clauses matched known legal patterns.")

            # Tab 3: Entities
            with tabs[2]:
                st.subheader("🧠 Named Entities")
                if results.entities:
                    for ent_type, ents in results.entities.items():
                        st.markdown(f"**{ent_type.replace('_', ' ').title()}:** {', '.join(ents[:10])}")
                        if len(ents) > 10:
                            st.caption(f"(and {len(ents) - 10} more...)")
                else:
                    st.info("No named entities identified.")

            # Tab 4: Stats
            with tabs[3]:
                st.subheader("📊 Document Statistics")
                for stat, value in results.statistics.items():
                    st.write(f"- **{stat.replace('_', ' ').title()}**: {value}")

            # Tab 5: Recommendation
            with tabs[4]:
                st.subheader("📝 Signing Recommendation")
                rec = results.signing_recommendation

                col1, col2 = st.columns([1, 3])
                with col1:
                    st.metric("🔒 Score", f"{rec['percentage']}%", delta="↑" if rec["percentage"] >= 50 else "↓")

                with col2:
                    if rec["percentage"] >= 80:
                        st.success(f"🟢 {rec['recommendation']}")
                    elif rec["percentage"] >= 65:
                        st.success(f"✅ {rec['recommendation']}")
                    elif rec["percentage"] >= 50:
                        st.warning(f"⚠️ {rec['recommendation']}")
                    else:
                        st.error(f"❌ {rec['recommendation']}")

                with st.expander("✅ Favorable Factors"):
                    if rec["findings"]["favorable_factors"]:
                        for f in rec["findings"]["favorable_factors"]:
                            st.markdown(f"- **🔹 {f['description']}** *(+{f['weight']} pts)*")
                            for ex in f.get("examples", []):
                                st.code(ex.strip())
                    else:
                        st.info("No favorable factors found.")

                with st.expander("❌ Risk Factors"):
                    if rec["findings"]["risk_factors"]:
                        for f in rec["findings"]["risk_factors"]:
                            st.markdown(f"- **🔻 {f['description']}** *(-{f['weight']} pts)*")
                            for ex in f.get("examples", []):
                                st.code(ex.strip())
                    else:
                        st.info("No risk factors found.")

                if rec["missing_clauses"]:
                    st.subheader("🚫 Missing Clauses")
                    st.error("⚠️ Potentially missing critical clauses:")
                    for clause in rec["missing_clauses"]:
                        st.markdown(f"- ❗ **{clause.replace('_', ' ').title()}**")
                else:
                    st.success("✅ All critical clauses are present.")

        except Exception as e:
            st.error("An error occurred during analysis.")
            st.exception(e)

    os.unlink(file_path)

st.caption("🛈 This tool is for informational purposes only and not a substitute for professional legal advice.")
