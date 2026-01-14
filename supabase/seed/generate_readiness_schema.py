
import json
from pathlib import Path


def option(value: str, label: str, score_value: str | None = None) -> dict:
    item = {"value": value, "label": label}
    if score_value is not None and score_value != value:
        item["score_value"] = score_value
    return item


def question(
    question_id: str,
    item_id: str,
    section_id: str,
    dimension: str,
    prompt: str,
    options: list[dict],
    *,
    weight: int = 1,
    applies_if: str = "always",
    system_na: bool = False,
    question_meta: dict | None = None,
) -> dict:
    payload = {
        "id": question_id,
        "item_id": item_id,
        "section_id": section_id,
        "dimension": dimension,
        "weight": weight,
        "prompt": prompt,
        "type": "single_select",
        "options": options,
        "applies_if": applies_if,
    }

    if system_na:
        payload["system_na"] = True
    if question_meta:
        payload["question_meta"] = question_meta
    return payload


def gate(when: str, when_na: str, question_id: str) -> list[dict]:
    return [
        {"when": when, "questions": [question_id], "result": "ask"},
        {"when": when_na, "questions": [question_id], "result": "na", "flag": "follow_up"},
    ]


ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "supabase" / "seed" / "readiness_v1_schema.json"
MIGRATION_PATH = (
    ROOT / "supabase" / "migrations" / "20260109005000_update_readiness_schema.sql"
)

dimensions = [
    {"id": "Legal_Planning", "label": "Legal Planning & Decision Makers"},
    {"id": "Health_Care", "label": "Health Care"},
    {"id": "Financial_Insurance", "label": "Financial & Insurance Planning"},
    {"id": "Family_Relationships", "label": "Family Relationships & Roles"},
    {"id": "Home_Pet_Daily_Life", "label": "Home, Pet & Daily Life"},
    {"id": "Digital_Life", "label": "Digital Life & Online Presence"},
    {"id": "Funeral_Memorial", "label": "Funeral, Memorial & Body Disposition"},
    {"id": "Emotional_Spiritual", "label": "Emotional & Spiritual"},
    {"id": "Supporting_Aging_Parents", "label": "Supporting Aging Parents"},
    {"id": "Home_Personal_Property", "label": "Home & Personal Property"},
    {"id": "Document_Storage", "label": "Document Storage"},
]

sections = [
    {
        "id": "1",
        "label": "Legal Planning & Decision Makers",
        "dimension": "Legal_Planning",
        "weight": 25,
    },
    {"id": "2", "label": "Health Care", "dimension": "Health_Care", "weight": 15},
    {
        "id": "3",
        "label": "Financial & Insurance Planning",
        "dimension": "Financial_Insurance",
        "weight": 20,
    },
    {
        "id": "4",
        "label": "Family Relationships & Roles",
        "dimension": "Family_Relationships",
        "weight": 10,
    },
    {
        "id": "5",
        "label": "Home, Pet & Daily Life",
        "dimension": "Home_Pet_Daily_Life",
        "weight": 10,
    },
    {
        "id": "6",
        "label": "Digital Life & Online Presence",
        "dimension": "Digital_Life",
        "weight": 5,
    },
    {
        "id": "7",
        "label": "Funeral, Memorial & Body Disposition",
        "dimension": "Funeral_Memorial",
        "weight": 5,
    },
    {
        "id": "8",
        "label": "Emotional & Spiritual",
        "dimension": "Emotional_Spiritual",
        "weight": 3,
    },
    {
        "id": "9",
        "label": "Supporting Aging Parents",
        "dimension": "Supporting_Aging_Parents",
        "weight": 2,
    },
    {
        "id": "10",
        "label": "Home & Personal Property",
        "dimension": "Home_Personal_Property",
        "weight": 3,
    },
    {
        "id": "11",
        "label": "Document Storage",
        "dimension": "Document_Storage",
        "weight": 2,
    },
]

profile_questions = [
    {
        "id": "profile.financial.has_beneficiary_accounts",
        "field": "financial.has_beneficiary_accounts",
        "prompt": "Do any of your accounts allow you to name beneficiaries?",
        "type": "single_select",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
        ],
        "value_map": {"yes": True, "no": False},
    },
    {
        "id": "profile.household.has_dependents",
        "field": "household.has_dependents",
        "prompt": "Do other people depend on you for care or financial support?",
        "type": "single_select",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
        ],
        "value_map": {"yes": True, "no": False},
    },
    {
        "id": "profile.pets.has_pets",
        "field": "pets.has_pets",
        "prompt": "Do you have pets that depend on you?",
        "type": "single_select",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
        ],
        "value_map": {"yes": True, "no": False},
    },
    {
        "id": "profile.digital.owns_crypto",
        "field": "digital.owns_crypto",
        "prompt": "Do you own any digital or cryptocurrency assets?",
        "type": "single_select",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
        ],
        "value_map": {"yes": True, "no": False},
    },
    {
        "id": "profile.family.supports_aging_parent",
        "field": "family.supports_aging_parent",
        "prompt": "Are you currently helping support an aging parent?",
        "type": "single_select",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
        ],
        "value_map": {"yes": True, "no": False},
    },
    {
        "id": "profile.home.owns_real_property",
        "field": "home.owns_real_property",
        "prompt": "Do you own your home or other real property?",
        "type": "single_select",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
        ],
        "value_map": {"yes": True, "no": False},
    },
    {
        "id": "profile.home.has_significant_personal_property",
        "field": "home.has_significant_personal_property",
        "prompt": "Do you own items of significant personal value?",
        "type": "single_select",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
        ],
        "value_map": {"yes": True, "no": False},
    },
    {
        "id": "profile.emotional.has_spiritual_practices",
        "field": "emotional.has_spiritual_practices",
        "prompt": "Do you have spiritual or cultural practices you'd want included?",
        "type": "single_select",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
        ],
        "value_map": {"yes": True, "no": False},
    },
]

profile_gates = [
    {
        "when": "profile.financial.has_beneficiary_accounts == false",
        "questions": ["3.4", "3.5"],
        "result": "na",
        "flag": "not_applicable",
    },
    {
        "when": "profile.pets.has_pets == false",
        "questions": ["5.4", "5.5"],
        "result": "na",
        "flag": "not_applicable",
    },
    {
        "when": "profile.emotional.has_spiritual_practices == false",
        "questions": ["8.1", "8.2"],
        "result": "na",
        "flag": "not_applicable",
    },
    {
        "when": "profile.digital.owns_crypto == false",
        "questions": ["6.7"],
        "result": "na",
        "flag": "not_applicable",
    },
    {
        "when": "profile.family.supports_aging_parent == false",
        "questions": ["9.2", "9.3", "9.4"],
        "result": "na",
        "flag": "not_applicable",
    },
    {
        "when": "profile.home.owns_real_property == false",
        "questions": ["10.1", "10.2"],
        "result": "na",
        "flag": "not_applicable",
    },
    {
        "when": "profile.home.has_significant_personal_property == false",
        "questions": ["10.5"],
        "result": "na",
        "flag": "not_applicable",
    },
]

questions = [
    question(
        "1.1.A.1",
        "legal.will.evaluation",
        "1",
        "Legal_Planning",
        "Have you ever evaluated whether you need a will?",
        [
            option("yes", "Yes, evaluation completed"),
            option("partial", "Evaluation started but not completed"),
            option("no", "No, never evaluated"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "1.1.A.2",
        "legal.will.evaluation_determination",
        "1",
        "Legal_Planning",
        "If evaluated, was a determination made about whether a will is appropriate for you?",
        [
            option("yes", "Yes, determination made and documented"),
            option("partial", "Determination made but not documented"),
            option("no", "No determination made"),
            option("na", "Not applicable"),
            option("not_sure", "Not sure"),
        ],
        applies_if="answers['1.1.A.1'] in ['yes','partial']",
        system_na=True,
    ),
    question(
        "1.1.A.3",
        "legal.trust.evaluation",
        "1",
        "Legal_Planning",
        "Have you ever evaluated whether a trust may be appropriate for your situation?",
        [
            option("yes", "Yes, evaluation completed"),
            option("partial", "Evaluation started but not completed"),
            option("no", "No, never evaluated"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "1.1.A.4",
        "legal.trust.evaluation_determination",
        "1",
        "Legal_Planning",
        "If evaluated, was a determination made about whether a trust is appropriate?",
        [
            option("yes", "Yes, determination made and documented"),
            option("partial", "Determination made but not documented"),
            option("no", "No determination made"),
            option("na", "Not applicable"),
            option("not_sure", "Not sure"),
        ],
        applies_if="answers['1.1.A.3'] in ['yes','partial']",
        system_na=True,
    ),
    question(
        "1.1.A.5",
        "legal.evaluation.professional_input",
        "1",
        "Legal_Planning",
        "Was any part of your legal planning evaluation done with professional input?",
        [option("yes", "Yes"), option("no", "No"), option("not_sure", "Not sure")],
    ),
    question(
        "1.1.A.6",
        "legal.plan.review_triggers",
        "1",
        "Legal_Planning",
        "Have you identified events that would trigger a review of your legal plan?",
        [
            option("yes", "Yes, documented"),
            option("partial", "Identified but not documented"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "1.1.A.7",
        "legal.documents.align_with_evaluation",
        "1",
        "Legal_Planning",
        "Do you believe your current legal documents reflect your most recent legal planning evaluation?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if=(
            "answers['1.1.B.1'] in ['yes','partial'] or "
            "answers['1.1.B.3'] in ['yes','partial'] or "
            "answers['1.1.B.5'] in ['yes','partial'] or "
            "answers['1.1.B.7'] in ['yes','partial'] or "
            "answers['1.1.B.8'] in ['yes','partial']"
        ),
        system_na=True,
    ),
    question(
        "1.1.B.1",
        "legal.will.exists",
        "1",
        "Legal_Planning",
        "Do you currently have a legally valid will?",
        [
            option("yes", "Yes, completed and signed"),
            option("partial", "Drafted but not signed"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "1.1.B.2",
        "legal.will.access",
        "1",
        "Legal_Planning",
        "Is the original or a court-acceptable copy of your will easy to locate if needed?",
        [
            option("yes", "Yes"),
            option("partial", "Location exists but unclear"),
            option("partial", "Draft only"),
            option("na", "Not applicable"),
            option("not_sure", "Not sure"),
        ],
        applies_if="answers['1.1.B.1'] in ['yes','partial']",
        system_na=True,
    ),
    question(
        "1.1.B.3",
        "legal.trust.exists",
        "1",
        "Legal_Planning",
        "Do you have a revocable living trust?",
        [
            option("yes", "Yes, completed and signed"),
            option("partial", "Drafted but not signed"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "1.1.B.4",
        "legal.trust.access",
        "1",
        "Legal_Planning",
        "If you have a trust, can the signed trust document be easily located if needed?",
        [
            option("yes", "Yes"),
            option("partial", "Location exists but unclear"),
            option("partial", "Only a draft exists"),
            option("na", "Not applicable"),
            option("not_sure", "Not sure"),
        ],
        applies_if="answers['1.1.B.3'] in ['yes','partial']",
        system_na=True,
    ),
    question(
        "1.1.B.4a",
        "legal.trust.funding",
        "1",
        "Legal_Planning",
        "Have assets been moved into your trust (often called 'funding' the trust)?",
        [
            option("yes", "Yes, most or all"),
            option("partial", "Some assets"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="answers['1.1.B.3'] in ['yes','partial']",
        system_na=True,
    ),
    question(
        "1.1.B.5",
        "legal.fpoa.exists",
        "1",
        "Legal_Planning",
        "Do you have a financial power of attorney?",
        [
            option("yes", "Yes, completed and signed"),
            option("partial", "Drafted but not signed"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "1.1.B.6",
        "legal.fpoa.acceptance",
        "1",
        "Legal_Planning",
        "If someone needed to use your financial power of attorney, would your banks accept it?",
        [
            option("yes", "Yes, all major institutions"),
            option("partial", "Some institutions"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="answers['1.1.B.5'] in ['yes','partial']",
        system_na=True,
    ),
    question(
        "1.1.B.7",
        "legal.hpoa.exists",
        "1",
        "Legal_Planning",
        "Do you have a healthcare power of attorney or healthcare proxy?",
        [
            option("yes", "Yes, completed and signed"),
            option("partial", "Drafted but not signed"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "1.1.B.8",
        "legal.body_disposition.document",
        "1",
        "Legal_Planning",
        "Do you have a written document that explains what should happen to your body after death (where required by law)?",
        [
            option("yes", "Yes, completed and signed"),
            option("partial", "Written but not finalized"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
    ),
    question(
        "1.1.B.9",
        "legal.practical_guide.exists",
        "1",
        "Legal_Planning",
        "Do you have a written guide (separate from legal documents) that explains practical information like where things are or what to do first?",
        [
            option("yes", "Yes, completed and accessible"),
            option("partial", "Exists but incomplete"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "1.1.B.10",
        "legal.documents.current",
        "1",
        "Legal_Planning",
        "Are all completed legal documents current and up to date?",
        [
            option("yes", "Yes, all"),
            option("partial", "Some outdated"),
            option("no", "Most outdated"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if=(
            "answers['1.1.B.1'] in ['yes','partial'] or "
            "answers['1.1.B.3'] in ['yes','partial'] or "
            "answers['1.1.B.5'] in ['yes','partial'] or "
            "answers['1.1.B.7'] in ['yes','partial'] or "
            "answers['1.1.B.8'] in ['yes','partial']"
        ),
        system_na=True,
    ),
    question(
        "1.1.B.11",
        "legal.documents.shared",
        "1",
        "Legal_Planning",
        "Have copies of completed legal documents been shared with the people who may need them?",
        [
            option("yes", "Yes, all"),
            option("partial", "Some"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if=(
            "answers['1.1.B.1'] in ['yes','partial'] or "
            "answers['1.1.B.3'] in ['yes','partial'] or "
            "answers['1.1.B.5'] in ['yes','partial'] or "
            "answers['1.1.B.7'] in ['yes','partial'] or "
            "answers['1.1.B.8'] in ['yes','partial']"
        ),
        system_na=True,
    ),
    question(
        "2.1",
        "healthcare.advance_directive.exists",
        "2",
        "Health_Care",
        "Do you have an advance directive or living will?",
        [
            option("yes", "Yes, completed and signed"),
            option("partial", "Drafted but not signed"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "2.2",
        "healthcare.advance_directive.instructions",
        "2",
        "Health_Care",
        "Does your advance directive include any written medical instructions (you do not need to know or share what they are)?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="answers['2.1'] in ['yes','partial']",
        system_na=True,
    ),
    question(
        "2.3",
        "healthcare.hipaa_release.exists",
        "2",
        "Health_Care",
        "Do you have a HIPAA authorization or medical information release?",
        [
            option("yes", "Yes, completed and signed"),
            option("partial", "Drafted but not signed"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "2.4",
        "healthcare.documents.on_file",
        "2",
        "Health_Care",
        "Are your healthcare documents on file with your doctors or in a patient portal?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if=(
            "answers['2.1'] in ['yes','partial'] or "
            "answers['2.3'] in ['yes','partial'] or "
            "answers['1.1.B.7'] in ['yes','partial']"
        ),
        system_na=True,
    ),
    question(
        "2.5",
        "healthcare.medical_info.list_access",
        "2",
        "Health_Care",
        "Is there a list of your medications, allergies, and doctors that someone could easily access?",
        [
            option("yes", "Yes, complete"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "2.6",
        "healthcare.access_plan.home_phone",
        "2",
        "Health_Care",
        "Is there a plan for how someone could access your home or phone if you were incapacitated?",
        [
            option("yes", "Yes"),
            option("partial", "Informal only"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "2.7",
        "healthcare.organ_donor.registered",
        "2",
        "Health_Care",
        "Are you registered as an organ donor or otherwise documented?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "2.8",
        "healthcare.body_donation.enrollment",
        "2",
        "Health_Care",
        "If applicable, have you completed any body donation enrollment paperwork?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("na", "Not applicable"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "3.1",
        "financial.assets_debts.list",
        "3",
        "Financial_Insurance",
        "Is there a list of your assets and debts that someone could access if needed?",
        [
            option("yes", "Yes, complete"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "3.2",
        "financial.accounts.manageability",
        "3",
        "Financial_Insurance",
        "Could someone step in and manage key accounts and obligations within about 30 days?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "3.4",
        "financial.beneficiaries.set",
        "3",
        "Financial_Insurance",
        "Are beneficiaries set up on all applicable accounts?",
        [
            option("yes", "All complete"),
            option("partial", "Some missing"),
            option("no", "Most missing"),
            option("no", "None"),
            option("not_sure", "Not sure"),
        ],
        applies_if="profile.financial.has_beneficiary_accounts == true",
        system_na=True,
    ),
    question(
        "3.5",
        "financial.beneficiaries.reviewed",
        "3",
        "Financial_Insurance",
        "Have beneficiary designations been reviewed in the last 5 years?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
        applies_if="profile.financial.has_beneficiary_accounts == true",
        system_na=True,
    ),
    question(
        "3.6",
        "financial.insurance.coverage",
        "3",
        "Financial_Insurance",
        "Do you currently have any life, long-term care, disability, or health insurance?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "3.7",
        "financial.final_expenses.plan",
        "3",
        "Financial_Insurance",
        "Is there a plan in place to cover final expenses?",
        [
            option("yes", "Yes, funded or prepaid"),
            option("partial", "Planned but not funded"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "3.8",
        "financial.recurring_bills.list",
        "3",
        "Financial_Insurance",
        "Is there a list of recurring bills, debts, or obligations someone could follow?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "3.9",
        "financial.manageability.self_assessed",
        "3",
        "Financial_Insurance",
        "Do you feel your finances could be difficult for others to manage if something happened?",
        [
            option("yes", "Yes", score_value="no"),
            option("no", "No", score_value="yes"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "4.2",
        "family.emergency_contacts.list",
        "4",
        "Family_Relationships",
        "Is there a written list of who should be contacted in an emergency?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "4.3",
        "family.documents.shared",
        "4",
        "Family_Relationships",
        "Have you shared where important documents are and who can make decisions?",
        [
            option("yes", "Yes"),
            option("partial", "Partially"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "4.4",
        "family.exclusions.guidance",
        "4",
        "Family_Relationships",
        "Is there written guidance about anyone who should not be involved in decisions?",
        [
            option("yes", "Yes"),
            option("partial", "Verbal only"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "5.1",
        "home.daily_responsibilities.plan",
        "5",
        "Home_Pet_Daily_Life",
        "Is there a plan for how your home and daily responsibilities would be handled?",
        [
            option("yes", "Yes"),
            option("partial", "Informal"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "5.2",
        "home.utilities.access_info",
        "5",
        "Home_Pet_Daily_Life",
        "Are utilities, access instructions, and service contacts written down somewhere?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "5.4",
        "home.pets.care_plan",
        "5",
        "Home_Pet_Daily_Life",
        "If yes, is there a written plan for their care?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.pets.has_pets == true",
        system_na=True,
    ),
    question(
        "5.5",
        "home.pets.records_access",
        "5",
        "Home_Pet_Daily_Life",
        "Are pet records and care instructions easy to find?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.pets.has_pets == true",
        system_na=True,
    ),
    question(
        "6.1",
        "digital.account_access.method",
        "6",
        "Digital_Life",
        "Is there a way someone could access your online accounts if needed (for example, a password manager)?",
        [
            option("yes", "Yes, complete"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "6.2",
        "digital.device_access.guidance",
        "6",
        "Digital_Life",
        "Is there guidance for accessing your phone or computer in an emergency?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "6.3",
        "digital.accounts.list",
        "6",
        "Digital_Life",
        "Is there a list of your important online accounts?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "6.4",
        "digital.account_inactivity_settings",
        "6",
        "Digital_Life",
        "On platforms like Apple, Google, or social media, have you set up settings for what happens to your account if you cannot use it?",
        [
            option("yes", "Yes, on all platforms"),
            option("partial", "Yes, on some"),
            option("no", "No"),
            option("na", "Not applicable"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "6.5",
        "digital.files.backup_access",
        "6",
        "Digital_Life",
        "Are important digital files backed up and accessible?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "6.7",
        "digital.assets.crypto.access_plan",
        "6",
        "Digital_Life",
        "If yes, is there a way someone could access or recover them if needed?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.digital.owns_crypto == true",
        system_na=True,
    ),
    question(
        "6.8",
        "digital.assets.mentioned_in_estate_docs",
        "6",
        "Digital_Life",
        "Do your estate documents mention digital assets?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
    ),
    question(
        "7.1",
        "final.guidance.after_death",
        "7",
        "Funeral_Memorial",
        "Is there written guidance about what should happen after death?",
        [
            option("yes", "Yes, accessible"),
            option("partial", "Exists but hard to find"),
            option("partial", "Verbal only"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "7.2",
        "final.arrangements.prepaid",
        "7",
        "Funeral_Memorial",
        "Have any funeral or cremation arrangements been prepaid or set up?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "7.3",
        "final.arrangements.guidance",
        "7",
        "Funeral_Memorial",
        "Is there written guidance to help others handle arrangements?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "7.4",
        "final.charitable_gifts.documented",
        "7",
        "Funeral_Memorial",
        "Are any charitable gifts at death written down somewhere?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "8.1",
        "emotional.spiritual_practices.documented",
        "8",
        "Emotional_Spiritual",
        "Are any spiritual or cultural practices written down?",
        [
            option("yes", "Yes"),
            option("partial", "Verbal only"),
            option("no", "No"),
            option("na", "Not applicable"),
            option("not_sure", "Not sure"),
        ],
        applies_if="profile.emotional.has_spiritual_practices == true",
        system_na=True,
    ),
    question(
        "8.2",
        "emotional.spiritual_contacts.list",
        "8",
        "Emotional_Spiritual",
        "Is there a written note about who to contact for spiritual support, if applicable?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("na", "Not applicable"),
            option("not_sure", "Not sure"),
        ],
        applies_if="profile.emotional.has_spiritual_practices == true",
        system_na=True,
    ),
    question(
        "8.3",
        "emotional.messages.prepared",
        "8",
        "Emotional_Spiritual",
        "Have you prepared any messages or notes you would want others to receive?",
        [
            option("yes", "Yes"),
            option("partial", "In progress"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "9.2",
        "parents.legal_permission",
        "9",
        "Supporting_Aging_Parents",
        "If yes, do you have legal permission to help make decisions if needed?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.family.supports_aging_parent == true",
        system_na=True,
    ),
    question(
        "9.3",
        "parents.key_info.list",
        "9",
        "Supporting_Aging_Parents",
        "Is there a list of your parent's key information you could access?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.family.supports_aging_parent == true",
        system_na=True,
    ),
    question(
        "9.4",
        "parents.documents.access_speed",
        "9",
        "Supporting_Aging_Parents",
        "If needed, how quickly could you find their important documents?",
        [
            option("yes", "Within 24 hours"),
            option("partial", "Within a week"),
            option("no", "Longer"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.family.supports_aging_parent == true",
        system_na=True,
    ),
    question(
        "10.1",
        "home.title.documents_access",
        "10",
        "Home_Personal_Property",
        "Are ownership or title documents easy to find?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.home.owns_real_property == true",
        system_na=True,
    ),
    question(
        "10.2",
        "home.maintenance.issues_documented",
        "10",
        "Home_Personal_Property",
        "Are any major home maintenance issues written down?",
        [
            option("yes", "Yes"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.home.owns_real_property == true",
        system_na=True,
    ),
    question(
        "10.3",
        "home.belongings.reduced",
        "10",
        "Home_Personal_Property",
        "Have you reduced belongings to make things easier for others?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "10.5",
        "home.personal_property.plan",
        "10",
        "Home_Personal_Property",
        "If yes, is there a written list or plan for those items?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
            option("na", "Not applicable"),
        ],
        applies_if="profile.home.has_significant_personal_property == true",
        system_na=True,
    ),
    question(
        "11.1",
        "documents.storage.single_location",
        "11",
        "Document_Storage",
        "Are most important documents kept in one main place?",
        [
            option("yes", "Yes"),
            option("partial", "Multiple locations"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "11.2",
        "documents.storage.access_shared",
        "11",
        "Document_Storage",
        "Do trusted people know how to access those documents?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "11.3",
        "documents.storage.start_guide",
        "11",
        "Document_Storage",
        "Is there a single 'start here' guide explaining what exists and where it is?",
        [
            option("yes", "Yes"),
            option("partial", "Partial"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
    question(
        "11.4",
        "documents.storage.originals_access",
        "11",
        "Document_Storage",
        "Are original documents accessible if needed?",
        [
            option("yes", "Yes"),
            option("partial", "Access may be difficult"),
            option("no", "No"),
            option("not_sure", "Not sure"),
        ],
    ),
]
soft_gates: list[dict] = []
soft_gates += gate(
    "answers['1.1.A.1'] in ['yes','partial']",
    "answers['1.1.A.1'] in ['no','not_sure']",
    "1.1.A.2",
)
soft_gates += gate(
    "answers['1.1.A.3'] in ['yes','partial']",
    "answers['1.1.A.3'] in ['no','not_sure']",
    "1.1.A.4",
)
soft_gates += gate(
    "answers['1.1.B.1'] in ['yes','partial']",
    "answers['1.1.B.1'] in ['no','not_sure']",
    "1.1.B.2",
)
soft_gates += gate(
    "answers['1.1.B.3'] in ['yes','partial']",
    "answers['1.1.B.3'] in ['no','not_sure']",
    "1.1.B.4",
)
soft_gates += gate(
    "answers['1.1.B.3'] in ['yes','partial']",
    "answers['1.1.B.3'] in ['no','not_sure']",
    "1.1.B.4a",
)
soft_gates += gate(
    "answers['1.1.B.5'] in ['yes','partial']",
    "answers['1.1.B.5'] in ['no','not_sure']",
    "1.1.B.6",
)
soft_gates += gate(
    "answers['1.1.B.1'] in ['yes','partial'] or "
    "answers['1.1.B.3'] in ['yes','partial'] or "
    "answers['1.1.B.5'] in ['yes','partial'] or "
    "answers['1.1.B.7'] in ['yes','partial'] or "
    "answers['1.1.B.8'] in ['yes','partial']",
    "answers['1.1.B.1'] in ['no','not_sure'] and "
    "answers['1.1.B.3'] in ['no','not_sure'] and "
    "answers['1.1.B.5'] in ['no','not_sure'] and "
    "answers['1.1.B.7'] in ['no','not_sure'] and "
    "answers['1.1.B.8'] in ['no','not_sure']",
    "1.1.A.7",
)
soft_gates += gate(
    "answers['1.1.B.1'] in ['yes','partial'] or "
    "answers['1.1.B.3'] in ['yes','partial'] or "
    "answers['1.1.B.5'] in ['yes','partial'] or "
    "answers['1.1.B.7'] in ['yes','partial'] or "
    "answers['1.1.B.8'] in ['yes','partial']",
    "answers['1.1.B.1'] in ['no','not_sure'] and "
    "answers['1.1.B.3'] in ['no','not_sure'] and "
    "answers['1.1.B.5'] in ['no','not_sure'] and "
    "answers['1.1.B.7'] in ['no','not_sure'] and "
    "answers['1.1.B.8'] in ['no','not_sure']",
    "1.1.B.10",
)
soft_gates += gate(
    "answers['1.1.B.1'] in ['yes','partial'] or "
    "answers['1.1.B.3'] in ['yes','partial'] or "
    "answers['1.1.B.5'] in ['yes','partial'] or "
    "answers['1.1.B.7'] in ['yes','partial'] or "
    "answers['1.1.B.8'] in ['yes','partial']",
    "answers['1.1.B.1'] in ['no','not_sure'] and "
    "answers['1.1.B.3'] in ['no','not_sure'] and "
    "answers['1.1.B.5'] in ['no','not_sure'] and "
    "answers['1.1.B.7'] in ['no','not_sure'] and "
    "answers['1.1.B.8'] in ['no','not_sure']",
    "1.1.B.11",
)
soft_gates += gate(
    "answers['2.1'] in ['yes','partial']",
    "answers['2.1'] in ['no','not_sure']",
    "2.2",
)
soft_gates += gate(
    "answers['2.1'] in ['yes','partial'] or "
    "answers['2.3'] in ['yes','partial'] or "
    "answers['1.1.B.7'] in ['yes','partial']",
    "answers['2.1'] in ['no','not_sure'] and "
    "answers['2.3'] in ['no','not_sure'] and "
    "answers['1.1.B.7'] in ['no','not_sure']",
    "2.4",
)

schema = {
    "assessment_id": "readiness_v1",
    "version": "v1",
    "dimensions": dimensions,
    "sections": sections,
    "profile_questions": profile_questions,
    "profile_gates": profile_gates,
    "soft_gates": soft_gates,
    "answer_scoring": {
        "yes": 1.0,
        "partial": 0.5,
        "no": 0.0,
        "not_sure": 0.25,
        "na": None,
    },
    "flags": {
        "review_on": ["not_sure"],
        "follow_up_on": ["na"],
        "risk_on": [],
    },
    "score_bands": [
        {"min": 80, "max": 100, "label": "Highly Prepared"},
        {"min": 60, "max": 79, "label": "Moderately Prepared"},
        {"min": 40, "max": 59, "label": "Limited Preparedness"},
        {"min": 0, "max": 39, "label": "Low Readiness / High Risk"},
    ],
    "questions": questions,
}

SCHEMA_PATH.write_text(json.dumps(schema, indent=2, ensure_ascii=True), encoding="utf-8")

schema_json = json.dumps(schema, indent=2, ensure_ascii=True)
sql = f"""-- Update readiness schema
insert into readiness_v1.assessment_schemas (assessment_id, version, schema_json)
values ('readiness_v1', 'v1', $$
{schema_json}
$$::jsonb)
on conflict (assessment_id, version)
 do update set schema_json = excluded.schema_json;
"""

MIGRATION_PATH.write_text(sql, encoding="utf-8")
