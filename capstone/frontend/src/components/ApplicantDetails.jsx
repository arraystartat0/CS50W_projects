import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ApplicantDetails({
  Username,
  selfView = false,
  statsList = [],
  showStats = false,
  userDetails = {},
}) {
  const location = useLocation();

  const renderGreeting = () => {
    if (location.pathname === "/applicant/me") {
      return <p className="mb-0">Full Name</p>;
    } else {
      return <p>Hello,</p>;
    }
  };

  return (
    <div className="container-fluid pb-0 pb-md-4 pt-2">
      <div className="row align-items-bottom">
        <div className="col-lg-8 col-12 mb-4 ps-0 mb-lg-0">
          <span className="text-muted fw-light small-text">{renderGreeting()}</span>
          <h3 className="dashboard-title mb-0">{Username}</h3>
          
          {selfView && userDetails && (
             <div className="mt-3">
               <div className="row">                
                 {userDetails.email && (
                   <div className="col-12 col-md-4 mb-2">
                     <small className="text-muted">Email</small>
                     <p className="mb-1">{userDetails.email}</p>
                   </div>
                 )}
                
                {userDetails.phone_number && (
                  <div className="col-12 col-md-3 mb-2">
                    <small className="text-muted">Phone</small>
                    <p className="mb-1">{userDetails.phone_number}</p>
                  </div>
                )}
                
                {(userDetails.city || userDetails.country) && (
                  <div className="col-12 col-md-3 mb-2">
                    <small className="text-muted">Location</small>
                    <p className="mb-1">
                      {[userDetails.city, userDetails.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
       
        {showStats && statsList.length > 0 && (
          <div className="col-lg-4 col-12 d-none d-md-block">
            <div className="d-flex justify-content-lg-end gap-5 stats">
              {statsList.map((s, i) => (
                <div className="stat-card d-flex" key={i}>
                  <div className="icon-label d-flex flex-column align-items-end align-self-end pe-2">
                    <div className="border border-black border-1 unround px-2 py-1 rounded-2 bg-opacity-25">
                      <i className={`fa-solid ${s.icon}`} />
                    </div>
                    <small className="stat-label text-muted">{s.label}</small>
                  </div>
                  <div className="stat-value-container d-flex align-items-center">
                    <span className="stat-value">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
