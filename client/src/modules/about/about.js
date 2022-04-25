import Container from "react-bootstrap/Container";

export default function About() {
  return (
    <div className="h-100 bg-white">
      <Container className="py-5">
        <h1 className="display-6 text-muted text-center text-uppercase ">About</h1>
      </Container>

      <hr />

      <Container className="py-5">
        <p>The International Classification of Diseases (ICD) coding system has been in existence for over a century and forms the basis for comparable statistics of disease incidence and mortality. The ICD coding system has  evolved over time to reflect temporal changes in disease-specific classification schemes. As of 2022, the latest version is ICD-10. </p>

        <p>The ICD for Oncology (ICD-O) coding system has been in use since 1976 and is designed specifically to classify tumors. It is used primarily in cancer registries for coding the site (topography) and the histology (morphology) of neoplasms, both of which are details that can be extracted from pathology reports. As of 2022, the ICD-O is in its third edition, i.e., ICD-O-3, which includes updated information, and related terms, on lymphoid tumors, hematologic malignancies, as well as tumors of the central nervous system and digestive system. Specifically designed for the classification of cancer, the ICD-O-3 is necessary for the standardization of cancer data collection in epidemiological research and statistical modeling.</p>

        <p>Although many of the early classification and coding conventions have remained unchanged in successive versions of ICD and ICD-O, substantial revisions have been made in more recent versions i.e., ICD-10 and ICD-O-3. Depending on when data were collected, epidemiological studies and cancer databases may employ different ICD versions, thereby hampering data harmonization. In addition, tumor-related data may be available only in pathology reports, in text formats, or as ICD codes, which can be difficult to translate for non-specialists. To address these challenges, we developed ICD Genie as a publicly available web tool to facilitate the translation of ICD-10 and ICD-O-3 codes to human-readable text and vice versa. ICD Genie synthesizes data from the following publicly available resources:</p>
      
        <p>ICD-10 Resources</p>
        <ul>
          <li><a href="https://www.cms.gov/files/zip/2022-code-tables-tabular-and-index.zip" target="_blank">ICD-10-CM codes maintained by Centers for Medicare & Medicaid Services (CMS)</a></li>
        </ul>

        <p>ICD-O3 morphology codes and description sources</p>
        <ul>
          <li><a href="https://www.naaccr.org/icdo3/" target="_blank">North American Association of Central Cancer Registries (NAACCR)</a></li>
          <li><a href="https://seer.cancer.gov/icd-o-3/" target="_blank">Surveillance, Epidemiology, and End Results (SEER) program validation list</a></li>
          <li><a href="https://apps.who.int/iris/bitstream/handle/10665/96612/9789241548496_eng.pdf" target="_blank">World Health Organization (WHO) ICD-O-3 publication</a></li>
        </ul>
      </Container>
    </div>
  );
}
