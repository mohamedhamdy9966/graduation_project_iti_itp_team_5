import React from "react";
import { Helmet } from "react-helmet";
import { assets } from "../assets/assets_frontend/assets";
import { useNavigate } from "react-router-dom";

const DoctorsBanner = () => {
  const navigate = useNavigate();
  return (
    <div className="flex bg-blue-500 rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-">
      <Helmet>
        <title>Book with Trusted Doctors - Roshetta</title>
        <meta
          name="description"
          content="Book appointments with over 100 trusted doctors on Roshetta. Sign up today to access top healthcare professionals."
        />
        <meta
          name="keywords"
          content="book doctors, trusted doctors, healthcare, appointments, Roshetta"
        />
        <link rel="canonical" href="https://www.roshetta.com/doctors" />
        <meta
          property="og:title"
          content="Book with Trusted Doctors - Roshetta"
        />
        <meta
          property="og:description"
          content="Book appointments with over 100 trusted doctors on Roshetta. Sign up today to access top healthcare professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.roshetta.com/doctors" />
        <meta property="og:image" content={assets.appointment_img} />
      </Helmet>
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white">
          <p>Book Appointment</p>
          <p className="mt-4">With 100+ Trusted Doctors</p>
        </div>
        <button
          onClick={() => {
            navigate("/login");
            scrollTo(0, 0);
          }}
          className="bg-white text-sm sm:text-base text-gray-600 px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all"
        >
          Create Account
        </button>
      </div>
      <div className="hidden md:block md:w-1/2 lg:w-[370px] relative">
        <img
          className="w-full absolute bottom-0 right-0 max-w-md"
          src={assets.appointment_img}
          alt="appointment-img"
        />
      </div>
    </div>
  );
};

export default DoctorsBanner;
