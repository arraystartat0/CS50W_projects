import React, { useState } from "react";
import "../../assets/css/ConfirmationModal.css";

function ApplyModal({ isOpen, posting, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    resume_link: "",
    cover_letter_link: "",
    additional_info: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (!formData.resume_link.trim()) {
      newErrors.resume_link = "Resume link is required";
    } else if (!isValidUrl(formData.resume_link)) {
      newErrors.resume_link = "Please enter a valid URL";
    }
    
    if (!formData.cover_letter_link.trim()) {
      newErrors.cover_letter_link = "Cover letter link is required";
    } else if (!isValidUrl(formData.cover_letter_link)) {
      newErrors.cover_letter_link = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // reset form on successful submission
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        resume_link: "",
        cover_letter_link: "",
        additional_info: ""
      });
      onClose();
    } catch (error) {
      console.error("Application submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        resume_link: "",
        cover_letter_link: "",
        additional_info: ""
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !posting) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content apply-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Apply for Position</h4>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleClose}
            disabled={loading}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Job Details Section */}
        <div className="job-details mb-4 p-3 bg-light border border-1 border-black rounded-0">
          <h6 className="mb-2">Job Details</h6>
          <div className="row">
            <div className="col-md-6">
              <p className="mb-1"><strong>Position:</strong> {posting.title}</p>
              <p className="mb-1"><strong>Company:</strong> {posting.company.name}</p>
              <p className="mb-1"><strong>Location:</strong> {posting.location}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1"><strong>Type:</strong> {posting.job_type}</p>
              <p className="mb-1"><strong>Pay:</strong> {
                posting.is_paid 
                  ? `${posting.pay_rate} ${posting.currency} ${posting.wage_type.toLowerCase()}`
                  : "Unpaid"
              }</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="full_name" className="form-label">Full Name *</label>
              <input
                type="text"
                className={`form-control unround border border-1 border-black ${errors.full_name ? 'is-invalid' : ''}`}
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">Email *</label>
              <input
                type="email"
                className={`form-control unround border border-1 border-black ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="phone" className="form-label">Phone Number *</label>
              <input
                type="tel"
                className={`form-control unround border border-1 border-black ${errors.phone ? 'is-invalid' : ''}`}
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="location" className="form-label">Location *</label>
              <input
                type="text"
                className={`form-control unround border border-1 border-black ${errors.location ? 'is-invalid' : ''}`}
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="City, State, Country"
              />
              {errors.location && <div className="invalid-feedback">{errors.location}</div>}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="resume_link" className="form-label">Resume Link *</label>
              <input
                type="url"
                className={`form-control unround border border-1 border-black ${errors.resume_link ? 'is-invalid' : ''}`}
                id="resume_link"
                name="resume_link"
                value={formData.resume_link}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="https://drive.google.com/..."
              />
              {errors.resume_link && <div className="invalid-feedback">{errors.resume_link}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="cover_letter_link" className="form-label">Cover Letter Link *</label>
              <input
                type="url"
                className={`form-control unround border border-1 border-black ${errors.cover_letter_link ? 'is-invalid' : ''}`}
                id="cover_letter_link"
                name="cover_letter_link"
                value={formData.cover_letter_link}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="https://drive.google.com/..."
              />
              {errors.cover_letter_link && <div className="invalid-feedback">{errors.cover_letter_link}</div>}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="additional_info" className="form-label">Additional Information</label>
            <textarea
              className="form-control unround border border-1 border-black"
              id="additional_info"
              name="additional_info"
              rows="4"
              value={formData.additional_info}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Any additional information you'd like to share or have been asked to share..."
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary unround border border-1 border-black"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-hireFlow-green unround border border-1 border-black"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin me-2"></i>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyModal; 