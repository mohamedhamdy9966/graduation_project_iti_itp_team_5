import React from "react";
import { assets } from "../assets/assets_frontend/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row items-center bg-blue-500 rounded-lg px-6 md:px-10 lg:px-20 overflow-hidden">
      {/* Left Side */}
      <div className="w-full md:w-1/2 flex flex-col items-start justify-center gap-6 py-10 md:py-20">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-snug">
          Book Appointments <br /> With Our System
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
          <img className="w-28" src={assets.group_profiles} alt="profiles" />
          <p className="text-center md:text-left">
            Simply through our extensive list of doctors, labs, and drugs.{" "}
            <br className="hidden sm:block" /> Schedule appointments easily.
          </p>
        </div>

        <a
          href="#specialty"
          className="flex items-center gap-2 bg-white px-6 py-3 rounded-full text-gray-700 font-medium text-sm hover:scale-105 transition-transform duration-300"
        >
          Book Appointment{" "}
          <img className="w-3" src={assets.arrow_icon} alt="arrow-icon" />
        </a>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 mt-8 md:mt-0 relative">
        <img
          className="w-full md:w-[90%] mx-auto h-auto rounded-lg object-contain"
          src={assets.header_img}
          alt="header"
        />
      </div>
    </div>
  );
};

export default Header;
