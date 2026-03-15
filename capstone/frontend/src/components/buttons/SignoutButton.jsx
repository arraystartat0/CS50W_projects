import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import "../../assets/css/SignoutButton.css"

const SignoutButton = ({ className = "", showText = false, variant = "default" }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const baseClasses = "text-black signout-btn border border-1 border-black";

  return (
    <button
      className={`${baseClasses}${className}`}
      onClick={handleSignout}
      title="Sign Out"
    >
      <i className="fa-solid fa-arrow-right-from-bracket"></i>
      {showText && <span>Sign Out</span>}
    </button>
  );
};

export default SignoutButton;