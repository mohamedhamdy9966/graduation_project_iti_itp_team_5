import { useContext, useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets_frontend/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
// import logo from "../assets/logo7.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
    setMenuOpen(false);
  };

  const handleNavClick = () => {
    setMenuOpen(false);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      // For mobile menu
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="Toggle menu"]')
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { label: "Home", path: "/", icon: "fa-home" },
    { label: "Doctors", path: "/doctors", icon: "fa-user-doctor" },
    { label: "Labs", path: "/labs", icon: "fa-flask" },
    { label: "Drug Store", path: "/drugs", icon: "fa-prescription-bottle-medical" },
    { label: "About", path: "/about", icon: "fa-info-circle" },
    { label: "Contact", path: "/contact", icon: "fa-phone" },
  ];

  return (
    <>
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-16 py-4 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border-b border-indigo-100 shadow-lg sticky top-0 z-50">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center gap-6">
          <img
            onClick={() => navigate("/")}
            className="w-36 md:w-44 cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out"
            src={assets.logo}
            alt="Roshetta logo"
          />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
            aria-label="Toggle menu"
          >
            <img className="w-7 h-7" src={assets.menu_icon} alt="Menu" />
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          <ul className="flex items-center gap-8 text-base font-semibold text-indigo-800 tracking-wide">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative py-2 px-3 rounded-md transition-all duration-300 ease-in-out hover:bg-indigo-100 hover:text-indigo-900 ${
                    isActive
                      ? "text-indigo-900 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-indigo-500 after:rounded-full"
                      : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </ul>

          {/* User Profile / Auth */}
          <div className="flex items-center gap-6 ml-8">
            {token && userData ? (
              <div className="relative">
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-full hover:bg-indigo-100 transition-all duration-300"
                >
                  <img
                    className="w-10 h-10 rounded-full border-2 border-indigo-200 object-cover shadow-sm"
                    src={userData.image || assets.profile_pic}
                    alt="Profile"
                  />
                  <img
                    className="w-4 h-4 transform transition-transform duration-300"
                    src={assets.dropdown_icon}
                    alt="Dropdown"
                    style={{
                      transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </div>
                {showDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {navItems.slice(4).map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={handleNavClick}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className="ml-2 px-3 py-1 rounded-md text-xs font-medium text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Sign Up
              </NavLink>
            )}
            {/* User Profile / Auth for tablet */}
            <div className="ml-2 flex items-center">
              {token && userData ? (
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <img
                      className="h-7 w-7 rounded-full border-2 border-white"
                      src={userData.image || assets.profile_pic}
                      alt="Profile"
                    />
                  </div>

                  {showDropdown && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm font-medium text-gray-700">
                          {userData.name}
                        </div>
                        <NavLink
                          to="/my-profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={handleNavClick}
                        >
                          My Profile
                        </NavLink>
                        <NavLink
                          to="/my-appointments"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={handleNavClick}
                        >
                          Doctor Appointments
                        </NavLink>
                        <NavLink
                          to="/my-lab-appointments"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={handleNavClick}
                        >
                          Lab Appointments
                        </NavLink>
                        <NavLink
                          to="/my-drug-orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={handleNavClick}
                        >
                          Drug Orders
                        </NavLink>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="ml-2 px-3 py-1 rounded-md text-xs font-medium text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Sign Up
                </NavLink>
              )}
            </div>

            {/* Mobile menu button - shown below 768px */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => navigate("/login")}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden fixed inset-0 z-40 transform ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
          style={{ top: "64px", width: "65%" }}
          ref={mobileMenuRef}
        >
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 ${
              menuOpen ? "block" : "hidden"
            }`}
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="relative flex flex-col w-full h-full bg-[#0097A7] shadow-xl">
            <div className="flex-1 overflow-y-auto">
              <nav className="px-2 py-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      group flex items-center px-3 py-3 my-1 text-sm font-medium rounded-md
                      ${isActive ? "bg-gray-100 text-gray-900" : "text-white hover:text-gray-900 hover:bg-gray-100"}
                    `}
                    onClick={handleNavClick}
                  >
                    {({ isActive }) => (
                      <>
                        <i
                          className={`fas ${item.icon} mr-3 ${
                            isActive
                              ? "text-gray-500"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                        ></i>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}

                {token && userData ? (
                  <>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <NavLink
                        to="/my-profile"
                        className={({ isActive }) => `
                          group flex items-center px-3 py-3 text-sm font-medium rounded-md
                          ${
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          }
                        `}
                        onClick={handleNavClick}
                      >
                        <i className="fas fa-user mr-3 text-gray-400 group-hover:text-gray-500"></i>
                        My Profile
                      </NavLink>
                      <NavLink
                        to="/my-appointments"
                        className={({ isActive }) => `
                          group flex items-center px-3 py-3 text-sm font-medium rounded-md
                          ${
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          }
                        `}
                        onClick={handleNavClick}
                      >
                        <i className="fas fa-calendar-check mr-3 text-gray-400 group-hover:text-gray-500"></i>
                        Doctor Appointments
                      </NavLink>
                      <NavLink
                        to="/my-lab-appointments"
                        className={({ isActive }) => `
                          group flex items-center px-3 py-3 text-sm font-medium rounded-md
                          ${
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          }
                        `}
                        onClick={handleNavClick}
                      >
                        <i className="fas fa-microscope mr-3 text-gray-400 group-hover:text-gray-500"></i>
                        Lab Appointments
                      </NavLink>
                      <NavLink
                        to="/my-drug-orders"
                        className={({ isActive }) => `
                          group flex items-center px-3 py-3 text-sm font-medium rounded-md
                          ${
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          }
                        `}
                        onClick={handleNavClick}
                      >
                        <i className="fas fa-pills mr-3 text-gray-400 group-hover:text-gray-500"></i>
                        Drug Orders
                      </NavLink>
                      <button
                        onClick={logout}
                        className="w-full text-left group flex items-center px-3 py-3 text-sm font-medium rounded-md text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <i className="fas fa-sign-out-alt mr-3"></i>
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `py-3 px-5 rounded-xl hover:bg-indigo-100 hover:text-indigo-900 transition-all duration-300 ${
                        isActive ? "text-indigo-900 bg-indigo-100" : ""
                      }`
                    }
                  >
                    Create Account
                  </NavLink>
                )}
              </nav>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;