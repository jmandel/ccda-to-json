ccda-to-json
============

Node.JS and browser-side module to convert C-CDA documents to simpler JSON.


### To install
```
git clone git@github.com:jmandel/ccda-to-json.git
npm install
```

### To build browser-side module
```
npm run-script browserify
# > output in browser-code/ccda-parser.js
```

### To use browser-side
```
<html>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
  <script src="ccda-to-json.js"></script>
  <script>
    $.get("example.xml").then(function(doc){
      ParseCCDA(doc, function(err, result){
        var js = result.toJSON();
        $("#result").text(JSON.stringify(js, null, " "));
      });
    });
  </script>
  <textarea class="prettyprint" style="height: 100%; width: 100%" id="result"></textarea>
</html>
```

### Sample output
```
{
 "demographics": {
  "name": {
   "givens": [
    "Myra",
    "B"
   ],
   "family": "Jones",
   "use": "Legal"
  },
  "maritalStatus": "Married",
  "religion": {
   "label": "Christian (non-Catholic, non-specific)",
   "code": "1013",
   "systemName": "OID 2.16.840.1.113883.5.1076",
   "uri": "urn:oid:2.16.840.1.113883.5.1076#1013"
  },
  "race": {
   "label": "White",
   "code": "2106-3",
   "systemName": "CDC Race",
   "uri": "http://phinvads.cdc.gov/vads/ViewCodeSystemConcept.action?oid=2.16.840.1.113883.6.238&code=2106-3"
  },
  "ethnicity": {
   "label": "Not Hispanic or Latino",
   "code": "2186-5",
   "systemName": "CDC Race",
   "uri": "http://phinvads.cdc.gov/vads/ViewCodeSystemConcept.action?oid=2.16.840.1.113883.6.238&code=2186-5"
  },
  "addresses": [
   {
    "streetLines": [
     "1357 Amber Drive"
    ],
    "city": "Beaverton",
    "state": "OR",
    "zip": "97006",
    "country": "US",
    "use": "primary home"
   }
  ],
  "guardians": [
   {
    "relation": "Grandfather",
    "addresses": [
     {
      "streetLines": [
       "1357 Amber Drive"
      ],
      "city": "Beaverton",
      "state": "OR",
      "zip": "97006",
      "country": "US",
      "use": "primary home"
     }
    ],
    "names": [
     {
      "givens": [
       "Ralph"
      ],
      "family": "Jones"
     }
    ],
    "telecoms": [
     {
      "value": "tel:(816)276-6909",
      "use": "primary home"
     }
    ]
   }
  ],
  "telecoms": [
   {
    "value": "tel:(816)276-6909",
    "use": "primary home"
   }
  ],
  "languages": [
   {
    "mode": "Expressed spoken",
    "code": "eng",
    "preferred": true
   }
  ],
  "medicalRecordNumbers": [
   {
    "root": "2.16.840.1.113883.4.6",
    "extension": "1"
   },
   {
    "root": "2.16.840.1.113883.4.1",
    "extension": "123-101-5230"
   }
  ],
  "gender": "Female",
  "birthTime": "1947-05-01T00:00:00.000Z",
  "birthTimeResolution": "day"
 },
 "vitals": {
  "panels": [
   {
    "panelName": {
     "label": "Vital signs",
     "code": "46680005",
     "systemName": "SNOMED CT",
     "uri": "http://purl.bioontology.org/ontology/SNOMEDCT/46680005"
    },
    "vitals": [
     {
      "vitalName": {
       "label": "Intravascular Systolic",
       "code": "8480-6",
       "systemName": "LOINC",
       "uri": "http://purl.bioontology.org/ontology/LNC/8480-6"
      },
      "measuredAt": {
       "point": "2012-08-06T00:00:00.000Z",
       "pointResolution": "day"
      },
      "physicalQuantity": {
       "value": 145,
       "unit": "mm[Hg]"
      },
      "freeTextValue": "145/88 mmHg",
      "interpretations": [
       "Normal"
      ]
     }
    ]
   }
  ]
 },
 "results": {
  "panels": [
   {
    "panelName": {
     "label": "CBC WO DIFFERENTIAL",
     "code": "43789009",
     "systemName": "SNOMED CT",
     "uri": "http://purl.bioontology.org/ontology/SNOMEDCT/43789009"
    },
    "results": [
     {
      "resultName": {
       "label": "PLT",
       "code": "26515-7",
       "systemName": "LOINC",
       "uri": "http://purl.bioontology.org/ontology/LNC/26515-7"
      },
      "measuredAt": {
       "point": "2012-08-10T00:00:00.000Z",
       "pointResolution": "day"
      },
      "physicalQuantity": {
       "value": 123,
       "unit": "10+3/ul"
      },
      "freeTextValue": "PLT (135-145 meq/l)",
      "interpretations": [
       "Low"
      ]
     }
    ]
   }
  ]
 },
 "medications": {
  "medicationsReported": [
   {
    "route": "RESPIRATORY (INHALATION)",
    "administrationUnit": {
     "label": "INHALANT",
     "code": "C42944",
     "systemName": "NCI Thesaurus",
     "uri": "http://nci-thesaurus-look-me-up#C42944"
    },
    "freeTextSig": "Albuterol 0.09 MG/ACTUAT inhalant solution",
    "dose": {
     "value": 0.09,
     "unit": "mg/actuat"
    },
    "rate": {
     "value": 90,
     "unit": "ml/min"
    },
    "productName": {
     "label": "Albuterol 0.09 MG/ACTUAT inhalant solution",
     "code": "573621",
     "systemName": "RXNORM",
     "translations": [
      {
       "label": "Proventil 0.09 MG/ACTUAT inhalant solution",
       "code": "573621",
       "systemName": "RXNORM",
       "uri": "http://purl.bioontology.org/ontology/RXNORM/573621"
      }
     ],
     "uri": "http://purl.bioontology.org/ontology/RXNORM/573621"
    },
    "freeTextProductName": "Albuterol 0.09 MG/ACTUAT inhalant solution",
    "dateRange": {
     "low": "2012-08-06T00:00:00.000Z",
     "lowResolution": "day",
     "high": "2012-08-13T00:00:00.000Z",
     "highResolution": "day"
    },
    "dosePeriod": {
     "value": 12,
     "unit": "h"
    }
   }
  ]
 },
 "immunizations": {
  "immunizationsGiven": [
   {
    "route": "Intramuscular injection",
    "date": {
     "point": "2012-05-10T00:00:00.000Z",
     "pointResolution": "day"
    },
    "productName": {
     "label": "Influenza virus vaccine",
     "code": "88",
     "systemName": "CVX Vaccine",
     "translations": [
      {
       "label": "influenza, live, intranasal",
       "code": "111",
       "systemName": "CVX Vaccine",
       "uri": "http://www2a.cdc.gov/vaccines/iis/iisstandards/vaccines.asp?rpt=cvx&code=111"
      }
     ],
     "uri": "http://www2a.cdc.gov/vaccines/iis/iisstandards/vaccines.asp?rpt=cvx&code=88"
    },
    "freeTextProductName": "Influenza virus vaccine"
   },
   {
    "route": "Intramuscular injection",
    "date": {
     "point": "2012-04-01T00:00:00.000Z",
     "pointResolution": "day"
    },
    "productName": {
     "label": "Tetanus and diphtheria toxoids - preservative free",
     "code": "103",
     "systemName": "CVX Vaccine",
     "translations": [
      {
       "label": "Tetanus and diphtheria toxoids - preservative free",
       "code": "09",
       "systemName": "CVX Vaccine",
       "uri": "http://www2a.cdc.gov/vaccines/iis/iisstandards/vaccines.asp?rpt=cvx&code=09"
      }
     ],
     "uri": "http://www2a.cdc.gov/vaccines/iis/iisstandards/vaccines.asp?rpt=cvx&code=103"
    },
    "freeTextProductName": "Tetanus and diphtheria toxoids - preservative free"
   }
  ]
 },
 "socialHistory": {
  "smokingStatuses": [
   {
    "smokingStatus": {
     "label": "Former smoker",
     "code": "8517006",
     "systemName": "SNOMED CT",
     "uri": "http://purl.bioontology.org/ontology/SNOMEDCT/8517006"
    },
    "dateRange": {
     "low": "2005-05-01T00:00:00.000Z",
     "lowResolution": "day",
     "high": "2011-02-27T00:00:00.000Z",
     "highResolution": "day"
    }
   }
  ]
 },
 "problems": {
  "problemConcerns": [
   {
    "dateRange": {
     "low": "2007-01-03T00:00:00.000Z",
     "lowResolution": "day",
     "high": "2012-08-06T00:00:00.000Z",
     "highResolution": "day"
    },
    "concernStatus": "completed",
    "problems": [
     {
      "problemType": {
       "label": "Complaint",
       "code": "409586006",
       "systemName": "SNOMED CT",
       "uri": "http://purl.bioontology.org/ontology/SNOMEDCT/409586006"
      },
      "problemName": {
       "label": "Asthma",
       "code": "195967001",
       "systemName": "SNOMED CT",
       "uri": "http://purl.bioontology.org/ontology/SNOMEDCT/195967001"
      },
      "freeTextProblemName": "Asthma : Status - Active",
      "dateRange": {
       "low": "2007-01-03T00:00:00.000Z",
       "lowResolution": "day"
      },
      "resolved": false,
      "ageAtOnset": {
       "value": 65,
       "unit": "a"
      },
      "problemStatus": {
       "label": "Active",
       "code": "55561003",
       "systemName": "SNOMED CT",
       "uri": "http://purl.bioontology.org/ontology/SNOMEDCT/55561003"
      },
      "healthStatus": {
       "label": "Symptom Free",
       "code": "162467007",
       "systemName": "SNOMED CT",
       "uri": "http://purl.bioontology.org/ontology/SNOMEDCT/162467007"
      }
     }
    ]
   }
  ]
 }
}
```
