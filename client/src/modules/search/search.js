import { Suspense, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";

import { useNavigate, useSearchParams, useLocation, NavLink } from "react-router-dom";
import { Container, Row, Col, Modal, InputGroup, Form, Button } from "react-bootstrap";

import Loader from "../common/loader";
import SearchResults from "./search.results";
import { modalState } from "./search.state";
import ErrorBoundary from "../common/error-boundary";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [modal, setModal] = useRecoilState(modalState);
  const query = searchParams.get("query");
  const [maps, setMaps] = useState({
    tabular: new Map(),
    neoplasm: new Map(),
    drug: new Map(),
    injury: new Map(),
    icdo3: []
  })
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [valid, setValid] = useState(true)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {

    if (location.state) {
      setInput(location.state.query)
      if(location.state.query.length >= 3)
        handleSubmit(location.state.query)
      else
        setValid(false)
    }

    window.history.replaceState(null, '')
  },
    [location]);

  function hideModal() {
    setModal((state) => ({ ...state, show: false }));
  }

  function processSearch(results) {

    const map = new Map();
    results.map((node) => {

      const source = node._source;
      const key = source.id;
      var parents = [];
      var currentKey = key;

      source.parent.reverse().map((parent) => {
        const parentKey = parent.id;

        if (!map.has(parentKey)) {

          var value;

          value = {
            description: parent.description,
            parents: parent.parents,
            children: [currentKey],
            key: parentKey,  
          }
         
          if (node._index === "drug" || node._index === "neoplasm") {
            for (var code in parent.code)
              value[code] = parent.code[code]
          }
          else
            value["code"] = parent.code

          map.set(parentKey, value)
        }
        else {

          var parentValue = map.get(parentKey)
          if (!parentValue.children.includes(currentKey)) {
            parentValue = { ...parentValue, children: parentValue.children.concat(currentKey) }
            map.set(parentKey, parentValue)
          }
        }

        currentKey = parentKey
        parents = parents.concat(parentKey)
      })

      const value = {
        description: source.description,
        key: key,
        parents: parents,
        children: [],
      }

      if (node._index === "drug" || node._index === "neoplasm") {
        for (var code in source.code)
          value[code] = source.code[code]
      }
      else
        value["code"] = source.code

      map.set(key, value)
    })
    return map
  }

  async function handleSubmit(query) {

    setLoading(true)
    setValid(true)
    setInput(query)
    const response = await axios.post("api/opensearch", { search: query })
    console.log(response)
    const results = {
      tabular: processSearch(response.data.tabular.filter((e) => e._source.type === "entry")),
      neoplasm: processSearch(response.data.neoplasm),
      drug: processSearch(response.data.drug),
      injury: processSearch(response.data.injury),
      icdo3: response.data.icdo3
    }
    console.log(results)
    setSuggestions(response.data.fuzzyTerms)
    setLoading(false)
    setMaps(results)
  }

  async function opensearch(e) {
    e.preventDefault();
    if(input.length >= 3)
      handleSubmit(input);
    else
      setValid(false)
  }

  return (
    <>
      <Loader show={loading} fullscreen />
      <Modal show={modal.show} size="xl" onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modal.body}</Modal.Body>
      </Modal>
      <div className="h-100 bg-white">

        <Container className="flex-grow-1 py-5">
          <Row className="h-100 justify-content-center align-items-center">
            <Col md={8}>
              <form onSubmit={opensearch}>
                <InputGroup size={"lg"} className="search-box" style={{borderColor: valid ? "" : "red"}}>
                  <Form.Control
                    className="border-0 shadow-none"
                    placeholder={"Search ICD Genie"}
                    aria-label={"Search ICD Genie"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onBlur={() => setValid(input.length >= 3)}
                  />
                  <Button type="submit" variant="white" className="border-0 shadow-none">
                    <span className="visually-hidden">Submit</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-muted" />
                  </Button>
                </InputGroup>
                {!valid && <div style={{color: "red"}}>
                  Your search text must be at least 3 characters long
                </div>}
              </form>
              {suggestions.length ? <span style={{fontSize: '18px'}}>
                Did you mean: {(suggestions.map((e, index) =>
                   <>
                    {index ? ', ': ''}
                    <a href="javascript:void(0)" onClick={() => handleSubmit(e)}>{e}</a>
                   </>
                ))}
              </span> : <></>}
              <div className="mt-3 text-uppercase text-muted text-center">
                Search by Keywords, ICD-10 code, or ICD-O-3 code
              </div>
            </Col>
          </Row>
        </Container>

        <ErrorBoundary fallback="">
          <Suspense fallback={<Loader show fullscreen />}>
            <SearchResults query={query} maps={maps} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>

  );
}
