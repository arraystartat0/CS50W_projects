import React, { useEffect, useState } from "react";
import "../assets/css/LandingPage.css";
import "../assets/css/LoadingSpinner.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import usePageLoading from "../hooks/usePageLoading";

const LandingPage = () => {
  const isPageLoading = usePageLoading([], 600);
  
  // Handle fade-in animations (existing code)
  useEffect(() => {
    const fadeEls = document.querySelectorAll(".fade-in");
    fadeEls.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.3}s`;
      el.classList.add("visible");
    });
  }, []);

  // Scroll listener to toggle navbar background
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
    // Clean up the event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isPageLoading) {
    return <LoadingSpinner message="Loading..." />;
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
                  Premium hiring solutions <br className="d-none d-lg-block" />
                  <span className="fw-light">to grow your business.</span>
                </h1>
                <p className="lead mb-4">
                  Don't miss out on the new all-in-one hiring platform. From
                  creating job postings to verifying candidates, we help you
                  hire effortlessly while providing a premium, reliable
                  experience.
                </p>
                <div className="d-flex flex-column flex-md-row align-items-start gap-2">
                  <a href="/plans" className="btn-3d pe-5 transition-icon">
                    Start now
                    <i className="fa-solid fa-chevron-right ms-2 icon-default"></i>
                    <i className="fa-solid fa-arrow-right ms-2 icon-hover"></i>
                  </a>
                  <a
                    href="#about"
                    className="btn btn-non-emphasis text-decoration-none btn-link ps-1 pt-2 ps-md-3 pe-md-2 my-md-1 text-dark"
                  >
                    Learn More
                    <i className="fa-solid fa-arrow-down fa-xs ms-2"></i>
                  </a>
                </div>
              </div>

              <div className="col-lg-6 fade-in text-end">
                <img
                  src="../src/assets/img/11.svg"
                  alt="Illustration"
                  className="img-fluid mt-3 mt-md-0 rounded"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="section-spacer"></div>

      {/* About Us Section */}
      <section className="about-section bg-hireFlow-green" id="about">
        <div className="container">
          <div className="row align-items-center about-row">
            {/* Image Column */}
            <div className="col-12 col-md-5 offset-md-1 order-2 order-md-1 fade-in">
              <img
                src="../src/assets/img/2.svg"
                alt="About HireFlow"
                className="img-fluid mt-5 mt-md-0 rounded"
                style={{ maxHeight: "400px" }}
              />
            </div>
            {/* Text Column */}
            <div className="col-12 col-md-5 offset-md-1 order-1 text-center text-md-start order-md-2 fade-in">
              <h1 className="display-3 fw-bold clip-heading mb-3">
                Instantly create listings.
              </h1>
              <p className="lead">
                Streamline your process for effortless talent acquisition. Our
                platform empowers you to create and manage position listings in
                a few clicks, reducing waste of time so you can focus on
                growing.
              </p>
            </div>
          </div>
          <div className="row align-items-center about-row">
            {/* Text Column */}
            <div className="col-12 col-md-5 offset-md-1 order-1 text-center text-md-start order-md-1 fade-in">
              <h1 className="display-3 fw-bold clip-heading mb-3">
                Built around efficiency & speed.
              </h1>
              <p className="lead">
                Streamline your process for effortless talent acquisition. Our
                platform empowers you to create and manage position listings in
                a few clicks, reducing the time it takes so you can focus on
                growing.
              </p>
            </div>
            {/* Image Column */}
            <div className="col-12 col-md-5 offset-md-1 order-2 order-md-1 fade-in">
              <img
                src="../src/assets/img/3.svg"
                alt="About HireFlow"
                className="img-fluid mt-3 mt-md-0 rounded"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>
          <div className="row align-items-center about-row-end">
            {/* Text Column */}
            <div className="col-12 col-md-5 offset-md-1 order-1 text-center text-md-start order-md-2 fade-in">
              <h1 className="display-3 fw-bold clip-heading mb-3">
                All new verification system.
              </h1>
              <p className="lead">
                Introducing our sleek verification system—where post-employment
                feedback meets detailed insights. Employers leave personalized
                messages and employment details, empowering futured
                organizations to verify credentials without any hastle or
                internal contact.
              </p>
            </div>
            <div className="col-12 col-md-5 offset-md-1 order-2 order-md-1 fade-in">
              <img
                src="../src/assets/img/4.svg"
                alt="About HireFlow"
                className="img-fluid mt-3 mt-md-0 rounded"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer-slashed"></div>

      {/* More Section 2 */}
      <section className="more-section-1" id="developers">
        <div className="container">
          <div className="section-header text-center fade-in">
            <h1 className="display-3 fw-bold clip-heading m-0">
              Built for ease
            </h1>
            <h4 className="text-muted fw-light m-0">
              Requires no-code to get started.
            </h4>
          </div>
          <div className="row align-items-center mt-5">
            {/* Text Column */}
            <div className="col-12 col-md-5 offset-md-1 order-1 text-center text-md-start order-md-1 fade-in">
              <h1 className="fw-bold fs-4 text-decoration-underline mb-3">
                Made for quick development
              </h1>
              <p className="lead">
                Save building time with quick to deploy functionality. We take
                care of the labyrinths of data channels, security and stability
                so that your startups can go further, faster.
              </p>
            </div>
            {/* snippet column */}
            <div className="col-12 col-md-5 offset-md-1 order-2 order-md-2 fade-in">
              <pre className="code-block">
                <code>
                  <span className="tag">&lt;a</span>
                  <span className="attr-name"> href</span>
                  <span>=</span>
                  <span className="attr-value">"https://hireflow.com/</span>
                  <span className="public-code">[YOUR_COMPANY_PUBLIC_CODE]</span>
                  <span className="attr-value">"</span>
                  <span className="tag">&gt;</span>
                  <span className="text">Careers</span>
                  <span className="tag">&lt;/a&gt;</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer"></div>

      {/* More Section 2 */}
      <section className="more-section-2">
        <div className="container">
          <div className="section-header text-start fade-in">
            <h1 className="display-3 fw-bold clip-heading m-0">Our Vision</h1>
          </div>
          <div className="row align-items-center mt-5">
            {/* Left Column */}
            <div className="col-12 col-md-4 order-1 ps-md-0 text-center text-md-start fade-in">
              <div className="card border border-2 border-black unround mb-4 vision-card h-100">
                <div className="card-body d-flex flex-column">
                  <img
                    src="../src/assets/img/5.svg"
                    alt="Unified Application Process"
                    className="card-img-top"
                  />
                  <h5 className="card-title">Unified Application Process</h5>
                  <p className="card-text">
                    HireFlow streamlines the application experience by offering
                    a single, consistent system for internships and
                    apprenticeships. No more fragmented processes—just one
                    platform to manage all applications.
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

            {/* Center Column */}
            <div className="col-12 col-md-4 order-2 text-center text-md-start fade-in">
              <div className="card border border-2 border-black unround mb-4 vision-card h-100">
                <div className="card-body d-flex flex-column">
                  <img
                    src="../src/assets/img/6.svg"
                    alt="Unified Application Process"
                    className="card-img-top"
                  />
                  <h5 className="card-title">Intuitive Onboarding</h5>
                  <p className="card-text">
                    Born out of real challenges, our platform simplifies the
                    process for students and companies alike. With clear
                    interfaces and streamlined workflows, onboarding becomes
                    effortless.
                  </p>
                  <div className="mt-auto text-center text-md-end">
                    <a href="/our-story" className="btn-3d-sm transition-icon">
                      <span className="me-4">Discover How</span>
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
                    src="../src/assets/img/7.svg"
                    alt="Unified Application Process"
                    className="card-img-top mb-4"
                  />
                  <h5 className="card-title">Scalable Infrastructure</h5>
                  <p className="card-text">
                    Designed to grow with your business, HireFlow supports
                    startups and enterprises by handling all the complexities
                    while handling your data securely.
                  </p>
                  <div className="mt-auto text-center text-md-end">
                    <a href="/plans" className="btn-3d-sm transition-icon">
                      <span className="me-4">Plans</span>
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
      <Footer />
    </div>
  );
};

export default LandingPage;
