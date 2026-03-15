import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import './assets/css/LoadingSpinner.css';

// Eager load LandingPage (and its CSS is imported in the file)
import LandingPage from './pages/LandingPage';

// Lazy load the rest of the pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const StoryPage = lazy(() => import('./pages/StoryPage'));
const FlowPage = lazy(() => import('./pages/FlowPage'));

// Registration pages
const RegisterCompanyPage = lazy(() => import('./pages/CompanyRegistration'));
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'));
const RegisterApplicantPage = lazy(() => import('./pages/RegisterPage'));
const AcceptInvitationPage = lazy(() => import('./pages/AcceptInvitation'));

// Admin Dashboard
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
//const AdminRepresentatives = lazy(() => import('./pages/admin/Representatives'));
//const AdminPostings = lazy(() => import('./pages/admin/Postings'));

// Representative Dashboard
const RepDashboard = lazy(() => import('./pages/rep/Dashboard'));
const RepListings = lazy(() => import('./pages/rep/Listings'));
const RepApplications = lazy(() => import('./pages/rep/Applications'));

// Applicant Dashboard
const ApplicantDashboard = lazy(() => import('./pages/applicant/Dashboard'));
const ApplicantApplications = lazy(() => import('./pages/applicant/Applications'));
const ApplicantWatchlist = lazy(() => import('./pages/applicant/Watchlist'));
const ApplicantSelf = lazy(() => import('./pages/applicant/Self'));

// Public pages
const PublicListing = lazy(() => import('./pages/PublicListing'));
const PublicCompany = lazy(() => import('./pages/PublicCompany'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/our-story" element={<StoryPage />} />
            <Route path="/flow" element={<FlowPage />} />
            
            {/* Registration Routes */}
            <Route path="/register/company" element={<RegisterCompanyPage />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/register/applicant" element={<RegisterApplicantPage />} />
            <Route path="/invitation/accept" element={<AcceptInvitationPage />} />
            
            {/* Public Listing & Company Views */}
            <Route path="/listing/:uid" element={<PublicListing />} />
            <Route path="/company/:publicKey" element={<PublicCompany />} />
            <Route path="/verify" element={<VerificationPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedUserTypes={['admin']}><AdminDashboard /></ProtectedRoute>} />
            
            {/* Representative Routes */}
            <Route 
              path="/rep" 
              element={
                <ProtectedRoute allowedUserTypes={['representative']}>
                  <RepDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rep/my-listings" 
              element={
                <ProtectedRoute allowedUserTypes={['representative']}>
                  <RepListings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rep/applications" 
              element={
                <ProtectedRoute allowedUserTypes={['representative']}>
                  <RepApplications />
                </ProtectedRoute>
              } 
            />
            
            {/* Applicant Routes */}
            <Route 
              path="/applicant" 
              element={
                <ProtectedRoute allowedUserTypes={['applicant']}>
                  <ApplicantDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/applications" 
              element={
                <ProtectedRoute allowedUserTypes={['applicant']}>
                  <ApplicantApplications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/my-watchlist" 
              element={
                <ProtectedRoute allowedUserTypes={['applicant']}>
                  <ApplicantWatchlist />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applicant/me" 
              element={
                <ProtectedRoute allowedUserTypes={['applicant']}>
                  <ApplicantSelf />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;