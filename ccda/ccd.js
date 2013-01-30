var fs = require("fs");
var util = require("util");
var common = require("./common");

var Processor = require("./processor");
var OIDs = require("./oids");
var Component = require("./component");
var Cleanup = require("./cleanup");

Component
  .withNegationStatus(false)
  .cleanupStep(Cleanup.hideFields(["sourceIds"]), "paredown")
  .cleanupStep(Cleanup.clearNulls, "paredown");

var Identifier = Component.define("Identifier")
.fields([
  ["root","1..1", "@root"],
  ["extension","0..1", "@extension"],
]);

var TextWithReference = Component.define("TextWithReference");
TextWithReference.fields([ 
  ["text","0..*", "text()"],
  ["reference","0..1", "./h:reference/@value"],
])
.cleanupStep(Cleanup.resolveReference);

var ConceptDescriptor = Component.define("ConceptDescriptor");
ConceptDescriptor.fields([ 
  ["label","0..1", "@displayName"],
  ["code","1..1", "@code"],
  ["system","1..1", "@codeSystem"],
  ["systemName","0..1", "@codeSystemName"],
  ["nullFlavor","0..1", "@nullFlavor"],
  ["translations","0..*", "h:translation", ConceptDescriptor],
])
.cleanupStep(Cleanup.validateShalls)
.cleanupStep(Cleanup.augmentConcept)
.cleanupStep(function(){
  (this.js && this.js.system && delete this.js.system);
}, "paredown");

var SimpleCode = function(oid){
  return Component.define("SimpleCode."+oid)
  .fields([])
  .cleanupStep(function(){
    if (this.js) {
      this.js = OIDs[oid].table[this.js];
    }
  }, "paredown");
};

var SimplifiedCode = ConceptDescriptor.define("SimpifiedCode")
.cleanupStep(function(){
  if (this.js) {
  // TODO: look up; don't trust the label to be present...
    this.js = this.js.label;
  }
});

var Address = Component.define("Address")
.fields([
  ["streetLines",   "1..4",   "h:streetAddressLine/text()"],
  ["city",          "1..1",   "h:city/text()", Processor.asString],
  ["state",         "0..1",   "h:state/text()"],
  ["zip",           "0..1",   "h:postalCode/text()"],
  ["country",       "0..1",   "h:country/text()"],
  ["use",           "0..1",   "@use", SimpleCode("2.16.840.1.113883.5.1119")]
]);

var Name = Component.define("Name")
.fields([
  ["prefixes", "0..*","h:prefix/text()"],
  ["givens", "1..*","h:given/text()"],
  ["family", "1..1","h:family/text()"],
  ["suffix", "0..1","h:suffix/text()"],
  ["use", "0..1", "@use", SimpleCode("2.16.840.1.113883.5.45")]
]);

var Telecom = Component.define("Telecom")
.fields([
  ["value", "1..1","@value"],
  ["use", "0..1", "@use", SimpleCode("2.16.840.1.113883.5.1119")]
]);

var Guardian = Component.define("Guardian")
.fields([
  ["relation","0..1", "h:code", SimplifiedCode],
  ["addresses","0..*", "h:addr", Address],
  ["names","1..*", "h:guardianPerson/h:name", Name],
  ["telecoms","0..*", "h:telecom", Telecom],
]);

var LanguageCommunication = Component.define("LanguageCommunication")
.fields([
  ["mode","0..1", "h:modeCode", SimplifiedCode],
  ["proficiency","0..1", "h:proficiencyLevelCode", SimplifiedCode],
  ["code", "1..1","h:languageCode/@code"],
  ["preferred", "1..1","h:preferenceInd/@value", Processor.asBoolean],
]);


var PhysicalQuantity = Component.define("PhysicalQuantity")
.fields([
  ["value","1..1", "@value", Processor.asFloat], 
  ["unit", "0..1", "@unit"],
]);

var EffectiveTime = Component.define("EffectiveTime")
.fields([
  ["point","0..1", "@value", Processor.asTimestamp],
  ["pointResolution","0..1", "@value", Processor.asTimestampResolution],
  ["low","0..1", "h:low/@value", Processor.asTimestamp],
  ["lowResolution","0..1", "h:low/@value", Processor.asTimestampResolution],
  ["high","0..1", "h:high/@value", Processor.asTimestamp],
  ["highResolution","0..1", "h:high/@value", Processor.asTimestampResolution],
  ["operator","0..1", "./@operator"],
  ["xsitype","0..1", "./@xsi:type"],
  ["period","0..1", "./h:period", PhysicalQuantity],
//  ["precise","0..1", "./@institutionSpecified", Processor.asBoolean],
])
.cleanupStep(function(){
  this.js && delete this.js.xsitype;
}, "paredown");

var AgeObservation = Component.define("AgeObservation")
.templateRoot("2.16.840.1.113883.10.20.22.4.31");

var ProblemStatus = Component.define("ProblemStatus")
.templateRoot("2.16.840.1.113883.10.20.22.4.6");

var HealthStatus = Component.define("HealthStatus")
.templateRoot("2.16.840.1.113883.10.20.22.4.5");

var ProblemObservation = Component.define("ProblemObservation")
.templateRoot("2.16.840.1.113883.10.20.22.4.4")
.fields([
  ["sourceIds","1..*", "h:id", Identifier],
  ["problemType","1..1", "h:code", ConceptDescriptor],
  ["problemName","1..1", "h:value", ConceptDescriptor],
  ["freeTextProblemName","0..1", "h:text", TextWithReference],
  ["dateRange", "1..1", "h:effectiveTime", EffectiveTime],
  ["resolved","1..1", "h:effectiveTime", Processor.pathExists("./@high")],
  ["ageAtOnset", "0..1", 
    AgeObservation.xpath() + "/h:value", 
    PhysicalQuantity],
  ["problemStatus","0..1", 
    ProblemStatus.xpath() + "/h:value", 
    ConceptDescriptor],
  ["healthStatus","0..1", 
    HealthStatus.xpath() + "/h:value", 
    ConceptDescriptor]
]);

var NonProblemObservation = ProblemObservation
.define("NonProblemObservation")
.withNegationStatus(true)
.uriBuilder({
  category: "entries",
  type: "nonProblems"
});

var ProblemOrganizer = Component.define("ProblemOrganizer")
.templateRoot("2.16.840.1.113883.10.20.22.4.3")
.fields([
  ["sourceIds","1..*", "h:id", Identifier],
  ["dateRange", "1..1", "h:effectiveTime", EffectiveTime],
  ["concernStatus", "1..1", "h:statusCode/@code", SimpleCode("2.16.840.1.113883.11.20.9.19")],
  ["problems", "1..*", ProblemObservation.xpath(), ProblemObservation],
  ["nonProblems", "0..*", NonProblemObservation.xpath(), NonProblemObservation]
])
.uriBuilder({
  category: "entries",
  type: "problemConcerns"
});


var ProblemsSection = Component.define("ProblemsSection")
.templateRoot("2.16.840.1.113883.10.20.22.2.5.1") // coded entries required
.fields([
  ["problemConcerns","0..*", ProblemOrganizer.xpath(), ProblemOrganizer],
])
.uriBuilder({
  category: "sections",
  type: "problems"
});


var VitalSignObservation = Component.define("VitalSignObservation")
.templateRoot("2.16.840.1.113883.10.20.22.4.27")
.fields([
  ["sourceIds","1..*", "h:id", Identifier],
  ["vitalName","1..1", "h:code", ConceptDescriptor],
  ["measuredAt", "1..1", "h:effectiveTime", EffectiveTime],
  ["physicalQuantity","1..1", "h:value[@xsi:type='PQ']", PhysicalQuantity],
  ["freeTextValue","0..1", "h:text", TextWithReference],
  ["interpretations", "0..*", "h:interpretationCode[@codeSystem='2.16.840.1.113883.5.83']", SimplifiedCode]
])
.uriBuilder({
  category: "entries",
  type: "vitals"
});


var VitalSignsOrganizer = Component.define("VitalSignsOrganizer")
.templateRoot("2.16.840.1.113883.10.20.22.4.26")
.fields([
  ["panelName","0..1", "h:code", ConceptDescriptor],
  ["sourceIds","1..*", "h:id", Identifier],
  ["vitals", "1..*", VitalSignObservation.xpath(), VitalSignObservation]
])
.uriBuilder({
  category: "organizers",
  type: "vitals"
});


var VitalSignsSection = Component.define("VitalSignsSection")
.templateRoot("2.16.840.1.113883.10.20.22.2.4.1")
.fields([
  //["name","0..1", "h:code", ConceptDescriptor],
  ["panels","0..*", VitalSignsOrganizer.xpath(), VitalSignsOrganizer],
])
.uriBuilder({
  category: "sections",
  type: "vitals"
});

var ImmunizationRefusalReason = Component.define("ImmunizationRefusalReason")
.templateRoot("2.16.840.1.113883.10.20.22.4.53");

var ImmunizationInformation = Component.define("ImmunizationInformation")
.templateRoot("2.16.840.1.113883.10.20.22.4.54")
.fields([
  ["productName","0..1", ".//h:manufacturedMaterial/h:code", ConceptDescriptor],
  ["freeTextProductName","0..1", ".//h:manufacturedMaterial/h:code/h:originalText", TextWithReference],
  ["lotNumber","0..1", "h:lotNumberText/text()"],
]);

var ImmunizationActivity = Component.define("ImmunizationActivity")
.templateRoot("2.16.840.1.113883.10.20.22.4.52")
.withMood("EVN")
.fields([
  ["sourceIds","1..*", "h:id", Identifier],
  ["deliveryMethod","0..1", "h:code", ConceptDescriptor],
  ["route","0..1", "h:routeCode", SimplifiedCode],
  ["site","0..1", "h:approachSiteCode", ConceptDescriptor],
  ["administrationUnit","0..1", "h:administrationUnitCode", ConceptDescriptor],
  ["date", "1..1", "h:effectiveTime", EffectiveTime],
  ["seriesNumber", "0..1", "h:repeatNumber/@value", EffectiveTime],
  ["immunizationName", "1..1", "h:consumable/h:manufacturedProduct", ImmunizationInformation],
  ["freeText","0..1", "h:text", TextWithReference],
  ["skippedFor", "0..1", ImmunizationRefusalReason.xpath()+"/h:code", SimplifiedCode]
])
.uriBuilder({
  category: "entries",
  type: "immunizationsGiven"
})
.cleanupStep(Cleanup.extractAllFields(["immunizationName"]));

var PlannedImmunization = ImmunizationActivity.define("PlannedImmunization")
.withMood("INT")
.uriBuilder({
  category:"entries",
  type:"immunizationsPlanned"
});

var RefusedImmunization = ImmunizationActivity.define("RefusedImmunization")
.withNegationStatus(true)
.uriBuilder({
  category:"entries",
  type:"immunizationsSkipped"
});

var ImmunizationsSection = Component.define("ImmunizationsSection")
.templateRoot(["2.16.840.1.113883.10.20.22.2.2", "2.16.840.1.113883.10.20.22.2.2.1"])
.fields([
  ["immunizationsGiven","0..*", ImmunizationActivity.xpath(), ImmunizationActivity],
  ["immunizationsPlanned","0..*", PlannedImmunization.xpath(), PlannedImmunization],
  ["immunizationsSkipped","0..*", RefusedImmunization.xpath(), RefusedImmunization],
])
.uriBuilder({
  category: "sections",
  type: "immunizations"
})
.cleanupStep(Cleanup.ensureMutuallyExclusive([
  "immunizationsSkipped",
  "immunizationsGiven", 
  "immunizationsPlanned"
]));


var MedicationInformation = Component.define("MedicationInformation")
.templateRoot("2.16.840.1.113883.10.20.22.4.23")
.fields([
  ["productName","0..1", "h:manufacturedMaterial/h:code", 
    ConceptDescriptor.shall({valueSetOid: "2.16.840.1.113883.3.88.12.80.17"})],
  ["freeTextProductName","0..1", "h:manufacturedMaterial/h:code/h:originalText", TextWithReference],
  //TODO: datatype?  ["manufacturer","0..1", "h:manufacturerOrganization", ??],
]);

var MedicationActivity = Component.define("MedicationActivity")
.templateRoot("2.16.840.1.113883.10.20.22.4.16")
.fields([
  ["sourceIds","1..*", "h:id", Identifier],
  ["deliveryMethod","0..1", "h:code", ConceptDescriptor],
  ["route","0..1", "h:routeCode", SimplifiedCode],
  ["site","0..1", "h:approachSiteCode", ConceptDescriptor],
  ["administrationUnit","0..1", "h:administrationUnitCode", ConceptDescriptor],
  ["times", "1..*", "h:effectiveTime", EffectiveTime],
  ["medicationName", "1..1", "h:consumable/h:manufacturedProduct", MedicationInformation],
  ["freeTextSig","0..1", "h:text", TextWithReference],
  ["dose","0..1", "h:doseQuantity", PhysicalQuantity],
  ["rate","0..1", "h:rateQuantity", PhysicalQuantity],
])
.cleanupStep(Cleanup.extractAllFields(["medicationName"]))
.cleanupStep(function(){
  // separate out two effectiveTimes

  // 1.  startDate --- endDate
  var range = this.js.times.filter(function(t){
    return -1 === ['PIVL_TS', 'EIVL_TS'].indexOf(t.js.xsitype);
  });

  // 2.  dosing interval
  var period= this.js.times.filter(function(t){
    return -1 !== ['PIVL_TS', 'EIVL_TS'].indexOf(t.js.xsitype);
  });

  delete this.js.times;

  if (range.length > 0) {
    this.js.dateRange = range[0];
  }

  if (period.length > 0) {
    this.js.dosePeriod = period[0].js.period;
  }
});

var MedActivityRx = MedicationActivity.define("Prescription")
.withMood("INT")
.uriBuilder({
  category:"entries",
  type:"medicationsPrescribed"
});

var MedActivityHx = MedicationActivity.define("MedActivityHx")
.withMood("EVN")
.uriBuilder({
  category:"entries",
  type:"medicationsReported"
});

var SmokingStatusObservation = Component.define("SmokingStatusObservation")
.templateRoot([
  "2.16.840.1.113883.10.20.22.4.78", // the correct templateId
  "2.16.840.1.113883.10.22.4.78" // incorrect id published in 1.1 DSTU
])
.fields([
  ["sourceIds","1..*", "h:id", Identifier],
  ["smokingStatus","0..1", "h:value", 
    ConceptDescriptor.shall({
      valueSetOid: "2.16.840.1.113883.11.20.9.38"
    })],
  // TODO: want a better name for this field -- but what does it mean?
  // http://www.hl7.org/dstucomments/showdetail_comment.cfm?commentid=98
  ["dateRange", "1..1", "h:effectiveTime", EffectiveTime],
])
.uriBuilder({
  category: "entries",
  type: "smokingStatus"
}) ;

var SocialHistorySection = Component.define("SocialHistorSection")
.templateRoot(["2.16.840.1.113883.10.20.22.2.17"])
.fields([
  ["smokingStatuses","0..*", SmokingStatusObservation.xpath(), SmokingStatusObservation]
])
.uriBuilder({
  category: "sections",
  type: "socialHistory"
});

var MedicationsSection = Component.define("MedicationsSection")
.templateRoot(["2.16.840.1.113883.10.20.22.2.1", "2.16.840.1.113883.10.20.22.2.1.1"])
.fields([
  ["medicationsPrescribed","0..*", MedActivityRx.xpath(), MedActivityRx],
  ["medicationsReported","0..*", MedActivityHx.xpath(), MedActivityHx],
])
.uriBuilder({
  category: "sections",
  type: "medications"
})
.cleanupStep(Cleanup.ensureMutuallyExclusive([
  "medicationsPrescribed",
  "medicationsReported", 
]));

var ResultObservation = Component.define("ResultObservation")
.templateRoot("2.16.840.1.113883.10.20.22.4.2")
.fields([
  ["sourceIds","1..*", "h:id", Identifier],
  ["resultName","1..1", "h:code", ConceptDescriptor],
  ["measuredAt", "1..1", "h:effectiveTime", EffectiveTime],
  ["physicalQuantity","1..1", "h:value[@xsi:type='PQ']", PhysicalQuantity],
  ["freeTextValue","0..1", "h:text", TextWithReference],
  ["interpretations", "0..*", "h:interpretationCode[@codeSystem='2.16.840.1.113883.5.83']", SimplifiedCode]
])
.uriBuilder({
  category: "entries",
  type: "results"
});


var ResultsOrganizer = Component.define("ResultsOrganizer")
.templateRoot("2.16.840.1.113883.10.20.22.4.1")
.fields([
  ["sourceIds","1..*", "h:id", Identifier],
  ["panelName","0..1", "h:code", ConceptDescriptor],
  ["results", "1..*", ResultObservation.xpath(), ResultObservation]
])
.uriBuilder({
  category: "organizers",
  type: "results"
});


var ResultsSection = Component.define("ResultsSection")
.templateRoot([
  '2.16.840.1.113883.10.20.22.2.3', '2.16.840.1.113883.10.20.22.2.3.1' // .1 for "entries required"
])
.fields([
  //        ["name","0..1", "h:code", ConceptDescriptor],
  ["panels","0..*", ResultsOrganizer.xpath(), ResultsOrganizer],
])
.uriBuilder({
  category: "sections",
  type: "results"
});

var Patient = Component.define("Patient")
.fields([
  ["name",                "1..1", "h:patient/h:name", Name],
  ["maritalStatus",       "0..1", "h:patient/h:maritalStatusCode", 
    SimplifiedCode.shall({valueSetOid: "2.16.840.1.113883.1.11.12212"})],
  ["religion",            "0..1", "h:patient/h:religiousAffiliationCode", ConceptDescriptor],
  ["race",                "0..1", "h:patient/h:raceCode", ConceptDescriptor],
  ["ethnicity",           "0..1", "h:patient/h:ethnicGroupCode", ConceptDescriptor],
  ["addresses",             "0..*", "h:addr", Address],
  ["guardians",            "0..*", "h:patient/h:guardian", Guardian],
  ["telecoms",             "0..*", "h:telecom", Telecom],
  ["languages",            "0..*", "h:patient/h:languageCommunication", LanguageCommunication],
  ["medicalRecordNumbers","1..*", "h:id", Identifier],
  ["gender",              "1..1", "h:patient/h:administrativeGenderCode", SimplifiedCode],
  ["birthTime",           "1..1", "h:patient/h:birthTime/@value", Processor.asTimestamp],
  ["birthTimeResolution", "1..1", "h:patient/h:birthTime/@value", Processor.asTimestampResolution],
])
.uriBuilder({
  category: "sections",
  type: "demographics"
});

var CCDA = Component.define("CCDA")
.fields([
  ["sourceIds", "1..*", "h:id", Identifier],
  ["demographics", "1..1", "//h:recordTarget/h:patientRole", Patient],
  ["vitals", "0..1", VitalSignsSection.xpath(), VitalSignsSection],
  ["results", "0..1", ResultsSection.xpath(), ResultsSection],
  ["medications", "0..1", MedicationsSection.xpath(), MedicationsSection],
  ["immunizations", "0..1", ImmunizationsSection.xpath(), ImmunizationsSection],
  ["socialHistory", "0..1", SocialHistorySection.xpath(), SocialHistorySection],
  ["problems", "0..1", ProblemsSection.xpath(), ProblemsSection],
])
.uriBuilder({
  category: "documents",
  type: "ccda"
}).cleanupStep(Cleanup.fixSectionUris, 1);


CCDA.prototype.run = function(node){
  this.errors = [];
  this.super_.run.apply(this, arguments);
  return this;
};

module.exports = function(src, options, callback){

  if (arguments.length === 2){
    callback = options;
    options = {};
  }

  if(options.hideFields){
    Component.cleanupStep(Cleanup.hideFields(options.hideFields), "paredown");
  };

  var patientId = options.patientId || 0;
  var xml = common.parseXml(src);
  
  var ret = new CCDA();
  ret.patientId = patientId;

  //TODO can we leverage external terminology services
  //explicitly here, to support browser- and server-side JS?
  ret.codes = []; // skip code resoution for now
  
  ret.src = src;
  ret.run(xml);

  ret.cleanupTree(); // first build the data objects up 
  ret.cleanupTree("paredown"); // then pare down to essentials
  callback(null, ret);
};

module.exports.ConceptDescriptor = ConceptDescriptor;
