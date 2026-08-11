import React from "react";

// Swagger UI syntax-highlights every response body with react-syntax-highlighter (highlight.js).
// On very large / deeply-nested responses — e.g. broad `/api/search` keyword queries like "neck"
// that return many MB — the highlighter recurses past the call-stack limit and the whole response
// panel crashes with "RangeError: Maximum call stack size exceeded" ("Could not render $e").
// See NCIATWP-10154.
//
// swagger-ui-react@4.19 does not forward the `syntaxHighlight` config option, so we disable
// highlighting only where it would crash: this plugin wraps the `highlightCode` component and
// renders oversized bodies as plain <pre> text. Normal-sized responses are untouched and keep
// their syntax highlighting and copy/download controls.

// Response bodies longer than this (in characters) skip highlighting to avoid the stack overflow.
// Comfortably above typical single-code lookups; well below the multi-MB keyword responses.
const MAX_HIGHLIGHT_LENGTH = 100000;

const SwaggerLargeResponseHighlightFix = () => ({
  wrapComponents: {
    highlightCode: (Original) => (props) => {
      const value = props && typeof props.value === "string" ? props.value : "";

      if (value.length > MAX_HIGHLIGHT_LENGTH) {
        const className = `${props.className || ""} microlight`.trim();
        return (
          <div className="highlight-code">
            <pre className={className}>{value}</pre>
          </div>
        );
      }

      return <Original {...props} />;
    },
  },
});

export default SwaggerLargeResponseHighlightFix;
