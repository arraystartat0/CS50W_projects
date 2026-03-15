import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function NavBar() {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!isModalOpen);

  const { pathname, state } = useLocation();
  const navigate = useNavigate();

  const backTo = state?.from || "/login";
  const isAuthenticated = Boolean(localStorage.getItem("access_token"));

  // Page flags
  const onHome = pathname === "/";
  const hideLogin = pathname === "/login";
  const hideRegister = ["/register/applicant", "/register/company"].includes(
    pathname
  );
  const listingMatch =
    pathname === "/listing" || pathname.startsWith("/listing/") || pathname.startsWith("/company/") ;
  const iconMargin = onHome || listingMatch ? "mt-2" : "";

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".nav-transition");
      window.pageYOffset > 50
        ? navbar.classList.add("scrolled")
        : navbar.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light sticky-top nav-transition">
        <div className="container">
          <Link to="/">
            <img
              className="navbar-brand"
              src="/logo-nav-01.png"
              height="56"
              alt="Logo"
            />
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={toggleModal}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop view */}
          <div className="d-none d-lg-flex w-100 justify-content-between">
            <ul className="navbar-nav">
              {/* Home link when not already home */}
              {!onHome && (
                <li className="nav-item btn-non-emphasis">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
              )}

              {/* Only show About/Developers on home page */}
              {onHome && (
                <>
                  <li className="nav-item btn-non-emphasis">
                    <a className="nav-link" href="#about">
                      About
                    </a>
                  </li>
                  <li className="nav-item btn-non-emphasis">
                    <a className="nav-link" href="#developers">
                      Developers
                    </a>
                  </li>
                </>
              )}

              <li className="nav-item btn-non-emphasis">
                <Link className="nav-link" to="/flow">
                  How It Works
                </Link>
              </li>
              <li className="nav-item btn-non-emphasis">
                <Link className="nav-link" to="/our-story">
                  Our Story
                </Link>
              </li>
              <li className="nav-item btn-non-emphasis">
                <Link className="nav-link" to="/verify">
                  Verify
                </Link>
              </li>
            </ul>

            <ul className="navbar-nav d-flex align-items-center gap-3">
              {!isAuthenticated && !hideLogin && (
                <li className="nav-item me-2">
                  <Link className="nav-link transition-icon" to="/login">
                    <span className="me-3">Login</span>
                    <i
                      className={`fa-solid fa-chevron-right icon-default ${iconMargin} pt-1 fa-xs`}
                    />
                    <i
                      className={`fa-solid fa-arrow-right-to-bracket icon-hover ${iconMargin} pt-1 fa-xs`}
                    />
                  </Link>
                </li>
              )}

              {!isAuthenticated && !hideRegister && (
                <li className="nav-item me-2">
                  <Link
                    className="nav-link transition-icon"
                    to="/register/applicant"
                  >
                    <span className="me-3">Register</span>
                    <i
                      className={`fa-solid fa-chevron-right icon-default ${iconMargin} pt-1 fa-xs`}
                    />
                    <i
                      className={`fa-solid fa-pencil icon-hover ${iconMargin} pt-1 fa-xs`}
                    />
                  </Link>
                </li>
              )}

              {isAuthenticated && (
                <li className="nav-item me-2">
                  <Link className="nav-link transition-icon" to={backTo}>
                    <span className="me-4">Back to portal</span>
                    <i
                      className={`fa-solid fa-chevron-right icon-default ${iconMargin} pt-1 fa-xs`}
                    />
                    <i
                      className={`fa-solid fa-arrow-right-to-bracket icon-hover ${iconMargin} pt-1 fa-xs`}
                    />
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar Modal */}
      {isModalOpen && (
        <div className="mobile-menu-modal" onClick={toggleModal}>
          <div
            className="mobile-menu-content border border-2 border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Menu</h5>
              <button
                className="border-0 text-black bg-transparent"
                onClick={toggleModal}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <ul className="navbar-nav text-center mobile-menu-links">
              {/* Home link */}
              {!onHome && (
                <li className="nav-item">
                  <Link className="nav-link" to="/" onClick={toggleModal}>
                    Home
                  </Link>
                </li>
              )}

              {/* About/Developers only on home */}
              {onHome && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="#about" onClick={toggleModal}>
                      About
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#developers"
                      onClick={toggleModal}
                    >
                      Developers
                    </a>
                  </li>
                </>
              )}

              <li className="nav-item">
                <Link className="nav-link" to="/flow" onClick={toggleModal}>
                  How It Works
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/our-story" onClick={toggleModal}>
                  Our Story
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/verify" onClick={toggleModal}>
                  Verify
                </Link>
              </li>

              {!isAuthenticated && !hideLogin && (
                <li className="nav-item">
                  <Link
                    className="nav-link transition-icon"
                    to="/login"
                    onClick={toggleModal}
                  >
                    <span className="me-3 pe-1">Login</span>
                    <i
                      className={`fa-solid fa-chevron-right icon-default ${iconMargin} fa-xs pt-2`}
                    />
                    <i
                      className={`fa-solid fa-arrow-right-to-bracket icon-hover ${iconMargin} fa-xs pt-2`}
                    />
                  </Link>
                </li>
              )}

              {!isAuthenticated && !hideRegister && (
                <li className="nav-item me-2">
                  <Link
                    className="nav-link transition-icon"
                    to="/register/applicant"
                    onClick={toggleModal}
                  >
                    <span className="me-4">Register</span>
                    <i
                      className={`fa-solid fa-chevron-right icon-default ${iconMargin} fa-xs pt-2`}
                    />
                    <i
                      className={`fa-solid fa-pencil icon-hover ${iconMargin} fa-xs pt-2`}
                    />
                  </Link>
                </li>
              )}

              {isAuthenticated && (
                <li className="nav-item me-2">
                  <Link className="nav-link transition-icon" to={backTo}>
                    <span className="me-4">Back to portal</span>
                    <i
                      className={`fa-solid fa-chevron-right icon-default ${iconMargin} pt-1 fa-xs`}
                    />
                    <i
                      className={`fa-solid fa-arrow-right-to-bracket icon-hover ${iconMargin} pt-1 fa-xs`}
                    />
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
