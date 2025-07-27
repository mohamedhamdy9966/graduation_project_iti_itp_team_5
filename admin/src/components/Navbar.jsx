import React from "react";
import { assets } from "../../../client/src/assets/assets_admin/assets";
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
    dToken && setDToken("");
    dToken && localStorage.removeItem("dToken");
  };

  return (
    <div className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <img
          src={assets.admin_logo}
          alt="logo"
          className="w-8 h-8 md:w-10 md:h-10"
        />
        <p className="text-lg md:text-xl font-semibold text-gray-800">
          {aToken ? "Admin Panel" : "Doctor Portal"}
        </p>
      </div>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm md:text-base transition-colors duration-200 flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 md:h-5 md:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Logout
      </button>
    </div>
  );
};

export default Navbar;
