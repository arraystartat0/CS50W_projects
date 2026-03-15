import React from "react";

export default function CompanyDetails({
  companyName,
  publicKey,
  copied,
  onCopy,
  statsList = [],
  showStats = false,
}) {
  return (
    <div className="container-fluid pb-0 pb-md-4 pt-2">
      <div className="row align-items-end">
        <div className="col-lg-8 col-12 mb-4 ps-0 mb-lg-0">
          <span className="text-muted fw-light small-text">COMPANY</span>
          <h3 className="dashboard-title mb-1">{companyName}</h3>
          <span className="text-muted fw-light small-text">PUBLIC KEY</span>
          <div className="d-flex align-items-center">
            <h1 className="company-code mb-0 me-2">{publicKey}</h1>
            <button
              type="button"
              className="btn border border-1 border-black btn-sm unround hover-link"
              onClick={onCopy}
              aria-label="Copy public key"
            >
              {copied ? (
                <i className="fa-solid fa-check"></i>
              ) : (
                <i className="fa-solid fa-copy"></i>
              )}
            </button>
          </div>
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
