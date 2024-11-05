import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import SwaggerUI from 'swagger-ui-react';

const SwaggerScrollablePreEnhancer = () => {
    useEffect(() => {
      const addScrollingAccessibility = () => {
        // Select the <pre> element within Swagger UI's response section
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
  
      // Retry to find and enhance the <pre> element every 500ms if not immediately available
      const intervalId = setInterval(() => {
        addScrollingAccessibility();
      }, 500);
  
      // Stop interval after successfully enhancing the <pre> element
      if (document.querySelector('#operations-Search-post_api_search .response-col_description .highlight-code pre')) {
        clearInterval(intervalId);
      }
  
      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }, []);
  
    return null;
  };

export default SwaggerScrollablePreEnhancer;