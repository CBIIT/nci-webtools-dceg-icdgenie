import React, { useEffect } from 'react';

const SwaggerButtonLabelInjector = () => {
  useEffect(() => {
    // Function to add aria-labels to buttons if missing
    const addAriaLabels = () => {
      // Select buttons with specific classes
      const copyButtons = document.querySelectorAll('.copy-to-clipboard button');
      const downloadButtons = document.querySelectorAll('.download-contents');

      let labelsAdded = 0;

      // Add aria-label to copy-to-clipboard buttons
      copyButtons.forEach((button) => {
        if (!button.getAttribute('aria-label')) {
          button.setAttribute('aria-label', 'Copy to Clipboard');
          labelsAdded++;
        }
      });

      // Add aria-label to download-content buttons
      downloadButtons.forEach((button) => {
        if (!button.getAttribute('aria-label')) {
          button.setAttribute('aria-label', 'Download Contents');
          labelsAdded++;
        }
      });

      // If all labels are added, clear the interval
      if (labelsAdded > 0) {
        console.log('Aria-labels added to Swagger UI buttons');
      }
    };

    // Use setInterval to attempt adding labels every second
    const intervalId = setInterval(() => {
      addAriaLabels();
    }, 1000);

    // Clear interval when component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  return null; // No UI needed for this component
};

export default SwaggerButtonLabelInjector;
