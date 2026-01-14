-- Seed readiness schema
insert into readiness_v1.assessment_schemas (assessment_id, version, schema_json)
values ('readiness_v1', 'v1', $$
{
  "assessment_id": "readiness_v1",
  "version": "v1",
  "dimensions": [
    {
      "id": "Legal",
      "label": "Legal Foundations and Trusts"
    },
    {
      "id": "Decision_Makers_and_Guardianship",
      "label": "Decision Makers and Guardianship"
    },
    {
      "id": "Communication_and_Access",
      "label": "Communication and Access"
    },
    {
      "id": "Financial",
      "label": "Financial"
    },
    {
      "id": "Healthcare",
      "label": "Healthcare"
    },
    {
      "id": "Digital",
      "label": "Digital"
    },
    {
      "id": "Physical_and_Household",
      "label": "Physical and Household"
    },
    {
      "id": "Final_Arrangements",
      "label": "Final Arrangements"
    }
  ],
  "sections": [
    {
      "id": "1",
      "label": "Legal Foundations and Core Estate Documents",
      "dimension": "Legal",
      "weight": 22
    },
    {
      "id": "2",
      "label": "Decision Makers, Guardianship, Role Clarity",
      "dimension": "Decision_Makers_and_Guardianship",
      "weight": 12
    },
    {
      "id": "3",
      "label": "Document Access, Storage, Emergency Findability",
      "dimension": "Communication_and_Access",
      "weight": 12
    },
    {
      "id": "4",
      "label": "Trust Funding and Implementation",
      "dimension": "Legal",
      "weight": 14
    },
    {
      "id": "5",
      "label": "Financial Accounts, Beneficiaries, Cashflow Continuity",
      "dimension": "Financial",
      "weight": 14
    },
    {
      "id": "6",
      "label": "Insurance, Benefits, Program Access",
      "dimension": "Financial",
      "weight": 6
    },
    {
      "id": "7",
      "label": "Healthcare Execution and Provider Access",
      "dimension": "Healthcare",
      "weight": 10
    },
    {
      "id": "8",
      "label": "Digital Life, Devices, Online Assets",
      "dimension": "Digital",
      "weight": 6
    },
    {
      "id": "9",
      "label": "Home Readiness, Household Operations, Property Transfer",
      "dimension": "Physical_and_Household",
      "weight": 8
    },
    {
      "id": "10",
      "label": "Personal Property, Heirlooms, Items of Value",
      "dimension": "Physical_and_Household",
      "weight": 6
    },
    {
      "id": "11",
      "label": "Pets and Animal Dependents",
      "dimension": "Physical_and_Household",
      "weight": 4
    },
    {
      "id": "12",
      "label": "Final Arrangements and After-Death Instructions",
      "dimension": "Final_Arrangements",
      "weight": 6
    },
    {
      "id": "13",
      "label": "Business Interests, Shared Responsibilities, Things Only You Know",
      "dimension": "Communication_and_Access",
      "weight": 4
    }
  ],
  "profile_gates": [
    {
      "when": "profile.estate.has_trust == false",
      "questions": [
        "1.2",
        "2.2",
        "4.1",
        "4.2",
        "4.3"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.household.has_dependents == false",
      "questions": [
        "2.3"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.pets.has_pets == false",
      "questions": [
        "11.1",
        "11.2"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.estate.business_interests == false",
      "questions": [
        "13.1"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.digital.owns_crypto == false",
      "questions": [
        "8.3"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.access.has_safe_deposit_box == false",
      "questions": [
        "3.4"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.financial.has_beneficiary_accounts == false",
      "questions": [
        "5.2"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.financial.has_insurance_coverage == false",
      "questions": [
        "6.1"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.financial.has_employer_or_gov_benefits == false",
      "questions": [
        "6.2"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.healthcare.has_primary_provider == false",
      "questions": [
        "7.2"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.residence.primary_residence_type == 'none'",
      "questions": [
        "9.1",
        "9.2",
        "9.3"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "profile.residence.primary_residence_type != 'own'",
      "questions": [
        "9.4"
      ],
      "result": "na",
      "flag": "follow_up"
    }
  ],
  "soft_gates": [
    {
      "when": "answers['1.1'] in ['yes', 'partial']",
      "questions": [
        "1.1a"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1'] in ['no', 'not_sure']",
      "questions": [
        "1.1a"
      ],
      "result": "na",
      "flag": "follow_up"
    }
  ],
  "answer_scoring": {
    "yes": 1.0,
    "partial": 0.5,
    "no": 0.0,
    "not_sure": 0.0,
    "na": null
  },
  "flags": {
    "review_on": [
      "not_sure"
    ],
    "follow_up_on": [
      "na"
    ],
    "risk_on": [
      "no in sections 1-5",
      "trust exists and 4.1/4.2/4.3 != yes",
      "access items answered partial/no",
      "home readiness 9.1-9.3 in partial/no/not_sure"
    ]
  },
  "questions": [
    {
      "id": "1.1",
      "item_id": "legal.will.exists_access",
      "section_id": "1",
      "dimension": "Legal",
      "weight": 6,
      "prompt": "Have you documented whether you have a valid, signed Will (or equivalent) that reflects your current intentions?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "1.1a",
      "item_id": "legal.will.review_recency",
      "section_id": "1",
      "dimension": "Legal",
      "weight": 3,
      "prompt": "When is the last time you personally read your Will to confirm it reflects what you believe your wishes are today?",
      "type": "single_select",
      "options": [
        {
          "value": "within_12_months",
          "label": "Within the last 12 months",
          "score_value": "yes"
        },
        {
          "value": "within_1_3_years",
          "label": "1-3 years ago",
          "score_value": "partial"
        },
        {
          "value": "more_than_3_years",
          "label": "More than 3 years ago",
          "score_value": "no"
        },
        {
          "value": "never_read",
          "label": "I have never read it all the way through",
          "score_value": "no"
        },
        {
          "value": "dont_remember",
          "label": "I do not remember",
          "score_value": "not_sure"
        }
      ],
      "applies_if": "answers['1.1'] in ['yes','partial']",
      "system_na": true,
      "response_map": "will_recency"
    },
    {
      "id": "1.2",
      "item_id": "legal.trust.exists_access",
      "section_id": "1",
      "dimension": "Legal",
      "weight": 4,
      "prompt": "Have you documented whether you have a Trust (if part of your plan) and where the executed trust documents are stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.estate.has_trust == true",
      "system_na": true
    },
    {
      "id": "1.3",
      "item_id": "legal.fpoa.exists_access",
      "section_id": "1",
      "dimension": "Legal",
      "weight": 4,
      "prompt": "Have you documented whether you have Financial Power of Attorney (durable) and where the executed document is stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "1.4",
      "item_id": "legal.hpoa.exists_access",
      "section_id": "1",
      "dimension": "Legal",
      "weight": 4,
      "prompt": "Have you documented whether you have Healthcare Power of Attorney / Healthcare Proxy and where the executed document is stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "1.5",
      "item_id": "legal.advance_directive.exists_access",
      "section_id": "1",
      "dimension": "Legal",
      "weight": 4,
      "prompt": "Have you documented whether you have an Advance Directive/Living Will (and/or equivalent state forms) and where it is stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "2.1",
      "item_id": "decision.executor.designation",
      "section_id": "2",
      "dimension": "Decision_Makers_and_Guardianship",
      "weight": 4,
      "prompt": "Have you documented who your primary executor/personal representative is (and any alternates), and where that designation is recorded?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "2.2",
      "item_id": "decision.trustee.designation",
      "section_id": "2",
      "dimension": "Decision_Makers_and_Guardianship",
      "weight": 3,
      "prompt": "If you have a trust, have you documented who the trustee(s) are (and alternates) and where this is recorded?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.estate.has_trust == true",
      "system_na": true
    },
    {
      "id": "2.3",
      "item_id": "decision.guardianship.designation",
      "section_id": "2",
      "dimension": "Decision_Makers_and_Guardianship",
      "weight": 3,
      "prompt": "If you have minor children or dependent adults, have you documented guardianship designations and where they are recorded?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible"
        },
        {
          "value": "partial",
          "label": "Partially ? decided but not finalized in legal documents"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.household.has_dependents == true",
      "system_na": true
    },
    {
      "id": "2.4",
      "item_id": "decision.decision_makers_informed",
      "section_id": "2",
      "dimension": "Decision_Makers_and_Guardianship",
      "weight": 2,
      "prompt": "Have you documented whether your decision-makers have been informed of their roles and can access what they need when the time comes?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "3.1",
      "item_id": "access.source_of_truth.location",
      "section_id": "3",
      "dimension": "Communication_and_Access",
      "weight": 4,
      "prompt": "Have you documented a single 'source of truth' location (physical and/or digital) for critical documents?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "3.2",
      "item_id": "access.document_access.methods",
      "section_id": "3",
      "dimension": "Communication_and_Access",
      "weight": 4,
      "prompt": "Have you documented how your executor/agents will access originals or acceptable copies (including keys, combinations, vault access)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "3.3",
      "item_id": "access.vital_records.location",
      "section_id": "3",
      "dimension": "Communication_and_Access",
      "weight": 2,
      "prompt": "Have you documented where your IDs and vital records are kept (for example, birth certificate, Social Security card, marriage/divorce, citizenship/immigration docs)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "3.4",
      "item_id": "access.safe_deposit_access",
      "section_id": "3",
      "dimension": "Communication_and_Access",
      "weight": 2,
      "prompt": "Have you documented whether you have a safe deposit box and how it can be accessed when needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.access.has_safe_deposit_box == true",
      "system_na": true
    },
    {
      "id": "4.1",
      "item_id": "legal.trust.funded",
      "section_id": "4",
      "dimension": "Legal",
      "weight": 6,
      "prompt": "If you have a trust, have you documented whether key assets intended for the trust have been retitled/assigned (the trust is funded)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? fully funded as intended, and this is documented"
        },
        {
          "value": "partial",
          "label": "Partially ? some assets moved/assigned; documentation incomplete"
        },
        {
          "value": "no",
          "label": "No ? not funded/unknown implementation"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.estate.has_trust == true",
      "system_na": true
    },
    {
      "id": "4.2",
      "item_id": "legal.trust.funding_records",
      "section_id": "4",
      "dimension": "Legal",
      "weight": 4,
      "prompt": "Have you documented where trust funding records can be found (deeds, account titles, assignments) and who can access them?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible"
        },
        {
          "value": "partial",
          "label": "Partially"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.estate.has_trust == true",
      "system_na": true
    },
    {
      "id": "4.3",
      "item_id": "legal.trust.funding_verified",
      "section_id": "4",
      "dimension": "Legal",
      "weight": 4,
      "prompt": "Has trust funding or implementation been verified (in writing or otherwise reliably) by an attorney/advisor/trustee?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.estate.has_trust == true",
      "system_na": true
    },
    {
      "id": "5.1",
      "item_id": "financial.accounts.inventory",
      "section_id": "5",
      "dimension": "Financial",
      "weight": 5,
      "prompt": "Have you documented an up-to-date inventory of your major accounts (banking, retirement, brokerage, credit, loans) and where it is stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "5.2",
      "item_id": "financial.beneficiaries.reviewed",
      "section_id": "5",
      "dimension": "Financial",
      "weight": 4,
      "prompt": "Have you documented whether beneficiary designations have been reviewed recently enough to reflect your current intentions?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? reviewed recently and documented"
        },
        {
          "value": "partial",
          "label": "Partially ? some reviewed; others unknown/outdated"
        },
        {
          "value": "no",
          "label": "No ? not reviewed/unknown"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.financial.has_beneficiary_accounts == true",
      "system_na": true
    },
    {
      "id": "5.3",
      "item_id": "financial.cashflow.continuity",
      "section_id": "5",
      "dimension": "Financial",
      "weight": 3,
      "prompt": "Have you documented how critical ongoing bills and obligations get handled if you are incapacitated (utilities, mortgage/rent, insurance, caregiving, taxes)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "5.4",
      "item_id": "financial.final_expenses.plan",
      "section_id": "5",
      "dimension": "Financial",
      "weight": 2,
      "prompt": "Have you documented how final expenses will be paid (plan exists and is findable), without specifying amounts here?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "6.1",
      "item_id": "financial.insurance.coverage_inventory",
      "section_id": "6",
      "dimension": "Financial",
      "weight": 4,
      "prompt": "Have you documented what insurance coverage exists (life, disability, long-term care, health) and where policies or account access info are stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.financial.has_insurance_coverage == true",
      "system_na": true
    },
    {
      "id": "6.2",
      "item_id": "financial.benefits.contacts",
      "section_id": "6",
      "dimension": "Financial",
      "weight": 2,
      "prompt": "Have you documented whether key employer/government benefits and contacts are identified (for example, pension, Social Security) and findable?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.financial.has_employer_or_gov_benefits == true",
      "system_na": true
    },
    {
      "id": "7.1",
      "item_id": "healthcare.proxy_access",
      "section_id": "7",
      "dimension": "Healthcare",
      "weight": 4,
      "prompt": "Have you documented that your healthcare decision-maker(s) can access your healthcare directive/proxy when needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "7.2",
      "item_id": "healthcare.provider_copy",
      "section_id": "7",
      "dimension": "Healthcare",
      "weight": 3,
      "prompt": "Have you documented whether your primary care provider/hospital system has a copy of your directive/proxy (or instructions to provide it)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.healthcare.has_primary_provider == true",
      "system_na": true
    },
    {
      "id": "7.3",
      "item_id": "healthcare.medical_info.organized",
      "section_id": "7",
      "dimension": "Healthcare",
      "weight": 3,
      "prompt": "Have you documented whether any critical medical information is organized and accessible (medications list, diagnoses, allergies, providers)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "8.1",
      "item_id": "digital.credentials.access",
      "section_id": "8",
      "dimension": "Digital",
      "weight": 3,
      "prompt": "Have you documented where credentials are managed (password manager, vault, secure list) and how your designated person can access it?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "8.2",
      "item_id": "digital.device_access",
      "section_id": "8",
      "dimension": "Digital",
      "weight": 2,
      "prompt": "Have you documented digital device access (phone/computer unlock method, recovery contacts, 2FA backup codes where applicable) in a safe, executable way?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "8.3",
      "item_id": "digital.crypto.access",
      "section_id": "8",
      "dimension": "Digital",
      "weight": 1,
      "prompt": "If you own digital currency/crypto, have you documented ownership/access procedures and where that documentation is stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partially"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.digital.owns_crypto == true",
      "system_na": true
    },
    {
      "id": "9.1",
      "item_id": "home.readiness.status",
      "section_id": "9",
      "dimension": "Physical_and_Household",
      "weight": 3,
      "prompt": "Have you documented the current state of home readiness (clutter level, organization, and what would burden others)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.residence.primary_residence_type != 'none'",
      "system_na": true
    },
    {
      "id": "9.2",
      "item_id": "home.declutter.recency",
      "section_id": "9",
      "dimension": "Physical_and_Household",
      "weight": 2,
      "prompt": "Have you documented when you last purged/downsized and whether further reduction is needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? recently and documented"
        },
        {
          "value": "partial",
          "label": "Somewhat/partially"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.residence.primary_residence_type != 'none'",
      "system_na": true
    },
    {
      "id": "9.3",
      "item_id": "home.maintenance.needs",
      "section_id": "9",
      "dimension": "Physical_and_Household",
      "weight": 2,
      "prompt": "Have you documented deferred maintenance needs that could impact safety or sale readiness?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.residence.primary_residence_type != 'none'",
      "system_na": true
    },
    {
      "id": "9.4",
      "item_id": "home.deed.access",
      "section_id": "9",
      "dimension": "Physical_and_Household",
      "weight": 1,
      "prompt": "Is proof of ownership (deed/title) documented, protected, and accessible to your executor/agent?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partially"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.residence.primary_residence_type == 'own'",
      "system_na": true
    },
    {
      "id": "10.1",
      "item_id": "home.personal_property.inventory",
      "section_id": "10",
      "dimension": "Physical_and_Household",
      "weight": 3,
      "prompt": "Have you documented an inventory of significant personal property (heirlooms/valuables/collections) and where it is stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "10.2",
      "item_id": "home.personal_property.instructions",
      "section_id": "10",
      "dimension": "Physical_and_Household",
      "weight": 3,
      "prompt": "Have you documented how those items should be handled (for example, designated recipients or disposal instructions) in an accessible way?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible"
        },
        {
          "value": "partial",
          "label": "Partially"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "11.1",
      "item_id": "home.pets.caregiver",
      "section_id": "11",
      "dimension": "Physical_and_Household",
      "weight": 2,
      "prompt": "If you have pets, have you documented who will care for them and how the caregiver will be reached quickly?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and caregiver agreed"
        },
        {
          "value": "partial",
          "label": "Partially/informal"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.pets.has_pets == true",
      "system_na": true
    },
    {
      "id": "11.2",
      "item_id": "home.pets.info_access",
      "section_id": "11",
      "dimension": "Physical_and_Household",
      "weight": 2,
      "prompt": "Have you documented where pet care info is stored (vet, medications, routines, microchip/registration) and who can access it?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partially"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.pets.has_pets == true",
      "system_na": true
    },
    {
      "id": "12.1",
      "item_id": "final.disposition.plan",
      "section_id": "12",
      "dimension": "Final_Arrangements",
      "weight": 3,
      "prompt": "Have you documented your body disposition plan (burial/cremation/donation) and where it is stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "12.2",
      "item_id": "final.prepaid.arrangements",
      "section_id": "12",
      "dimension": "Final_Arrangements",
      "weight": 2,
      "prompt": "Have you documented whether any prepaid arrangements exist (or whether none exist), and where records can be found?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented"
        },
        {
          "value": "partial",
          "label": "Partially"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "12.3",
      "item_id": "final.notify_contacts",
      "section_id": "12",
      "dimension": "Final_Arrangements",
      "weight": 1,
      "prompt": "Have you documented who should be notified first and where that contact list is stored?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "13.1",
      "item_id": "access.business.interests",
      "section_id": "13",
      "dimension": "Communication_and_Access",
      "weight": 2,
      "prompt": "Have you documented whether you have any business interests or responsibilities that others would need to manage (even small ones), and where that is recorded?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented"
        },
        {
          "value": "partial",
          "label": "Partially"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "profile.estate.business_interests == true",
      "system_na": true
    },
    {
      "id": "13.2",
      "item_id": "access.hidden_knowledge",
      "section_id": "13",
      "dimension": "Communication_and_Access",
      "weight": 2,
      "prompt": "Have you documented any critical 'things only you know' (service providers, recurring obligations, access procedures) in a place your executor/agent can find?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes ? documented and accessible (I know where it is, and my designated person(s) can access it)"
        },
        {
          "value": "partial",
          "label": "Partially ? started or exists but incomplete/outdated/unclear access"
        },
        {
          "value": "no",
          "label": "No ? not documented"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    }
  ]
}
$$::jsonb)
on conflict (assessment_id, version)
 do update set schema_json = excluded.schema_json;
