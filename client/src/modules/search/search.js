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

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useRecoilState(searchState);
  const [modal, setModal] = useRecoilState(modalState);
  const query = searchParams.get("query");
  const [maps,setMaps] = useState({})

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
      const key = source.path.join();
      var parents = [];
  
      source.parent.map((parent) => {
        const parentKey = parent.path.join()
        if (!map.has(parentKey)) {
  
          var value;
  
          value = {
            path: parent.source ? parent.source.join(' ') : parent.source,
            description: parent.description,
            children: [key],
            parents: parent.parents.map((e) => {
              return e.path.join();
            })
          }
  
          if(node._index === "drug" || node._index === "neoplasm"){
            for(var code in parent.code)
              value[code] = parent.code[code] 
          }
          else
            value["code"] = parent.code
  
          map.set(parentKey, value)
        }
        else {
          var parent = map.get(parentKey)
          parent = { ...parent, children: parent.children.concat(key) }
          map.set(parentKey, parent)
        }
  
        parents = parents.concat(parentKey)
      })
  
      const value = {
        path: source.path.join(' '),
        description: source.description,
        parents: parents,
        children: [],
      }
  
      if(node._index === "drug" || node._index === "neoplasm"){
        for(var code in source.code)
          value[code] = source.code[code] 
      }
      else
        value["code"] = source.code
  
      map.set(key, value)
    })
    console.log(map)
    return map
  }

  async function typeaheadSearch(e) {
    var query = {
      query: {
        match: {
          title: {
            query: e.target.value
          }
        }
      }
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.post("api/opensearch",{ search: e.target.value })
    
    const results = {
      drug: processSearch(response.data.drug)
    }

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
              {<SearchForm
                className="search-box mb-3"
                search={search}
                setSearch={setSearch}
                handleSubmit={handleSubmit}
                
                placeholder="Search ICD Genie"
              />}
              <Form.Control
                className="search-box mb-3"
                onBlur={typeaheadSearch}
              />
              <div className="text-uppercase text-muted text-center">
                Search by Keywords, ICD-10 code, or ICD-O-3 code
              </div>
            </Col>
          </Row>
        </Container>

        <ErrorBoundary fallback="">
          <Suspense fallback={<Loader show fullscreen />}>
            <SearchResults query={query} maps={maps}/>
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}
