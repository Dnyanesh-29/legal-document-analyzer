import re
import unicodedata
from PyPDF2 import PdfReader
from docx import Document
from dataclasses import dataclass, field # Import 'field'
from typing import Dict, List, Tuple, Any
import spacy
from spacy.matcher import Matcher
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

@dataclass
class AnalysisResult:
    clauses: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict) # Use default_factory for mutable defaults
    entities: Dict[str, List[str]] = field(default_factory=dict)
    summary: str = ""
    statistics: Dict[str, int] = field(default_factory=dict)
    cleaned_text: str = ""
    signing_recommendation: Dict[str, Any] = field(default_factory=dict)

class LegalDocumentAnalyzer:
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        try:
            self.nlp = spacy.load("en_core_web_lg")
            self.nlp.max_length = 10_000_000 # Increased max_length
        except OSError:
            raise ImportError(
                "Please install the spaCy English model: 'python -m spacy download en_core_web_lg' "
                "(recommended) or 'python -m spacy download en_core_web_sm')"
            )

        self.matcher = Matcher(self.nlp.vocab)
        self._add_custom_matcher_patterns()

        # Increased specificity for legal clauses
        self.legal_clauses = {
            "confidentiality": r"confidential(?:ity| information| agreement)",
            "indemnification": r"indemnif(?:y|ication|ies|ing)",
            "liability": r"liability|limitation of liability|disclaimer of liability",
            "termination": r"terminat(?:ion|e|es|ing)",
            "governing_law": r"governing law|choice of law|jurisdiction|venue",
            "amendment": r"amend(?:ment|ing|ed)",
            "dispute_resolution": r"dispute resolution|arbitration|mediation",
            "force_majeure": r"force majeure",
            "assignment": r"assign(?:ment|ability|s)",
            "warranty": r"warrant(?:y|ies|s)",
            "severability": r"severability"
        }

        # More detailed risk patterns with potentially higher weights
        self.risk_patterns = {
            "unlimited_liability": {
                "pattern": r"unlimited liability|all liability|full liability|no limitation of liability",
                "weight": -20, # Increased impact
                "description": "Unlimited or no limitation on liability"
            },
            "unilateral_changes": {
                "pattern": r"(?:may|can|will) (?:modify|change|alter|amend) (?:at any time|without notice|in its sole discretion|unilaterally)",
                "weight": -15, # Increased impact
                "description": "Party has unilateral modification rights"
            },
            "broad_indemnification": {
                "pattern": r"indemnif(?:y|ication) (?:against|from) any and all (?:claims|losses|damages)",
                "weight": -12, # A broad indemnification could be a risk depending on context
                "description": "Broad indemnification clause"
            },
            "automatic_renewal": {
                "pattern": r"automatically renew(?:s|ed|al)",
                "weight": -8,
                "description": "Automatic renewal without clear termination notice"
            },
            "no_assignment_without_consent": {
                "pattern": r"not assign(?:ed)? this agreement without.{1,50}prior (?:written )?consent",
                "weight": -7,
                "description": "Restriction on assignment without consent"
            },
            "broad_confidentiality": {
                "pattern": r"all(?: |\b)information(?: |\b)shall be considered confidential",
                "weight": -6,
                "description": "Overly broad confidentiality definition"
            },
            "non_negotiable": {
                "pattern": r"non-negotiable|not negotiable|as is|without recourse",
                "weight": -10,
                "description": "Non-negotiable terms"
            },
            "waiver_of_rights": {
                "pattern": r"waive(?:s|r of) (?:right|jury trial|class action)",
                "weight": -15,
                "description": "Waiver of significant rights (e.g., jury trial)"
            },
            "perpetual_obligations": {
                "pattern": r"(?:perpetual|eternal|indefinite|survive termination)",
                "weight": -8,
                "description": "Perpetual obligations after termination"
            }
        }

        # More detailed favorable patterns with potentially higher weights
        self.favorable_patterns = {
            "mutual_termination": {
                "pattern": r"(?:either|both|any) part(?:y|ies) may terminate",
                "weight": 12, # Increased impact
                "description": "Mutual termination rights for all parties"
            },
            "limited_liability": {
                "pattern": r"liability (?:limited to|shall not exceed) (?:[$€£]\d{1,3}(?:,\d{3})*(?:\.\d{2})?|the amount of this agreement)",
                "weight": 15, # Strong positive impact
                "description": "Liability is clearly limited to a specific amount"
            },
            "reasonable_notice_period": {
                "pattern": r"(?:notice period|notice of \d+ (?:business )?(?:day|week|month|year)s) prior to termination",
                "weight": 8,
                "description": "Clearly defined reasonable notice period for termination"
            },
            "clear_dispute_resolution": {
                "pattern": r"dispute resolution clause|(?:binding )?arbitration|(?:mandatory )?mediation",
                "weight": 10,
                "description": "Clear and defined alternative dispute resolution mechanism"
            },
            "mutual_confidentiality": {
                "pattern": r"(?:both|all|either|respective) part(?:y|ies).{1,50}confidential(?:ity)? obligations",
                "weight": 7,
                "description": "Mutual confidentiality obligations"
            },
            "governing_law_defined": {
                "pattern": r"governed by and construed in accordance with the laws of (?:the State of )?[A-Za-z ]+",
                "weight": 8,
                "description": "Clearly defined governing law and jurisdiction"
            },
            "right_to_cure": {
                "pattern": r"(?:right to cure|opportunity to cure) (?:breach)?",
                "weight": 7,
                "description": "Opportunity to cure breaches before termination"
            }
        }

    def print_debug(self, message: str):
        if self.verbose:
            print(f"[DEBUG] {message}")

    def _add_custom_matcher_patterns(self):
        # Define patterns for common legal entities that spaCy might miss or misclassify.
        # These patterns are designed to be more specific to legal contexts.

        # --- Document Identifiers ---
        self.matcher.add("LEGAL_DOC_TYPE", [[{"LOWER": "this"}, {"LOWER": {"IN": ["agreement", "contract", "memorandum", "indenture", "deed"]}}]])
        self.matcher.add("CONTRACT_TITLE", [[{"POS": "PROPN", "OP": "*"}, {"LOWER": "agreement"}],
                                             [{"POS": "PROPN", "OP": "*"}, {"LOWER": "contract"}],
                                             [{"IS_TITLE": True, "OP": "+"}, {"LOWER": {"IN": ["agreement", "contract"]}}]]) # e.g. "Software License Agreement"

        # --- Parties to the Agreement ---
        self.matcher.add("LEGAL_PARTY_ROLE", [
            [{"LOWER": {"IN": ["client", "contractor", "vendor", "licensor", "licensee", "supplier", "grantor", "grantee", "employer", "employee", "customer"]}}],
            [{"LOWER": "party"}, {"TEXT": {"REGEX": "[A-Z]"}}], # e.g., "Party A", "Party B"
            [{"LOWER": "parties"}],
            [{"LOWER": "the"}, {"LOWER": {"IN": ["undersigned", "company", "corporation", "inc.", "llc", "ltd.", "llp", "pte ltd", "plc", "gmbh", "ag", "sa", "co.", "inc"]}}] # Added more common suffixes
        ])
        # Add a pattern for specific company names that aren't picked up by ORG
        self.matcher.add("COMPANY_NAME_PAT", [[{"POS": "PROPN", "OP": "+"}, {"LOWER": {"IN": ["inc.", "llc", "corp.", "ltd.", "co."]}}]])


        # --- Dates and Durations ---
        self.matcher.add("EFFECTIVE_DATE", [[{"LOWER": "effective"}, {"LOWER": "as"}, {"LOWER": "of"}, {"ENT_TYPE": "DATE"}]])
        self.matcher.add("AGREEMENT_DATE", [[{"LOWER": "date"}, {"LOWER": "of"}, {"LOWER": "this"}, {"LOWER": "agreement"}, {"IS_PUNCT": False, "OP": "*"}, {"ENT_TYPE": "DATE"}]])
        self.matcher.add("LEGAL_DURATION", [[{"ENT_TYPE": "CARDINAL"}, {"LOWER": {"IN": ["day", "days", "week", "weeks", "month", "months", "year", "years", "business days", "calendar days"]}}]])

        # --- Monetary Terms ---
        self.matcher.add("LEGAL_MONEY", [
            [{"TEXT": {"REGEX": r"\$|€|£|¥"}}, {"IS_DIGIT": True, "OP": "+"}, {"TEXT": ".", "OP": "?"}, {"IS_DIGIT": True, "OP": "*"}], # Currency symbol then digits
            [{"TEXT": {"REGEX": r"\d{1,3}(?:,\d{3})*(?:\.\d{2})?"}}, {"LOWER": {"IN": ["usd", "eur", "gbp", "dollars", "euros", "pounds", "yen"]}, "OP": "+"}], # Digits then currency code/word
            [{"ENT_TYPE": "CARDINAL"}, {"LOWER": {"IN": ["dollars", "euros", "pounds"]}}] # "One thousand dollars"
        ])

        # --- Governing Law and Jurisdiction ---
        self.matcher.add("GOVERNING_LAW_LOC", [[{"LOWER": {"IN": ["laws", "jurisdiction"]}}, {"LOWER": "of"}, {"ENT_TYPE": "GPE"}]])
        self.matcher.add("STATE_NAME", [[{"LOWER": "state"}, {"LOWER": "of"}, {"POS": "PROPN", "OP": "+"}]])
        self.matcher.add("COMMONWEALTH_NAME", [[{"LOWER": "commonwealth"}, {"LOWER": "of"}, {"POS": "PROPN", "OP": "+"}]])
        # Broader pattern for governing law phrases
        self.matcher.add("GOVERNING_LAW_PHRASE", [[{"LOWER": "governed"}, {"LOWER": "by"}, {"LOWER": "and"}, {"LOWER": "construed"}, {"LOWER": "in"}, {"LOWER": "accordance"}, {"LOWER": "with"}, {"LOWER": "the"}, {"LOWER": "laws"}, {"LOWER": "of"}, {"ENT_TYPE": "GPE", "OP": "*"}, {"POS": "PROPN", "OP": "+"}, {"LOWER": "state", "OP": "?"}]])


        # --- Legal Processes/Concepts (often misclassified by general NER) ---
        self.matcher.add("LEGAL_CONCEPT", [[{"LOWER": {"IN": ["arbitration", "mediation", "litigation", "injunction", "subrogation", "negotiation", "termination", "indemnification", "confidentiality", "governing law", "jurisdiction", "amendment", "waiver", "notice", "breach", "remedies", "damages", "force majeure", "severability", "assignment", "warranty", "exclusive", "non-exclusive", "royalty", "licence"]}}]])
        self.matcher.add("LEGAL_CONCEPT", [[{"LOWER": "limitation"}, {"LOWER": "of"}, {"LOWER": "liability"}]])
        self.matcher.add("LEGAL_CONCEPT", [[{"LOWER": "dispute"}, {"LOWER": "resolution"}]])
        self.matcher.add("LEGAL_CONCEPT", [[{"LOWER": "intellectual"}, {"LOWER": "property"}]])


    def clean_text(self, text: str) -> str:
        replacements = {
            'Ɵ': 't', 'Ʃ': 's', 'ƚ': 'l', 'ƭ': 't',
            'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi',
            'conﬁdenƟal': 'confidential',
            'Terminaton': 'Termination',
            'Compensa ton': 'Compensation',
            'informa ton': 'information',
            'arbitra ton': 'arbitration',
            'Arbitra': 'Arbitration'
        }
        for bad_char, good_char in replacements.items():
            text = text.replace(bad_char, good_char)
        text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')

        # Replace multiple spaces with a single space, but preserve newlines.
        text = re.sub(r'[ \t]+', ' ', text) # Replace multiple spaces/tabs with single space
        text = re.sub(r'\n{2,}', '\n\n', text).strip() # Reduce multiple newlines to max two for paragraphs

        return text

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
            # When extracting from DOCX, ensure paragraphs are separated by newlines
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
            clause_matches = []
            for match in matches:
                # Calculate line number
                line_number = text.count('\n', 0, match.start()) + 1
                clause_matches.append({
                    "text": match.group(),
                    "positions": [match.start(), match.end()],
                    "line_number": line_number
                })
            # Sort by line number for consistent output
            found_clauses[name] = sorted(clause_matches, key=lambda x: x['line_number'])
        return found_clauses


    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        doc = self.nlp(text)
        temp_entities = {}

        for ent in doc.ents:
            temp_entities.setdefault(ent.label_, []).append(ent.text)

        matches = self.matcher(doc)
        for match_id, start, end in matches:
            span = doc[start:end]
            label = self.nlp.vocab.strings[match_id]
            temp_entities.setdefault(label, []).append(span.text)

        final_entities: Dict[str, List[str]] = {
            "CONTRACT_PARTIES": [],
            "CONTRACT_DATES": [],
            "MONEY_AMOUNTS": [],
            "LOCATIONS": [],
            "ORGANIZATIONS": [],
            "PERSONS": [],
            "LEGAL_CONCEPTS": [],
            "DOCUMENT_TYPES": [],
            "DURATIONS": [],
            "GOVERNING_LAW_LOCATIONS": [],
            "CONTRACT_TITLES": [],
            "CARDINAL_NUMBERS": [],
            "ORDINAL_NUMBERS": [],
            "COMPANY_NAMES": [] # New category for explicit company names
        }

        # Priority 1: Custom Matcher entities
        for label_key in [
            "LEGAL_DOC_TYPE", "CONTRACT_TITLE", "LEGAL_PARTY_ROLE", "COMPANY_NAME_PAT",
            "EFFECTIVE_DATE", "AGREEMENT_DATE", "LEGAL_DURATION",
            "LEGAL_MONEY", "GOVERNING_LAW_LOC", "STATE_NAME", "COMMONWEALTH_NAME", "GOVERNING_LAW_PHRASE",
            "LEGAL_CONCEPT"
        ]:
            if label_key in temp_entities:
                if label_key == "LEGAL_DOC_TYPE":
                    final_entities["DOCUMENT_TYPES"].extend(temp_entities[label_key])
                elif label_key == "CONTRACT_TITLE":
                    final_entities["CONTRACT_TITLES"].extend(temp_entities[label_key])
                elif label_key == "LEGAL_PARTY_ROLE":
                    final_entities["CONTRACT_PARTIES"].extend(temp_entities[label_key])
                elif label_key == "COMPANY_NAME_PAT":
                    final_entities["COMPANY_NAMES"].extend(temp_entities[label_key])
                elif label_key in ["EFFECTIVE_DATE", "AGREEMENT_DATE"]:
                    final_entities["CONTRACT_DATES"].extend(temp_entities[label_key])
                elif label_key == "LEGAL_DURATION":
                    final_entities["DURATIONS"].extend(temp_entities[label_key])
                elif label_key == "LEGAL_MONEY":
                    final_entities["MONEY_AMOUNTS"].extend(temp_entities[label_key])
                elif label_key in ["GOVERNING_LAW_LOC", "STATE_NAME", "COMMONWEALTH_NAME", "GOVERNING_LAW_PHRASE"]:
                    final_entities["GOVERNING_LAW_LOCATIONS"].extend(temp_entities[label_key])
                elif label_key == "LEGAL_CONCEPT":
                    final_entities["LEGAL_CONCEPTS"].extend(temp_entities[label_key])

        # Priority 2: General spaCy NER entities, with filtering and reclassification
        # ORGANIZATIONS (ORG)
        if "ORG" in temp_entities:
            for org_candidate in temp_entities["ORG"]:
                lowered_org = org_candidate.lower()
                # Skip if already captured by more specific COMPANY_NAMES or LEGAL_PARTY_ROLE
                if any(org_candidate in c for c in final_entities["COMPANY_NAMES"]) or \
                   any(org_candidate in p for p in final_entities["CONTRACT_PARTIES"]):
                    continue
                # Exclude if it's a known legal role or concept or document title
                if any(keyword in lowered_org for keyword in
                       [lc.lower() for lc in final_entities["LEGAL_CONCEPTS"]] +
                       [lp.lower() for lp in final_entities["CONTRACT_PARTIES"]] +
                       [lt.lower() for lt in final_entities["CONTRACT_TITLES"]] +
                       [ldt.lower() for ldt in final_entities["DOCUMENT_TYPES"]]):
                    self.print_debug(f"Skipping ORG '{org_candidate}' (likely a legal concept/role/title).")
                    continue
                # Specific common misclassifications
                if lowered_org in ["client", "contractor", "developer", "vendor", "agreement", "resolution"]:
                    self.print_debug(f"Reclassifying ORG '{org_candidate}' to CONTRACT_PARTIES/LEGAL_CONCEPTS.")
                    if lowered_org in ["client", "contractor", "developer", "vendor"]:
                        final_entities["CONTRACT_PARTIES"].append(org_candidate)
                    elif lowered_org in ["agreement", "resolution"]:
                        final_entities["LEGAL_CONCEPTS"].append(org_candidate)
                    continue
                # If it contains a zip code, it might be an address, not an organization.
                if re.search(r'\b\d{5}(?:-\d{4})?\b', org_candidate) and (len(org_candidate.split()) < 4 or any(c in org_candidate.lower() for c in ['street', 'road', 'avenue'])):
                    self.print_debug(f"Reclassifying ORG '{org_candidate}' to LOCATION (due to ZIP code/address hint).")
                    final_entities["LOCATIONS"].append(org_candidate)
                    continue
                # Otherwise, keep as ORG if it looks like a valid organization name
                if re.search(r'\b(?:inc|corp|llc|ltd|gmbh|ag|sa|co\.)\b', lowered_org) or \
                   (org_candidate[0].isupper() and ' ' in org_candidate and not any(digit.isdigit() for digit in org_candidate) and len(org_candidate.split()) > 1):
                    final_entities["ORGANIZATIONS"].append(org_candidate)
                else:
                    self.print_debug(f"Skipping ORG '{org_candidate}' (does not resemble typical organization name).")

        # PERSONS
        if "PERSON" in temp_entities:
            for person_candidate in temp_entities["PERSON"]:
                lowered_person = person_candidate.lower()
                if any(keyword in lowered_person for keyword in
                       [lp.lower() for lp in final_entities["CONTRACT_PARTIES"]] +
                       [lc.lower() for lc in final_entities["LEGAL_CONCEPTS"]]):
                    self.print_debug(f"Skipping PERSON '{person_candidate}' (likely a legal role/concept).")
                    continue
                if lowered_person in ["termination", "information", "compensation", "arbitration", "developer"]:
                    self.print_debug(f"Reclassifying PERSON '{person_candidate}' to LEGAL_CONCEPTS.")
                    final_entities["LEGAL_CONCEPTS"].append(person_candidate)
                    continue
                if len(person_candidate.split()) > 1 or re.match(r'^[A-Z]\.?\s?[A-Z][a-z]+$', person_candidate):
                    final_entities["PERSONS"].append(person_candidate)
                else:
                    self.print_debug(f"Skipping PERSON '{person_candidate}' (does not resemble typical person name).")

        # LOCATIONS (GPE)
        if "GPE" in temp_entities:
            for gpe_candidate in temp_entities["GPE"]:
                lowered_gpe = gpe_candidate.lower()
                if any(gpe_candidate in loc for loc in final_entities["GOVERNING_LAW_LOCATIONS"]):
                    continue
                if any(st in lowered_gpe for st in ["drive", "road", "street", "avenue", "boulevard"]):
                    self.print_debug(f"Skipping GPE '{gpe_candidate}' (likely just a street type).")
                    continue
                if lowered_gpe == "client":
                    final_entities["CONTRACT_PARTIES"].append(gpe_candidate)
                    continue
                final_entities["LOCATIONS"].append(gpe_candidate)

        # DATES
        if "DATE" in temp_entities:
            for date_candidate in temp_entities["DATE"]:
                if not re.search(r'\b\d{5}(?:-\d{4})?\b', date_candidate) and \
                   not any(date_candidate in cd for cd in final_entities["CONTRACT_DATES"]):
                    final_entities["CONTRACT_DATES"].append(date_candidate)

        # MONEY
        if "MONEY" in temp_entities:
            for money_candidate in temp_entities["MONEY"]:
                if not any(money_candidate in lm for lm in final_entities["MONEY_AMOUNTS"]):
                    final_entities["MONEY_AMOUNTS"].append(money_candidate)

        # CARDINAL and ORDINAL Numbers:
        if "CARDINAL" in temp_entities:
            for cardinal_candidate in temp_entities["CARDINAL"]:
                is_part_of_other_entity = False
                for entity_list in [final_entities["DURATIONS"], final_entities["MONEY_AMOUNTS"]]:
                    if any(cardinal_candidate in item for item in entity_list):
                        is_part_of_other_entity = True
                        break
                if not is_part_of_other_entity:
                    final_entities["CARDINAL_NUMBERS"].append(cardinal_candidate)

        if "ORDINAL" in temp_entities:
            final_entities["ORDINAL_NUMBERS"].extend(temp_entities["ORDINAL"])

        # Discard inherently irrelevant general spaCy entities for legal docs
        for discard_type in ["WORK_OF_ART", "PRODUCT", "EVENT", "FAC", "LANGUAGE"]:
            if discard_type in temp_entities:
                self.print_debug(f"Discarding {discard_type}: {temp_entities[discard_type]}")

        if "LAW" in temp_entities:
            for law_text in temp_entities["LAW"]:
                if "act" in law_text.lower() or "code" in law_text.lower():
                    final_entities.setdefault("LEGAL_STATUTES", []).append(law_text)
                else:
                    final_entities["LEGAL_CONCEPTS"].append(law_text)
        if "NORP" in temp_entities:
            final_entities.setdefault("NATIONALITIES_GROUPS", []).extend(temp_entities["NORP"])

        # --- Step 4: Deduplicate and Final Clean Up ---
        final_cleaned_entities = {}
        for key, value_list in final_entities.items():
            cleaned_list = list(set(value_list))
            if cleaned_list:
                final_cleaned_entities[key] = cleaned_list

        return final_cleaned_entities


    def summarize_text(self, text: str, sentences_count: int = 3) -> str:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, sentences_count)
        return " ".join(str(sentence) for sentence in summary)

    def calculate_signing_recommendation(self, text: str, clause_data: Dict[str, Any], extracted_entities: Dict[str, List[str]]) -> Dict[str, Any]:
        # Start with a neutral base score
        base_score = 50
        score = base_score
        findings = {
            "favorable_factors": [],
            "risk_factors": []
        }

        # Factor 1: Risk Patterns
        for name, risk_info in self.risk_patterns.items():
            matches = list(re.finditer(risk_info["pattern"], text, re.IGNORECASE))
            if matches:
                # Apply weight based on number of matches, but cap impact
                impact = risk_info["weight"] * min(len(matches), 3) # Cap impact for multiple occurrences
                score += impact
                findings["risk_factors"].append({
                    "type": name,
                    "description": risk_info["description"],
                    "weight": impact,
                    "matches": len(matches),
                    "examples": [text[max(0, m.start()-50):min(len(text), m.end()+50)] for m in matches[:2]]
                })

        # Factor 2: Favorable Patterns
        for name, favorable_info in self.favorable_patterns.items():
            matches = list(re.finditer(favorable_info["pattern"], text, re.IGNORECASE))
            if matches:
                # Apply weight based on number of matches, but cap impact
                impact = favorable_info["weight"] * min(len(matches), 3) # Cap impact for multiple occurrences
                score += impact
                findings["favorable_factors"].append({
                    "type": name,
                    "description": favorable_info["description"],
                    "weight": impact,
                    "matches": len(matches),
                    "examples": [text[max(0, m.start()-50):min(len(text), m.end()+50)] for m in matches[:2]]
                })

        # Factor 3: Presence/Absence of Key Clauses (from `identify_clauses`)
        critical_clauses = {
            "indemnification": "Missing indemnification clause",
            "governing_law": "Missing governing law clause",
            "termination": "Missing termination clause",
            "dispute_resolution": "Missing dispute resolution clause"
        }
        missing_clauses = []
        for clause_name, description in critical_clauses.items():
            # Check if list is empty for the clause name
            if not clause_data.get(clause_name):
                missing_clauses.append(clause_name)
                score -= 10 # Stronger penalty for missing critical clauses
                findings["risk_factors"].append({
                    "type": f"missing_{clause_name}",
                    "description": description,
                    "weight": -10
                })
            else:
                # If a critical clause IS present, add a slight positive
                score += 3
                findings["favorable_factors"].append({
                    "type": f"present_{clause_name}",
                    "description": f"Presence of {clause_name} clause",
                    "weight": 3
                })


        # Factor 4: Document Complexity / Readability
        word_count = len(text.split())
        if word_count < 200: # Very short document might indicate missing info
            score -= 10
            findings["risk_factors"].append({"type": "short_document", "description": "Document is very short, potentially incomplete", "weight": -10})
        elif word_count > 5000: # Very long documents can be complex
            score -= 5
            findings["risk_factors"].append({"type": "long_document", "description": "Document is very long, potentially complex", "weight": -5})

        avg_word_length = sum(len(word) for word in text.split()) / max(1, word_count)
        if avg_word_length > 7: # High average word length suggests complex language
            score -= (avg_word_length - 7) * 2 # More dynamic penalty
            findings["risk_factors"].append({
                "type": "complex_language",
                "description": f"Document uses complex language (avg word length: {avg_word_length:.2f})",
                "weight": -(round((avg_word_length - 7) * 2))
            })
        else: # Reward for simpler language
            score += 2


        # Factor 5: Entity Density (Example: presence of defined parties, money)
        if extracted_entities.get("CONTRACT_PARTIES"):
            score += 5 # Good to have clear parties
            findings["favorable_factors"].append({"type": "clear_parties", "description": "Clear identification of contract parties", "weight": 5})
        else:
            score -= 8
            findings["risk_factors"].append({"type": "unclear_parties", "description": "Ambiguous or missing contract parties", "weight": -8})

        if extracted_entities.get("MONEY_AMOUNTS"):
            score += 3 # Good to have money amounts defined
            findings["favorable_factors"].append({"type": "defined_money", "description": "Presence of monetary terms", "weight": 3})
        else:
            # Only a risk if it's a contract where money is expected
            # For a general analyzer, this is less critical unless specified
            pass

        if extracted_entities.get("GOVERNING_LAW_LOCATIONS"):
            score += 4 # Good to have governing law
            findings["favorable_factors"].append({"type": "defined_governing_law", "description": "Clearly defined governing law", "weight": 4})
        else:
            score -= 7
            findings["risk_factors"].append({"type": "missing_governing_law_entity", "description": "Governing law entity not explicitly found", "weight": -7})


        # Cap the score to stay within 0-100
        final_score = max(0, min(100, score))

        if final_score >= 80:
            recommendation = "Highly Favorable - Confident to sign after normal review."
        elif final_score >= 65: # Adjusted thresholds
            recommendation = "Favorable - Consider signing with normal review."
        elif final_score >= 50: # Adjusted thresholds
            recommendation = "Moderately Favorable - Review carefully; minor issues may exist."
        elif final_score >= 35: # Adjusted thresholds
            recommendation = "Neutral to Potentially Unfavorable - Consult legal professional for review."
        elif final_score >= 20:
            recommendation = "Potentially Unfavorable - Negotiate changes; significant risks identified."
        else:
            recommendation = "Highly Unfavorable - Do not sign; significant revisions or rejection recommended."

        return {
            "percentage": final_score,
            "recommendation": recommendation,
            "findings": findings,
            "missing_clauses": missing_clauses
        }

    def analyze(self, file_path: str) -> AnalysisResult:
        raw_text = self.load_document(file_path)
        cleaned_text = raw_text # Keep raw_text for line numbering based on original structure
        clauses = self.identify_clauses(cleaned_text)
        entities = self.extract_entities(cleaned_text) # Extract entities first
        return AnalysisResult(
            clauses=clauses,
            entities=entities, # Pass extracted entities
            summary=self.summarize_text(cleaned_text),
            statistics={
                "word_count": len(cleaned_text.split()),
                "char_count": len(cleaned_text),
                "paragraph_count": len(re.findall(r'\n\s*\n', raw_text)) # Use raw_text for paragraph count
            },
            cleaned_text=cleaned_text,
            # Pass extracted_entities to calculate_signing_recommendation
            signing_recommendation=self.calculate_signing_recommendation(cleaned_text, clauses, entities)
        )