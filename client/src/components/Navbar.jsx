import { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { MdShoppingCart } from "react-icons/md";
import logo from "../assets/logo7.png";

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
    {
      label: "Drug Store",
      path: "/drugs",
      icon: "fa-prescription-bottle-medical",
    },
    { label: "About", path: "/about", icon: "fa-info-circle" },
    { label: "Contact", path: "/contact", icon: "fa-phone" },
  ];

  // Cart component for reusability
  const CartIcon = ({ size = "text-2xl" }) => (
    <NavLink to="/cart" className="relative">
      <MdShoppingCart 
        className={`text-white ${size} hover:text-[gray-300 ] transition-colors`}
      />
      {userData?.cartItems && userData.cartItems.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {userData.cartItems.length}
        </span>
      )}
    </NavLink>
  );

  return (
    <>
      <nav
        className="shadow z-50 fixed  top-0 left-0 w-full"
        style={{ backgroundColor: "var(--color-primary-dark)" }}
      >
        <div className="flex justify-between  items-center h-16  mx-auto max-w-7xl px-4">
          {/* Logo */}

          <div
            className="flex items-center  cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              width={35}
              height={35}
              alt="Logo"
              className="mb-2"
            />
            <span
              className="text-white text-3xl font-bold"
              style={{ fontFamily: "var(--logo-font)", letterSpacing: "1px" }}
            >
              Roshetta
            </span>
          </div>

          {/* Desktop Navigation - shown above 1000px */}
          <div className="hidden lg:flex items-center space-x-8">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `text-white px-3 py-2 rounded-md text-sm font-medium relative
                      after:content-[''] after:absolute after:left-0 after:bottom-0 
                      after:h-[2px] after:bg-white after:transition-all after:duration-400 
                      ${
                        isActive
                          ? "after:w-full"
                          : "after:w-0 hover:after:w-full"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* User Profile / Auth */}
            <div className="ml-4 flex items-center space-x-4">
              {/* Cart Icon - Desktop */}
              {token && userData && <CartIcon />}

              {token && userData ? (
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <img
                      className="h-8 w-8 rounded-full border-2 border-white"
                      src={userData.image || assets.profile_pic}
                      alt="Profile"
                    />
                    <span className="ml-2 text-white text-sm font-medium">
                      {userData.name}
                    </span>
                    <i
                      className={`fas fa-chevron-${
                        showDropdown ? "up" : "down"
                      } ml-1 text-white text-xs`}
                    ></i>
                  </div>

                  {showDropdown && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
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
                  className="ml-4 px-8 py-2 rounded-md text-sm font-medium text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Sign Up
                </NavLink>
              )}
            </div>
          </div>

          {/* Tablet Navigation - shown between 768px and 999px */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            <ul className="flex space-x-4">
              {navItems.slice(0, 4).map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `text-white px-2 py-1 rounded-md text-xs font-medium relative
                      after:content-[''] after:absolute after:left-0 after:bottom-0 
                      after:h-[2px] after:bg-white after:transition-all after:duration-400 
                      ${
                        isActive
                          ? "after:w-full"
                          : "after:w-0 hover:after:w-full"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* More dropdown for tablet */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-white px-2 py-1 rounded-md text-xs font-medium"
              >
                More{" "}
                <i
                  className={`fas fa-chevron-${
                    showDropdown ? "up" : "down"
                  } ml-1 text-xs`}
                ></i>
              </button>

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

            {/* Cart Icon and User Profile / Auth for tablet */}
            <div className="ml-2 flex items-center space-x-3">
              {/* Cart Icon - Tablet */}
              {token && userData && <CartIcon size="text-lg" />}

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
          </div>

          {/* Mobile menu button - shown below 768px */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Cart Icon - Mobile (outside hamburger) */}
            {token && userData && <CartIcon size="text-lg" />}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg
                className={`h-6 w-6 ${menuOpen ? "hidden" : "block"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`h-6 w-6 ${menuOpen ? "block" : "hidden"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {/* <div className="h-20"></div> */}

      {/* Add margin to the top of the content to account for the fixed navbar */}
      <div className="pt-16"></div>

      {/* Mobile menu - shown below 768px */}
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
                    ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-white hover:text-gray-900 hover:bg-gray-100"
                    }
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
                      to="/cart"
                      className={({ isActive }) => `
                        group flex items-center px-3 py-3 text-sm font-medium rounded-md relative
                        ${
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-white hover:text-gray-900 hover:bg-gray-100"
                        }
                      `}
                      onClick={handleNavClick}
                    >
                      <MdShoppingCart  className="mr-3 text-gray-400 group-hover:text-gray-500" />
                      Cart
                      {userData.cartItems && userData.cartItems.length > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {userData.cartItems.length}
                        </span>
                      )}
                    </NavLink>
                    <NavLink
                      to="/my-profile"
                      className={({ isActive }) => `
                        group flex items-center px-3 py-3 text-sm font-medium rounded-md
                        ${
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-white hover:text-gray-900 hover:bg-gray-100"
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
                            : "text-white hover:text-gray-900 hover:bg-gray-100"
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
                            : "text-white hover:text-gray-900 hover:bg-gray-100"
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
                            : "text-white hover:text-gray-900 hover:bg-gray-100"
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
                <div className="mt-4 px-3">
                  <NavLink
                    to="/login"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                    onClick={handleNavClick}
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;