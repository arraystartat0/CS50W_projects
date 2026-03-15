import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const withLoading = (WrappedComponent, loadingMessage = "Loading...") => {
  return function WithLoadingComponent(props) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // set a minimum loading time to prevent flashing - improved ux
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
      return <LoadingSpinner message={loadingMessage} />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withLoading; 