import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function SearchForm({
  search,
  setSearch,
  handleSubmit,
  placeholder = "Search",
  className = "",
  size = "lg",
}) {
  return (
    <form onSubmit={handleSubmit}>
      <InputGroup size={size} className={className}>
        <FormControl
          className="border-0 shadow-none"
          placeholder={placeholder}
          aria-label={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="white" className="border-0 shadow-none">
          <span className="visually-hidden">Submit</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-muted" />
        </Button>
      </InputGroup>
    </form>
  );
}
