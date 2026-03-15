// components/RecentApplications.jsx
import React from "react";

const statusClassMap = {
  Active: "bg-active",
  "Decision pending": "bg-decision-pending",
  Unopened: "bg-unopened",
  "Interview Scheduled": "bg-interview-scheduled",
  "Final decision pending": "bg-final-decision-pending",
  Denied: "bg-rejected",
};

export default function RecentApplications({ applications = [] }) {
  return (
    <>
      <h6 className="text-muted fw-light mb-2">Recent Applications</h6>
      <div className="table-responsive">
        <table className="table table-sm table-borderless align-middle">
          <thead>
            <tr className="text-muted small-text">
              <th scope="col">Internship</th>
              <th scope="col">Date Applied</th>
              <th scope="col">Last Updated</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app, idx) => (
                <tr key={idx}>
                  {/* Company & Position */}
                  <td>
                    <div className="d-flex flex-column">
                      <a href={`/company/${app.company_public_key}`} className="fw-bold text-black">
                        {app.company}
                      </a>
                      <small className="text-muted">
                        <a href={`/listing/${app.listing_UID}`} className="text-muted">
                          {app.position}
                        </a>
                      </small>
                    </div>
                  </td>

                  {/* Date Applied */}
                  <td>
                    <small className="text-muted">{app.dateApplied}</small>
                  </td>

                  {/* Last Updated */}
                  <td>
                    <small className="text-muted">{app.lastUpdated}</small>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`badge unround ${
                        statusClassMap[app.status] || "bg-light-gray"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted py-3">
                  No recent applications to show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}