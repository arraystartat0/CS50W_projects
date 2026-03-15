import React, { useEffect, useState } from "react";
import "../assets/css/LandingPage.css";
import "../assets/css/LoadingSpinner.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import usePageLoading from "../hooks/usePageLoading";

const FlowPage = () => {
  const isPageLoading = usePageLoading([], 600);

  useEffect(() => {
    const fadeEls = document.querySelectorAll(".fade-in");
    fadeEls.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.3}s`;
      el.classList.add("visible");
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".nav-tra`nsition");
      if (window.pageYOffset > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isPageLoading) {
    return <LoadingSpinner message="Loading flow..." />;
  }

  return (
    <div className="container-fluid landing-page gx-0 text-dark">
      <NavBar />
      <div className="landing-wrapper">
        {/* Hero Section */}
        <section className="hero-section position-relative py-5 mb-5 text-dark">
          <div className="container position-relative">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0 fade-in">
                <h1 className="display-3 fw-bold clip-heading mb-3">
                  One platform, <br className="d-none d-lg-block" />
                  <span className="fw-light">endless opportunities.</span>
                </h1>
                <p className="lead mb-4">
                  Say goodbye to scattered applications across multiple portals.
                  HireFlow unifies the entire internship application process,
                  making it seamless for applicants and efficient for companies.
                </p>
                <div className="d-flex flex-column flex-md-row align-items-start gap-2">
                  <a
                    href="#applicant-flow"
                    className="btn-3d pe-5 transition-icon"
                  >
                    See how it works
                    <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                    <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                  </a>
                  <a
                    href="#company-flow"
                    className="btn btn-non-emphasis text-decoration-none btn-link ps-1 pt-2 ps-md-3 pe-md-2 my-md-1 text-dark"
                  >
                    For Companies
                    <i className="fa-solid fa-arrow-down fa-xs ms-2"></i>
                  </a>
                </div>
              </div>

              <div className="col-lg-6 fade-in text-end">
                <img
                  src="../src/assets/img/flow 1.svg"
                  alt="Application Flow"
                  className="img-fluid mt-3 mt-md-0 rounded"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="section-spacer"></div>

      {/* Applicant Flow Section */}
      <section className="about-section bg-hireFlow-green" id="applicant-flow">
        <div className="container">
          <div className="row align-items-center about-row">
            <div className="col-12 col-md-5 offset-md-1 order-1 text-center text-md-start order-md-1 fade-in">
              <h1 className="display-3 fw-bold clip-heading mb-3">
                For Applicants
              </h1>
              <p className="lead">
                No more juggling multiple portals, different formats, and
                scattered application statuses. Everything you need in one
                place.
              </p>
            </div>
            <div className="col-12 col-md-5 offset-md-1 order-2 order-md-2 fade-in">
              <img
                src="../src/assets/img/flow 2.svg"
                alt="Applicant Flow"
                className="img-fluid mt-5 mt-md-0 rounded"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>

          {/* Applicant Steps */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="row g-4">
                <div className="col-md-4 fade-in">
                  <div className="card border border-2 border-black unround h-100 flow-card">
                    <div className="card-body text-center">
                      <div className="step-number mb-3">1</div>
                      <h5 className="card-title">Create Profile</h5>
                      <p className="card-text">
                        Set up your profile once with all your details, skills,
                        and preferences. No need to repeat this information for
                        every application.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 fade-in">
                  <div className="card border border-2 border-black unround h-100 flow-card">
                    <div className="card-body text-center">
                      <div className="step-number mb-3">2</div>
                      <h5 className="card-title">View & Apply</h5>
                      <p className="card-text">
                        View the listing/company details page redirected from the
                        company's website and apply to the most suitable role available.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 fade-in">
                  <div className="card border border-2 border-black unround h-100 flow-card">
                    <div className="card-body text-center">
                      <div className="step-number mb-3">3</div>
                      <h5 className="card-title">Track Progress</h5>
                      <p className="card-text">
                        Monitor all your applications in one dashboard. Get
                        real-time updates on your application status and next
                        steps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer-slashed"></div>

      {/* Company Flow Section */}
      <section className="more-section-1" id="company-flow">
        <div className="container">
          <div className="section-header text-center fade-in">
            <h1 className="display-3 fw-bold clip-heading m-0">
              For Companies
            </h1>
            <h4 className="text-muted fw-light m-0">
              Streamlined hiring process for your team
            </h4>
          </div>

          <div className="row align-items-center mt-5">
            <div className="col-12 col-md-5 offset-md-1 order-1 text-center text-md-start order-md-1 fade-in">
              <h1 className="fw-bold fs-4 text-decoration-underline mb-3">
                Simplified Management
              </h1>
              <p className="lead">
                Manage all your internship postings, applications, and candidate
                communications from one centralized platform. No more scattered
                systems or lost applications.
              </p>
            </div>
            <div className="col-12 col-md-5 offset-md-1 order-2 order-md-2 fade-in">
              <img
                src="../src/assets/img/flow 3.svg"
                alt="Company Flow"
                className="img-fluid mt-3 mt-md-0 rounded"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>

          {/* Company Steps */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="row g-4">
                <div className="col-md-3 fade-in">
                  <div className="card border border-2 border-black unround h-100 flow-card">
                    <div className="card-body text-center">
                      <div className="step-number mb-3">1</div>
                      <h5 className="card-title">Setup Company</h5>
                      <p className="card-text">
                        Register your company and get your unique public/private
                        keys for secure access and integration.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 fade-in">
                  <div className="card border border-2 border-black unround h-100 flow-card">
                    <div className="card-body text-center">
                      <div className="step-number mb-3">2</div>
                      <h5 className="card-title">Add Representatives</h5>
                      <p className="card-text">
                        Invite team members to manage applications. Each rep
                        gets their own dashboard with appropriate permissions.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 fade-in">
                  <div className="card border border-2 border-black unround h-100 flow-card">
                    <div className="card-body text-center">
                      <div className="step-number mb-3">3</div>
                      <h5 className="card-title">Create Postings</h5>
                      <p className="card-text">
                        Create detailed internship postings with requirements,
                        responsibilities, and application deadlines.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 fade-in">
                  <div className="card border border-2 border-black unround h-100 flow-card">
                    <div className="card-body text-center">
                      <div className="step-number mb-3">4</div>
                      <h5 className="card-title">Review & Select</h5>
                      <p className="card-text">
                        Review applications, schedule interviews, and manage the
                        entire selection process from one platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer"></div>

      {/* Representative Flow Section */}
      <section className="more-section-2">
        <div className="container">
          <div className="section-header text-start fade-in">
            <h1 className="display-3 fw-bold clip-heading m-0">
              For Representatives
            </h1>
          </div>
          <div className="row align-items-center mt-5">
            <div className="col-12 col-md-4 order-1 ps-md-0 text-center text-md-start fade-in">
              <div className="card border border-2 border-black unround mb-4 vision-card h-100">
                <div className="card-body d-flex flex-column">
                  <img
                    src="../src/assets/img/flow 4.svg"
                    alt="Representative Dashboard"
                    className="card-img-top"
                  />
                  <h5 className="card-title">Personal Dashboard</h5>
                  <p className="card-text">
                    Access your personalized dashboard with all assigned
                    applications, interview schedules, and candidate
                    communications in one place.
                  </p>
                  <div className="mt-auto text-center text-md-end">
                    <a href="/register" className="btn-3d-sm transition-icon">
                      <span className="me-4">Get Started</span>
                      <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                      <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column */}
            <div className="col-12 col-md-4 order-2 text-center text-md-start fade-in">
              <div className="card border border-2 border-black unround mb-4 vision-card h-100">
                <div className="card-body d-flex flex-column">
                  <img
                    src="../src/assets/img/flow 5.svg"
                    alt="Application Review"
                    className="card-img-top"
                  />
                  <h5 className="card-title">Efficient Review</h5>
                  <p className="card-text">
                    Review applications with standardized formats, filter by
                    criteria, and provide feedback all from your dashboard.
                  </p>
                  <div className="mt-auto text-center text-md-end">
                    <a href="/register" className="btn-3d-sm transition-icon">
                      <span className="me-4">Join Now</span>
                      <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                      <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-12 col-md-4 order-3 pe-md-0 text-center text-md-start fade-in">
              <div className="card border border-2 border-black unround mb-4 vision-card h-100">
                <div className="card-body d-flex flex-column">
                  <img
                    src="../src/assets/img/flow 6.svg"
                    alt="Communication"
                    className="card-img-top mb-4"
                  />
                  <h5 className="card-title">Seamless Communication</h5>
                  <p className="card-text">
                    Communicate with candidates, schedule interviews, and send
                    status updates through integrated messaging system.
                  </p>
                  <div className="mt-auto text-center text-md-end">
                    <a href="/register" className="btn-3d-sm transition-icon">
                      <span className="me-4">Register</span>
                      <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                      <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="about-section bg-hireFlow-green">
        <div className="container">
          <div className="section-header text-center fade-in">
            <h1 className="display-3 fw-bold clip-heading m-0">
              Why Choose HireFlow?
            </h1>
            <h4 className="text-muted fw-light m-0">
              Built for simplicity and efficiency
            </h4>
          </div>

          <div className="row mt-5">
            <div className="col-md-6 fade-in">
              <div className="benefit-item mb-4">
                <div className="d-flex align-items-start">
                  <div className="benefit-icon me-3">
                    <i className="fa-solid fa-universal-access fa-2x text-hireFlow-green-dark"></i>
                  </div>
                  <div>
                    <h5>Universal Access</h5>
                    <p className="text-muted">
                      One profile works for all companies. No more creating
                      multiple accounts or repeating information.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 fade-in">
              <div className="benefit-item mb-4">
                <div className="d-flex align-items-start">
                  <div className="benefit-icon me-3">
                    <i className="fa-solid fa-chart-line fa-2x text-hireFlow-green-dark"></i>
                  </div>
                  <div>
                    <h5>Real-time Tracking</h5>
                    <p className="text-muted">
                      Track application status, interview schedules, and
                      feedback in real-time across all applications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 fade-in">
              <div className="benefit-item mb-4">
                <div className="d-flex align-items-start">
                  <div className="benefit-icon me-3">
                    <i className="fa-solid fa-shield-halved fa-2x text-hireFlow-green-dark"></i>
                  </div>
                  <div>
                    <h5>Secure & Reliable</h5>
                    <p className="text-muted">
                      Enterprise-grade security with unique keys for each
                      company, ensuring data privacy and integrity.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 fade-in">
              <div className="benefit-item mb-4">
                <div className="d-flex align-items-start">
                  <div className="benefit-icon me-3">
                    <i className="fa-solid fa-clock fa-2x text-hireFlow-green-dark"></i>
                  </div>
                  <div>
                    <h5>Time-Saving</h5>
                    <p className="text-muted">
                      Reduce application time by 80% with pre-filled profiles
                      and standardized application processes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FlowPage;
