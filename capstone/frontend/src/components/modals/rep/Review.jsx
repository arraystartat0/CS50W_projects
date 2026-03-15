import React, { useState, useEffect } from "react";
import "../../../assets/css/rep/ReviewModal.css";
import { api } from "../../../services/auth";
import { useAuth } from "../../../contexts/AuthContext";

const ReviewModal = ({ isOpen, onClose, application, onStatusChange }) => {
  const [showListingDetails, setShowListingDetails] = useState(false);
  const [showApplicantDetails, setShowApplicantDetails] = useState(true);
  const [feedback, setFeedback] = useState(application?.feedback || "");
  const [currentStatus, setCurrentStatus] = useState(application?.status || "");
  const [isSaving, setIsSaving] = useState(false);

  // "Active" status internship fields
  const [supervisorId, setSupervisorId] = useState("");
  const [activeStartDate, setActiveStartDate] = useState("");
  const [activeEndDate, setActiveEndDate] = useState("");
  const [supervisors, setSupervisors] = useState([]); // State to store fetched supervisors

  // "Interview-scheduled" status scheduling fields
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [locationType, setLocationType] = useState("physical");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Completed fields
  const [completionRemarks, setCompletionRemarks] = useState("");
  const [completionLetterLink, setCompletionLetterLink] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  const [initialValues, setInitialValues] = useState(null);

  const { userType } = useAuth();
  const isApplicant = userType === "applicant";

  if (!isOpen || !application) return null;

  const statusClassMap = {
    Completed: "bg-active",
    Active: "bg-active",
    Unopened: "bg-unopened",
    "Interview Scheduled": "bg-interview-scheduled",
    Denied: "bg-rejected",
    "Decision Pending": "bg-unopened",
    "Under Review": "bg-under-review",
  };

  const statusOptions = [
    "Under Review",
    "Interview Scheduled",
    "Decision Pending",
    "Active",
    "Completed",
    "Denied",
  ];

  // helper function to format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // synchronize local state when a new application is loaded or modal opens
  useEffect(() => {
    if (application) {
      setFeedback(application.feedback || "");
      setCurrentStatus(application.status || "");

      // initialize active internship fields
      setActiveStartDate(
        formatDateForInput(application.active_start_date) || ""
      );
      setActiveEndDate(formatDateForInput(application.active_end_date) || "");
      setSupervisorId(application.supervisor?.id || "");

      // initialize interview fields
      setInterviewDate(
        formatDateForInput(application.interview?.interview_date) || ""
      );
      setInterviewTime(application.interview?.interview_time || "");
      setLocationType(application.interview?.location_type || "physical");
      setPhysicalAddress(application.interview?.physical_address || "");
      setMeetingLink(application.interview?.meeting_link || "");
      setAdditionalNotes(application.interview?.additional_notes || "");
      setErrors({});

      setCompletionRemarks(application.completion_remarks || "");
      setCompletionLetterLink(application.completion_letter_link || "");

      setInitialValues({
        status: application.status,
        feedback: application.feedback || "",
        // interview fields
        interviewDate,
        interviewTime,
        locationType,
        physicalAddress,
        meetingLink,
        additionalNotes,
        // active internship fields
        supervisorId: application.supervisor?.id || "",
        activeStartDate:
          formatDateForInput(application.active_start_date) || "",
        activeEndDate: formatDateForInput(application.active_end_date) || "",
      });
    }
  }, [application]);

  useEffect(() => {
    if (currentStatus === "Active") {
      setSupervisorId(application.supervisor?.id || "");
      setActiveStartDate(
        formatDateForInput(application.active_start_date) || ""
      );
      setActiveEndDate(formatDateForInput(application.active_end_date) || "");

      (async () => {
        try {
          const companyPublicKey = application.posting?.company?.public_key;
          if (!companyPublicKey) {
            console.warn(
              "Company public key not available for fetching supervisors."
            );
            setSupervisors([]);
            return;
          }
          const { data } = await api.get(
            `/api/companies/${companyPublicKey}/representatives/`
          );
          setSupervisors(data);
        } catch (err) {
          console.error("Error fetching supervisors:", err);
          setSupervisors([]);
        }
      })();
    } else {
      setSupervisorId("");
      setActiveStartDate("");
      setActiveEndDate("");
    }

    // clear interview fields if status is not 'Interview Scheduled'
    if (currentStatus !== "Interview Scheduled") {
      resetInterviewFields();
    }
    // clear status-specific errors when status changes
    setErrors((prev) => {
      const cleanedErrors = { ...prev };
      // remove interview-related errors
      [
        "interviewDate",
        "interviewTime",
        "physicalAddress",
        "meetingLink",
      ].forEach((key) => delete cleanedErrors[key]);
      // remove "active" internship status related errors
      ["supervisor", "activeStartDate", "activeEndDate"].forEach(
        (key) => delete cleanedErrors[key]
      );
      return cleanedErrors;
    });
  }, [currentStatus, application.posting?.company?.public_key]);

  const resetInterviewFields = () => {
    setInterviewDate("");
    setInterviewTime("");
    setLocationType("physical");
    setPhysicalAddress("");
    setMeetingLink("");
    setAdditionalNotes("");
  };

  const handleLocalStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
  };

  // date validation boundaries
  const getToday = () => new Date().toISOString().split("T")[0];
  const getMaxDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  };

  // centralized validation logic
  const validateField = (name, value, allValues = {}) => {
    let message = "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (name) {
      case "interviewDate": {
        if (!value) message = "Interview date is required.";
        else {
          const dateObj = new Date(value);
          dateObj.setHours(0, 0, 0, 0);
          if (dateObj < today) message = "Date cannot be in the past.";
          else if (value > getMaxDate())
            message = "Date cannot be more than one year from today.";
        }
        break;
      }
      case "interviewTime":
        if (!value) message = "Interview time is required.";
        break;
      case "physicalAddress":
        if (allValues.locationType === "physical" && !value.trim())
          message = "Physical address is required.";
        break;
      case "meetingLink":
        if (allValues.locationType === "online" && !value.trim())
          message = "Meeting link is required.";
        break;
      case "supervisorId":
        if (!value) message = "Supervisor is required.";
        break;
      case "activeStartDate": {
        if (!value) message = "Start date is required.";
        else {
          const dateObj = new Date(value);
          dateObj.setHours(0, 0, 0, 0);
          if (dateObj < today) message = "Start date cannot be in the past.";
        }
        break;
      }
      case "activeEndDate": {
        if (!value) message = "End date is required.";
        else if (
          allValues.activeStartDate &&
          new Date(value) < new Date(allValues.activeStartDate)
        ) {
          message = "End date cannot be before start date.";
        }
        break;
      }
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const isFormValid = () => {
    let valid = true;
    const currentValues = {
      interviewDate,
      interviewTime,
      locationType,
      physicalAddress,
      meetingLink,
      supervisorId,
      activeStartDate,
      activeEndDate,
    };

    if (currentStatus === "Interview Scheduled") {
      valid =
        validateField("interviewDate", interviewDate, currentValues) && valid;
      valid =
        validateField("interviewTime", interviewTime, currentValues) && valid;
      valid =
        validateField(
          locationType === "physical" ? "physicalAddress" : "meetingLink",
          locationType === "physical" ? physicalAddress : meetingLink,
          currentValues
        ) && valid;
    } else if (currentStatus === "Active") {
      valid =
        validateField("supervisorId", supervisorId, currentValues) && valid;
      valid =
        validateField("activeStartDate", activeStartDate, currentValues) &&
        valid;
      valid =
        validateField("activeEndDate", activeEndDate, currentValues) && valid;
    }
    return valid;
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      isFormValid(); // call again to ensure all relevant error messages are set
      return;
    }

    setIsSaving(true);
    try {
      let updateData = { status: currentStatus, feedback };

      if (currentStatus === "Interview Scheduled") {
        updateData.interviewDetails = {
          interview_date: interviewDate,
          interview_time: interviewTime,
          location_type: locationType,
          physical_address: locationType === "physical" ? physicalAddress : "",
          meeting_link: locationType === "online" ? meetingLink : "",
          additional_notes: additionalNotes,
        };
      } else {
        updateData.interviewDetails = null;
      }

      if (currentStatus === "Active") {
        updateData.supervisor_id = supervisorId || null;
        updateData.active_start_date = activeStartDate || null;
        updateData.active_end_date = activeEndDate || null;
      } else {
        updateData.supervisor_id = null;
        updateData.active_start_date = null;
        updateData.active_end_date = null;
      }

      if (currentStatus === "Completed") {
        updateData.completion_remarks = completionRemarks || "";
        updateData.completion_letter_link = completionLetterLink || "";
      } else {
        updateData.completion_remarks = "";
        updateData.completion_letter_link = "";
      }

      await onStatusChange(application.UID, updateData);
      onClose();
    } catch (error) {
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        const newErrors = {};
        // map backend errors to frontend error state
        if (serverErrors.interviewDetails) {
          //handle nested interviewDetails errors
          Object.keys(serverErrors.interviewDetails).forEach((key) => {
            newErrors[key] = serverErrors.interviewDetails[key][0];
          });
        }
        // handle direct application field errors
        Object.keys(serverErrors).forEach((key) => {
          if (Array.isArray(serverErrors[key])) {
            newErrors[key] = serverErrors[key][0];
          } else if (typeof serverErrors[key] === "string") {
            newErrors[key] = serverErrors[key];
          }
        });
        setErrors((prev) => ({ ...prev, ...newErrors }));
      } else {
        alert("Failed to save changes. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    initialValues &&
    (currentStatus !== initialValues.status ||
      feedback !== initialValues.feedback ||
      (currentStatus === "Interview Scheduled" &&
        (interviewDate !== initialValues.interviewDate ||
          interviewTime !== initialValues.interviewTime ||
          locationType !== initialValues.locationType ||
          (locationType === "physical"
            ? physicalAddress !== initialValues.physicalAddress
            : meetingLink !== initialValues.meetingLink) ||
          additionalNotes !== initialValues.additionalNotes)) ||
      (currentStatus === "Active" &&
        (supervisorId !== initialValues.supervisorId ||
          activeStartDate !== initialValues.activeStartDate ||
          activeEndDate !== initialValues.activeEndDate)));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content xl-modal p-4 rounded"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <button className="btn-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <h2 className="mb-0">Review Application</h2>
        <hr className="mb-4 mt-3" />

        {/* Listing details toggle */}
        <button
          type="button"
          className={`btn btn-secondary d-flex w-100 justify-content-between align-items-center fs-5 border border-1 border-black ${
            showListingDetails
              ? "rounded-top rounded-bottom-0 mb-0 border-bottom-0"
              : "rounded mb-3"
          }`}
          onClick={() => setShowListingDetails((v) => !v)}
        >
          <span>
            {showListingDetails ? "Hide listing details" : "Listing details"}
          </span>
          <i
            className={`fa-solid fa-chevron-${
              showListingDetails ? "up" : "down"
            } fa-sm`}
          />
        </button>
        {showListingDetails && (
          <div className="px-2 py-4 bg-secondary border border-1 border-black border-top-0 rounded-bottom">
            <div className="row align-items-center mb-2">
              <div className="col">
                <h4 className="m-0">{application.posting?.title || "N/A"}</h4>
              </div>
              <div className="col text-end">
                <span className="text-muted">
                  {application.posting?.created_at
                    ? new Date(
                        application.posting.created_at
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", paddingRight: "5rem" }}>
              {application.posting?.description || "No description available"}
            </p>
            <div className="row">
              <div className="col-6">
                  <p className="my-0"> 
                    <strong>Job Type:</strong> {application.posting?.job_type || "N/A"}
                  </p>
                  <p className="my-0"> 
                    <strong>Start Date:</strong>{" "}
                    {formatDisplayDate(application.posting?.start_date)}
                  </p>
                  <p className="my-0">
                    <strong>End Date:</strong> {formatDisplayDate(application.posting?.end_date)}
                  </p>
                  <p className="mb-0 mt-2">
                    <span className={`badge ${statusClassMap[application.status]}`}>{application.posting?.status}</span>
                  </p>
                </div>
              <div className="col-6">
                <p className="m-0">
                  <i className="fa-solid fa-location-dot fa-sm me-2"></i>
                  {application.posting?.location || "Location not specified"}
                </p>
                <p className="m-0">
                  <i className="fa-solid fa-money-bill fa-sm me-2"></i>
                  {application.posting?.is_paid
                    ? `${application.posting.pay_rate} ${
                        application.posting.currency
                      }/${application.posting.wage_type?.toLowerCase()}`
                    : "Unpaid"}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Applicant details toggle */}
        <button
          type="button"
          className={`btn btn-secondary d-flex w-100 justify-content-between align-items-center fs-5 border border-1 border-black ${
            showApplicantDetails
              ? "rounded-top rounded-bottom-0 mb-0 border-bottom-0"
              : "rounded mb-3"
          } ${showListingDetails ? "mt-3" : ""}`}
          onClick={() => setShowApplicantDetails((v) => !v)}
        >
          <span>
            {showApplicantDetails
              ? "Hide application details"
              : "Application details"}
          </span>
          <i
            className={`fa-solid fa-chevron-${
              showApplicantDetails ? "up" : "down"
            } fa-sm`}
          />
        </button>
        {showApplicantDetails && (
          <div className="px-2 py-4 bg-light border border-1 border-black border-top-0 rounded-bottom text-start">
            <p className="mb-1">
              <strong>UUID:</strong> {application.UID}
            </p>
            <p className="mb-1">
              <strong>Full Name:</strong> {application.full_name}
            </p>
            <p className="mb-1">
              <strong>Email:</strong> {application.email}
            </p>
            <p className="mb-1">
              <strong>Phone:</strong> {application.phone}
            </p>
            <p className="mb-1">
              <strong>Location:</strong> {application.location}
            </p>
            <p className="mb-1">
              <a
                href={application.resume_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-transparent unround border border-1 border-black hover-green"
              >
                {" "}
                View Resume{" "}
                <i className="fa-solid fa-arrow-up-right-from-square fa-2xs"></i>{" "}
              </a>
            </p>
            <p className="mb-1">
              <a
                href={application.cover_letter_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-transparent unround border border-1 border-black hover-green"
              >
                {" "}
                View Cover Letter{" "}
                <i className="fa-solid fa-arrow-up-right-from-square fa-2xs"></i>{" "}
              </a>
            </p>
            {application.additional_info && (
              <p className="mb-1">
                <strong>Additional Info:</strong> {application.additional_info}
              </p>
            )}
            <p className="mb-1">
              <strong>Applied At:</strong>{" "}
              {new Date(application.applied_at).toLocaleString()}
            </p>
            <p className="mb-1">
              <strong>Status:</strong>{" "}
              <span className={`badge ${statusClassMap[application.status]}`}>
                {application.status}
              </span>
            </p>
          </div>
        )}

        {/* Status Dropdown */}
        <div className="mb-4 mt-3">
          <label htmlFor="statusSelect" className="form-label fs-5">
            Application Status:
          </label>
          <select
            id="statusSelect"
            className={`form-select`}
            value={currentStatus}
            onChange={(e) => handleLocalStatusChange(e.target.value)}
            disabled={isSaving || isApplicant}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional Interview Scheduling Fields */}
        {currentStatus === "Interview Scheduled" && (
          <div className="card card-body border border-1 border-black mb-4">
            <h6 className="mb-3">Interview Details</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="interviewDate" className="form-label">
                  Interview Date:
                </label>
                <input
                  type="date"
                  id="interviewDate"
                  className={`form-control ${
                    errors.interviewDate ? "is-invalid" : ""
                  }`}
                  value={interviewDate}
                  onChange={(e) => {
                    setInterviewDate(e.target.value);
                    validateField("interviewDate", e.target.value);
                  }}
                  onBlur={(e) => validateField("interviewDate", e.target.value)}
                  disabled={isApplicant}
                />
                {errors.interviewDate && (
                  <div className="invalid-feedback">{errors.interviewDate}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="interviewTime" className="form-label">
                  Interview Time:
                </label>
                <input
                  type="time"
                  id="interviewTime"
                  className={`form-control ${
                    errors.interviewTime ? "is-invalid" : ""
                  }`}
                  value={interviewTime}
                  onChange={(e) => {
                    setInterviewTime(e.target.value);
                    validateField("interviewTime", e.target.value);
                  }}
                  onBlur={(e) => validateField("interviewTime", e.target.value)}
                  disabled={isApplicant}
                />
                {errors.interviewTime && (
                  <div className="invalid-feedback">{errors.interviewTime}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="locationType" className="form-label">
                  Location Type:
                </label>
                <select
                  id="locationType"
                  className="form-select"
                  value={locationType}
                  onChange={(e) => {
                    setLocationType(e.target.value);
                    // clear the address & link validation when type changes
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.physicalAddress;
                      delete newErrors.meetingLink;
                      return newErrors;
                    });
                  }}
                  disabled={isApplicant}
                >
                  <option value="physical">Physical Location</option>
                  <option value="online">Online Meeting</option>
                </select>
              </div>
              <div className="col-md-6">
                {locationType === "physical" && (
                  <>
                    <label htmlFor="physicalAddress" className="form-label">
                      Physical Address:
                    </label>
                    <input
                      type="text"
                      id="physicalAddress"
                      className={`form-control ${
                        errors.physicalAddress ? "is-invalid" : ""
                      }`}
                      value={physicalAddress}
                      onChange={(e) => {
                        setPhysicalAddress(e.target.value);
                        validateField("physicalAddress", e.target.value, {
                          locationType,
                        });
                      }}
                      onBlur={(e) =>
                        validateField("physicalAddress", e.target.value, {
                          locationType,
                        })
                      }
                      disabled={isApplicant}
                      placeholder="e.g., 123 Main St, City"
                    />
                    {errors.physicalAddress && (
                      <div className="invalid-feedback">
                        {errors.physicalAddress}
                      </div>
                    )}
                  </>
                )}
                {locationType === "online" && (
                  <>
                    <label htmlFor="meetingLink" className="form-label">
                      Meeting Link:
                    </label>
                    <input
                      type="url"
                      id="meetingLink"
                      className={`form-control ${
                        errors.meetingLink ? "is-invalid" : ""
                      }`}
                      value={meetingLink}
                      onChange={(e) => {
                        setMeetingLink(e.target.value);
                        validateField("meetingLink", e.target.value, {
                          locationType,
                        });
                      }}
                      onBlur={(e) =>
                        validateField("meetingLink", e.target.value, {
                          locationType,
                        })
                      }
                      disabled={isApplicant}
                      placeholder="e.g., https://zoom.us/j/123456789"
                    />
                    {errors.meetingLink && (
                      <div className="invalid-feedback">
                        {errors.meetingLink}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="col-12">
                <label htmlFor="additionalNotes" className="form-label">
                  Additional Notes:
                </label>
                <textarea
                  id="additionalNotes"
                  className="form-control"
                  rows="3"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any specific instructions for the applicant..."
                  disabled={isApplicant}
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditional Active Internship Fields */}
        {currentStatus === "Active" && (
          <div className="card card-body border border-1 border-black mb-4">
            <h6 className="mb-3">Additional Internship Details</h6>
            <div className="row g-3">
              <div className="col-md-12">
                <label htmlFor="supervisorSelect" className="form-label">
                  Supervisor:
                </label>
                <select
                  id="supervisorSelect"
                  className={`form-select ${
                    errors.supervisorId ? "is-invalid" : ""
                  }`}
                  value={supervisorId}
                  onChange={(e) => {
                    setSupervisorId(e.target.value);
                    validateField("supervisorId", e.target.value);
                  }}
                  onBlur={(e) => validateField("supervisorId", e.target.value)}
                  disabled={isApplicant}
                >
                  <option value="">Select a supervisor</option>
                  {supervisors.map((sup, idx) => (
                    <option key={sup.id ?? `sup-${idx}`} value={sup.id}>
                      {sup.first_name} {sup.last_name}
                    </option>
                  ))}
                </select>
                {errors.supervisorId && (
                  <div className="invalid-feedback">{errors.supervisorId}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="activeStartDate" className="form-label">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="activeStartDate"
                  className={`form-control ${
                    errors.activeStartDate ? "is-invalid" : ""
                  }`}
                  value={activeStartDate}
                  onChange={(e) => {
                    setActiveStartDate(e.target.value);
                    validateField("activeStartDate", e.target.value, {
                      activeEndDate: activeEndDate,
                    });
                  }}
                  onBlur={(e) =>
                    validateField("activeStartDate", e.target.value, {
                      activeEndDate: activeEndDate,
                    })
                  }
                  disabled={isApplicant}
                />
                {errors.activeStartDate && (
                  <div className="invalid-feedback">
                    {errors.activeStartDate}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="activeEndDate" className="form-label">
                  End Date:
                </label>
                <input
                  type="date"
                  id="activeEndDate"
                  className={`form-control ${
                    errors.activeEndDate ? "is-invalid" : ""
                  }`}
                  value={activeEndDate}
                  onChange={(e) => {
                    setActiveEndDate(e.target.value);
                    validateField("activeEndDate", e.target.value, {
                      activeStartDate: activeStartDate,
                    });
                  }}
                  onBlur={(e) =>
                    validateField("activeEndDate", e.target.value, {
                      activeStartDate: activeStartDate,
                    })
                  }
                  disabled={isApplicant}
                />
                {errors.activeEndDate && (
                  <div className="invalid-feedback">{errors.activeEndDate}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStatus === "Completed" && (
          <div className="card card-body border border-1 border-black mb-4">
            <h6 className="mb-3">Completion Details</h6>

            <div className="mb-3">
              <label htmlFor="completionRemarks" className="form-label">
                Completion Remarks:
              </label>
              <textarea
                id="completionRemarks"
                className="form-control"
                rows="4"
                value={completionRemarks}
                onChange={(e) => setCompletionRemarks(e.target.value)}
                placeholder={!isApplicant ? ("Add your feedback here..."):("Remarks about the completion of the internship appears here.")}
                disabled={isApplicant}
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="completionLetterLink" className="form-label">
                Completion Letter Link:
              </label>
              <input
                type="url"
                id="completionLetterLink"
                className="form-control"
                value={completionLetterLink}
                onChange={(e) => setCompletionLetterLink(e.target.value)}
                placeholder={!isApplicant ? ("e.g., https://drive.google.com/..."):("Link from rep appears here.")}
                disabled={isApplicant}
              />
            </div>
          </div>
        )}

        {/* Feedback text area */}
        <div className="mb-4">
          <label htmlFor="feedbackTextarea" className="form-label fs-5">
            Feedback:
          </label>
          <textarea
            id="feedbackTextarea"
            className="form-control"
            rows="5"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={!isApplicant ? ("Add your feedback here..."):("Feedback from rep appears here.")}
            disabled={isApplicant}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={onClose}
            disabled={isSaving}
          >
            {!isApplicant ? "Cancel" : "Close"}
          </button>
          {!isApplicant && (
            <button
              type="button"
              className="btn btn-hireFlow-green border border-1 border-black unround"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>{" "}
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
