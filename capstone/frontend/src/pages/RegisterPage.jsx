import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import countryList from "react-select-country-list";
import "../assets/css/LoginPage.css";
import authService from "../services/auth";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [applicantData, setApplicantData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    phone_number: "",
    city: "",
    state: "",
    country: "",
  });

  const handleLogout = () => {
    logout(); // clear the auth
    navigate("/login"); // redirect to login
  };

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { register, isAuthenticated, userType: currentUserType } = useAuth();

  // memoized country options
  const countryOptions = useMemo(() => countryList().getData(), []);

  // memoized validation rules
  const validationRules = useMemo(
    () => ({
      first_name: {
        required: true,
        minLength: 2,
        messages: {
          required: "First Name is required.",
          minLength: "First name must be at least 2 characters long.",
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
      password: {
        required: true,
        minLength: 8,
        patterns: {
          uppercase: /[A-Z]/,
          lowercase: /[a-z]/,
          digit: /[0-9]/,
          special: /[^A-Za-z0-9]/,
        },
        messages: {
          required: "Password is required.",
          minLength: "Password must be at least 8 characters long.",
          uppercase: "Password must contain at least one uppercase letter.",
          lowercase: "Password must contain at least one lowercase letter.",
          digit: "Password must contain at least one digit.",
          special: "Password must contain at least one special character.",
        },
      },
      password2: {
        required: true,
        matchField: "password",
        messages: {
          required: "Confirm Password is required.",
          match: "Passwords do not match.",
        },
      },
      phone_number: {
        pattern: /^\+?[0-9]{7,15}$/,
        messages: {
          pattern: "Phone number is invalid.",
        },
      },
      country: {
        required: true,
        messages: {
          required: "Country is required.",
        },
      },
    }),
    []
  );

  // memoized submit button disabled state
  const isSubmitDisabled = useMemo(() => {
    const hasErrors = Object.values(formErrors).some((error) => error !== "");

    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "password",
      "password2",
      "country",
    ];
    const isIncomplete = requiredFields.some(
      (field) => !applicantData[field]?.trim()
    );

    return loading || hasErrors || isIncomplete;
  }, [formErrors, applicantData, loading]);

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

      // password specific validations
      if (fieldName === "password" && rules.patterns) {
        for (const [type, pattern] of Object.entries(rules.patterns)) {
          if (!pattern.test(trimmedValue)) {
            return rules.messages[type];
          }
        }
      }

      // match field validation (for password confirmation)
      if (
        rules.matchField &&
        trimmedValue !== applicantData[rules.matchField]
      ) {
        return rules.messages.match;
      }

      return "";
    },
    [validationRules, applicantData]
  );

  useEffect(() => {
    if (isAuthenticated) {
      setError("You are already logged in. Please log out before registering.");
    }
  }, [isAuthenticated]);

  // form change handler
  const handleFormChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setApplicantData((prev) => ({ ...prev, [name]: value }));

      // clear field error when user starts typing
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }

      // clear general error
      if (error) {
        setError("");
      }
    },
    [formErrors, error]
  );

  // blur handler
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      const fieldError = validateField(name, value);

      setFormErrors((prev) => ({ ...prev, [name]: fieldError }));

      // special handling for password confirmation when password changes for good UX
      if (name === "password" && applicantData.password2) {
        const password2Error = validateField(
          "password2",
          applicantData.password2
        );
        setFormErrors((prev) => ({ ...prev, password2: password2Error }));
      }
    },
    [validateField, applicantData.password2]
  );

  // validate entire form
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(applicantData).forEach((fieldName) => {
      const fieldError = validateField(fieldName, applicantData[fieldName]);
      if (fieldError) {
        errors[fieldName] = fieldError;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  }, [applicantData, validateField]);

  // form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      try {
        const result = await authService.registerApplicant(applicantData);

        if (result.success) {
          navigate("/registration-success", {
            state: {
              applicant: {
                first_name: applicantData.first_name,
                last_name: applicantData.last_name,
                email: applicantData.email,
              },
            },
          });
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [applicantData, validateForm, navigate]
  );

  // navigation handler
  const handleCompanyRegisterClick = useCallback(() => {
    navigate("/register/company");
  }, [navigate]);

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
        rows = null,
        isTextarea = false,
        isSelect = false,
        options = [],
        colClass = "col-12",
      } = fieldConfig;

      const fieldProps = {
        name,
        className: `form-control rounded-0 border border-1 border-black ${
          formErrors[name] ? "is-invalid" : ""
        }`,
        onChange: handleFormChange,
        onBlur: handleBlur,
        value: applicantData[name],
        ...(required && { required: true }),
        ...(placeholder && { placeholder }),
        ...(rows && { rows }),
      };

      return (
        <div className={colClass} key={name}>
          <label className="form-label fw-light">
            {icon && <i className={`${icon} me-2`}></i>}
            {label}
            {required && <span className="text-danger">*</span>}
          </label>

          {isTextarea ? (
            <textarea {...fieldProps} />
          ) : isSelect ? (
            <select {...fieldProps}>
              <option value="">Select {label.toLowerCase()}</option>
              {options.map(({ label: optionLabel, value: optionValue }) => (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              ))}
            </select>
          ) : (
            <input {...fieldProps} type={type} />
          )}

          {formErrors[name] && (
            <div className="invalid-feedback">{formErrors[name]}</div>
          )}
        </div>
      );
    },
    [applicantData, formErrors, handleFormChange, handleBlur]
  );

  // form field configurations
  const formFields = useMemo(
    () => [
      {
        name: "first_name",
        label: "First Name",
        icon: "fa-solid fa-user",
        required: true,
        colClass: "col-md-6",
      },
      {
        name: "last_name",
        label: "Last Name",
        icon: "fa-solid fa-user",
        required: true,
        colClass: "col-md-6",
      },
      {
        name: "phone_number",
        type: "tel",
        label: "Phone Number",
        icon: "fa-solid fa-phone",
        colClass: "col-12",
      },
      {
        name: "email",
        type: "email",
        label: "Email Address",
        icon: "fa-solid fa-envelope",
        required: true,
        colClass: "col-12",
      },
      {
        name: "password",
        type: "password",
        label: "Password",
        icon: "fa-solid fa-lock",
        required: true,
        colClass: "col-md-6",
      },
      {
        name: "password2",
        type: "password",
        label: "Confirm Password",
        icon: "fa-solid fa-lock",
        required: true,
        colClass: "col-md-6",
      },
      {
        name: "city",
        label: "City",
        icon: "fa-solid fa-city",
        colClass: "col-md-12",
      },
      {
        name: "state",
        label: "State/Province",
        icon: "fa-solid fa-map-marked-alt",
        colClass: "col-md-12",
      },
      {
        name: "country",
        label: "Country",
        icon: "fa fa-globe",
        required: true,
        isSelect: true,
        options: countryOptions,
        colClass: "col-12",
      },
    ],
    [countryOptions]
  );

  return (
    <>
      <NavBar />
      {/* Main Content */}
      <div className="card-wrapper">
        <div
          className="center-card border border-1 border-black rounded-1"
          style={{ maxWidth: "600px" }}
        >
          <h2 className="card-heading fw-light">Register Your Account</h2>

          <div className="tab-nav">
            <button className="tab-btn active" disabled>
              Applicant
            </button>
            <button
              className="tab-btn fw-light"
              onClick={handleCompanyRegisterClick}
            >
              Company
            </button>
          </div>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}{" "}
              {isAuthenticated && (
                <button
                  className="btn btn-link p-0 ms-1 text-decoration-underline"
                  onClick={handleLogout}
                  style={{ fontSize: "0.95rem" }}
                >
                  Log out
                </button>
              )}
            </div>
          )}
          {!isAuthenticated && (
            <form
              onSubmit={handleSubmit}
              className="login-form mt-3"
              noValidate
            >
              <div className="row mb-3">
                {formFields.slice(0, 2).map(renderField)}
              </div>

              <div className="mb-3">{renderField(formFields[2])}</div>

              <div className="mb-3">{renderField(formFields[3])}</div>

              <div className="row mb-3">
                {formFields.slice(4, 6).map(renderField)}
              </div>

              <div className="mb-3">{renderField(formFields[6])}</div>

              <div className="row">
                {formFields.slice(7, 8).map(renderField)}
              </div>

              <div className="mb-3">{renderField(formFields[8])}</div>

              <button
                type="submit"
                className="btn btn-fillGreen border border-1 border-black w-100 transition-icon mt-3"
                disabled={isSubmitDisabled}
              >
                <span>
                  {loading ? "Registering..." : "Create Applicant Account"}
                </span>
                <i className="fa-solid fa-chevron-right icon-default pt-1 fa-xs"></i>
                <i className="fa-solid fa-pencil icon-hover pt-1 fa-xs"></i>
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RegisterPage;
