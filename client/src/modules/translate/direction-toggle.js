import { Form, ButtonGroup, Button } from "react-bootstrap";

// Two side-by-side toggle buttons for choosing translation direction. The active side is filled,
// the other outlined. `type="button"` keeps clicks from submitting an enclosing form.
// Shared by the single Translate page and the Batch Translate page.
export default function DirectionToggle({ value, onChange, label = "Direction" }) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-bold d-block">{label}</Form.Label>
      <ButtonGroup className="w-100" size="lg">
        <Button
          type="button"
          variant={value === "icd10" ? "primary" : "outline-primary"}
          active={value === "icd10"}
          onClick={() => onChange("icd10")}
        >
          ICD-10-CM → ICD-11
        </Button>
        <Button
          type="button"
          variant={value === "icd11" ? "primary" : "outline-primary"}
          active={value === "icd11"}
          onClick={() => onChange("icd11")}
        >
          ICD-11 → ICD-10-CM
        </Button>
      </ButtonGroup>
    </Form.Group>
  );
}
