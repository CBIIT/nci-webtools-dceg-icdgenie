import React, { useEffect } from 'react';


const SwaggerColorCustomizer = () => {
  useEffect(() => {
    const changeIntegerColor = () => {
      // Select all <span> elements within the JSON response body that have a specific color style for numbers
      const integerSpans = document.querySelectorAll(
        '#operations-Search-post_api_search .response-col_description span[style*="color: rgb(211, 99, 99);"]'
      );

      let colorChanged = false;

      integerSpans.forEach((span) => {
        // Update the inline style to a new color
        span.style.color = '#8ee827'; // Replace with your desired color
        colorChanged = true;
      });

      // Stop the interval if colors have been changed
      if (colorChanged) {
        console.log("Color change applied to integer values.");
        clearInterval(intervalId);
      }
    };

    // Set up an interval to retry color application every 500ms
    const intervalId = setInterval(() => {
      changeIntegerColor();
    }, 500);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return null;
};

export default SwaggerColorCustomizer;