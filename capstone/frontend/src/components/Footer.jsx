import React from "react";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const { pathname } = useLocation();

  const hideLogin = pathname === "/login";
  const hideOurStory = pathname === "/our-story";
  const hideFlow = pathname === "/flow";
  const hideRegisterApplicant = pathname === "/register/applicant";
  const hideRegisterCompany = pathname === "/register/company";

  return (
    <>
      {/* Footer */}
      <footer className="footer bg-light border-top py-5">
        <div className="container">
          {/* Top row: multiple columns */}
          <div className="row g-4">
            {/* Column 1: logo (center on mobile) */}
            <div className="col-12 col-md-3 text-center text-md-start">
              <img
                className="img-fluid px-1"
                src="/logo-footer-01.png"
                alt="HireFlow logo"
              />
            </div>

            {/* Spacer Column (you can remove or fill this) */}
            <div className="col-12 col-md-3"></div>

            {/* Column 2 */}
            <div className="col-12 col-md-3 text-center text-md-start">
              <h6 className="fw-bold">Learn More</h6>
              <ul className="list-unstyled">
                {!hideOurStory && (
                  <li>
                    <a
                      href="/our-story"
                      className="text-decoration-none text-dark"
                    >
                      Our Story
                    </a>
                  </li>
                )}
                {!hideFlow && (
                  <li>
                    <a href="/flow" className="text-decoration-none text-dark">
                      How it works
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 3 */}
            <div className="col-12 col-md-3 text-center text-md-start">
              <h6 className="fw-bold">Platform</h6>
              <ul className="list-unstyled">
                {!hideLogin && (
                  <li>
                    <a href="/login" className="text-decoration-none text-dark">
                      Login
                    </a>
                  </li>
                )}
                {!hideRegisterApplicant && (
                  <li>
                    <a
                      href="/register/applicant"
                      className="text-decoration-none text-dark"
                    >
                      Register
                    </a>
                  </li>
                )}
                {!hideRegisterCompany && (
                  <li>
                    <a
                      href="/register/company"
                      className="text-decoration-none text-dark"
                    >
                      Register your company
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Visual separator */}
          <hr className="my-4" />

          {/* Bottom row */}
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <p className="mb-2 mb-md-0 text-muted">
              &copy; {new Date().getFullYear()} HireFlow. All rights reserved.
            </p>
            <div className="mb-0 text-muted text-center text-md-start">
              Developed by Bhatt Studios
              <p
                className="mb-0"
                data-cc="http://creativecommons.org/ns/"
                data-dct="http://purl.org/dc/terms"
              >
                <span property="dct:title"></span>licensed under
                <a
                  className="text-muted ms-1"
                  href="https://creativecommons.org/licenses/by-nc-nd/4.0/?ref=chooser-v1"
                  target="_blank"
                  rel="license noopener noreferrer"
                  style={{ display: "inline-block" }}
                >
                  CC BY‑NC‑ND 4.0
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
