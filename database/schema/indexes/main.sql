create index index__icdo3_morphology__histology on icdo3_morphology("histology");
create index index__icdo3_morphology__behavior on icdo3_morphology("behavior");
create index index__icdo3_morphology__description on icdo3_morphology("description");
create index index__icdo3_morphology__code on icdo3_morphology("code");

create index index__icd10_icdo3_mapping__icd10 on icd10_icdo3_mapping("icd10");
create index index__icd10_icdo3_mapping__icdo3 on icd10_icdo3_mapping("icdo3");

create index index__icd10__path on icd10("path");
create index index__icd10__code on icd10("code");
create index index__icd10__description on icd10("description");

create index index__icd10_drug__path on icd10_drug("path");
create index index__icd10_drug__substance on icd10_drug("substance");
create index index__icd10_drug__poisoningAccidental on icd10_drug("poisoningAccidental");
create index index__icd10_drug__poisoningIntentionalSelfHarm on icd10_drug("poisoningIntentionalSelfHarm");
create index index__icd10_drug__poisoningAssault on icd10_drug("poisoningAssault");
create index index__icd10_drug__poisoningUndetermined on icd10_drug("poisoningUndetermined");
create index index__icd10_drug__adverseEffect on icd10_drug("adverseEffect");
create index index__icd10_drug__underdosing on icd10_drug("underdosing");
create index index__icd10_drug__code on icd10_drug(
  "poisoningAccidental",
  "poisoningIntentionalSelfHarm",
  "poisoningAssault",
  "poisoningUndetermined",
  "adverseEffect",
  "underdosing"
);

create index index__icd10_injury__path on icd10_injury("path");
create index index__icd10_injury__description on icd10_injury("description");
create index index__icd10_injury__code on icd10_injury("code");

create index index__icd10_neoplasm__path on icd10_neoplasm("path");
create index index__icd10_neoplasm__neoplasm on icd10_neoplasm("neoplasm");
create index index__icd10_neoplasm__malignantPrimary on icd10_neoplasm("malignantPrimary");
create index index__icd10_neoplasm__malignantSecondary on icd10_neoplasm("malignantSecondary");
create index index__icd10_neoplasm__carcinomaInSitu on icd10_neoplasm("carcinomaInSitu");
create index index__icd10_neoplasm__benign on icd10_neoplasm("benign");
create index index__icd10_neoplasm__uncertainBehavior on icd10_neoplasm("uncertainBehavior");
create index index__icd10_neoplasm__unspecifiedBehavior on icd10_neoplasm("unspecifiedBehavior");
create index index__icd10_neoplasm__code on icd10_neoplasm(
  "malignantPrimary",
  "malignantSecondary",
  "carcinomaInSitu",
  "benign",
  "uncertainBehavior",
  "unspecifiedBehavior"
);
