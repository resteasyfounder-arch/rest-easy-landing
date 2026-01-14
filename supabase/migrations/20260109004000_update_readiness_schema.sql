-- Update readiness schema
insert into readiness_v1.assessment_schemas (assessment_id, version, schema_json)
values ('readiness_v1', 'v1', $$
{
  "assessment_id": "readiness_v1",
  "version": "v1",
  "dimensions": [
    {
      "id": "Legal_Planning",
      "label": "Legal Planning & Decision Makers"
    },
    {
      "id": "Health_Care",
      "label": "Health Care"
    },
    {
      "id": "Financial_Insurance",
      "label": "Financial & Insurance Planning"
    },
    {
      "id": "Family_Relationships",
      "label": "Family Relationships & Roles"
    },
    {
      "id": "Home_Pet_Daily_Life",
      "label": "Home, Pet & Daily Life"
    },
    {
      "id": "Digital_Life",
      "label": "Digital Life & Online Presence"
    },
    {
      "id": "Funeral_Memorial",
      "label": "Funeral, Memorial & Body Disposition"
    },
    {
      "id": "Emotional_Spiritual",
      "label": "Emotional & Spiritual"
    },
    {
      "id": "Supporting_Aging_Parents",
      "label": "Supporting Aging Parents"
    },
    {
      "id": "Home_Personal_Property",
      "label": "Home & Personal Property"
    },
    {
      "id": "Document_Storage",
      "label": "Document Storage"
    }
  ],
  "sections": [
    {
      "id": "1",
      "label": "Legal Planning & Decision Makers",
      "dimension": "Legal_Planning",
      "weight": 25
    },
    {
      "id": "2",
      "label": "Health Care",
      "dimension": "Health_Care",
      "weight": 15
    },
    {
      "id": "3",
      "label": "Financial & Insurance Planning",
      "dimension": "Financial_Insurance",
      "weight": 20
    },
    {
      "id": "4",
      "label": "Family Relationships & Roles",
      "dimension": "Family_Relationships",
      "weight": 10
    },
    {
      "id": "5",
      "label": "Home, Pet & Daily Life",
      "dimension": "Home_Pet_Daily_Life",
      "weight": 10
    },
    {
      "id": "6",
      "label": "Digital Life & Online Presence",
      "dimension": "Digital_Life",
      "weight": 5
    },
    {
      "id": "7",
      "label": "Funeral, Memorial & Body Disposition",
      "dimension": "Funeral_Memorial",
      "weight": 5
    },
    {
      "id": "8",
      "label": "Emotional & Spiritual",
      "dimension": "Emotional_Spiritual",
      "weight": 3
    },
    {
      "id": "9",
      "label": "Supporting Aging Parents",
      "dimension": "Supporting_Aging_Parents",
      "weight": 2
    },
    {
      "id": "10",
      "label": "Home & Personal Property",
      "dimension": "Home_Personal_Property",
      "weight": 3
    },
    {
      "id": "11",
      "label": "Document Storage",
      "dimension": "Document_Storage",
      "weight": 2
    }
  ],
  "profile_questions": [
    {
      "id": "profile.financial.has_beneficiary_accounts",
      "field": "financial.has_beneficiary_accounts",
      "prompt": "Do any of your accounts allow you to name beneficiaries?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "no",
          "label": "No"
        }
      ],
      "value_map": {
        "yes": true,
        "no": false
      }
    },
    {
      "id": "profile.household.has_dependents",
      "field": "household.has_dependents",
      "prompt": "Do other people depend on you for care or financial support?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "no",
          "label": "No"
        }
      ],
      "value_map": {
        "yes": true,
        "no": false
      }
    },
    {
      "id": "profile.pets.has_pets",
      "field": "pets.has_pets",
      "prompt": "Do you have pets that depend on you?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "no",
          "label": "No"
        }
      ],
      "value_map": {
        "yes": true,
        "no": false
      }
    },
    {
      "id": "profile.digital.owns_crypto",
      "field": "digital.owns_crypto",
      "prompt": "Do you own any digital or cryptocurrency assets?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "no",
          "label": "No"
        }
      ],
      "value_map": {
        "yes": true,
        "no": false
      }
    },
    {
      "id": "profile.family.supports_aging_parent",
      "field": "family.supports_aging_parent",
      "prompt": "Are you currently helping support an aging parent?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "no",
          "label": "No"
        }
      ],
      "value_map": {
        "yes": true,
        "no": false
      }
    },
    {
      "id": "profile.home.has_significant_personal_property",
      "field": "home.has_significant_personal_property",
      "prompt": "Do you own items of significant personal value?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "no",
          "label": "No"
        }
      ],
      "value_map": {
        "yes": true,
        "no": false
      }
    }
  ],
  "profile_gates": [
    {
      "when": "profile.financial.has_beneficiary_accounts == false",
      "questions": [
        "3.4",
        "3.5"
      ],
      "result": "na",
      "flag": "not_applicable"
    },
    {
      "when": "profile.pets.has_pets == false",
      "questions": [
        "5.4",
        "5.5"
      ],
      "result": "na",
      "flag": "not_applicable"
    },
    {
      "when": "profile.digital.owns_crypto == false",
      "questions": [
        "6.7"
      ],
      "result": "na",
      "flag": "not_applicable"
    },
    {
      "when": "profile.family.supports_aging_parent == false",
      "questions": [
        "9.2",
        "9.3",
        "9.4"
      ],
      "result": "na",
      "flag": "not_applicable"
    },
    {
      "when": "profile.home.has_significant_personal_property == false",
      "questions": [
        "10.5"
      ],
      "result": "na",
      "flag": "not_applicable"
    }
  ],
  "soft_gates": [
    {
      "when": "answers['1.1.A.1'] in ['yes','partial']",
      "questions": [
        "1.1.A.2"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.A.1'] in ['no','not_sure']",
      "questions": [
        "1.1.A.2"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['1.1.A.3'] in ['yes','partial']",
      "questions": [
        "1.1.A.4"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.A.3'] in ['no','not_sure']",
      "questions": [
        "1.1.A.4"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['1.1.B.1'] in ['yes','partial']",
      "questions": [
        "1.1.B.2"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.B.1'] in ['no','not_sure']",
      "questions": [
        "1.1.B.2"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['1.1.B.3'] in ['yes','partial']",
      "questions": [
        "1.1.B.4"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.B.3'] in ['no','not_sure']",
      "questions": [
        "1.1.B.4"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['1.1.B.3'] in ['yes','partial']",
      "questions": [
        "1.1.B.4a"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.B.3'] in ['no','not_sure']",
      "questions": [
        "1.1.B.4a"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['1.1.B.5'] in ['yes','partial']",
      "questions": [
        "1.1.B.6"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.B.5'] in ['no','not_sure']",
      "questions": [
        "1.1.B.6"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['1.1.B.1'] in ['yes','partial'] or answers['1.1.B.3'] in ['yes','partial'] or answers['1.1.B.5'] in ['yes','partial'] or answers['1.1.B.7'] in ['yes','partial'] or answers['1.1.B.8'] in ['yes','partial']",
      "questions": [
        "1.1.A.7"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.B.1'] in ['no','not_sure'] and answers['1.1.B.3'] in ['no','not_sure'] and answers['1.1.B.5'] in ['no','not_sure'] and answers['1.1.B.7'] in ['no','not_sure'] and answers['1.1.B.8'] in ['no','not_sure']",
      "questions": [
        "1.1.A.7"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['1.1.B.1'] in ['yes','partial'] or answers['1.1.B.3'] in ['yes','partial'] or answers['1.1.B.5'] in ['yes','partial'] or answers['1.1.B.7'] in ['yes','partial'] or answers['1.1.B.8'] in ['yes','partial']",
      "questions": [
        "1.1.B.10"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.B.1'] in ['no','not_sure'] and answers['1.1.B.3'] in ['no','not_sure'] and answers['1.1.B.5'] in ['no','not_sure'] and answers['1.1.B.7'] in ['no','not_sure'] and answers['1.1.B.8'] in ['no','not_sure']",
      "questions": [
        "1.1.B.10"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['1.1.B.1'] in ['yes','partial'] or answers['1.1.B.3'] in ['yes','partial'] or answers['1.1.B.5'] in ['yes','partial'] or answers['1.1.B.7'] in ['yes','partial'] or answers['1.1.B.8'] in ['yes','partial']",
      "questions": [
        "1.1.B.11"
      ],
      "result": "ask"
    },
    {
      "when": "answers['1.1.B.1'] in ['no','not_sure'] and answers['1.1.B.3'] in ['no','not_sure'] and answers['1.1.B.5'] in ['no','not_sure'] and answers['1.1.B.7'] in ['no','not_sure'] and answers['1.1.B.8'] in ['no','not_sure']",
      "questions": [
        "1.1.B.11"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['2.1'] in ['yes','partial']",
      "questions": [
        "2.2"
      ],
      "result": "ask"
    },
    {
      "when": "answers['2.1'] in ['no','not_sure']",
      "questions": [
        "2.2"
      ],
      "result": "na",
      "flag": "follow_up"
    },
    {
      "when": "answers['2.1'] in ['yes','partial'] or answers['2.3'] in ['yes','partial'] or answers['1.1.B.7'] in ['yes','partial']",
      "questions": [
        "2.4"
      ],
      "result": "ask"
    },
    {
      "when": "answers['2.1'] in ['no','not_sure'] and answers['2.3'] in ['no','not_sure'] and answers['1.1.B.7'] in ['no','not_sure']",
      "questions": [
        "2.4"
      ],
      "result": "na",
      "flag": "follow_up"
    }
  ],
  "answer_scoring": {
    "yes": 1.0,
    "partial": 0.5,
    "no": 0.0,
    "not_sure": 0.25,
    "na": null
  },
  "flags": {
    "review_on": [
      "not_sure"
    ],
    "follow_up_on": [
      "na"
    ],
    "risk_on": []
  },
  "score_bands": [
    {
      "min": 80,
      "max": 100,
      "label": "Highly Prepared"
    },
    {
      "min": 60,
      "max": 79,
      "label": "Moderately Prepared"
    },
    {
      "min": 40,
      "max": 59,
      "label": "Limited Preparedness"
    },
    {
      "min": 0,
      "max": 39,
      "label": "Low Readiness / High Risk"
    }
  ],
  "questions": [
    {
      "id": "1.1.A.1",
      "item_id": "legal.will.evaluation",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Have you ever evaluated whether you need a will?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, evaluation completed"
        },
        {
          "value": "partial",
          "label": "Evaluation started but not completed"
        },
        {
          "value": "no",
          "label": "No, never evaluated"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "1.1.A.2",
      "item_id": "legal.will.evaluation_determination",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "If evaluated, was a determination made about whether a will is appropriate for you?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, determination made and documented"
        },
        {
          "value": "partial",
          "label": "Determination made but not documented"
        },
        {
          "value": "no",
          "label": "No determination made"
        },
        {
          "value": "na",
          "label": "Not applicable"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "answers['1.1.A.1'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "1.1.A.3",
      "item_id": "legal.trust.evaluation",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Have you ever evaluated whether a trust may be appropriate for your situation?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, evaluation completed"
        },
        {
          "value": "partial",
          "label": "Evaluation started but not completed"
        },
        {
          "value": "no",
          "label": "No, never evaluated"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "1.1.A.4",
      "item_id": "legal.trust.evaluation_determination",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "If evaluated, was a determination made about whether a trust is appropriate?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, determination made and documented"
        },
        {
          "value": "partial",
          "label": "Determination made but not documented"
        },
        {
          "value": "no",
          "label": "No determination made"
        },
        {
          "value": "na",
          "label": "Not applicable"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "answers['1.1.A.3'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "1.1.A.5",
      "item_id": "legal.evaluation.professional_input",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Was any part of your legal planning evaluation done with professional input?",
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
      "applies_if": "always"
    },
    {
      "id": "1.1.A.6",
      "item_id": "legal.plan.review_triggers",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Have you identified events that would trigger a review of your legal plan?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, documented"
        },
        {
          "value": "partial",
          "label": "Identified but not documented"
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
      "id": "1.1.A.7",
      "item_id": "legal.documents.align_with_evaluation",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Do you believe your current legal documents reflect your most recent legal planning evaluation?",
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
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "answers['1.1.B.1'] in ['yes','partial'] or answers['1.1.B.3'] in ['yes','partial'] or answers['1.1.B.5'] in ['yes','partial'] or answers['1.1.B.7'] in ['yes','partial'] or answers['1.1.B.8'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "1.1.B.1",
      "item_id": "legal.will.exists",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Do you currently have a legally valid will?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, completed and signed"
        },
        {
          "value": "partial",
          "label": "Drafted but not signed"
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
      "id": "1.1.B.2",
      "item_id": "legal.will.access",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Is the original or a court-acceptable copy of your will easy to locate if needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Location exists but unclear"
        },
        {
          "value": "partial",
          "label": "Draft only"
        },
        {
          "value": "na",
          "label": "Not applicable"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "answers['1.1.B.1'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "1.1.B.3",
      "item_id": "legal.trust.exists",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Do you have a revocable living trust?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, completed and signed"
        },
        {
          "value": "partial",
          "label": "Drafted but not signed"
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
      "id": "1.1.B.4",
      "item_id": "legal.trust.access",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "If you have a trust, can the signed trust document be easily located if needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Location exists but unclear"
        },
        {
          "value": "partial",
          "label": "Only a draft exists"
        },
        {
          "value": "na",
          "label": "Not applicable"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "answers['1.1.B.3'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "1.1.B.4a",
      "item_id": "legal.trust.funding",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Have assets been moved into your trust (often called 'funding' the trust)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, most or all"
        },
        {
          "value": "partial",
          "label": "Some assets"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "answers['1.1.B.3'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "1.1.B.5",
      "item_id": "legal.fpoa.exists",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Do you have a financial power of attorney?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, completed and signed"
        },
        {
          "value": "partial",
          "label": "Drafted but not signed"
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
      "id": "1.1.B.6",
      "item_id": "legal.fpoa.acceptance",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "If someone needed to use your financial power of attorney, would your banks accept it?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, all major institutions"
        },
        {
          "value": "partial",
          "label": "Some institutions"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "answers['1.1.B.5'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "1.1.B.7",
      "item_id": "legal.hpoa.exists",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Do you have a healthcare power of attorney or healthcare proxy?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, completed and signed"
        },
        {
          "value": "partial",
          "label": "Drafted but not signed"
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
      "id": "1.1.B.8",
      "item_id": "legal.body_disposition.document",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Do you have a written document that explains what should happen to your body after death (where required by law)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, completed and signed"
        },
        {
          "value": "partial",
          "label": "Written but not finalized"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "1.1.B.9",
      "item_id": "legal.practical_guide.exists",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Do you have a written guide (separate from legal documents) that explains practical information like where things are or what to do first?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, completed and accessible"
        },
        {
          "value": "partial",
          "label": "Exists but incomplete"
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
      "id": "1.1.B.10",
      "item_id": "legal.documents.current",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Are all completed legal documents current and up to date?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, all"
        },
        {
          "value": "partial",
          "label": "Some outdated"
        },
        {
          "value": "no",
          "label": "Most outdated"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "answers['1.1.B.1'] in ['yes','partial'] or answers['1.1.B.3'] in ['yes','partial'] or answers['1.1.B.5'] in ['yes','partial'] or answers['1.1.B.7'] in ['yes','partial'] or answers['1.1.B.8'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "1.1.B.11",
      "item_id": "legal.documents.shared",
      "section_id": "1",
      "dimension": "Legal_Planning",
      "weight": 1,
      "prompt": "Have copies of completed legal documents been shared with the people who may need them?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, all"
        },
        {
          "value": "partial",
          "label": "Some"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "answers['1.1.B.1'] in ['yes','partial'] or answers['1.1.B.3'] in ['yes','partial'] or answers['1.1.B.5'] in ['yes','partial'] or answers['1.1.B.7'] in ['yes','partial'] or answers['1.1.B.8'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "2.1",
      "item_id": "healthcare.advance_directive.exists",
      "section_id": "2",
      "dimension": "Health_Care",
      "weight": 1,
      "prompt": "Do you have an advance directive or living will?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, completed and signed"
        },
        {
          "value": "partial",
          "label": "Drafted but not signed"
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
      "id": "2.2",
      "item_id": "healthcare.advance_directive.instructions",
      "section_id": "2",
      "dimension": "Health_Care",
      "weight": 1,
      "prompt": "Does your advance directive include any written medical instructions (you do not need to know or share what they are)?",
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
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "answers['2.1'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "2.3",
      "item_id": "healthcare.hipaa_release.exists",
      "section_id": "2",
      "dimension": "Health_Care",
      "weight": 1,
      "prompt": "Do you have a HIPAA authorization or medical information release?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, completed and signed"
        },
        {
          "value": "partial",
          "label": "Drafted but not signed"
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
      "id": "2.4",
      "item_id": "healthcare.documents.on_file",
      "section_id": "2",
      "dimension": "Health_Care",
      "weight": 1,
      "prompt": "Are your healthcare documents on file with your doctors or in a patient portal?",
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
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "answers['2.1'] in ['yes','partial'] or answers['2.3'] in ['yes','partial'] or answers['1.1.B.7'] in ['yes','partial']",
      "system_na": true
    },
    {
      "id": "2.5",
      "item_id": "healthcare.medical_info.list_access",
      "section_id": "2",
      "dimension": "Health_Care",
      "weight": 1,
      "prompt": "Is there a list of your medications, allergies, and doctors that someone could easily access?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, complete"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "2.6",
      "item_id": "healthcare.access_plan.home_phone",
      "section_id": "2",
      "dimension": "Health_Care",
      "weight": 1,
      "prompt": "Is there a plan for how someone could access your home or phone if you were incapacitated?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Informal only"
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
      "id": "2.7",
      "item_id": "healthcare.organ_donor.registered",
      "section_id": "2",
      "dimension": "Health_Care",
      "weight": 1,
      "prompt": "Are you registered as an organ donor or otherwise documented?",
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
      "applies_if": "always"
    },
    {
      "id": "2.8",
      "item_id": "healthcare.body_donation.enrollment",
      "section_id": "2",
      "dimension": "Health_Care",
      "weight": 1,
      "prompt": "If applicable, have you completed any body donation enrollment paperwork?",
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
          "value": "na",
          "label": "Not applicable"
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
      "item_id": "financial.assets_debts.list",
      "section_id": "3",
      "dimension": "Financial_Insurance",
      "weight": 1,
      "prompt": "Is there a list of your assets and debts that someone could access if needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, complete"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "3.2",
      "item_id": "financial.accounts.manageability",
      "section_id": "3",
      "dimension": "Financial_Insurance",
      "weight": 1,
      "prompt": "Could someone step in and manage key accounts and obligations within about 30 days?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "3.4",
      "item_id": "financial.beneficiaries.set",
      "section_id": "3",
      "dimension": "Financial_Insurance",
      "weight": 1,
      "prompt": "Are beneficiaries set up on all applicable accounts?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "All complete"
        },
        {
          "value": "partial",
          "label": "Some missing"
        },
        {
          "value": "no",
          "label": "Most missing"
        },
        {
          "value": "no",
          "label": "None"
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
      "id": "3.5",
      "item_id": "financial.beneficiaries.reviewed",
      "section_id": "3",
      "dimension": "Financial_Insurance",
      "weight": 1,
      "prompt": "Have beneficiary designations been reviewed in the last 5 years?",
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
      "applies_if": "profile.financial.has_beneficiary_accounts == true",
      "system_na": true
    },
    {
      "id": "3.6",
      "item_id": "financial.insurance.coverage",
      "section_id": "3",
      "dimension": "Financial_Insurance",
      "weight": 1,
      "prompt": "Do you currently have any life, long-term care, disability, or health insurance?",
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
      "applies_if": "always"
    },
    {
      "id": "3.7",
      "item_id": "financial.final_expenses.plan",
      "section_id": "3",
      "dimension": "Financial_Insurance",
      "weight": 1,
      "prompt": "Is there a plan in place to cover final expenses?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, funded or prepaid"
        },
        {
          "value": "partial",
          "label": "Planned but not funded"
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
      "id": "3.8",
      "item_id": "financial.recurring_bills.list",
      "section_id": "3",
      "dimension": "Financial_Insurance",
      "weight": 1,
      "prompt": "Is there a list of recurring bills, debts, or obligations someone could follow?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "3.9",
      "item_id": "financial.manageability.self_assessed",
      "section_id": "3",
      "dimension": "Financial_Insurance",
      "weight": 1,
      "prompt": "Do you feel your finances could be difficult for others to manage if something happened?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes",
          "score_value": "no"
        },
        {
          "value": "no",
          "label": "No",
          "score_value": "yes"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "4.2",
      "item_id": "family.emergency_contacts.list",
      "section_id": "4",
      "dimension": "Family_Relationships",
      "weight": 1,
      "prompt": "Is there a written list of who should be contacted in an emergency?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "4.3",
      "item_id": "family.documents.shared",
      "section_id": "4",
      "dimension": "Family_Relationships",
      "weight": 1,
      "prompt": "Have you shared where important documents are and who can make decisions?",
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
      "applies_if": "always"
    },
    {
      "id": "4.4",
      "item_id": "family.exclusions.guidance",
      "section_id": "4",
      "dimension": "Family_Relationships",
      "weight": 1,
      "prompt": "Is there written guidance about anyone who should not be involved in decisions?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Verbal only"
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
      "id": "5.1",
      "item_id": "home.daily_responsibilities.plan",
      "section_id": "5",
      "dimension": "Home_Pet_Daily_Life",
      "weight": 1,
      "prompt": "Is there a plan for how your home and daily responsibilities would be handled?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Informal"
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
      "id": "5.2",
      "item_id": "home.utilities.access_info",
      "section_id": "5",
      "dimension": "Home_Pet_Daily_Life",
      "weight": 1,
      "prompt": "Are utilities, access instructions, and service contacts written down somewhere?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "5.4",
      "item_id": "home.pets.care_plan",
      "section_id": "5",
      "dimension": "Home_Pet_Daily_Life",
      "weight": 1,
      "prompt": "If yes, is there a written plan for their care?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "profile.pets.has_pets == true",
      "system_na": true
    },
    {
      "id": "5.5",
      "item_id": "home.pets.records_access",
      "section_id": "5",
      "dimension": "Home_Pet_Daily_Life",
      "weight": 1,
      "prompt": "Are pet records and care instructions easy to find?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "profile.pets.has_pets == true",
      "system_na": true
    },
    {
      "id": "6.1",
      "item_id": "digital.account_access.method",
      "section_id": "6",
      "dimension": "Digital_Life",
      "weight": 1,
      "prompt": "Is there a way someone could access your online accounts if needed (for example, a password manager)?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, complete"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "6.2",
      "item_id": "digital.device_access.guidance",
      "section_id": "6",
      "dimension": "Digital_Life",
      "weight": 1,
      "prompt": "Is there guidance for accessing your phone or computer in an emergency?",
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
      "applies_if": "always"
    },
    {
      "id": "6.3",
      "item_id": "digital.accounts.list",
      "section_id": "6",
      "dimension": "Digital_Life",
      "weight": 1,
      "prompt": "Is there a list of your important online accounts?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "6.4",
      "item_id": "digital.account_inactivity_settings",
      "section_id": "6",
      "dimension": "Digital_Life",
      "weight": 1,
      "prompt": "On platforms like Apple, Google, or social media, have you set up settings for what happens to your account if you cannot use it?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, on all platforms"
        },
        {
          "value": "partial",
          "label": "Yes, on some"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "na",
          "label": "Not applicable"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "6.5",
      "item_id": "digital.files.backup_access",
      "section_id": "6",
      "dimension": "Digital_Life",
      "weight": 1,
      "prompt": "Are important digital files backed up and accessible?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "6.7",
      "item_id": "digital.assets.crypto.access_plan",
      "section_id": "6",
      "dimension": "Digital_Life",
      "weight": 1,
      "prompt": "If yes, is there a way someone could access or recover them if needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "profile.digital.owns_crypto == true",
      "system_na": true
    },
    {
      "id": "6.8",
      "item_id": "digital.assets.mentioned_in_estate_docs",
      "section_id": "6",
      "dimension": "Digital_Life",
      "weight": 1,
      "prompt": "Do your estate documents mention digital assets?",
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
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "7.1",
      "item_id": "final.guidance.after_death",
      "section_id": "7",
      "dimension": "Funeral_Memorial",
      "weight": 1,
      "prompt": "Is there written guidance about what should happen after death?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes, accessible"
        },
        {
          "value": "partial",
          "label": "Exists but hard to find"
        },
        {
          "value": "partial",
          "label": "Verbal only"
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
      "id": "7.2",
      "item_id": "final.arrangements.prepaid",
      "section_id": "7",
      "dimension": "Funeral_Memorial",
      "weight": 1,
      "prompt": "Have any funeral or cremation arrangements been prepaid or set up?",
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
      "applies_if": "always"
    },
    {
      "id": "7.3",
      "item_id": "final.arrangements.guidance",
      "section_id": "7",
      "dimension": "Funeral_Memorial",
      "weight": 1,
      "prompt": "Is there written guidance to help others handle arrangements?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "7.4",
      "item_id": "final.charitable_gifts.documented",
      "section_id": "7",
      "dimension": "Funeral_Memorial",
      "weight": 1,
      "prompt": "Are any charitable gifts at death written down somewhere?",
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
      "applies_if": "always"
    },
    {
      "id": "8.1",
      "item_id": "emotional.spiritual_practices.documented",
      "section_id": "8",
      "dimension": "Emotional_Spiritual",
      "weight": 1,
      "prompt": "Are any spiritual or cultural practices written down?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Verbal only"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "na",
          "label": "Not applicable"
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
      "item_id": "emotional.spiritual_contacts.list",
      "section_id": "8",
      "dimension": "Emotional_Spiritual",
      "weight": 1,
      "prompt": "Is there a written note about who to contact for spiritual support, if applicable?",
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
          "value": "na",
          "label": "Not applicable"
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
      "item_id": "emotional.messages.prepared",
      "section_id": "8",
      "dimension": "Emotional_Spiritual",
      "weight": 1,
      "prompt": "Have you prepared any messages or notes you would want others to receive?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "In progress"
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
      "id": "9.2",
      "item_id": "parents.legal_permission",
      "section_id": "9",
      "dimension": "Supporting_Aging_Parents",
      "weight": 1,
      "prompt": "If yes, do you have legal permission to help make decisions if needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "profile.family.supports_aging_parent == true",
      "system_na": true
    },
    {
      "id": "9.3",
      "item_id": "parents.key_info.list",
      "section_id": "9",
      "dimension": "Supporting_Aging_Parents",
      "weight": 1,
      "prompt": "Is there a list of your parent's key information you could access?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "profile.family.supports_aging_parent == true",
      "system_na": true
    },
    {
      "id": "9.4",
      "item_id": "parents.documents.access_speed",
      "section_id": "9",
      "dimension": "Supporting_Aging_Parents",
      "weight": 1,
      "prompt": "If needed, how quickly could you find their important documents?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Within 24 hours"
        },
        {
          "value": "partial",
          "label": "Within a week"
        },
        {
          "value": "no",
          "label": "Longer"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "profile.family.supports_aging_parent == true",
      "system_na": true
    },
    {
      "id": "10.1",
      "item_id": "home.title.documents_access",
      "section_id": "10",
      "dimension": "Home_Personal_Property",
      "weight": 1,
      "prompt": "Are ownership or title documents easy to find?",
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
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "10.2",
      "item_id": "home.maintenance.issues_documented",
      "section_id": "10",
      "dimension": "Home_Personal_Property",
      "weight": 1,
      "prompt": "Are any major home maintenance issues written down?",
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
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "10.3",
      "item_id": "home.belongings.reduced",
      "section_id": "10",
      "dimension": "Home_Personal_Property",
      "weight": 1,
      "prompt": "Have you reduced belongings to make things easier for others?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "10.5",
      "item_id": "home.personal_property.plan",
      "section_id": "10",
      "dimension": "Home_Personal_Property",
      "weight": 1,
      "prompt": "If yes, is there a written list or plan for those items?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
        },
        {
          "value": "no",
          "label": "No"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        },
        {
          "value": "na",
          "label": "Not applicable"
        }
      ],
      "applies_if": "profile.home.has_significant_personal_property == true",
      "system_na": true
    },
    {
      "id": "11.1",
      "item_id": "documents.storage.single_location",
      "section_id": "11",
      "dimension": "Document_Storage",
      "weight": 1,
      "prompt": "Are most important documents kept in one main place?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Multiple locations"
        },
        {
          "value": "not_sure",
          "label": "Not sure"
        }
      ],
      "applies_if": "always"
    },
    {
      "id": "11.2",
      "item_id": "documents.storage.access_shared",
      "section_id": "11",
      "dimension": "Document_Storage",
      "weight": 1,
      "prompt": "Do trusted people know how to access those documents?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "11.3",
      "item_id": "documents.storage.start_guide",
      "section_id": "11",
      "dimension": "Document_Storage",
      "weight": 1,
      "prompt": "Is there a single 'start here' guide explaining what exists and where it is?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Partial"
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
      "id": "11.4",
      "item_id": "documents.storage.originals_access",
      "section_id": "11",
      "dimension": "Document_Storage",
      "weight": 1,
      "prompt": "Are original documents accessible if needed?",
      "type": "single_select",
      "options": [
        {
          "value": "yes",
          "label": "Yes"
        },
        {
          "value": "partial",
          "label": "Access may be difficult"
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
    }
  ]
}
$$::jsonb)
on conflict (assessment_id, version)
 do update set schema_json = excluded.schema_json;
