import React from "react";
import { Helmet } from "react-helmet";
import { specialtyData } from "../assets/assets_frontend/assets";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const DoctorSpecialty = () => {
  return (
    <div
      className="flex flex-col items-center gap-6 py-16 text-gray-800 px-4 sm:px-8"
      id="doctorSpecialty"
    >
      <Helmet>
        <title>Find Doctors by Specialty - Roshetta</title>
        <meta
          name="description"
          content="Find doctors by specialty on Roshetta. Browse our extensive list of medical specialties to book appointments with trusted healthcare professionals."
        />
        <meta
          name="keywords"
          content="find doctors, medical specialties, book appointments, healthcare, Roshetta"
        />
        <link rel="canonical" href="https://www.roshetta.com/doctors" />
        <meta
          property="og:title"
          content="Find Doctors by Specialty - Roshetta"
        />
        <meta
          property="og:description"
          content="Find doctors by specialty on Roshetta. Browse our extensive list of medical specialties to book appointments with trusted healthcare professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.roshetta.com/doctors" />
      </Helmet>
      <h2 className="text-3xl font-semibold text-center">Find by Specialty</h2>
      <p className="sm:w-1/3 text-center text-sm text-gray-600">
        Simply browse through our extensive list of medical specialties and find
        the right doctor for your needs.
      </p>
      <div className="flex flex-wrap justify-center gap-6 pt-8 w-full max-w-6xl">
        {specialtyData.map((item) => (
          <Link
            onClick={() => scrollTo(0, 0)}
            key={uuidv4()}
            to={`/doctors/${item.specialty.toLowerCase().replace(/ /g, "-")}`}
            className="flex flex-col items-center text-xs cursor-pointer hover:translate-y-[-5px] transition-all duration-300 w-24 sm:w-28"
          >
            <img
              className="w-16 sm:w-20 mb-2 object-contain"
              src={item.image}
              alt={item.specialty}
            />
            <p className="text-center font-medium">{item.specialty}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DoctorSpecialty;
