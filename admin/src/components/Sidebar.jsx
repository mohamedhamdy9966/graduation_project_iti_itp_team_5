import React from "react";
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { LabContext } from "../context/LabContext";
import {
  FiHome,
  FiCalendar,
  FiPlusCircle,
  FiUsers,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { GiHealthPotion } from "react-icons/gi";
import { FaPills } from "react-icons/fa";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { lToken } = useContext(LabContext);

  return (
    <div className="min-h-screen bg-white border-r w-full md:w-64 fixed md:relative z-10">
      <div className="sticky top-0">
        {aToken && (
          <ul className="text-[#515151] mt-5 space-y-2">
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/admin-dashboard"}
            >
              <FiHome className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Dashboard
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/all-appointments"}
            >
              <FiCalendar className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Appointments
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"add-doctor"}
            >
              <FiPlusCircle className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Add Doctor
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"add-lab"}
            >
              <FiPlusCircle className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Add Lab
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/add-drug"}
            >
              <FiPlusCircle className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Add Drug
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/doctor-list"}
            >
              <FiUsers className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Doctor List
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/lab-list"}
            >
              <GiHealthPotion className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Lab List
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/drug-list"}
            >
              <FaPills className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Drugs List
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/all-orders"}
            >
              <FiShoppingBag className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Orders
              </span>
            </NavLink>
          </ul>
        )}

        {dToken && (
          <ul className="text-[#515151] mt-5 space-y-2">
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/doctor-dashboard"}
            >
              <FiHome className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Dashboard
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/doctor-appointments"}
            >
              <FiCalendar className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Appointments
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/doctor-profile"}
            >
              <FiUser className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Profile
              </span>
            </NavLink>
          </ul>
        )}

        {lToken && (
          <ul className="text-[#515151] mt-5 space-y-2">
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/lab-dashboard"}
            >
              <FiHome className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Dashboard
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/lab-appointments"}
            >
              <FiCalendar className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Appointments
              </span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-[#f2f3ff] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#f2f3ff] border-r-4 border-blue-500 font-medium"
                    : ""
                }`
              }
              to={"/lab-profile"}
            >
              <FiUser className="w-5 h-5 text-[#515151]" />
              <span className="hidden md:block text-sm md:text-base">
                Profile
              </span>
            </NavLink>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
