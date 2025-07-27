import React, { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  return (
    <div className="flex flex-col items-center gap-4 my-16 px-4 md:px-10 text-gray-900">
      <h2 className="text-3xl font-semibold text-center">
        Top Doctors to Book
      </h2>
      <p className="sm:w-1/2 text-center text-sm text-gray-600">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
        {doctors.slice(0, 8).map((item) => (
          <div
            key={uuidv4()}
            onClick={() => {
              navigate(`/my-appointments/${item._id}`); // Updated path
              scrollTo(0, 0);
            }}
            className="border border-blue-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-2 cursor-pointer transition-all duration-300 bg-white"
          >
            <img
              className="w-full max-h-96 object-cover bg-blue-50"
              src={item.image}
              alt={item.name}
            />
            <div className="p-4 space-y-1">
              <div
                className={`flex items-center gap-2 text-sm ${
                  item.available ? "text-green-500" : "text-gray-500"
                }`}
              >
                <p
                  className={`w-2 h-2 ${
                    item.available ? "bg-green-500" : "bg-gray-500"
                  } rounded-full`}
                ></p>
                <p>{item.available ? "Available" : "Not Available"}</p>
              </div>
              <p className="text-lg font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">{item.specialty}</p>
            </div>
          </div>
        ))}
      </div>

      {/* More Button */}
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-blue-100 text-blue-700 px-8 py-2 rounded-full mt-10 hover:bg-blue-200 transition"
      >
        View All Doctors
      </button>
    </div>
  );
};

export default TopDoctors;
