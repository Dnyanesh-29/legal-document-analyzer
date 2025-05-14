import re
import unicodedata
from PyPDF2 import PdfReader
from docx import Document
from dataclasses import dataclass
from typing import Dict, List, Tuple, Any
import spacy
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

@dataclass
class AnalysisResult:
    clauses: Dict[str, List[Dict[str, Any]]]
    entities: Dict[str, List[str]]
    summary: str
    statistics: Dict[str, int]
    cleaned_text: str
    signing_recommendation: Dict[str, Any]

class LegalDocumentAnalyzer:
    def __init__(self, verbose=False):
        self.verbose = verbose
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise ImportError("Please install the spaCy English model: 'python -m spacy download en_core_web_sm'")

        self.legal_clauses = {
            "confidentiality": r"confidential(?:ity| information)",
            "indemnification": r"indemnif(?:y|ication)",
            "liability": r"liability|limitation of liability",
            "termination": r"terminat(?:ion|e)",
            "governing_law": r"governing law|jurisdiction",
            "amendment": r"amend(?:ment|ing)",
            "relationship": r"employment relationship|joint venture|partnership"
        }

        self.risk_patterns = {
            "unlimited_liability": {
                "pattern": r"unlimited liability|all liability|full liability",
                "weight": -15,
                "description": "Unlimited liability clauses"
            },
            "unilateral_changes": {
                "pattern": r"(?:may|can|will) (?:modify|change|alter|amend) (?:at any time|without notice|in its sole discretion)",
                "weight": -10,
                "description": "Unilateral modification rights"
            },
            "non_negotiable": {
                "pattern": r"non-negotiable|not negotiable|as is",
                "weight": -5,
                "description": "Non-negotiable terms"
            },
            "waiver_of_rights": {
                "pattern": r"waive(?:s|r of) (?:right|jury trial|class action)",
                "weight": -10,
                "description": "Rights waiver clauses"
            },
            "perpetual_obligations": {
                "pattern": r"(?:perpetual|eternal|indefinite|survive termination)",
                "weight": -5,
                "description": "Perpetual obligations"
            }
        }

        self.favorable_patterns = {
            "mutual_termination": {
                "pattern": r"(?:either|both|any) part(?:y|ies) may terminate",
                "weight": 10,
                "description": "Mutual termination rights"
            },
            "limited_liability": {
                "pattern": r"limited liability|liability (?:limited|shall not exceed)",
                "weight": 8,
                "description": "Limited liability protection"
            },
            "notice_period": {
                "pattern": r"(?:notice period|notice of \d+ (?:day|week|month)s)",
                "weight": 5,
                "description": "Reasonable notice period"
            },
            "dispute_resolution": {
                "pattern": r"(?:mediation|arbitration|dispute resolution)",
                "weight": 7,
                "description": "Alternative dispute resolution"
            },
            "mutual_confidentiality": {
                "pattern": r"(?:both|all|either|respective) part(?:y|ies).{1,30}confidential",
                "weight": 6,
                "description": "Mutual confidentiality"
            }
        }

    def print_debug(self, message: str):
        if self.verbose:
            print(f"[DEBUG] {message}")

    def clean_text(self, text: str) -> str:
        replacements = {
            'Ɵ': 't', 'Ʃ': 's', 'ƚ': 'l', 'ƭ': 't',
            'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi',
            'conﬁdenƟal': 'confidential'
        }
        for bad_char, good_char in replacements.items():
            text = text.replace(bad_char, good_char)
        text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
        return ' '.join(text.split())

    def load_document(self, file_path: str) -> str:
        if file_path.endswith('.pdf'):
            return self._load_pdf(file_path)
        elif file_path.endswith('.docx'):
            return self._load_docx(file_path)
        else:
            return self._load_text(file_path)

    def _load_pdf(self, file_path: str) -> str:
        text = ""
        try:
            with open(file_path, 'rb') as file:
                reader = PdfReader(file)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
        return self.clean_text(text)

    def _load_docx(self, file_path: str) -> str:
        try:
            doc = Document(file_path)
            return self.clean_text("\n".join([para.text for para in doc.paragraphs]))
        except Exception as e:
            raise ValueError(f"Error reading DOCX: {str(e)}")

    def _load_text(self, file_path: str) -> str:
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return self.clean_text(file.read())
        except Exception as e:
            raise ValueError(f"Error reading text file: {str(e)}")

    def identify_clauses(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        found_clauses = {}
        for name, pattern in self.legal_clauses.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            found_clauses[name] = [{
                "text": match.group(),
                "positions": [match.start(), match.end()]
            } for match in matches]
        return found_clauses

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        doc = self.nlp(text)
        entities = {}
        for ent in doc.ents:
            entities.setdefault(ent.label_, []).append(ent.text)
        return {key: list(set(values)) for key, values in entities.items()}

    def summarize_text(self, text: str, sentences_count: int = 3) -> str:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, sentences_count)
        return " ".join(str(sentence) for sentence in summary)

    def calculate_signing_recommendation(self, text: str, clause_data: Dict[str, Any]) -> Dict[str, Any]:
        base_score = 50
        score = base_score
        findings = {
            "favorable_factors": [],
            "risk_factors": []
        }

        for name, risk_info in self.risk_patterns.items():
            matches = list(re.finditer(risk_info["pattern"], text, re.IGNORECASE))
            if matches:
                score += risk_info["weight"]
                findings["risk_factors"].append({
                    "type": name,
                    "description": risk_info["description"],
                    "weight": risk_info["weight"],
                    "matches": len(matches),
                    "examples": [text[max(0, m.start()-30):min(len(text), m.end()+30)] for m in matches[:2]]
                })

        for name, favorable_info in self.favorable_patterns.items():
            matches = list(re.finditer(favorable_info["pattern"], text, re.IGNORECASE))
            if matches:
                score += favorable_info["weight"]
                findings["favorable_factors"].append({
                    "type": name,
                    "description": favorable_info["description"],
                    "weight": favorable_info["weight"],
                    "matches": len(matches),
                    "examples": [text[max(0, m.start()-30):min(len(text), m.end()+30)] for m in matches[:2]]
                })

        missing_clauses = []
        for clause_name in ["indemnification", "governing_law", "termination"]:
            if not clause_data.get(clause_name):
                missing_clauses.append(clause_name)
                score -= 5

        avg_word_length = sum(len(word) for word in text.split()) / max(1, len(text.split()))
        if avg_word_length > 8:
            score -= 5
            findings["risk_factors"].append({
                "type": "complex_language",
                "description": "Document uses complex language (high average word length)",
                "weight": -5
            })

        final_score = max(0, min(100, score))
        if final_score >= 80:
            recommendation = "Favorable - Consider signing with normal review"
        elif final_score >= 60:
            recommendation = "Moderately favorable - Review carefully before signing"
        elif final_score >= 40:
            recommendation = "Neutral - Consult a legal professional before signing"
        elif final_score >= 20:
            recommendation = "Potentially unfavorable - Negotiate changes before signing"
        else:
            recommendation = "Unfavorable - Consider not signing or significant revisions"

        return {
            "percentage": final_score,
            "recommendation": recommendation,
            "findings": findings,
            "missing_clauses": missing_clauses
        }

    def analyze(self, file_path: str) -> AnalysisResult:
        raw_text = self.load_document(file_path)
        cleaned_text = raw_text  # Already cleaned in load_document
        clauses = self.identify_clauses(cleaned_text)
        return AnalysisResult(
            clauses=clauses,
            entities=self.extract_entities(cleaned_text),
            summary=self.summarize_text(cleaned_text),
            statistics={
                "word_count": len(cleaned_text.split()),
                "char_count": len(cleaned_text),
                "paragraph_count": len(re.findall(r'\n\s*\n', raw_text))
            },
            cleaned_text=cleaned_text,
            signing_recommendation=self.calculate_signing_recommendation(cleaned_text, clauses)
        )

def main():
    import sys
    from pprint import pprint

    if len(sys.argv) != 2:
        print("Usage: python legal_analyzer.py <document_path>")
        return

    analyzer = LegalDocumentAnalyzer(verbose=True)
    try:
        results = analyzer.analyze(sys.argv[1])

        print("\n=== DOCUMENT SUMMARY ===")
        print(results.summary)

        print("\n=== FOUND CLAUSES ===")
        for clause, matches in results.clauses.items():
            if matches:
                print(f"- {clause}: {len(matches)} occurrences")
                for match in matches[:2]:
                    print(f"  - '{match['text']}'")

        print("\n=== IMPORTANT ENTITIES ===")
        for entity_type, values in results.entities.items():
            if values:
                print(f"- {entity_type}: {', '.join(values[:5])}")

        print("\n=== STATISTICS ===")
        for stat, value in results.statistics.items():
            print(f"- {stat.replace('_', ' ')}: {value}")

        print("\n=== SIGNING RECOMMENDATION ===")
        rec = results.signing_recommendation
        print(f"Recommendation Score: {rec['percentage']}%")
        print(f"Recommendation: {rec['recommendation']}")

        if rec['findings']['favorable_factors']:
            print("\nFavorable Factors:")
            for factor in rec['findings']['favorable_factors']:
                print(f"- {factor['description']} (+{factor['weight']} points)")
                for i, example in enumerate(factor.get('examples', [])):
                    print(f"  Example {i+1}: \"...{example}...\"")

        if rec['findings']['risk_factors']:
            print("\nRisk Factors:")
            for factor in rec['findings']['risk_factors']:
                print(f"- {factor['description']} ({factor['weight']} points)")
                for i, example in enumerate(factor.get('examples', [])):
                    print(f"  Example {i+1}: \"...{example}...\"")

        if rec['missing_clauses']:
            print("\nMissing Important Clauses:")
            for clause in rec['missing_clauses']:
                print(f"- {clause.replace('_', ' ').title()}")

        print("\nDISCLAIMER: This analysis is for informational purposes only and not a substitute for legal advice.")

    except Exception as e:
        print(f"Error analyzing document: {str(e)}")

if __name__ == "__main__":
    main()
