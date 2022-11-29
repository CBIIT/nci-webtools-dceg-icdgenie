import { Container, Row, Col } from "react-bootstrap";
import { HashLink } from 'react-router-hash-link';
import { useNavigate } from "react-router-dom";

export default function Starter() {
    const navigate = useNavigate();
    return (
        <div className="h-100 bg-white">
            <Container className="py-5">
                <h1 className="display-6 text-muted text-center text-uppercase">About</h1>
            </Container>
            <hr />
            <Container className="py-5">
                <Row>
                    <Col md={2} >
                        <div className="pb-5" style={{ borderRight: "4px solid #76BDD7" }}>
                            <div className="my-2"><HashLink smooth to='/getting-started/#checklist' className="h6 blue-subheader">CHECKLIST</HashLink></div>
                            <div className="my-2"><HashLink smooth to='/getting-started/#searchTypes' className="h6 blue-subheader">SEARCH TYPES</HashLink></div>
                            <div className="my-2"><HashLink smooth to='/getting-started/#formatting' className="h6 blue-subheader">FORMATTING ICD CODES</HashLink></div>
                            <div className="my-2"><HashLink smooth to='/getting-started/#tutorials' className="h6 blue-subheader">TUTORIALS</HashLink></div>
                        </div>
                    </Col>
                    <Col md={10}>
                        <Container className="mx-5">
                            <h5>We encourage new users of ICD Genie to familiarize themselves with the following checklist to ensure they are using appropriate search terms and getting maximal utility from their ICD Genie searches. </h5>
                            <h3 id="checklist" className="my-4 text-center text-uppercase blue-subheader">Checklist</h3>
                            <ol>
                                <li>Assess if you need to use single or batch query</li>
                                <li>Figure out what you will use as input values (e.g., ICD-10 codes, ICD-O-3 codes or text diagnoses)</li>
                                <li>Ensure your input values are properly formatted </li>
                                <ul>
                                    <li>Ensure diagnosis codes (i.e., ICD-10 or codes ICD-O-3 you are looking to translate) are properly formatted. Guidance is provided <HashLink smooth to='/getting-started/#formatting'>below</HashLink></li>
                                    <li>Ensure text diagnoses are in American English, not British English</li>
                                </ul>
                                <li>Determine your desired output ( ICD-10 codes, ICD-O-3 codes or text diagnoses)</li>
                            </ol>
                        </Container>
                    </Col>
                </Row>
            </Container>
            <div style={{ backgroundColor: "lightgrey" }}>
                <Container className="py-5" >
                    <Row>
                        <Col md={2} />
                        <Col md={10}>
                            <Container className="mx-5">
                                <h3 id="searchTypes" className="my-4 text-center text-uppercase blue-subheader">Search Types</h3>
                                <b style={{ textDecorationLine: "underline" }}>Single Query</b>
                                <p>Single query accepts text, numeric (ICD-O-3), and alphanumeric (ICD-10) queries. You can explore disease descriptions and the coding hierarchy (i.e., parent nodes and child nodes). Only one search term can be entered at a time. </p>
                                <b style={{ textDecorationLine: "underline" }}>Batch Query</b>
                                <p>
                                    ICD Genie will return the original information submitted with a new column added at the end with the search results. We recommend you submit a tab-delimited file (“.tsv”) with no more than 5 columns by 5,000 rows. If you have advanced queries that require more than 5,000 search codes or terms, we recommend you use
                                    the <a href="javascript:void(0)" onClick={() => { navigate('/api-access') }}>API Access</a>.
                                </p>
                                <div>Batch Query does not...</div>
                                <ul>
                                    <li>Automatically detect the type of information you submit nor automatically determine what type of output you need</li>
                                    <li>Know which column is the input column you want it to use for queries of diagnosis codes or text</li>
                                    <li>Automatically select “Preferred Term.” If you only want 1 text diagnosis per 1 ICD-O-3 or ICD-10 code you put in, you must select the box next to “Preferred Term”</li>
                                </ul>
                                <b style={{ textDecorationLine: "underline" }}>API</b>
                                <p>For more advanced searches with large numbers of text or diagnosis code queries, we recommend <a href="javascript:void(0)" onClick={() => { navigate('/api-access') }}>API Access</a>.</p>
                            </Container>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Container className="py-5">
                <Row>
                    <Col md={2} />
                    <Col md={10}>
                        <Container className="mx-5">
                            <h3 id="formatting" className="my-4 text-center text-uppercase blue-subheader">Formatting ICD Codes</h3>
                            <b style={{ textDecorationLine: "underline" }}>ICD-10 Codes</b>
                            <div>A 0 1 . 0 2 1 S</div>
                            <ul>
                                <li>Alphanumeric</li>
                                <li>Can be up to 7 characters</li>
                                <li>First character is always a letter (except "U")</li>
                                <li>Second and third characters are always a number</li>
                                <li>Characters 4 through 7 : either a number or letter</li>
                            </ul>
                            <b style={{ textDecorationLine: "underline" }}>ICD-0-3 Codes</b>
                            <div>9 1 4 0 / 3</div>
                            <ul>
                                <li>Entirely Numeric</li>
                                <li>Must have a forward slash (i.e., "/")</li>
                                <li>Number after the slash is the behavior code</li>
                            </ul>
                        </Container>
                    </Col>
                </Row>
            </Container>
            <div style={{ backgroundColor: "lightgrey" }}>
                <Container className="py-5">
                    <Row>
                        <Col md={2} />
                        <Col md={10}>
                            <Container className="mx-5">
                                <h3 id="tutorials" className="my-4 text-center text-uppercase blue-subheader">Tutorials</h3>
                                <b style={{ textDecorationLine: "underline" }}>Formatting</b>
                                <ul>
                                    <li>Identifying what kind of ICD codes you have</li>
                                    <li>Formatting data in excel or a text editor</li>
                                </ul>
                                <b style={{ textDecorationLine: "underline" }}>Using the Tool</b>
                                <ul>
                                    <li>Step by step guide for using batch query</li>
                                </ul>
                            </Container>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    )
}