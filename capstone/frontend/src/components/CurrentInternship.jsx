import React, { useState, useEffect } from "react";

export default function CurrentInternship({
  company,
  position,
  location,
  startDate,
  endDate,
  supervisor,
  notes = [],              // array of strings from supervisor
  applicationUUID,
}) {
  const [uuidCopied, setUuidCopied] = useState(false);

const copyUUID = async () => {
    const sanitized = applicationUUID.replace(/-/g, "");

    // First try the modern API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(sanitized);
        setUuidCopied(true);
        setTimeout(() => setUuidCopied(false), 2000);
        return;
      } catch (_) {
        // if it fails, fall back
      }
    }

    // Fallback for older/mobile browsers
    const textarea = document.createElement("textarea");
    textarea.value = sanitized;
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setUuidCopied(true);
      setTimeout(() => setUuidCopied(false), 2000);
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }
    document.body.removeChild(textarea);
  };

  // Example: you could push messages into this array at runtime:
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    // e.g. check if endDate is near and push a notification
    // if (isNear(endDate)) setNotifications(n => [...n, "Your internship ends soon"]);
  }, [endDate]);

  return (
    <div className="card mb-3 border-0">
      <div className="card-body p-0">
        {/* Header */}
        <h6 className="card-title text-muted fw-light mb-2">Current Internship</h6>

        {/* Hidden notifications container */}
        <div
          id="ci-notifications"
          className="d-none"
          aria-live="polite"
          role="alert"
        >
          {notifications.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>

        {/* Company, Position, Location */}
        <div className="row gx-2 gy-2 mb-2">
          <div className="col-md-4">
            <small className="text-muted">
              <i className="fa-solid fa-building me-1"></i>Company
            </small>
            <p className="mb-1">{company}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">
              <i className="fa-solid fa-briefcase me-1"></i>Position
            </small>
            <p className="mb-1">{position}</p>
          </div>
          <div className="col-md-4">
            <small className="text-muted">
              <i className="fa-solid fa-map-marker-alt me-1"></i>Location
            </small>
            <p className="mb-1">{location}</p>
          </div>
        </div>

        {/* Dates & Supervisor */}
        <div className="row gx-2 gy-2 mb-2">
          <div className="col-sm-4">
            <small className="text-muted">
              <i className="fa-solid fa-calendar-plus me-1"></i>Start Date
            </small>
            <p className="mb-1">{startDate}</p>
          </div>
          <div className="col-sm-4">
            <small className="text-muted">
              <i className="fa-solid fa-calendar-minus me-1"></i>End Date
            </small>
            <p className="mb-1">{endDate}</p>
          </div>
          <div className="col-sm-4">
            <small className="text-muted">
              <i className="fa-solid fa-user-tie me-1"></i>Supervisor
            </small>
            <p className="mb-1">{supervisor}</p>
          </div>
        </div>

        {/* Notes Section (Read-only) */}
        <div className="mb-2">
          <small className="text-muted">
            <i className="fa-solid fa-note-sticky me-1"></i>Supervisor Notes
          </small>
          {notes.length > 0 ? (
            <ul className="list-group list-group-flush mt-1">
              {notes.map((note, i) => (
                <li key={i} className="list-group-item py-1 ps-0">
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="fst-italic text-secondary mb-1">
              No notes available.
            </p>
          )}
        </div>

        {/* Application UUID */}
        <div className="d-flex align-items-center">
          <small className="text-muted me-2">
            <i className="fa-solid fa-key me-1"></i>Application UUID
          </small>
          <p className="mb-0 me-2">{applicationUUID}</p>
          <button
            type="button"
            className="btn border border-1 border-black btn-sm unround hover-link"
            onClick={copyUUID}
            aria-label="Copy Application UUID"
          >
            {uuidCopied ? (
              <i className="fa-solid fa-check"></i>
            ) : (
              <i className="fa-solid fa-copy"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
