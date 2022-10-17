import { Suspense, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import { Form } from 'react-bootstrap'
import Loader from "../common/loader";
import SearchForm from "../common/search-form";
import SearchResults from "./search.results";
import { modalState, searchState } from "./search.state";
import ErrorBoundary from "../common/error-boundary";
import axios from "axios";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useRecoilState(searchState);
  const [modal, setModal] = useRecoilState(modalState);
  const query = searchParams.get("query");
  const [maps, setMaps] = useState({})
  const [input, setInput] = useState("")

  useEffect(() => setSearch(query || ""), [query, setSearch]);

  async function handleSubmit(event) {
    event.preventDefault();
    const params = createSearchParams({ query: search });
    navigate(`/search?${params}`);
  }

  function hideModal() {
    setModal((state) => ({ ...state, show: false }));
  }

  function processSearch(results) {

    const map = new Map();

    results.map((node) => {

      const source = node._source;
      const key = source.id;
      var parents = [];
      console.log(source)
      var currentKey = key;

      source.parent.reverse().map((parent) => {
        const parentKey = parent.id;
        if (!map.has(parentKey)) {

          var value;

          value = {
            path: parent.source ? parent.source.join(' ') : parent.source,
            description: parent.description,
            children: [currentKey],
            key: parentKey,
            parents: parent.parents.map((e) => {
              return e.path.join();
            })
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
          var parent = map.get(parentKey)
          if (!parent.children.includes(currentKey)) {
            parent = { ...parent, children: parent.children.concat(currentKey) }
            map.set(parentKey, parent)
          }
        }

        currentKey = parentKey
        parents = parents.concat(parentKey)
      })

      const value = {
        path: source.path.join(' '),
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
    console.log(Array.from(map.values()).filter((node) => node.parents.length === 0))
    return map
  }

  async function opensearch(e) {
    e.preventDefault();
    console.log(input)
    const response = await axios.post("api/opensearch", { search: input })

    const results = {
      tabular: processSearch(response.data.tabular),
      neoplasm: processSearch(response.data.neoplasm),
      drug: processSearch(response.data.drug),
      injury: processSearch(response.data.injury)
    }
    console.log(results)
    setMaps(results)
  }
  console.log(maps)
  return (
    <>
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
                <InputGroup size={"lg"} className="search-box mb-3">
                  <FormControl
                    className="border-0 shadow-none"
                    placeholder={"Search ICD Genie"}
                    aria-label={"Search ICD Genie"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button type="submit" variant="white" className="border-0 shadow-none">
                    <span className="visually-hidden">Submit</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-muted" />
                  </Button>
                </InputGroup>
              </form>
              <div className="text-uppercase text-muted text-center">
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
