import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import SwaggerUI from 'swagger-ui-react';

const SwaggerColorCustomizer = () => {
  useEffect(() => {
    const changeIntegerColor = () => {
      // Select all <span> elements within the JSON response body that have a specific color style for numbers
      const integerSpans = document.querySelectorAll(
        '#operations-Search-post_api_search .response-col_description span[style*="color: rgb(211, 99, 99);"]'
      );

      integerSpans.forEach((span) => {
        // Update the inline style to a new color
        span.style.color = '#8ee827'; // Replace with your desired color
      });
    };

    // Initial call to change integer colors
    changeIntegerColor();

    // Use MutationObserver to apply styling when content updates
    const observer = new MutationObserver(changeIntegerColor);
    const targetNode = document.querySelector('#operations-Search-post_api_search');

    if (targetNode) {
      observer.observe(targetNode, { childList: true, subtree: true });
    }

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  return null;
};

export default SwaggerColorCustomizer;