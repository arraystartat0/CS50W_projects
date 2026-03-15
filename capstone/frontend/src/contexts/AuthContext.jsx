import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import { ScaleLoader } from 'react-spinners';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider'); // debugging if a component tries to use useAuth() but it's not wrapped inside an AuthProvider
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true); // flag for auth process status for smoother loading ui 

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);
        setUserType(authService.getUserType());
        setUserProfile(authService.getUserProfile());
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, userType) => {
    const result = await authService.login(email, password, userType);
    
    if (result.success) {
      setIsAuthenticated(true);
      setUserType(result.data.user_type);
      setUserProfile(result.data.profile);
      return { success: true };
    }
    
    return { success: false, error: result.error };
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserType(null);
    setUserProfile(null);
  };

  const registerCompany = async (companyData, adminData, createRepAccount) => {
    return await authService.registerCompany(companyData, adminData, createRepAccount);
  };

  const registerApplicant = async (userData) => {
    return await authService.registerApplicant(userData);
  };

  const value = {
    isAuthenticated,
    userType,
    userProfile,
    loading,
    login,
    logout,
    registerCompany,
    registerApplicant
  };

  if (loading) {
    return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <ScaleLoader
          color={"#AACDBE"} 
          loading={true}     
          height={35}        // height of the bars
          width={4}          // width of each bar
          margin={2}         // space between bars
          radius={2}         // border radius of bars
          speedMultiplier={1} // speed 
          aria-label="Loading Spinner" 
          data-testid="loader" 
        />
      </div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};