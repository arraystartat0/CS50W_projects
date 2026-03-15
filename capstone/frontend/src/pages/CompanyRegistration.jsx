import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import countryList from "react-select-country-list";
import { normalizeUrl } from "../utils/url";
import authService from "../services/auth";
import "../assets/css/LoginPage.css";
import validatePassword from "../utils/validatePassword";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../assets/css/LoadingSpinner.css";
import LoadingSpinner from "../components/LoadingSpinner";
import usePageLoading from "../hooks/usePageLoading";

const CompanyRegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    AdminFirstName: "",
    AdminLastName: "",
    AdminEmail: "",
    AdminPassword: "",
    companyName: "",
    description: "",
    registrationNumber: "",
    incorporationDate: "",
    companyType: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    CompanyEmail: "",
    phone: "",
    website: "",
    reps: [{ lastName: "", RepEmail: "" }],
  });

  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [incorporationDateError, setIncorporationDateError] = useState("");

  const [formErrors, setFormErrors] = useState({
    AdminEmail: "",
    CompanyEmail: "",
    phone: "",
    reps: [{ lastName: "", RepEmail: "" }],
  });

  // Page loading state
  const isPageLoading = usePageLoading([], 600);

  const handleAdminPasswordBlur = () => {
    const err = validatePassword(formData.AdminPassword);
    setAdminPasswordError(err || "");
  };

  // Calculate the maximum allowed incorporation date (14 days ago)
  const getMaxIncorporationDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() - 14);
    return maxDate.toISOString().split("T")[0];
  };

  const validateIncorporationDate = (date) => {
    if (!date) return "";

    const selectedDate = new Date(date);
    const today = new Date();
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);

    if (selectedDate > fourteenDaysAgo) {
      return "You can only register with us 14 days after incorporation for security purposes";
    }

    return "";
  };

  const handleIncorporationDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate the incorporation date
    const error = validateIncorporationDate(value);
    setIncorporationDateError(error);
  };

  const options = useMemo(() => countryList().getData(), []);

  const validateField = (name, value) => {
    let error = "";

    if (
      name === "CompanyEmail" ||
      name === "RepEmail" ||
      name === "AdminEmail"
    ) {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(value)) {
        error = "Please enter a valid email address.";
      }
    }

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        error = "Phone number should be 7–15 digits.";
      }
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        const AdminEmailOK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
          formData.AdminEmail
        );
        const pwdErr = validatePassword(formData.AdminPassword);
        return (
          AdminEmailOK &&
          !pwdErr &&
          formData.AdminPassword.trim().length > 0 &&
          formData.AdminFirstName.trim().length > 0 &&
          formData.AdminLastName.trim().length > 0
        );
      case 2:
        const incorporationDateErr = validateIncorporationDate(
          formData.incorporationDate
        );
        return (
          formData.companyName.trim().length > 0 &&
          formData.description.trim().length > 0 &&
          formData.registrationNumber.trim().length > 0 &&
          formData.incorporationDate &&
          !incorporationDateErr &&
          formData.companyType
        );
      case 3:
        return (
          formData.address.trim().length > 0 &&
          formData.city.trim().length > 0 &&
          formData.country.trim().length > 0
        );
      case 4:
        // basic email+phone check
        const emailOK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
          formData.CompanyEmail
        );
        const phoneLength = formData.phone.trim().length;
        return emailOK && phoneLength > 6 && phoneLength < 16;
      case 5:
        // every rep must have last name & valid email
        const allRepsValid = formData.reps.every(
          (rep) =>
            rep.lastName.trim().length > 0 &&
            /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rep.RepEmail)
        );

        // Check if there are no validation errors
        const noRepErrors = formErrors.reps.every(
          (repError) => !repError.lastName && !repError.RepEmail
        );

        return allRepsValid && noRepErrors;
      case 6:
        return true;
      default:
        return true;
    }
  };

  const validateRepField = (idx, name, value) => {
    const errs = [...formErrors.reps];
    let error = "";

    if (name === "lastName") {
      if (!value.trim()) {
        error = "Last name is required.";
      }
    }

    if (name === "RepEmail") {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!value.trim()) {
        error = "Email is required.";
      } else if (!emailRegex.test(value)) {
        error = "Please enter a valid email address.";
      }
    }

    errs[idx] = { ...errs[idx], [name]: error };
    setFormErrors((prev) => ({ ...prev, reps: errs }));
  };

  // Only advance if validateStep() and password passes
  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 6));
    } else {
      alert("Please complete all required fields correctly before moving on.");
    }
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRepChange = (idx, e) => {
    const { name, value } = e.target;
    const reps = [...formData.reps];
    reps[idx][name] = value;
    setFormData({ ...formData, reps });
  };

  const addRep = () => {
    setFormData((fd) => ({
      ...fd,
      reps: [...fd.reps, { lastName: "", RepEmail: "" }],
    }));
    setFormErrors((fe) => ({
      ...fe,
      reps: [...fe.reps, { lastName: "", RepEmail: "" }],
    }));
  };

  const removeRep = (idx) => {
    setFormData((fd) => ({
      ...fd,
      reps: fd.reps.filter((_, i) => i !== idx),
    }));
    setFormErrors((fe) => ({
      ...fe,
      reps: fe.reps.filter((_, i) => i !== idx),
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      alert("Please ensure all fields are valid before submitting.");
      return;
    }

    try {
      // Submission logic including generating codes and invites
      const result = await authService.registerCompany(formData);
      navigate("/registration-success", { state: result.data });
    } catch (err) {
      console.error("Registration failed:", err);
      alert(`Registration failed: ${err.message || err}`);
    }
  };

  if (isPageLoading) {
    return <LoadingSpinner message="Loading registration page..." />;
  }

  return (
    <>
      <NavBar />
      <div className="card-wrapper pb-5">
        <div
          className={
            `center-card border border-1 border-black rounded-1 mx-auto ` +
            (step === 6 ? "card-wide" : "")
          }
        >
          <h2 className="card-heading fw-light">Register your company</h2>
          <p className="fw-light">
            Fill in the following information to register with us.
          </p>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step Indicators */}
            <ul className="nav nav-pills justify-content-center mb-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <li className="nav-item" key={num}>
                  <span
                    className={`nav-link text-dark ${
                      step === num
                        ? "active bg-hireFlow-green border border-1 border-black rounded-1 me-2"
                        : ""
                    }`}
                  >
                    {num}
                  </span>
                </li>
              ))}
            </ul>
            {/* Step 1: Admin details */}
            {step === 1 && (
              <>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-light">
                      First Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="AdminFirstName"
                      className="form-control rounded-0 border border-1 border-black"
                      placeholder="John"
                      value={formData.AdminFirstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-light">
                      Last Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="AdminLastName"
                      className="form-control rounded-0 border border-1 border-black"
                      placeholder="Doe"
                      value={formData.AdminLastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-light">
                    Email Address<span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="AdminEmail"
                    className="form-control rounded-0 border border-1 border-black"
                    placeholder="email"
                    value={formData.AdminEmail}
                    onChange={handleChange}
                    onBlur={(e) => validateField("AdminEmail", e.target.value)}
                    required
                    autoComplete="email"
                  />
                  {formErrors.AdminEmail && (
                    <small className="text-danger">
                      {formErrors.AdminEmail}
                    </small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-light">
                    Password<span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="AdminPassword"
                    className="form-control rounded-0 border border-1 border-black"
                    placeholder="********"
                    value={formData.AdminPassword}
                    onChange={handleChange}
                    onBlur={handleAdminPasswordBlur}
                    required
                    autoComplete="new-password"
                  />
                  {adminPasswordError && (
                    <small className="text-danger">{adminPasswordError}</small>
                  )}
                </div>
                <div className="mt-4 bg-hireFlow-green p-2 rounded-2">
                  <i className="fa-solid fa-info me-2"></i>These are the
                  credentials you will use to login into your portal.
                </div>
              </>
            )}
            {/* Step 2: Company Details */}
            {step === 2 && (
              <div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-id-badge"></i> Company Name
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa-solid fa-align-justify"></i> Description
                    <span className="text-danger">*</span>
                  </label>
                  <textarea
                    type="text"
                    name="description"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-hashtag"></i> Registration Number
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-calendar"></i> Date of Incorporation
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="incorporationDate"
                    className={`form-control rounded-0 border border-1 border-black ${
                      incorporationDateError ? "border-danger" : ""
                    }`}
                    value={formData.incorporationDate}
                    onChange={handleIncorporationDateChange}
                    max={getMaxIncorporationDate()}
                    required
                  />
                  {incorporationDateError && (
                    <small className="text-danger">
                      {incorporationDateError}
                    </small>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-list"></i> Company Type
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    name="companyType"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.companyType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="LLC">LLC</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">
                      Sole Proprietorship
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Address Details */}
            {step === 3 && (
              <div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-map-marker"></i> Address
                    <span className="text-danger">*</span>
                  </label>
                  <textarea
                    type="text"
                    name="address"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.address}
                    onChange={handleChange}
                    maxLength={60}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 form-group mb-3">
                    <label>
                      <i className="fa fa-city"></i> City
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="form-control rounded-0 border border-1 border-black"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 form-group mb-3">
                    <label>
                      <i className="fa fa-flag"></i> State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      className="form-control rounded-0 border border-1 border-black"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-globe"></i> Country
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    name="country"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select country </option>
                    {options.map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-envelope"></i> Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {step === 4 && (
              <div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-envelope-open"></i> Email
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="CompanyEmail"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.CompanyEmail}
                    onChange={handleChange}
                    onBlur={(e) =>
                      validateField("CompanyEmail", e.target.value)
                    }
                    required
                  />
                  {formErrors.CompanyEmail && (
                    <small className="text-danger">
                      {formErrors.CompanyEmail}
                    </small>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-phone"></i> Phone
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={(e) => validateField("phone", e.target.value)}
                    required
                  />
                  {formErrors.phone && (
                    <small className="text-danger">{formErrors.phone}</small>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label>
                    <i className="fa fa-globe"></i> Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    className="form-control rounded-0 border border-1 border-black"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Reps */}
            {step === 5 && (
              <div>
                <label>
                  <i className="fa-solid fa-users"></i> Company Reps
                </label>

                {/* Render each rep's fields */}
                {formData.reps.map((rep, i) => (
                  <div className="row align-items-end mb-3" key={i}>
                    <div className="col-md-5 form-group">
                      <label>
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        className={`form-control rounded-0 border border-1 border-black ${
                          formErrors.reps[i] && formErrors.reps[i].lastName
                            ? "border-danger"
                            : ""
                        }`}
                        value={rep.lastName}
                        onChange={(e) => handleRepChange(i, e)}
                        onBlur={(e) =>
                          validateRepField(i, "lastName", e.target.value)
                        }
                        required
                      />
                      {formErrors.reps[i] && formErrors.reps[i].lastName && (
                        <small className="text-danger">
                          {formErrors.reps[i].lastName}
                        </small>
                      )}
                    </div>

                    {/* Email */}
                    <div className="col-md-5 form-group">
                      <label>
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="RepEmail"
                        className={`form-control rounded-0 border border-1 border-black ${
                          formErrors.reps[i] && formErrors.reps[i].RepEmail
                            ? "border-danger"
                            : ""
                        }`}
                        value={rep.RepEmail}
                        onChange={(e) => handleRepChange(i, e)}
                        onBlur={(e) =>
                          validateRepField(i, "RepEmail", e.target.value)
                        }
                        required
                      />
                      {formErrors.reps[i] && formErrors.reps[i].RepEmail && (
                        <small className="text-danger">
                          {formErrors.reps[i].RepEmail}
                        </small>
                      )}
                    </div>

                    {/* Delete button */}
                    <div className="col-md-2 text-end mt-3">
                      <button
                        type="button"
                        className="btn btn-fillRed border border-1 border-black w-100 d-flex justify-content-center align-items-center p-3"
                        onClick={() => formData.reps.length > 1 && removeRep(i)}
                        disabled={formData.reps.length === 1}
                        aria-label="Remove rep"
                      >
                        <span>
                          <i className="fa fa-trash"></i>
                        </span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Full‑width Add button */}
                <div className="row">
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-fillGreen border border-1 border-black w-100 transition-icon"
                      onClick={addRep}
                    >
                      <i className="fa fa-plus"></i>{" "}
                      <span>Add Another Rep</span>
                    </button>
                  </div>
                </div>
                <div className="mt-4 bg-rejected p-2 rounded-2">
                  <i className="fa-solid fa-info me-2"></i>A one time use
                  invite-link will be generated for each rep once your company
                  is registered with us.
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h4 className="card-heading fw-bold">
                  Review Your Information
                </h4>

                <div className="bg-light p-4 border border-1 border-black">
                  {/* Company Details */}
                  <h5 className="text-decoration-underline">Company Details</h5>
                  <dl className="row mb-4">
                    <dt className="col-sm-4 mb-3">Name</dt>
                    <dd className="col-sm-8 mb-3">{formData.companyName}</dd>

                    <dt className="col-sm-4 mb-3">Description</dt>
                    <dd className="col-sm-8 mb-3">{formData.description}</dd>

                    <dt className="col-sm-4 mb-3">Registration #</dt>
                    <dd className="col-sm-8 mb-3">
                      {formData.registrationNumber}
                    </dd>

                    <dt className="col-sm-4 mb-3">Incorporation Date</dt>
                    <dd className="col-sm-8 mb-3">
                      {formData.incorporationDate}
                    </dd>

                    <dt className="col-sm-4 mb-3">Company Type</dt>
                    <dd className="col-sm-8 mb-3">{formData.companyType}</dd>
                  </dl>

                  {/* Address */}
                  <h5 className="text-decoration-underline">Address</h5>
                  <dl className="row mb-4">
                    <dt className="col-sm-4 mb-3">Street</dt>
                    <dd className="col-sm-8 mb-3">{formData.address}</dd>

                    <dt className="col-sm-4 mb-3">City</dt>
                    <dd className="col-sm-8 mb-3">{formData.city}</dd>

                    <dt className="col-sm-4 mb-3">State/Province</dt>
                    <dd className="col-sm-8 mb-3">{formData.state}</dd>

                    <dt className="col-sm-4 mb-3">Country</dt>
                    <dd className="col-sm-8 mb-3">{formData.country}</dd>

                    <dt className="col-sm-4 mb-3">Postal Code</dt>
                    <dd className="col-sm-8 mb-3">{formData.postalCode}</dd>
                  </dl>

                  {/* Contact */}
                  <h5 className="text-decoration-underline">Contact</h5>
                  <dl className="row mb-4">
                    <dt className="col-sm-4 mb-3">Email</dt>
                    <dd className="col-sm-8 mb-3">{formData.CompanyEmail}</dd>

                    <dt className="col-sm-4 mb-3">Phone</dt>
                    <dd className="col-sm-8 mb-3">{formData.phone}</dd>

                    {formData.website && (
                      <>
                        <dt className="col-sm-4">Website</dt>
                        <dd className="col-sm-8">
                          <a
                            href={normalizeUrl(formData.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {formData.website}
                          </a>
                        </dd>
                      </>
                    )}
                  </dl>

                  {/* Reps */}
                  {formData.reps && (
                    <>
                      <h5>Company Reps</h5>
                      <ul className="list-group mb-4">
                        {formData.reps.map((r, i) => (
                          <li
                            className="list-group-item border border-1 border-black rounded mb-3"
                            key={i}
                          >
                            <strong>{r.lastName}</strong> &mdash; {r.RepEmail}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-5">
              {step > 1 ? (
                <button
                  type="button"
                  className="btn btn-fillRed border border-1 border-black w-100 transition-icon me-4"
                  onClick={prevStep}
                >
                  <i className="fa fa-arrow-left"></i> <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <button
                  type="button"
                  className="btn btn-fillGreen border border-1 border-black w-100 transition-icon"
                  onClick={nextStep}
                  disabled={!validateStep()}
                >
                  <span>Next</span> <i className="fa fa-arrow-right"></i>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-fillGreen border border-1 border-black w-100 transition-icon"
                  disabled={!validateStep()}
                  onClick={handleSubmit}
                >
                  <i className="fa fa-check"></i> <span>Submit</span>
                </button>
              )}
            </div>
          </form>
          <p className="mt-3 mb-0">
            <span className="text-danger">
              <i className="fa-solid fa-circle-info me-2"></i>
            </span>
            All data is shown publicly for verification purposes.
          </p>
          <p className="mb-0">
            <span className="text-danger">*</span>Shows required fields.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyRegistrationForm;
