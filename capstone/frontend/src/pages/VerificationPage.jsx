import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/LoginPage.css";
import "../assets/css/ConfirmationModal.css";
import "../assets/css/LoadingSpinner.css";
import api from "../services/api";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import usePageLoading from "../hooks/usePageLoading";

function VerificationPage() {
  const navigate = useNavigate();

  const [verificationData, setVerificationData] = useState({
    application_uid: "",
    last_name: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [verificationResult, setVerificationResult] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const isPageLoading = usePageLoading([], 800);

  // memoized validation rules
  const validationRules = useMemo(
    () => ({
      application_uid: {
        required: true,
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        messages: {
          required: "Application UID is required.",
          pattern: "Please enter a valid UID format (e.g., 12345678-1234-1234-1234-123456789abc).",
        },
      },
      last_name: {
        required: true,
        minLength: 2,
        messages: {
          required: "Last Name is required.",
          minLength: "Last name must be at least 2 characters long.",
        },
      },
      email: {
        required: true,
        pattern: /\S+@\S+\.\S+/,
        messages: {
          required: "Email is required.",
          pattern: "Email address is invalid.",
        },
      },
    }),
    []
  );

  // memoized submit button disabled state
  const isSubmitDisabled = useMemo(() => {
    const hasErrors = Object.values(formErrors).some((error) => error !== "");

    const requiredFields = ["application_uid", "last_name", "email"];
    const isIncomplete = requiredFields.some(
      (field) => !verificationData[field]?.trim()
    );

    return loading || hasErrors || isIncomplete;
  }, [formErrors, verificationData, loading]);

  const validateField = useCallback(
    (fieldName, value) => {
      const rules = validationRules[fieldName];
      if (!rules) return "";

      const trimmedValue = typeof value === "string" ? value.trim() : value;

      // required field validation
      if (rules.required && !trimmedValue) {
        return rules.messages.required;
      }

      // Skip other validations if field is empty and not required
      if (!trimmedValue && !rules.required) return "";

      // length validations
      if (rules.minLength && trimmedValue.length < rules.minLength) {
        return rules.messages.minLength;
      }

      if (rules.maxLength && trimmedValue.length > rules.maxLength) {
        return rules.messages.maxLength;
      }

      // pattern validation
      if (rules.pattern && !rules.pattern.test(trimmedValue)) {
        return rules.messages.pattern;
      }

      return "";
    },
    [validationRules]
  );

  // form change handler
  const handleFormChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setVerificationData((prev) => ({ ...prev, [name]: value }));

      // clear field error when user starts typing
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }

      // clear general error and result
      if (error) {
        setError("");
      }
      if (verificationResult) {
        setVerificationResult(null);
      }
    },
    [formErrors, error, verificationResult]
  );

  // blur handler
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      const fieldError = validateField(name, value);

      setFormErrors((prev) => ({ ...prev, [name]: fieldError }));
    },
    [validateField]
  );

  // validate entire form
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(verificationData).forEach((fieldName) => {
      const fieldError = validateField(fieldName, verificationData[fieldName]);
      if (fieldError) {
        errors[fieldName] = fieldError;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  }, [verificationData, validateField]);

  // form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setVerificationResult(null);

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      try {
        const response = await api.get(`/applications/verify/${verificationData.application_uid.trim()}/`, {
          params: {
            last_name: verificationData.last_name,
            email: verificationData.email,
          },
        });

        setVerificationResult(response.data);
        setShowVerificationModal(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Application not found or verification details do not match.");
        } else if (err.response?.status === 400) {
          setError(err.response.data.error || "Application is not completed or verification failed.");
        } else {
          setError("Verification failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [verificationData, validateForm]
  );

  // render field with error handling
  const renderField = useCallback(
    (fieldConfig) => {
      const {
        name,
        type = "text",
        label,
        icon,
        required = false,
        placeholder = "",
        colClass = "col-12",
      } = fieldConfig;

      const fieldProps = {
        name,
        className: `form-control rounded-0 border border-1 border-black ${
          formErrors[name] ? "is-invalid" : ""
        }`,
        onChange: handleFormChange,
        onBlur: handleBlur,
        value: verificationData[name],
        ...(required && { required: true }),
        ...(placeholder && { placeholder }),
      };

      return (
        <div className={colClass} key={name}>
          <label className="form-label fw-light">
            {icon && <i className={`${icon} me-2`}></i>}
            {label}
            {required && <span className="text-danger">*</span>}
          </label>

          <input {...fieldProps} type={type} />

          {formErrors[name] && (
            <div className="invalid-feedback">{formErrors[name]}</div>
          )}
        </div>
      );
    },
    [verificationData, formErrors, handleFormChange, handleBlur]
  );

  // form field configurations
  const formFields = useMemo(
    () => [
      {
        name: "application_uid",
        label: "Application UID",
        icon: "fa-solid fa-id-card",
        required: true,
        placeholder: "Enter the application UID (e.g., 12345678-1234-1234-1234-123456789abc)",
        colClass: "col-12",
      },
      {
        name: "last_name",
        label: "Last Name",
        icon: "fa-solid fa-user",
        required: true,
        placeholder: "Enter the applicant's last name",
        colClass: "col-md-6",
      },
      {
        name: "email",
        type: "email",
        label: "Email Address",
        icon: "fa-solid fa-envelope",
        required: true,
        placeholder: "Enter the applicant's email address",
        colClass: "col-md-6",
      },
    ],
    []
  );

  // render verification modal
  const renderVerificationModal = useCallback(() => {
    if (!verificationResult || !showVerificationModal) return null;

    const { application, posting, company } = verificationResult;

    return (
      <div className="modal-overlay" onClick={() => setShowVerificationModal(false)} style={{ zIndex: 9999 }}>
        <div className="modal-content w-95 w-md-75 w-lg-75 h-75 mx-auto overflow-y-auto overflow-x-hidden" style={{ maxWidth: '1200px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">
              <i className="fa-solid fa-check-circle text-success me-2"></i>
              Verification Successful
            </h3>
            <button className="btn" onClick={() => setShowVerificationModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div className="alert alert-success" role="alert">
            <h5 className="alert-heading">
              <i className="fa-solid fa-check-circle me-2"></i>
              Application Verified
            </h5>
            <p className="mb-0">This application has been completed and verified successfully.</p>
          </div>

          <div className="row">
            {/* Application Details */}
            <div className="col-md-6 mb-3">
              <div className="card border border-1 border-black rounded-1 h-100">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="fa-solid fa-user me-2"></i>
                    Applicant Information
                  </h6>
                </div>
                <div className="card-body">
                  <p><strong>Name:</strong> {application.full_name}</p>
                  <p><strong>Email:</strong> {application.email}</p>
                  <p><strong>Phone:</strong> {application.phone}</p>
                  <p><strong>Location:</strong> {application.location}</p>
                  <p><strong>Applied:</strong> {new Date(application.applied_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="col-md-6 mb-3">
              <div className="card border border-1 border-black rounded-1 h-100">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="fa-solid fa-building me-2"></i>
                    Company Information
                  </h6>
                </div>
                <div className="card-body">
                  <p><strong>Company:</strong> {company.name}</p>
                  <p><strong>Public Key:</strong> {company.public_key}</p>
                  {company.description && (
                    <p><strong>Description:</strong> {company.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="col-12 mb-3">
              <div className="card border border-1 border-black rounded-1">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="fa-solid fa-briefcase me-2"></i>
                    Job Details
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Position:</strong> {posting.title}</p>
                      <p><strong>Job Type:</strong> {posting.job_type}</p>
                      <p><strong>Location:</strong> {posting.location || "Not specified"}</p>
                      <p><strong>Status:</strong> {posting.status}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Start Date:</strong> {posting.start_date ? new Date(posting.start_date).toLocaleDateString() : "Not specified"}</p>
                      <p><strong>End Date:</strong> {posting.end_date ? new Date(posting.end_date).toLocaleDateString() : "Not specified"}</p>
                      <p><strong>Wage Type:</strong> {posting.wage_type}</p>
                      {posting.pay_rate && (
                        <p><strong>Pay Rate:</strong> {posting.pay_rate} {posting.currency}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p><strong>Description:</strong></p>
                    <p className="text-muted">{posting.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Internship Details */}
            <div className="col-12 mb-3">
              <div className="card border border-1 border-black rounded-1">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="fa-solid fa-graduation-cap me-2"></i>
                    Internship Details
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Active Start Date:</strong> {application.active_start_date ? new Date(application.active_start_date).toLocaleDateString() : "Not specified"}</p>
                      <p><strong>Active End Date:</strong> {application.active_end_date ? new Date(application.active_end_date).toLocaleDateString() : "Not specified"}</p>
                      {application.supervisor && (
                        <p><strong>Supervisor:</strong> {application.supervisor.full_name}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <p><strong>Application Status:</strong> {application.status}</p>
                      <p><strong>Resume:</strong> <a href={application.resume_link} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                      <p><strong>Cover Letter:</strong> <a href={application.cover_letter_link} target="_blank" rel="noopener noreferrer">View Cover Letter</a></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Details */}
            <div className="col-12">
              <div className="card border border-1 border-black rounded-1">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="fa-solid fa-certificate me-2"></i>
                    Completion Details
                  </h6>
                </div>
                <div className="card-body">
                  {application.completion_remarks && (
                    <div className="mb-3">
                      <p><strong>Completion Remarks:</strong></p>
                      <p className="text-muted">{application.completion_remarks}</p>
                    </div>
                  )}
                  {application.completion_letter_link && (
                    <div>
                      <p><strong>Completion Letter:</strong></p>
                      <a 
                        href={application.completion_letter_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-success"
                      >
                        <i className="fa-solid fa-download me-2"></i>
                        Download Completion Letter
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [verificationResult, showVerificationModal]);

  if (isPageLoading) {
    return <LoadingSpinner message="Loading verification page..." />;
  }

  return (
    <>
      <NavBar />
      {/* Main Content */}
      <div className="card-wrapper">
        <div
          className="center-card border border-1 border-black rounded-1 mx-3"
          style={{ maxWidth: "800px" }}
        >
          <h2 className="card-heading fw-light">Verify Application</h2>
          <p className="text-muted text-center mb-4">
            Enter the application details to verify a completed internship
          </p>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="login-form mt-3"
            noValidate
          >
            <div className="row mb-3">
              {formFields.slice(0, 1).map(renderField)}
            </div>

            <div className="row mb-3">
              {formFields.slice(1, 3).map(renderField)}
            </div>

            <button
              type="submit"
              className="btn btn-fillGreen border border-1 border-black w-100 transition-icon mt-3"
              disabled={isSubmitDisabled}
            >
              <span>
                {loading ? "Verifying..." : "Verify Application"}
              </span>
              <i className="fa-solid fa-chevron-right icon-default pt-1 fa-xs"></i>
              <i className="fa-solid fa-search icon-hover pt-1 fa-xs"></i>
            </button>
          </form>
        </div>
      </div>

      {renderVerificationModal()}
      
      <Footer />
    </>
  );
}

export default VerificationPage; 