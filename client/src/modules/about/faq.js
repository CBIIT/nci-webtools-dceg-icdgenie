import { Container, Row, Col, Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function FAQ() {
    const navigate = useNavigate();
    return (
        <div className="h-100 bg-white">
            <Container className="py-3">
                <h1 className="display-6 page-header text-muted text-center ">FAQs</h1>
            </Container>
            <hr />
            <Container className="py-3">
                <h5 className="my-4 blue-subheader">Frequently Asked Questions:</h5>
                <Accordion defaultActiveKey={["0","1","2"]} alwaysOpen className="mb-4">
                    <Accordion.Item eventKey="0" className="mb-2">
                        <Accordion.Header>1. How do I figure out what my non-text, diagnosis code is ?</Accordion.Header>
                        <Accordion.Body>
                            <ul>
                                <li>ICD-O-3 : Entirely numeric, 5 numbers maximum, has a forward slash after the fourth number.</li>
                                <li>ICD-10 : Starts with a letter and 2 numbers. Can be up to 7 characters long</li>
                            </ul>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1" className="mb-3">
                        <Accordion.Header>2. What are the differences between ICD-O-3 and ICD-10?</Accordion.Header>
                        <Accordion.Body>
                            <div><a href="https://training.seer.cancer.gov/coding/differences/" target="_blank">Go here (SEER Training site)</a></div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>3. I have more than 5,000 rows of diagnosis codes - do you have an R program?</Accordion.Header>
                        <Accordion.Body>
                            <div>An R program is in development. At present we recommend the ICD Genie <a href="javascript:void(0)" onClick={() => { navigate('/api-access') }}>API access</a> for performing these large queries.</div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Container>
        </div>
    )
}