import React from 'react';

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="color-changing-spinner" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner; 