import { useNavigate } from "react-router-dom";
import { formState } from "../search/search.state";
import { useState } from "react";
import Container from "react-bootstrap/Container";
import { useRecoilState } from "recoil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";


export default function Home() {

  const [form, setForm] = useRecoilState(formState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  async function handleKeyDown(event) {
    if (event.key === "Enter") {
      await mergeForm({ search: search })
      navigate('/search?query=' + form.search)
    }
  };

  async function handleClick(event){
    await mergeForm({ search: search })
    navigate('/search?query=' + form.search)
  }

  return (
    <>
      <div className="d-flex flex-column cover-image h-100 shadow-sm" >
        <Container className="d-flex h-75 flex-column justify-content-center align-items-center py-5">
          <div style={{ fontSize: '45px', color: 'white', fontWeight: '300', letterSpacing: '7px' }}>ICDGENIE</div>


          <div className="w-50 mt-5 align-items-center input-group search-box">
            <input
              name="search"
              type="text"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Search ICDGenie"}
              style={{ border: 0, boxShadow: 'none', fontSize: '20px' }}
            />
            <div className="input-group-append">
              <FontAwesomeIcon
                className="mt-3 mr-3"
                icon={faArrowRight}
                style={{ fontSize: "20px", cursor: 'pointer', color: '#97B4CB' }}
                onClick={handleClick}
              />
            </div>
          </div>

        </Container>
        <div className="d-flex flex-grow-1 justify-content-center mt-4" style={{ backgroundColor: 'white', background: 'linear-gradient(270deg, #F1A193 0%, #A9E0FB 100%)' }}>
          <p className="col-xl-7 col-lg-11 align-self-center mx-1 pt-3" style={{ fontSize: '18px', lineHeight: '36px' }}>
            Accurate histological classification is important for facilitating studies of cancer epidemiology and
            etiologic heterogeneity. ICDgenie is a web-based tool that can assist epidemiologists, pathologists,
            research assistants, and data scientists to more easily access, translate and validate codes and text
            descriptions from the International Classification of Diseases (10th Edition) and International
            Classification of Diseases for Oncology, 3rd Edition (ICD-O-3). By improving accessibility and making
            existing cancer classification and coding schemes to be more readily understandable and searchable,
            ICDgenie will help accelerate descriptive and molecular epidemiological studies of cancer.
          </p>
        </div>
      </div>
    </>
  );
}
