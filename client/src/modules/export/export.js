import { Form, Container, Row, Col } from "react-bootstrap";
import { defaultFormState, formState } from "./export.state";
import { useState } from "react";
import { post } from "../../services/query";
import { useRecoilState } from "recoil";
import { LoadingOverlay } from "@cbiitss/react-components";
import { Grid, Table, TableHeaderRow } from "@devexpress/dx-react-grid-bootstrap4";

export default function Export() {
    const [form, setForm] = useRecoilState(formState);
    const mergeForm = (obj) => setForm({ ...form, ...obj });
    var tableColumnExtensions =  [{ columnName: "icd10Description", width: 600, wordWrapEnabled: true }];

    function getColumns() {

        var columns = []

        if (form.type === 'keywords')
            columns = [{ name: "input", title: "Keyword(s)" }]
        else if (form.type === 'icd10')
            columns = [{ name: "input", title: "ICD-10 Code(s)" }]
        else if (form.type === 'icdo3')
            columns = [{ name: "input", title: "ICD-O-3 Code(s)" }]

        if (form.outputType === 'icd10'){
            columns = columns.concat([{ name: "icd10", title: "ICD-10 Code(s)" }, { name: "icd10Description", title: "Description" }])
        }
        else if (form.outputType === 'icdo3'){
            columns = columns.concat([{ name: "icdo3", title: "ICD-O-3 Code(s)" }, { name: "icdo3Description", title: "Description" }])
            tableColumnExtensions = [{ columnName: "icdo3Description", width: 600, wordWrapEnabled: true }];
        }
        console.log(columns)
        return columns
    }

    console.log(form.output)
    function handleChange(event) {

        const { name, value } = event.target
        mergeForm({ [name]: value })
    }

    async function handleSubmit(event) {
        mergeForm({ ...form, loading: true });
        
        const response = await post('api/batch', {
            inputType: form.type,
            input: form.input,
            outputType: form.outputType,
            outputFormat: "json",
        })

        mergeForm({ ...form, loading: false, submitted: true, output: response });
    }

    return (
        <Container className="py-4 h-100">
            <LoadingOverlay active={form.loading} overlayStyle={{ position: "fixed" }} />
            <Row>
                <Col xl={3}>
                    <Form.Group className="mb-3">
                        <Form.Check
                            label="ICD-10 Codes"
                            name="type"
                            type="radio"
                            id="icd10"
                            value="icd10"
                            checked={form.type === 'icd10'}
                            onChange={handleChange}
                        />

                        <Form.Check
                            label="ICD-O-3 Codes"
                            name="type"
                            type="radio"
                            id="icdo3"
                            value="icdo3"
                            checked={form.type === 'icdo3'}
                            onChange={handleChange}
                        />

                        <Form.Check
                            label="Keywords"
                            name="type"
                            type="radio"
                            id="keywords"
                            value="keywords"
                            checked={form.type === 'keywords'}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <textarea className="form-control" name="input" placeholder="ICD-10 Codes, ICD-O-3 Codes, or Keywords" onChange={handleChange}></textarea>
                    </Form.Group>
                </Col>
                <Col xl={3}>
                    <Form.Group className="mb-3">
                        <input className="form-control" type="file" id='fileInput' />
                    </Form.Group>
                </Col>
                <Col xl={3}>
                    <button className="btn btn-outline-primary" type="button" onClick={handleSubmit}>
                        Export
                    </button>
                </Col>
            </Row>
            <Row style={{ maxHeight: "800px", overflow: "auto" }}>
                {form.submitted ? <Grid rows={form.output} columns={form.submitted ? getColumns() : []}>
                    <Table columnExtensions={tableColumnExtensions}/>
                    <TableHeaderRow />

                </Grid> : <></>}
            </Row>
        </Container>
    )
}