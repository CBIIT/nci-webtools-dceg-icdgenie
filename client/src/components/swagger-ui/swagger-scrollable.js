import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import SwaggerUI from 'swagger-ui-react';

const SwaggerScrollablePreEnhancer = () => {
  useEffect(() => {
    const enhancePreElement = () => {
      // Select the scrollable <pre> element within Swagger UI's response section
      const preElement = document.querySelector(
        '#operations-Search-post_api_search .response-col_description .highlight-code pre'
      );

      if (preElement) {
        // Make the <pre> element focusable
        preElement.setAttribute('tabindex', '0');

        // Add keyboard scrolling functionality
        preElement.addEventListener('keydown', (event) => {
          const scrollAmount = 10; // Adjust for desired scroll sensitivity

          switch (event.key) {
            case 'ArrowUp':
              preElement.scrollTop -= scrollAmount;
              event.preventDefault();
              break;
            case 'ArrowDown':
              preElement.scrollTop += scrollAmount;
              event.preventDefault();
              break;
            case 'ArrowLeft':
              preElement.scrollLeft -= scrollAmount;
              event.preventDefault();
              break;
            case 'ArrowRight':
              preElement.scrollLeft += scrollAmount;
              event.preventDefault();
              break;
            default:
              break;
          }
        });
      }
    };

    // Initial call to enhance the <pre> element if it exists
    enhancePreElement();

    // Use MutationObserver to re-apply enhancement when content updates
    const observer = new MutationObserver(enhancePreElement);
    const targetNode = document.querySelector('#operations-Search-post_api_search');

    if (targetNode) {
      observer.observe(targetNode, { childList: true, subtree: true });
    }

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  return null;
};

export default SwaggerScrollablePreEnhancer;