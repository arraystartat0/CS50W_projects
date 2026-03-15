import React, { useEffect, useState } from "react";
import "../assets/css/LandingPage.css";
import "../assets/css/LoadingSpinner.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import usePageLoading from "../hooks/usePageLoading";

const StoryPage = () => {
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
      const navbar = document.querySelector(".nav-transition");
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
    return <LoadingSpinner message="Loading our story..." />;
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
                  Our Story <br className="d-none d-lg-block" />
                  <span className="fw-light">begins with frustration.</span>
                </h1>
                <p className="lead mb-4">
                  Like many students, I found myself drowning in a sea of
                  different application portals, each with their own unique
                  requirements and formats. There had to be a better way.
                </p>
                <div className="d-flex flex-column flex-md-row align-items-start gap-2">
                  <a
                    href="#the-problem"
                    className="btn-3d pe-5 transition-icon"
                  >
                    Read our story
                    <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                    <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                  </a>
                  <a
                    href="#our-mission"
                    className="btn btn-non-emphasis text-decoration-none btn-link ps-1 pt-2 ps-md-3 pe-md-2 my-md-1 text-dark"
                  >
                    Our Mission
                    <i className="fa-solid fa-arrow-down fa-xs ms-2"></i>
                  </a>
                </div>
              </div>

              <div className="col-lg-6 fade-in text-end">
                <img
                  src="../src/assets/img/story 1.svg"
                  alt="Our Story"
                  className="img-fluid mt-3 mt-md-0 rounded"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="section-spacer"></div>

      {/* The Problem Section */}
      <section className="about-section bg-hireFlow-green" id="the-problem">
        <div className="container">
          <div className="row align-items-center about-row">
            <div className="col-12 col-md-5 offset-md-1 order-2 order-md-1 fade-in">
              <img
                src="../src/assets/img/story 2.svg"
                alt="The Problem"
                className="img-fluid mt-3 mt-md-0 rounded"
                style={{ maxHeight: "400px" }}
              />
            </div>
            <div className="col-12 col-md-5 offset-md-1 order-1 text-center text-md-start order-md-2 fade-in">
              <h1 className="display-3 fw-bold clip-heading mb-3">
                The Problem
              </h1>
              <p className="lead">
                Every company had their own portal, their own format, their own
                requirements. I was spending more time navigating different
                systems than actually applying. Sound familiar?
              </p>
            </div>
          </div>

          {/* Problem Details */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="row g-4">
                <div className="col-md-4 fade-in">
                  <div className="card border border-2 border-black unround h-100 problem-card">
                    <div className="card-body text-center">
                      <div className="problem-icon mb-3">
                        <i className="fa-solid fa-sitemap fa-3x text-hireFlow-green-dark"></i>
                      </div>
                      <h5 className="card-title">Scattered Systems</h5>
                      <p className="card-text">
                        Each company's application process was completely
                        different. No standardization, no consistency, just
                        chaos.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 fade-in">
                  <div className="card border border-2 border-black unround h-100 problem-card">
                    <div className="card-body text-center">
                      <div className="problem-icon mb-3">
                        <i className="fa-solid fa-clock fa-3x text-hireFlow-green-dark"></i>
                      </div>
                      <h5 className="card-title">Time Wasted</h5>
                      <p className="card-text">
                        Hours spent creating new accounts, filling the same
                        information repeatedly, and tracking applications across
                        multiple platforms.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 fade-in">
                  <div className="card border border-2 border-black unround h-100 problem-card">
                    <div className="card-body text-center">
                      <div className="problem-icon mb-3">
                        <i className="fa-solid fa-eye-slash fa-3x text-hireFlow-green-dark"></i>
                      </div>
                      <h5 className="card-title">Lost Opportunities</h5>
                      <p className="card-text">
                        Important deadlines missed, applications lost in the
                        shuffle, and no clear way to track progress or follow
                        up.
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

      {/* The Solution Section */}
      <section className="more-section-1" id="the-solution">
        <div className="container">
          <div className="section-header text-center fade-in">
            <h1 className="display-3 fw-bold clip-heading m-0">The Solution</h1>
            <h4 className="text-muted fw-light m-0">
              One platform to rule them all
            </h4>
          </div>

          <div className="row align-items-center mt-5">
            <div className="col-12 col-md-5 offset-md-1 order-1 text-center text-md-start order-md-1 fade-in">
              <h1 className="fw-bold fs-4 text-decoration-underline mb-3">
                HireFlow was born
              </h1>
              <p className="lead">
                Instead of complaining about the problem, I decided to build the
                solution. A unified platform that would make internship
                applications simple, efficient, and actually enjoyable for
                everyone involved.
              </p>
            </div>
            <div className="col-12 col-md-5 offset-md-1 order-2 order-md-2 fade-in">
              <img
                src="../src/assets/img/story 3.svg"
                alt="The Solution"
                className="img-fluid mt-3 mt-md-0 rounded"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>

          {/* Solution Features */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="row g-4">
                <div className="col-md-6 fade-in">
                  <div className="card border border-2 border-black unround h-100 solution-card">
                    <div className="card-body">
                      <div className="d-flex align-items-start">
                        <div className="solution-icon me-3">
                          <i className="fa-solid fa-universal-access fa-2x text-hireFlow-green-dark"></i>
                        </div>
                        <div>
                          <h5>Universal Profile</h5>
                          <p className="text-muted">
                            Create your profile once, use it everywhere. No more
                            repeating the same information for every
                            application.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 fade-in">
                  <div className="card border border-2 border-black unround h-100 solution-card">
                    <div className="card-body">
                      <div className="d-flex align-items-start">
                        <div className="solution-icon me-3">
                          <i className="fa-solid fa-chart-line fa-2x text-hireFlow-green-dark"></i>
                        </div>
                        <div>
                          <h5>Centralized Tracking</h5>
                          <p className="text-muted">
                            All your applications in one dashboard. Real-time
                            updates, status tracking, and never miss a deadline
                            again.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 fade-in">
                  <div className="card border border-2 border-black unround h-100 solution-card">
                    <div className="card-body">
                      <div className="d-flex align-items-start">
                        <div className="solution-icon me-3">
                          <i className="fa-solid fa-shield-halved fa-2x text-hireFlow-green-dark"></i>
                        </div>
                        <div>
                          <h5>Secure & Reliable</h5>
                          <p className="text-muted">
                            Enterprise-grade security with unique keys for each
                            company, ensuring your data is always protected and
                            private.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 fade-in">
                  <div className="card border border-2 border-black unround h-100 solution-card">
                    <div className="card-body">
                      <div className="d-flex align-items-start">
                        <div className="solution-icon me-3">
                          <i className="fa-solid fa-clock fa-2x text-hireFlow-green-dark"></i>
                        </div>
                        <div>
                          <h5>Time-Saving</h5>
                          <p className="text-muted">
                            Reduce application time by 80%. Focus on what
                            matters - showcasing your skills and experience.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer"></div>

      {/* Mission & Values Section */}
      <section className="more-section-2" id="our-mission">
        <div className="container">
          <div className="section-header text-start fade-in">
            <h1 className="display-3 fw-bold clip-heading m-0">
              Our Mission & Values
            </h1>
          </div>
          <div className="row align-items-center mt-5">
            <div className="col-12 col-md-4 order-1 ps-md-0 text-center text-md-start fade-in">
              <div className="card border border-2 border-black unround mb-4 vision-card h-100">
                <div className="card-body d-flex flex-column">
                  <img
                    src="../src/assets/img/story 4.svg"
                    alt="Simplicity"
                    className="card-img-top"
                  />
                  <h5 className="card-title">Simplicity First</h5>
                  <p className="card-text">
                    In a world of complexity, we believe in the power of
                    simplicity. Every feature, every interaction, every process
                    is designed to make your life easier, not harder.
                  </p>
                  <div className="mt-auto text-center text-md-end">
                    <a href="/flow" className="btn-3d-sm transition-icon">
                      <span className="me-4">See How</span>
                      <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                      <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4 order-2 text-center text-md-start fade-in">
              <div className="card border border-2 border-black unround mb-4 vision-card h-100">
                <div className="card-body d-flex flex-column">
                  <img
                    src="../src/assets/img/story 5.svg"
                    alt="Efficiency"
                    className="card-img-top"
                  />
                  <h5 className="card-title">Efficiency Matters</h5>
                  <p className="card-text">
                    Time is precious, especially for busy students and
                    professionals. We're obsessed with saving you time so you
                    can focus on what truly matters.
                  </p>
                  <div className="mt-auto text-center text-md-end">
                    <a href="/flow" className="btn-3d-sm transition-icon">
                      <span className="me-4">Learn More</span>
                      <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                      <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4 order-3 pe-md-0 text-center text-md-start fade-in">
              <div className="card border border-2 border-black unround mb-4 vision-card h-100">
                <div className="card-body d-flex flex-column">
                  <img
                    src="../src/assets/img/story 6.svg"
                    alt="Empowerment"
                    className="card-img-top mb-4"
                  />
                  <h5 className="card-title">Empowerment Through Technology</h5>
                  <p className="card-text">
                    Technology should empower people, not frustrate them. We're
                    building tools that make complex processes simple and
                    accessible to everyone.
                  </p>
                  <div className="mt-auto text-center text-md-end">
                    <a href="/flow" className="btn-3d-sm transition-icon">
                      <span className="me-4">Explore</span>
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

      {/* Values Section */}
      <section className="about-section bg-hireFlow-green">
        <div className="container">
          <div className="section-header text-center fade-in">
            <h1 className="display-3 fw-bold clip-heading m-0">
              Our Core Values
            </h1>
            <h4 className="text-muted fw-light m-0">What drives us forward</h4>
          </div>
          <div className="row mt-5">
            <div className="col-md-6 fade-in">
              <div className="value-item mb-4">
                <div className="d-flex align-items-start">
                  <div className="value-icon me-3">
                    <i className="fa-solid fa-heart fa-2x text-hireFlow-green-dark"></i>
                  </div>
                  <div>
                    <h5>User-Centric Design</h5>
                    <p className="text-muted">
                      Every decision we make starts with the user. We build
                      features that solve real problems, not just add
                      complexity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 fade-in">
              <div className="value-item mb-4">
                <div className="d-flex align-items-start">
                  <div className="value-icon me-3">
                    <i className="fa-solid fa-rocket fa-2x text-hireFlow-green-dark"></i>
                  </div>
                  <div>
                    <h5>Continuous Innovation</h5>
                    <p className="text-muted">
                      We're never satisfied with "good enough." We constantly
                      iterate, improve, and innovate to make things better.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 fade-in">
              <div className="value-item mb-4">
                <div className="d-flex align-items-start">
                  <div className="value-icon me-3">
                    <i className="fa-solid fa-handshake fa-2x text-hireFlow-green-dark"></i>
                  </div>
                  <div>
                    <h5>Transparency & Trust</h5>
                    <p className="text-muted">
                      We believe in building trust through transparency. Clear
                      processes, honest communication, and reliable systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 fade-in">
              <div className="value-item mb-4">
                <div className="d-flex align-items-start">
                  <div className="value-icon me-3">
                    <i className="fa-solid fa-users fa-2x text-hireFlow-green-dark"></i>
                  </div>
                  <div>
                    <h5>Community Focus</h5>
                    <p className="text-muted">
                      We're building more than a platform - we're building a
                      community of students, companies, and professionals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="more-section-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center fade-in">
              <h2 className="display-4 fw-bold mb-4">
                Ready to Simplify Your Journey?
              </h2>
              <p className="lead mb-4">
                Join thousands of students and companies who have already
                discovered the power of unified application management.
              </p>
              <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                <a href="/register" className="btn-3d pe-5 transition-icon">
                  Get Started Today
                  <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                  <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                </a>
                <a
                  href="/flow"
                  className="btn btn-non-emphasis text-decoration-none"
                >
                  Learn More
                  <i className="fa-solid fa-arrow-right fa-xs ms-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StoryPage;
