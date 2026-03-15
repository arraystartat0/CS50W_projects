import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../services/auth";
import "../assets/css/LoginPage.css";
import validatePassword from "../utils/validatePassword";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

// constants
const PRIVATE_CODE_LENGTH = 8;
const PRIVATE_CODE_REGEX = /[^A-Z0-9]/g;

// private code input component
const PrivateCodeInput = ({ privateCode, onChange, onKeyDown, onPaste, inputRefs }) => (
  <div className="mb-3">
    <label className="form-label fw-light">
      Company Private Code<span className="text-danger">*</span>
    </label>
    <div className="d-flex gap-2">
      {privateCode.map((char, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          className="form-control justify-content-center rounded-0 border border-1 border-black text-center"
          style={{
            width: "2.1rem",
            height: "2.1rem",
            padding: "0rem",
            fontSize: "18px",
            fontWeight: "600",
            textTransform: "uppercase",
            flex: "none",
          }}
          value={char}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={onPaste}
          maxLength="1"
          required
        />
      ))}
    </div>
    <small className="form-text text-muted mt-2">
      Enter the 8-character private code provided by your company
    </small>
  </div>
);

// form input component
const FormInput = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  onBlur, 
  placeholder, 
  required = false,
  error,
  readOnly = false,
  disabled = false,
  className = "col-12"
}) => (
  <div className={`mb-3 ${className}`}>
    <label className="form-label fw-light">
      {label}{required && <span className="text-danger">*</span>}
    </label>
    <input
      type={type}
      name={name}
      className="form-control rounded-0 border border-1 border-black"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      disabled={disabled}
    />
    {error && <small className="text-danger">{error}</small>}
  </div>
);

// loading and error components
const LoadingScreen = () => (
  <div
    className="card-wrapper d-flex justify-content-center align-items-center"
    style={{ height: "100vh" }}
  >
    <h4>Validating invitation...</h4>
  </div>
);

const ErrorScreen = ({ error }) => (
  <div className="card-wrapper pb-5" style={{ paddingTop: "5rem" }}>
    <div className="center-card border border-1 border-black rounded-1 mx-auto text-center">
      <i className="fa-solid fa-circle-xmark fa-4x text-danger mb-3"></i>
      <h2 className="card-heading fw-bold">Invalid Invitation</h2>
      <p className="fw-light">{error}</p>
    </div>
  </div>
);

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // form state
  const [formData, setFormData] = useState({
    token: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    private_code: "",
  });

  // error states
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  // loading states
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // UI states
  const [isTokenFromUrl, setIsTokenFromUrl] = useState(false);

  // private code state
  const [privateCode, setPrivateCode] = useState(Array(PRIVATE_CODE_LENGTH).fill(""));
  const inputRefs = useRef([]);

  // memoized computed values
  const privateCodeStr = useMemo(() => privateCode.join(""), [privateCode]);
  const privateCodeValid = useMemo(() => privateCodeStr.length === PRIVATE_CODE_LENGTH, [privateCodeStr]);

  const validationState = useMemo(() => {
    const hasErrorText = Boolean(passwordError || confirmPasswordError || error);
    const allRequiredFilled = Boolean(
      formData.first_name.trim() &&
      formData.last_name.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.password2 &&
      formData.token
    );
    const passwordValid = !validatePassword(formData.password);
    const passwordsMatch = formData.password === formData.password2;

    return {
      hasErrorText,
      allRequiredFilled,
      passwordValid,
      passwordsMatch,
      isFormInvalid: loading || hasErrorText || !allRequiredFilled || !passwordValid || !passwordsMatch || !privateCodeValid
    };
  }, [formData, passwordError, confirmPasswordError, error, loading, privateCodeValid]);

  // call backs
  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handlePrivateCodeChange = useCallback((index, value) => {
    const sanitizedValue = value.toUpperCase().replace(PRIVATE_CODE_REGEX, "");

    if (sanitizedValue.length <= 1) {
      setPrivateCode(prev => {
        const newCode = [...prev];
        newCode[index] = sanitizedValue;
        return newCode;
      });

      // move to next input if character was entered
      if (sanitizedValue && index < PRIVATE_CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  }, []);

  const handlePrivateCodeKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace" && !privateCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < PRIVATE_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [privateCode]);

  const handlePrivateCodePaste = useCallback((e) => {
    e.preventDefault();
    const pastedText = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(PRIVATE_CODE_REGEX, "");

    if (pastedText.length <= PRIVATE_CODE_LENGTH) {
      const newCode = Array(PRIVATE_CODE_LENGTH).fill("");
      for (let i = 0; i < PRIVATE_CODE_LENGTH; i++) {
        newCode[i] = pastedText[i] || "";
      }
      setPrivateCode(newCode);

      // focus on the next empty input or the last one
      const nextEmptyIndex = newCode.findIndex((char) => char === "");
      const focusIndex = nextEmptyIndex === -1 ? PRIVATE_CODE_LENGTH - 1 : Math.min(nextEmptyIndex, PRIVATE_CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  }, []);

  const handlePasswordBlur = useCallback(() => {
    const err = validatePassword(formData.password);
    setPasswordError(err || "");
    
    // re-validate password match if confirmation has value
    if (formData.password2) {
      setConfirmPasswordError(
        formData.password !== formData.password2 ? "Passwords do not match." : ""
      );
    }
  }, [formData.password, formData.password2]);

  const handleConfirmBlur = useCallback(() => {
    if (formData.password2) {
      setConfirmPasswordError(
        formData.password !== formData.password2 ? "Passwords do not match." : ""
      );
    }
  }, [formData.password, formData.password2]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Clear all errors
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");

    // validate password requirements
    const passwordErr = validatePassword(formData.password);
    if (passwordErr) {
      setPasswordError(passwordErr);
      return;
    }

    if (formData.password !== formData.password2) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    if (!formData.token) {
      setError("Invitation Token is required.");
      return;
    }

    if (formData.private_code.length !== PRIVATE_CODE_LENGTH) {
      setError("Private Code must be exactly 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { password2, ...payload } = formData;
      const result = await authService.acceptInvitation(payload);
      
      if (result.success) {
        navigate("/registration-success", {
          state: { user: result.data.user, message: result.data.message },
        });
      } else {
        setError(result.error);
        alert(`Registration failed: ${result.error}`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  // effects
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (tokenFromUrl) {
      setIsTokenFromUrl(true);

      const validateToken = async () => {
        try {
          const result = await authService.validateInvitation(tokenFromUrl);
          if (result.success) {
            setFormData(prev => ({ ...prev, token: tokenFromUrl }));
          } else {
            setValidationError(result.error);
          }
        } catch (err) {
          setValidationError("Failed to validate invitation token.");
          console.error("Token validation error:", err);
        } finally {
          setIsValidating(false);
        }
      };

      validateToken();
    } else {
      setIsValidating(false);
    }
  }, [searchParams]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, private_code: privateCodeStr }));
  }, [privateCodeStr]);

  // clear general error when form data changes
  useEffect(() => {
    if (error) setError("");
  }, [formData, privateCode, error]);

  // Conditional rendering
  if (isValidating) return <LoadingScreen />;
  if (validationError) return <ErrorScreen error={validationError} />;

  return (
    <>
      <NavBar />

      <div className="card-wrapper pb-5" style={{ paddingTop: "5rem" }}>
        <div className="center-card border border-1 border-black rounded-1 mx-auto">
          <h2 className="card-heading fw-light">Accept Invitation</h2>
          <p className="fw-light">
            Complete your registration as a Company Representative.
          </p>
          
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Invitation Token"
              name="token"
              value={formData.token}
              onChange={handleChange}
              placeholder={isTokenFromUrl ? "" : "Enter your invitation token"}
              required
              readOnly={isTokenFromUrl}
              disabled={isTokenFromUrl}
            />

            <PrivateCodeInput
              privateCode={privateCode}
              onChange={handlePrivateCodeChange}
              onKeyDown={handlePrivateCodeKeyDown}
              onPaste={handlePrivateCodePaste}
              inputRefs={inputRefs}
            />

            <div className="row">
              <FormInput
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                required
                className="col-md-6"
              />
              <FormInput
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="col-md-6"
              />
            </div>

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="johndoe@example.com"
              required
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handlePasswordBlur}
              placeholder="***********"
              required
              error={passwordError}
            />

            <FormInput
              label="Re-enter Password"
              name="password2"
              type="password"
              value={formData.password2}
              onChange={handleChange}
              onBlur={handleConfirmBlur}
              placeholder="***********"
              required
              error={confirmPasswordError}
            />

            {error && (
              <div className="bg-rejected border border-1 border-black rounded-0 py-3">
                {error}
              </div>
            )}

            <div className="d-flex justify-content-end mt-5">
              <button
                type="submit"
                className="btn btn-fillGreen border border-1 border-black w-100 transition-icon"
                disabled={validationState.isFormInvalid}
              >
                <span>
                  {loading ? "Registering..." : "Complete Registration"}
                </span>
                <i className="fa-solid fa-chevron-right icon-default pt-1 fa-2xs"></i>
                <i className="fa-solid fa-arrow-right-to-bracket icon-hover pt-1 fa-2xs"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

    <Footer />
    </>
  );
};

export default AcceptInvitation;