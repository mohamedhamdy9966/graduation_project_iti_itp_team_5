import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { v4 as uuidv4 } from "uuid";

const Doctors = () => {
  const { specialty } = useParams();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const urlSpecialtyMap = {
    "general-physician": "General Physician",
    gynecologist: "Gynecologist",
    dermatologist: "Dermatologist",
    pediatrician: "Pediatrician",
    bones: "Bones",
    surgery: "Surgery",
    ent: "ENT",
  };

  const specialties = [
    "General Physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Bones",
    "Surgery",
    "ENT",
  ];

  const applyFilter = () => {
    if (specialty) {
      const normalizedspecialty =
        urlSpecialtyMap[specialty.toLowerCase()] || specialty;
      setFilterDoc(
        doctors.filter((doc) => doc.specialty === normalizedspecialty)
      );
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, specialty]);

  if (!doctors || doctors.length === 0) {
    return (
      <div className="px-4 md:px-16 pt-8 max-w-7xl mx-auto">
        <Helmet>
          <title>Find Doctors - Your Healthcare Platform</title>
          <meta
            name="description"
            content="Find expert doctors across various specialties at Your Healthcare Platform. Browse and book appointments with trusted medical professionals."
          />
          <meta
            name="keywords"
            content="find doctors, medical specialists, book appointments, healthcare, general physician, gynecologist, dermatologist, pediatrician, surgery, ENT"
          />
          <link rel="canonical" href="https://www.yourhealthcare.com/doctors" />
          <meta
            property="og:title"
            content="Find Doctors - Your Healthcare Platform"
          />
          <meta
            property="og:description"
            content="Find expert doctors across various specialties at Your Healthcare Platform. Browse and book appointments with trusted medical professionals."
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content="https://www.yourhealthcare.com/doctors"
          />
        </Helmet>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-16 pt-8 pb-12 max-w-7xl mx-auto">
      <Helmet>
        <title>
          {specialty
            ? `${
                urlSpecialtyMap[specialty] || specialty
              } Specialists - Your Healthcare Platform`
            : "Find Doctors - Your Healthcare Platform"}
        </title>
        <meta
          name="description"
          content={
            specialty
              ? `Browse expert ${
                  urlSpecialtyMap[specialty.toLowerCase()] || specialty
                } doctors at Your Healthcare Platform. Book appointments with trusted specialists.`
              : "Find expert doctors across various specialties at Your Healthcare Platform. Browse and book appointments with trusted medical professionals."
          }
        />
        <meta
          name="keywords"
          content={
            specialty
              ? `find ${
                  urlSpecialtyMap[specialty.toLowerCase()] || specialty
                } doctors, book appointments, healthcare, medical specialists`
              : "find doctors, medical specialists, book appointments, healthcare, general physician, gynecologist, dermatologist, pediatrician, surgery, ENT"
          }
        />
        <link
          rel="canonical"
          href={`https://www.yourhealthcare.com/doctors${
            specialty ? `/${specialty}` : ""
          }`}
        />
        <meta
          property="og:title"
          content={
            specialty
              ? `${
                  urlSpecialtyMap[specialty] || specialty
                } Specialists - Your Healthcare Platform`
              : "Find Doctors - Your Healthcare Platform"
          }
        />
        <meta
          property="og:description"
          content={
            specialty
              ? `Browse expert ${
                  urlSpecialtyMap[specialty.toLowerCase()] || specialty
                } doctors at Your Healthcare Platform. Book appointments with trusted specialists.`
              : "Find expert doctors across various specialties at Your Healthcare Platform. Browse and book appointments with trusted medical professionals."
          }
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://www.yourhealthcare.com/doctors${
            specialty ? `/${specialty}` : ""
          }`}
        />
      </Helmet>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {specialty
            ? `${urlSpecialtyMap[specialty] || specialty} Specialists`
            : "Our Specialist Doctors"}
        </h1>
        <p className="text-gray-600 text-lg">
          {specialty
            ? `Browse our expert ${
                urlSpecialtyMap[specialty.toLowerCase()] || specialty
              } doctors`
            : "Browse through our team of specialist doctors"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 flex-shrink-0">
          <button
            className={`lg:hidden mb-4 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              showFilter
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {showFilter ? "Hide Filters" : "Show Filters"}
          </button>

          <div
            className={`${
              showFilter ? "block" : "hidden lg:block"
            } bg-white p-4 rounded-xl shadow-sm border border-gray-200`}
          >
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">
              Specialties
            </h3>
            <div className="space-y-2">
              {specialties.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    specialty === item.toLowerCase().replace(/ /g, "-")
                      ? navigate("/doctors")
                      : navigate(
                          `/doctors/${item.toLowerCase().replace(/ /g, "-")}`
                        )
                  }
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all ${
                    specialty === item.toLowerCase().replace(/ /g, "-")
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {filterDoc.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterDoc.map((item) => (
                <div
                  key={uuidv4()}
                  onClick={() => navigate(`/my-appointments/${item._id}`)}
                  className="group border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg bg-white"
                >
                  <div className="relative overflow-hidden h-60">
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={item.image}
                      alt={item.name}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.available ? "bg-green-400" : "bg-gray-400"
                          }`}
                        ></div>
                        <span className="text-white text-sm">
                          {item.available ? "Available" : "Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium">
                      {item.specialty}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-gray-500 text-sm">
                        {item.experience} years experience
                      </span>
                      <span className="text-gray-500 text-sm">
                        {item.degree}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-800">
                No doctors found
              </h3>
              <p className="mt-1 text-gray-500">
                We couldn't find any doctors matching your criteria
              </p>
              <button
                onClick={() => navigate("/doctors")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View All Doctors
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
