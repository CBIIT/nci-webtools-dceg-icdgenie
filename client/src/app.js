import { RecoilRoot } from "recoil";
import { HashRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Home from "./modules/home/home";
import Search from "./modules/search/search";
import ApiAccess from "./modules/api-access/api-access";
import About from "./modules/about/about";
import "./styles/main.scss";

export default function App() {
  const links = [
    {
      route: "/",
      title: "Home",
      component: Home,
    },
    {
      route: "/search",
      title: "Search",
      component: Search,
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
      <Router>
        <Navbar expand="sm" className="navbar-light shadow-sm py-0 flex-none-auto">
          <Container>
            <Navbar.Toggle aria-controls="app-navbar" />
            <Navbar.Collapse id="app-navbar">
              <Nav>
                {links.map((link, index) => (
                  <NavLink key={`navlink-${index}`} to={link.route} className="nav-link">
                    {link.title}
                  </NavLink>
                ))}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <div id="main-content" className="flex-grow-1">
          <Routes>
            {links.map((link, index) => (
              <Route exact key={`route-${index}`} path={link.route} element={<link.component />} />
            ))}
          </Routes>
        </div>
      </Router>
    </RecoilRoot>
  );
}
