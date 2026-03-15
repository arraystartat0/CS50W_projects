import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CopyTextToClipboard from "../utils/copy";
import "../assets/css/LoginPage.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

// constants
const COPY_FEEDBACK_DURATION = 2000;

// reusable Components
const CopyButton = ({ text, copyKey, copiedStates, onCopy, label = "Copy" }) => {
  const isCopied = copiedStates[copyKey];
  
  return (
    <button
      className="btn btn-sm btn-fillGreen border border-1 border-black transition-icon rounded-0"
      onClick={() => onCopy(text, copyKey)}
    >
      <span>{isCopied ? "Copied!" : label}</span>
    </button>
  );
};

const CompanyKeyRow = ({ label, value, copyKey, copiedStates, onCopy }) => (
  <>
    <dt className="col-sm-4">{label}</dt>
    <dd className="col-sm-8 d-flex justify-content-between align-items-center">
      <code className="fs-5 mb-3">{value}</code>
      <CopyButton
        text={value}
        copyKey={copyKey}
        copiedStates={copiedStates}
        onCopy={onCopy}
      />
    </dd>
  </>
);

const InvitationLink = ({ invite, index, copiedStates, onCopy }) => (
  <li className="list-group-item border border-1 border-black p-2 rounded-0 mb-2">
    <strong>For:</strong> {invite.email}
    <div className="d-flex flex-column">
      <div className="mt-2">
        <a
          href={invite.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.9rem",
            wordBreak: "break-all",
          }}
        >
          {invite.link}
        </a>
      </div>
      <div className="mt-2">
        <CopyButton
          text={invite.link}
          copyKey={`link-${index}`}
          copiedStates={copiedStates}
          onCopy={onCopy}
          label="Copy Link"
        />
      </div>
    </div>
  </li>
);

const SuccessMessage = ({ registrationType, data }) => {
  switch (registrationType) {
    case 'company':
      return (
        <p className="fw-light">
          Your company, <strong>{data.company.name}</strong>, has been
          registered. Welcome to the HireFlow team!
        </p>
      );
    case 'representative':
      return (
        <p className="fw-light">
          Welcome, <strong>{data.user.first_name}</strong>! Your
          representative account has been created successfully.
        </p>
      );
    case 'applicant':
      return (
        <p className="fw-light">
          Welcome, <strong>{data.applicant.first_name} {data.applicant.last_name}</strong>! Your
          applicant account has been created successfully.
        </p>
      );
    default:
      return null;
  }
};

const CompanyRegistrationContent = ({ company, invitation_links, copiedStates, onCopy }) => (
  <>
    <div className="bg-light p-3 border border-1 border-black rounded-1 mb-4">
      <h5 className="fw-bold">Your Company Codes</h5>
      <div className="bg-hireFlow-green py-3 px-2 rounded-1 mb-3">
        <i className="fa-solid fa-circle-info text-center"></i>
        <p className="text-muted mb-0">
          The private key is required for representatives to register,
          kindly share it with them along with the links.
        </p>
        <p className="text-muted mb-0 mt-2">
          The public key is an identifier used to search for your
          company on our platform. It will be used in your hiring
          links too!
        </p>
        <p className="text-muted mb-0 mt-2">
          These are both accessible on your dashboard.
        </p>
      </div>
      <dl className="row">
        <CompanyKeyRow
          label="Public Key"
          value={company.public_key}
          copyKey="public"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <CompanyKeyRow
          label="Private Key"
          value={company.private_key}
          copyKey="private"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </dl>
    </div>

    <div className="bg-light p-3 border border-1 border-black rounded-1">
      <h5 className="fw-bold">Representative Invitation Links</h5>
      <p className="text-muted">
        These are one-time use links. Send each link to the
        corresponding representative.
      </p>
      <ul className="list-group">
        {invitation_links.map((invite, index) => (
          <InvitationLink
            key={index}
            invite={invite}
            index={index}
            copiedStates={copiedStates}
            onCopy={onCopy}
          />
        ))}
      </ul>
    </div>
  </>
);

const RepresentativeRegistrationContent = () => (
  <div className="text-center">
    <p>You may now log in with your credentials to access your company dashboard.</p>
  </div>
);

const ApplicantRegistrationContent = () => (
  <div className="bg-light p-3 border border-1 border-black rounded-1 mb-4">
    <h5 className="fw-bold">Next Steps</h5>
    <div className="text-start">
      <p className="mb-3">
        <i className="fa-solid fa-user-circle me-2 text-success"></i>
        You can now log in to your account and start applying for internships.
      </p>
      <p className="mb-0">
        <i className="fa-solid fa-search me-2 text-info"></i>
        Explore internship opportunities and build your professional profile.
      </p>
    </div>
  </div>
);

const RegistrationSuccess = () => {
  const [copiedStates, setCopiedStates] = useState({});
  const { state } = useLocation();
  const navigate = useNavigate();

  // memoized registration type detection with null check
  const registrationType = useMemo(() => {
    if (!state) return null;
    if (state.company) return 'company';
    if (state.user) return 'representative';
    if (state.applicant) return 'applicant';
    return null;
  }, [state]);

  // callbacks
  const handleCopy = useCallback(async (text, key) => {
    try {
      const success = await CopyTextToClipboard(text);
      if (success) {
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        
        // Reset copied state after delay
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, COPY_FEEDBACK_DURATION);
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, []);

  const handleLoginRedirect = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  // effects
  useEffect(() => {
    if (!state) {
      navigate("/register/applicant");
    }
  }, [state, navigate]);

  // Early return if no state (this will prevent rendering while redirect is happening)
  if (!state) {
    return null;
  }

  const { company, invitation_links, applicant } = state;

  // Content renderer based on registration type
  const renderContent = () => {
    switch (registrationType) {
      case 'company':
        return (
          <CompanyRegistrationContent
            company={company}
            invitation_links={invitation_links}
            copiedStates={copiedStates}
            onCopy={handleCopy}
          />
        );
      case 'representative':
        return <RepresentativeRegistrationContent />;
      case 'applicant':
        return <ApplicantRegistrationContent />;
      default:
        return null;
    }
  };

  return (
    <>
      <NavBar />
      <div className="card-wrapper pb-5" style={{ paddingTop: "5rem" }}>
        <div className="center-card border border-1 border-black rounded-1 mx-auto card-wide">
          <div className="text-center">
            <i className="fa-solid fa-circle-check fa-4x text-success mb-3"></i>
            <h2 className="card-heading fw-bold">Registration Successful!</h2>
            <SuccessMessage registrationType={registrationType} data={state} />
          </div>

          <hr />

          {renderContent()}

          <div className="text-center mt-4">
            <button
              className="btn btn-fillGreen border border-1 border-black transition-icon"
              onClick={handleLoginRedirect}
            >
              <span className="me-4">Proceed to Login</span>
              <i className="fa-solid fa-arrow-right icon-default"></i>
              <i className="fa-solid fa-arrow-right-to-bracket icon-hover"></i>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegistrationSuccess;