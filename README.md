# ICDgenie

A search, translation, and validation service for ICD codes and descriptions

## Introduction

Accurate histological classification is important for facilitating studies of cancer epidemiology and etiologic heterogeneity. ICDgenie is a web-based tool that can assist epidemiologists, pathologists, research assistants, and data scientists to more easily access, translate and validate codes and text descriptions from the International Classification of Diseases (10th Edition) and International Classification of Diseases for Oncology, 3rd Edition (ICD-O-3).

By improving accessibility and making existing cancer classification and coding schemes to be more readily understandable and searchable, ICDgenie will help accelerate descriptive and molecular epidemiological studies of cancer.

## Getting Started

```bash
# clone repository
git pull https://github.com/CBIIT/nci-webtools-dceg-icdgenie
cd nci-webtools-dceg-icdgenie

# install git hooks
npm install

# install database dependencies
npm run install:database

# install client dependencies
npm run install:client
```

### Database

The database service exposes a query api using express.js.

#### Getting Started

1. Create `database/config.json` using `database/config.example.json` as a template
2. Run `npm start` in the database folder

#### Supported Queries

#### ICD10 search

Endpoint: `/api/search/icd10`

Parameters:

- description - Partial description or keyword
- code - ICD10 code or prefix
- type - "index" (default), "drug", "injury" or "neoplasm"
- format "list" (default) or "tree"

Note that child/parent records are also included in search results.

Examples:

- search for neoplasms which contain the term "lung"
  - `/api/search/icd10?type=neoplasm&description=lung`
- search for ICD-10 codes which begin with "D05" and retrieve results as a tree
  - `api/search/icd10?code=D05&format=tree`
- search for injuries which contain the ICD10 code "Y93.74"
  - `/api/search/icd10?type=injury&code=Y93.74`

#### ICD-O-3 search

Endpoint: `/api/search/icdo3`

Parameters:

- description - Partial description or keyword
- code - ICD-O-3 code or prefix
- type - "morphology" (default)

Examples:

- search for ICD-O-3 morphologies which contain the term "lung"
  - `/api/search/icdo3?description=lung`
- search for ICD-O-3 morphologies with a histology code of 8253 and a behavior code of 3
  - `/api/search/icdo3?code=8253/3`
- search for ICD-O-3 morphologies with a histology code of 8964
  - `/api/search/icdo3?code=8964`

#### ICD10/ICD-O-3 translation

Endpoint: `/translate`

Parameters (mutually exclusive):

- icd10 - ICD10 code or prefix to translate to ICD-O-3
- icdo3 - ICD-O-3 code or prefix to translate to ICD10

Examples:

- translate ICD-O-3 morphology codes beginning with 8253 to ICD-10 codes
  - `/api/translate?icdo3=8253`
- translate ICD-10 codes beginning with C34.1 to ICD-10 morphology codes
  - `/api/translate?icd10=C34.1`

### Client

The client is an Angular PWA which allows users to perform and visualize queries against the ICD database service.

#### Getting Started

1. Run `npm start` in the client folder
