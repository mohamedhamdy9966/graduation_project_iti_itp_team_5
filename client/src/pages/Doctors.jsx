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
  const [filters, setFilters] = useState({
    specialty: "",
    experience: "",
    availability: "",
    minFees: "",
    maxFees: "",
    minRating: "",
  });
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

  const experienceOptions = [
    { label: "Any", value: "" },
    { label: "0-5 years", value: "0-5" },
    { label: "5-10 years", value: "5-10" },
    { label: "10+ years", value: "10+" },
  ];

  const ratingOptions = [
    { label: "Any", value: "" },
    { label: "3+ Stars", value: "3" },
    { label: "4+ Stars", value: "4" },
    { label: "5 Stars", value: "5" },
  ];

  const applyFilter = () => {
    let filtered = doctors;

    // Specialty filter
    if (filters.specialty || specialty) {
      const normalizedSpecialty =
        urlSpecialtyMap[filters.specialty.toLowerCase()] ||
        filters.specialty ||
        urlSpecialtyMap[specialty?.toLowerCase()] ||
        specialty;
      filtered = filtered.filter(
        (doc) => doc.specialty === normalizedSpecialty
      );
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter((doc) => {
        const years = parseInt(doc.experience) || 0;
        if (filters.experience === "0-5") return years <= 5;
        if (filters.experience === "5-10") return years > 5 && years <= 10;
        if (filters.experience === "10+") return years > 10;
        return true;
      });
    }

    // Availability filter
    if (filters.availability !== "") {
      filtered = filtered.filter(
        (doc) => doc.available === (filters.availability === "true")
      );
    }

    // Fees filter
    if (filters.minFees) {
      filtered = filtered.filter(
        (doc) => doc.fees >= parseFloat(filters.minFees)
      );
    }
    if (filters.maxFees) {
      filtered = filtered.filter(
        (doc) => doc.fees <= parseFloat(filters.maxFees)
      );
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter((doc) => {
        const avgRating =
          doc.ratings.length > 0
            ? doc.ratings.reduce((sum, r) => sum + r.rating, 0) /
              doc.ratings.length
            : 0;
        return avgRating >= parseFloat(filters.minRating);
      });
    }

    setFilterDoc(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      specialty: "",
      experience: "",
      availability: "",
      minFees: "",
      maxFees: "",
      minRating: "",
    });
    navigate("/doctors");
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, specialty, filters]);

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
            <div className="h-8 bg-[#B2EBF2] rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#B2EBF2] rounded-xl h-80"></div>
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
        <h1 className="text-3xl font-bold text-[#212121] mb-2">
          {specialty
            ? `${urlSpecialtyMap[specialty] || specialty} Specialists`
            : "Our Specialist Doctors"}
        </h1>
        <p className="text-[#757575] text-lg">
          {specialty
            ? `Browse our expert ${
                urlSpecialtyMap[specialty.toLowerCase()] || specialty
              } doctors`
            : "Browse through our team of specialist doctors"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <button
            className={`lg:hidden mb-4 py-2 px-4 border border-[#BDBDBD] rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              showFilter
                ? "bg-[#00BCD4] text-white"
                : "bg-white text-[#212121] hover:bg-[#B2EBF2]"
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
            } bg-[#00BCD4] p-4 rounded-xl shadow-sm border border-[#B2EBF2]`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-white text-lg">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-white hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Specialty Filter */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Specialty</h4>
              <select
                name="specialty"
                value={
                  filters.specialty ||
                  (specialty ? urlSpecialtyMap[specialty] || specialty : "")
                }
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg text-[#212121]"
              >
                <option value="">All Specialties</option>
                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Experience</h4>
              <select
                name="experience"
                value={filters.experience}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg text-[#212121]"
              >
                {experienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Availability</h4>
              <select
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg text-[#212121]"
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>

            {/* Fees Filter */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Fees Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minFees"
                  value={filters.minFees}
                  onChange={handleFilterChange}
                  placeholder="Min Fees"
                  className="w-1/2 p-2 rounded-lg text-[#212121]"
                />
                <input
                  type="number"
                  name="maxFees"
                  value={filters.maxFees}
                  onChange={handleFilterChange}
                  placeholder="Max Fees"
                  className="w-1/2 p-2 rounded-lg text-[#212121]"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Minimum Rating</h4>
              <select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-lg text-[#212121]"
              >
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="flex-1">
          {filterDoc.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterDoc.map((item) => (
                <div
                  key={uuidv4()}
                  onClick={() => navigate(`/my-appointments/${item._id}`)}
                  className="group border border-[#B2EBF2] rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg bg-white"
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
                            item.available ? "bg-green-400" : "bg-[#BDBDBD]"
                          }`}
                        ></div>
                        <span className="text-white text-sm">
                          {item.available ? "Available" : "Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#212121]">
                      {item.name}
                    </h3>
                    <p className="text-[#00BCD4] text-sm font-medium">
                      {item.specialty}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[#757575] text-sm">
                        {item.experience} years experience
                      </span>
                      <span className="text-[#757575] text-sm">
                        {item.degree}
                      </span>
                    </div>
                    <div className="mt-2 text-[#757575] text-sm">
                      Fees: ${item.fees}
                    </div>
                    <div className="mt-2 text-[#757575] text-sm">
                      Rating:{" "}
                      {item.ratings.length > 0
                        ? (
                            item.ratings.reduce((sum, r) => sum + r.rating, 0) /
                            item.ratings.length
                          ).toFixed(1)
                        : "No ratings"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-[#B2EBF2]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-[#BDBDBD]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-[#212121]">
                No doctors found
              </h3>
              <p className="mt-1 text-[#757575]">
                We couldn't find any doctors matching your criteria
              </p>
              <button
                onClick={() => navigate("/doctors")}
                className="mt-4 px-4 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#0097A7] transition-colors text-sm font-medium"
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
