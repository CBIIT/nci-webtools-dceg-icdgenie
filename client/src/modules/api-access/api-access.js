import Container from "react-bootstrap/Container";
import SwaggerUI from "swagger-ui-react";
import SwaggerLabelInjector from "../../components/swagger-ui/swagger-injecttion";
import SwaggerColorCustomizer from "../../components/swagger-ui/swagger-color-customizer";
import SwaggerScrollablePreEnhancer from "../../components/swagger-ui/swagger-scrollable";

export default function ApiAccess() {
  return (
    <div className="h-100 bg-white">
      <Container className="py-3">
        <h1 className="display-6 page-header text-muted text-center text-uppercase ">API Access</h1>
      </Container>

      <hr />

      <Container className="py-5">
        <p>
          The ICD Genie API provides programmatic access to endpoints which allow users to search and translate ICD-10
          and ICD-O-3 codes. The following resources are available:
        </p>
        <SwaggerUI url={process.env.PUBLIC_URL + "/api"} />
        {/* Add SwaggerLabelInjector to observe and inject the label */}
        <SwaggerLabelInjector />
        {/* Custom integer color styling */}
        <SwaggerColorCustomizer />
        <SwaggerScrollablePreEnhancer />
      </Container>
    </div>
  );
}
