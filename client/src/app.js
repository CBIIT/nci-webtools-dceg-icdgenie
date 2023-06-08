import { Suspense, lazy } from "react";
import { RecoilRoot } from "recoil";
import { HashRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Loader from "./modules/common/loader";
import ErrorBoundary from "./modules/common/error-boundary";

import "./styles/main.scss";

// preload lazy-loaded page components
const Home = preloadLazyComponent(() => import("./modules/home/home"));
const Search = preloadLazyComponent(() => import("./modules/search/search"));
const ApiAccess = preloadLazyComponent(() => import("./modules/api-access/api-access"));
const About = preloadLazyComponent(() => import("./modules/about/about"));
const Resources = preloadLazyComponent(() => import("./modules/about/resources"));
const FAQ = preloadLazyComponent(() => import("./modules/about/faq"));
const Started = preloadLazyComponent(() => import("./modules/about/getting-started"));
const BatchQuery = preloadLazyComponent(() => import("./modules/batch-query/batch-query"));

function preloadLazyComponent(factory) {
  const loader = factory();
  return lazy(() => loader);
}

export default function App() {
  const links = [
    {
      route: "/",
      title: "Home",
      component: Home,
    },
    {
      route: "/getting-started",
      title: "Getting Started",
      component: Started,
    },
    {
      route: "/search",
      title: "Search",
      component: Search,
    },
    {
      route: "/batch-query",
      title: "Batch Query",
      component: BatchQuery,
    },
    {
      route: "/api-access",
      title: "API Access",
      component: ApiAccess,
    },
    {
      route: "/about",
      title: "About",
      component: About,
    },
  ];

  return (
    <RecoilRoot>
      <Router basename={process.env.PUBLIC_URL}>
        <div className="d-flex flex-column flex-grow-1">
          <Navbar expand="lg" variant="dark" className="py-0 flex-none-auto shadow" style={{backgroundColor: "#F8F9A"}}>
            <Container>
              <Navbar.Toggle aria-controls="app-navbar" />
              <Navbar.Collapse id="app-navbar">
                <Nav className="d-flex w-100 justify-content-center">
                  {links.map((link, index) => (
                    <NavLink key={`navlink-${index}`} to={link.route} className="nav-link mx-3" style={{whiteSpace: "nowrap"}}>
                      {link.title}
                    </NavLink>
                  ))}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <div id="main-content" className="d-flex flex-column flex-grow-1">
            <ErrorBoundary fallback="">
              <Suspense fallback={<Loader>Loading Page</Loader>}>
                <Routes>
                  {links.map((link, index) => (
                    <Route exact key={`route-${index}`} path={link.route} element={<link.component />} />
                  ))}
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </Router>
      {/* <pre>{JSON.stringify(process.env, null, 2)}</pre> */}
    </RecoilRoot>
  );
}
