create table "icd10"
(
    "id" integer primary key,
    "neoplasm" text,
    "level" integer,
    "parent" text,
    "malignantPrimary" text,
    "malignantSecondary" text,
    "carcinomaInSitu" text,
    "benign" text,
    "uncertainBehavior" text,
    "unspecifiedBehavior" text,
    "other" text
);
