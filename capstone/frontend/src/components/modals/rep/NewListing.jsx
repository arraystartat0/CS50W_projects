import React, { useState, useEffect } from "react";
import "../../../assets/css/rep/NewListingModal.css";
import { api } from "../../../services/auth";
import { useAuth } from "../../../contexts/AuthContext";

function NewListingModal({ isOpen, handleClose, editingListing, onListingUpdated }) {
  if (!isOpen) return null;

  const { userProfile } = useAuth();
  const isEditing = !!editingListing; // check if we are in edit mode

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const [wageType, setWageType] = useState("UNPAID");
  const [payRate, setPayRate] = useState("");
  const [currency, setCurrency] = useState("");

  const [additionalInfo, setAdditionalInfo] = useState("");
  const [documentsNeeded, setDocumentsNeeded] = useState([]);
  const [documentsInput, setDocumentsInput] = useState("");

  const [status, setStatus] = useState("Active");

  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState({});

  const [noChangesMessage, setNoChangesMessage] = useState("");

  // populate form fields if in editing mode
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingListing) {
        setTitle(editingListing.title || "");
        setDescription(editingListing.description || "");
        setJobType(editingListing.job_type || "");
        setLocation(editingListing.location || "");
        setStartDate(editingListing.start_date || "");
        setEndDate(editingListing.end_date || "");

        setWageType(editingListing.wage_type || "UNPAID");
        setPayRate(editingListing.pay_rate || "");
        setCurrency(editingListing.currency || "");

        setAdditionalInfo(editingListing.additional_info || "");
        const docs = Array.isArray(editingListing.documents_needed) ? editingListing.documents_needed : [];
        setDocumentsNeeded(docs);
        setDocumentsInput(docs.join(', '));

        setStatus(editingListing.status || "Active");

        setInitialFormState({
          title: editingListing.title || "",
          description: editingListing.description || "",
          jobType: editingListing.job_type || "",
          location: editingListing.location || "",
          startDate: editingListing.start_date || "",
          endDate: editingListing.end_date || "",
          wageType: editingListing.wage_type || "UNPAID",
          payRate: editingListing.pay_rate || "",
          currency: editingListing.currency || "",
          additionalInfo: editingListing.additional_info || "",
          documentsNeeded: docs,
          status: editingListing.status || "Active",
        });
        setHasChanges(false);
      } else {
        // reset form for new listing
        setTitle("");
        setDescription("");
        setJobType("");
        setLocation("");
        setStartDate("");
        setEndDate("");
        setWageType("UNPAID");
        setPayRate("");
        setCurrency("");
        setAdditionalInfo("");
        setDocumentsNeeded([]);
        setDocumentsInput("");
        setStatus("Active"); 
        setInitialFormState({});
        setHasChanges(false);
      }
      setDateError("");
      setNoChangesMessage("");
    }
  }, [isOpen, isEditing, editingListing]);

  // check for changes and enable/disable the submit button
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing) {
      const currentFormState = {
        title, description, jobType, location, startDate, endDate,
        wageType, payRate, currency, additionalInfo, documentsNeeded,
        status,
      };

      const compareArrays = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        const sorted1 = [...arr1].sort();
        const sorted2 = [...arr2].sort();
        for (let i = 0; i < sorted1.length; i++) {
          if (sorted1[i] !== sorted2[i]) return false;
        }
        return true;
      };

      const changed = Object.keys(currentFormState).some(key => {
        if (key === 'documentsNeeded') {
          return !compareArrays(currentFormState[key], initialFormState[key]);
        }
        return String(currentFormState[key]) !== String(initialFormState[key]);
      });
      setHasChanges(changed);
    } else {
      setHasChanges(title.trim() !== "" && description.trim() !== "" && jobType.trim() !== "" && location.trim() !== "" && startDate.trim() !== "" && endDate.trim() !== "");
    }
    // clear "no changes" message if changes are made or if it's a new listing
    if (hasChanges || !isEditing) {
      setNoChangesMessage("");
    }
  }, [
    title, description, jobType, location, startDate, endDate,
    wageType, payRate, currency, additionalInfo, documentsNeeded, status,
    isEditing, initialFormState, isOpen
  ]);

  const handleDocumentsInputChange = (e) => {
    setDocumentsInput(e.target.value);
    const docsArray = e.target.value.split(',').map(doc => doc.trim()).filter(doc => doc !== '');
    setDocumentsNeeded(docsArray);
  };

  const validateDate = (dateValue, fieldName) => {
    if (!dateValue) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateObj = new Date(dateValue);
    if (dateObj < today) {
      return `${fieldName} cannot be in the past.`;
    }
    return null;
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    
    const error = validateDate(value, "Start Date");
    if (error) {
      setDateError(error);
    } else if (dateError && dateError.includes("Start Date")) {
      setDateError("");
    }
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    
    const error = validateDate(value, "End Date");
    if (error) {
      setDateError(error);
    } else if (dateError && dateError.includes("End Date")) {
      setDateError("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      if (!editingListing || !editingListing.UID) {
        setDateError("Error: Listing UID is missing for update operation. Please close and re-open the edit form.");
        return;
      }
    }

    if (isEditing && !hasChanges) {
      setNoChangesMessage("No changes detected. Listing cannot be updated.");
      setDateError("");
      return;
    }

    // date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to start of day for accurate comparison

    if (startDate) {
      const startDateObj = new Date(startDate);
      if (startDateObj < today) {
        setDateError("Start Date cannot be in the past.");
        setNoChangesMessage("");
        return;
      }
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      if (endDateObj < today) {
        setDateError("End Date cannot be in the past.");
        setNoChangesMessage("");
        return;
      }
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setDateError("End Date must be later than Start Date.");
      setNoChangesMessage("");
      return;
    }
    setDateError("");

    if (wageType !== 'UNPAID' && (!payRate || !currency)) {
      setDateError("Pay Rate and Currency are required for paid postings.");
      setNoChangesMessage("");
      return;
    }

    const listingData = {
      title,
      description,
      job_type: jobType,
      location,
      start_date: startDate || null,
      end_date: endDate || null,
      wage_type: wageType,
      pay_rate: payRate || null,
      currency: currency || null,
      additional_info: additionalInfo,
      documents_needed: documentsNeeded,
    };

    if (isEditing) {
      listingData.status = status;
    }

    try {
      if (isEditing) {
        const response = await api.patch(
          `/postings/${editingListing.UID}/`,
          listingData
        );
        console.log("Listing updated successfully!", response.data);
        alert("Listing updated successfully!");
      } else {
        const response = await api.post("/postings/", listingData);
        console.log("New listing submitted", response.data);
        alert("Listing created successfully!");
      }
      if (onListingUpdated) {
        onListingUpdated();
      }
      handleClose();
    } catch (error) {
      console.error("API call failed:", error.response?.data || error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.response?.data) {
        const apiErrors = error.response.data;
        errorMessage = "Validation Error:\n";
        for (const key in apiErrors) {
          errorMessage += `- ${key}: ${apiErrors[key].join(', ')}\n`;
        }
      }
      setDateError(errorMessage);
      setNoChangesMessage("");
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content xl-modal p-4 rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-close" onClick={handleClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        <h2 className="mb-0">{isEditing ? "Edit Listing" : "Post a new listing."}</h2>
        <hr className="mb-4 mt-3"></hr>
        <form onSubmit={onSubmit}>
          {/* Section: Listing Details */}
          <h5 className="mb-3">Listing Details</h5>
          <div className="mb-3">
            <label htmlFor="listingTitle" className="form-label">
              Title
            </label>
            <input
              type="text"
              id="listingTitle"
              className="form-control"
              placeholder="Enter listing title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="listingDescription" className="form-label">
              Description
            </label>
            <textarea
              id="listingDescription"
              className="form-control"
              placeholder="Enter job description (such as key responsibilities, objectives and duties)"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="jobType" className="form-label">
                Type
              </label>
              <select
                id="jobType"
                className="form-select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                required
              >
                <option value="" className="text-muted">
                  Select the type
                </option>
                <option>Internship</option>
                <option>Apprenticeship</option>
                <option>Full-time</option>
                <option>Part-time</option>
              </select>
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="location" className="form-label">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="form-control"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="form-control"
                value={startDate}
                onChange={handleStartDateChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="endDate" className="form-label">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={endDate}
                onChange={handleEndDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          {dateError && (
            <div className="alert alert-danger" role="alert">
              <p className="text-center m-0 rounded-1">{dateError}</p>
            </div>
          )}
          <hr className="mb-4 mt-3"></hr>
          {isEditing && (
            <>
              <h5 className="mb-3">Listing Status</h5>
              <div className="mb-4">
                <label htmlFor="listingStatus" className="form-label">
                  Status
                </label>
                <select
                  id="listingStatus"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <hr className="mb-4 mt-3"></hr>
            </>
          )}

          {/* Section: Required documents */}
          <h5 className="mt-4 mb-0">Documents</h5>
          <p className="text-muted mb-3">
            Enter required documents as a comma-separated list
          </p>
          <div className="mb-3">
            <label htmlFor="documentsInput" className="form-label">
              Documents Needed (comma-separated)
            </label>
            <input
              type="text"
              id="documentsInput"
              className="form-control"
              placeholder="e.g., Resume, Cover Letter, Transcript"
              value={documentsInput}
              onChange={handleDocumentsInputChange}
            />
            {documentsNeeded.length > 0 && (
              <div className="mt-2">
                <strong>Current:</strong>{" "}
                {documentsNeeded.map((doc, index) => (
                  <span key={index} className="badge bg-info text-dark me-1 my-1">
                    {doc}
                  </span>
                ))}
              </div>
            )}
          </div>
          <hr className="mb-4 mt-3"></hr>
          {/* Section: Payment Details */}
          <h5 className="mt-4 mb-3">Payment Details</h5>
          <div className="row align-items-center">
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label me-3">Status:</label>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="paidRadio"
                  name="paymentStatus"
                  className="form-check-input round"
                  value="HOURLY"
                  checked={wageType !== "UNPAID"}
                  onChange={() => setWageType("HOURLY")}
                />
                <label htmlFor="paidRadio" className="form-check-label">
                  Paid
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="unpaidRadio"
                  name="paymentStatus"
                  className="form-check-input round"
                  value="UNPAID"
                  checked={wageType === "UNPAID"}
                  onChange={() => setWageType("UNPAID")}
                />
                <label htmlFor="unpaidRadio" className="form-check-label">
                  Unpaid
                </label>
              </div>
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="wageType" className="form-label">
                Pay Type
              </label>
              <select
                id="wageType"
                className="form-select"
                value={wageType}
                onChange={(e) => setWageType(e.target.value)}
                disabled={wageType === "UNPAID"}
              >
                <option value="">Select a pay type</option>
                <option value="HOURLY">Per Hour</option>
                <option value="COMMISSION">Per Commission</option>
                <option value="PROJECT">Per Project</option>
                <option value="SALARY">Salary</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="payRate" className="form-label">
                Pay Rate
              </label>
              <input
                type="number"
                id="payRate"
                className="form-control"
                placeholder="0.00"
                step="0.01"
                value={payRate}
                onChange={(e) => setPayRate(e.target.value)}
                disabled={wageType === "UNPAID"}
              />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="currency" className="form-label">
                Currency
              </label>
              <select
                id="currency"
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={wageType === "UNPAID"}
              >
                <option value="">Select a currency</option>
                <option value="UGX">UGX</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <hr className="mb-4 mt-3"></hr>
          {/* Section: Additional Information */}
          <h5 className="mt-4 mb-3">Additional Information</h5>
          <div className="mb-4">
            <label htmlFor="additionalInfo" className="form-label">
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              className="form-control"
              placeholder="Enter any additional information you want visible on your listing"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          {/* Message for no changes */}
          {noChangesMessage && (
            <div className="alert alert-info text-center" role="alert">
              {noChangesMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="hover-btn border border-1 border-black unround p-2 bg-transparent rounded-1 d-flex align-items-center ms-3"
              disabled={isEditing && !hasChanges} // disable if editing and no changes
            >
              {isEditing ? (
                <>
                  Update <i className="fa-solid fa-save ms-3"></i>
                </>
              ) : (
                <>
                  Post <i className="fa-solid fa-upload ms-3"></i>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewListingModal;