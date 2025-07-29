import { useContext, useState } from "react";
import { assets } from "../assets/assets_frontend/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "All Doctors", path: "/doctors" },
    { label: "All Labs", path: "/labs" },
    { label: "Drug Store", path: "/drugs" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  return (
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
          onClick={() => setShowMenu(true)}
          className="md:hidden p-2 rounded-lg text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
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
                <div className="absolute right-0 top-full mt-3 z-50 bg-white border border-indigo-100 shadow-xl rounded-xl p-4 w-64 flex flex-col gap-2 text-sm font-medium text-indigo-800">
                  <p
                    onClick={() => {
                      navigate("/my-profile");
                      setShowDropdown(false);
                    }}
                    className="hover:text-indigo-900 hover:bg-indigo-50 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => {
                      navigate("/my-appointments");
                      setShowDropdown(false);
                    }}
                    className="hover:text-indigo-900 hover:bg-indigo-50 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    Doctor Appointments
                  </p>
                  <p
                    onClick={() => {
                      navigate("/my-lab-appointments");
                      setShowDropdown(false);
                    }}
                    className="hover:text-indigo-900 hover:bg-indigo-50 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    Lab Appointments
                  </p>
                  <p
                    onClick={() => {
                      navigate("/my-drug-orders");
                      setShowDropdown(false);
                    }}
                    className="hover:text-indigo-900 hover:bg-indigo-50 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    Drug Orders
                  </p>
                  <p
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300"
                  >
                    Logout
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md"
            >
              Login / Sign UP
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 transform ${
          showMenu ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-500 ease-in-out md:hidden`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-60"
          onClick={() => setShowMenu(false)}
        ></div>
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-indigo-100 bg-indigo-50">
            <img className="w-36" src={assets.logo} alt="Roshetta logo" />
            <button
              onClick={() => setShowMenu(false)}
              className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
            >
              <img
                className="w-7 h-7"
                src={assets.cross_icon}
                alt="Close menu"
              />
            </button>
          </div>
          <div className="h-[calc(100%-76px)] overflow-y-auto">
            <ul className="flex flex-col gap-1 px-5 py-6 text-base font-semibold text-indigo-800">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `py-3 px-5 rounded-xl hover:bg-indigo-100 hover:text-indigo-900 transition-all duration-300 ${
                      isActive ? "text-indigo-900 bg-indigo-100" : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {token && userData ? (
                <>
                  <NavLink
                    to="/my-profile"
                    onClick={() => setShowMenu(false)}
                    className={({ isActive }) =>
                      `py-3 px-5 rounded-xl hover:bg-indigo-100 hover:text-indigo-900 transition-all duration-300 ${
                        isActive ? "text-indigo-900 bg-indigo-100" : ""
                      }`
                    }
                  >
                    My Profile
                  </NavLink>
                  <NavLink
                    to="/my-appointments"
                    onClick={() => setShowMenu(false)}
                    className={({ isActive }) =>
                      `py-3 px-5 rounded-xl hover:bg-indigo-100 hover:text-indigo-900 transition-all duration-300 ${
                        isActive ? "text-indigo-900 bg-indigo-100" : ""
                      }`
                    }
                  >
                    Doctor Appointments
                  </NavLink>
                  <NavLink
                    to="/my-lab-appointments"
                    onClick={() => setShowMenu(false)}
                    className={({ isActive }) =>
                      `py-3 px-5 rounded-xl hover:bg-indigo-100 hover:text-indigo-900 transition-all duration-300 ${
                        isActive ? "text-indigo-900 bg-indigo-100" : ""
                      }`
                    }
                  >
                    Lab Appointments
                  </NavLink>
                  <NavLink
                    to="/my-drug-orders"
                    onClick={() => setShowMenu(false)}
                    className={({ isActive }) =>
                      `py-3 px-5 rounded-xl hover:bg-indigo-100 hover:text-indigo-900 transition-all duration-300 ${
                        isActive ? "text-indigo-900 bg-indigo-100" : ""
                      }`
                    }
                  >
                    Drug Orders
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="w-full text-left py-3 px-5 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `py-3 px-5 rounded-xl hover:bg-indigo-100 hover:text-indigo-900 transition-all duration-300 ${
                      isActive ? "text-indigo-900 bg-indigo-100" : ""
                    }`
                  }
                >
                  Login / Sign UP
                </NavLink>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
