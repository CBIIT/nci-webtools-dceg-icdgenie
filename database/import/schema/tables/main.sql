create table "icd10"
(
    "id" integer primary key,
    "parentId" integer,
    "path" text,
    "code" text,
    "description" text,
    "level" integer,
    "parentCode" text
);

create table "icd10_drug"
(
    "id" integer primary key,
    "parentId" integer,
    "path" text,
    "substance" text,
    "level" integer,
    "parentSubstance" text,
    "poisoningAccidental" text,
    "poisoningIntentionalSelfHarm" text,
    "poisoningAssault" text,
    "poisoningUndetermined" text,
    "adverseEffect" text,
    "underdosing" text
);

create table "icd10_injury"
(
    "id" integer primary key,
    "parentId" integer,
    "path" text,
    "description" text,
    "level" integer,
    "parentDescription" text,
    "code" text
);

create table "icd10_neoplasm"
(
    "id" integer primary key,
    "parentId" integer,
    "path" text,
    "neoplasm" text,
    "level" integer,
    "parentNeoplasm" text,
    "malignantPrimary" text,
    "malignantSecondary" text,
    "carcinomaInSitu" text,
    "benign" text,
    "uncertainBehavior" text,
    "unspecifiedBehavior" text
);
