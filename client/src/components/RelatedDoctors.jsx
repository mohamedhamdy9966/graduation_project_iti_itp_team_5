import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

const RelatedDoctors = ({ specialty, docId }) => {
  const { doctors } = useContext(AppContext);
  const [relDoc, setRealDocs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0 && specialty) {
      const doctorsData = doctors.filter(
        (doc) => doc.specialty === specialty && doc._id !== docId
      );
      setRealDocs(doctorsData);
    }
  }, [doctors, specialty, docId]);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h2 className="text-3xl font-medium">Top Doctors to Book</h2>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors
      </p>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {relDoc.slice(0, 5).map((item) => (
          <div
            key={uuidv4()}
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              scrollTo(0, 0);
            }}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
          >
            <img className="bg-blue-50" src={item.image} alt="doctor" />
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-center text-green-500">
                <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                <p>Available</p>
              </div>
              <p className="text-gray-900 text-lg fot-medium">{item.name}</p>
              <p className="text-gray-600 text-sm">{item.specialty}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10"
      >
        more
      </button>
    </div>
  );
};

export default RelatedDoctors;
