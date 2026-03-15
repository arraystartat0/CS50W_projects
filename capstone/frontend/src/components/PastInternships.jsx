// components/PastInternships.jsx
import React from "react";

export default function PastInternships({ internships = [] }) {
  const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // ensure the date is valid before formatting
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
  return (
    <>
      <h6 className="text-muted fw-light mb-2">Past Internships</h6>

      <div className="table-responsive">
        <table className="table table-sm table-borderless align-middle">
          <thead>
            <tr className="text-muted small-text">
              <th scope="col">
                <i className="fa-solid fa-briefcase me-1"></i>Internship
              </th>
              <th scope="col">
                <i className="fa-solid fa-calendar-days me-1"></i>Dates
              </th>
            </tr>
          </thead>
          <tbody>
            {internships.length > 0 ? (
              internships.map((intn, idx) => (
                <tr key={idx}>
                  {/* Company & Position */}
                  <td>
                    <div className="d-flex flex-column">
                      <a href={`/company/${intn.company_public_key}`} className="fw-bold text-black">
                      {intn.company}
                      </a>
                      <a href={`/listing/${intn.listing_UID}`} className="text-muted">
                      {intn.position}</a>
                    </div>
                  </td>

                  {/* Dates */}
                  <td>
                    <small className="text-muted">
                      {formatDate(intn.startDate)} – {formatDate(intn.endDate)}
                    </small>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted py-3">
                  No past internships to show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
