import React from "react";
import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../../../client/src/assets/assets_admin/assets";
import { DoctorContext } from "../context/DoctorContext";
import { LabContext } from "../context/LabContext";

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
              <img src={assets.home_icon} alt="dashboard" className="w-5 h-5" />
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
              <img
                src={assets.appointment_icon}
                alt="appointments"
                className="w-5 h-5"
              />
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
              <img src={assets.add_icon} alt="add doctor" className="w-5 h-5" />
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
              <img src={assets.add_icon} alt="add lab" className="w-5 h-5" />
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
              to={"/doctor-list"}
            >
              <img
                src={assets.people_icon}
                alt="doctor list"
                className="w-5 h-5"
              />
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
              <img
                src={assets.people_icon}
                alt="doctor list"
                className="w-5 h-5"
              />
              <span className="hidden md:block text-sm md:text-base">
                Lab List
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
              <img src={assets.home_icon} alt="dashboard" className="w-5 h-5" />
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
              <img
                src={assets.appointment_icon}
                alt="appointments"
                className="w-5 h-5"
              />
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
              <img src={assets.people_icon} alt="profile" className="w-5 h-5" />
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
              <img src={assets.home_icon} alt="dashboard" className="w-5 h-5" />
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
              <img
                src={assets.appointment_icon}
                alt="appointments"
                className="w-5 h-5"
              />
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
              <img src={assets.people_icon} alt="profile" className="w-5 h-5" />
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
