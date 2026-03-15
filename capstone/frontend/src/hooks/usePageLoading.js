import { useState, useEffect } from 'react';

const usePageLoading = (dependencies = [], minLoadingTime = 500) => {
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const checkLoading = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      if (remainingTime > 0) {
        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      } else {
        setIsLoading(false);
      }
    };

    // Check if all dependencies are ready
    if (dependencies.every(dep => dep !== undefined && dep !== null)) {
      checkLoading();
    }
  }, [dependencies, startTime, minLoadingTime]);

  return isLoading;
};

export default usePageLoading; 