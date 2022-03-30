import Container from "react-bootstrap/Container";
import SwaggerUI from "swagger-ui-react";

export default function ApiAccess() {
  return (
    <div className="h-100" style={{backgroundColor: 'white'}}>
      <Container className="py-4 shadow-sm h-100">
        <h2 className="text-primary">API Access</h2>
        <hr />

        <p>
          The ICDGenie API provides programmatic access to endpoints which allow users to search and translate ICD-10
          and ICD-O-3 codes. The following resources are available:
        </p>
        <SwaggerUI url={process.env.PUBLIC_URL + "/api"} />
      </Container>
    </div>
  );
}
