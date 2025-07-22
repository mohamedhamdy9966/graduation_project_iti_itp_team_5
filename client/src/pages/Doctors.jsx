import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { v4 as uuidv4 } from "uuid";

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const navigate = useNavigate();
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };
  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);
  return (
    <div>
      <p className="text-gray-600">Browse through the doctors specialist</p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <div className="flex flex-col gap-4 text-sm text-gray-600">
          <p
            onClick={() =>
              speciality === "General-Physician"
                ? navigate("/doctors")
                : navigate("/doctors/General-Physician")
            }
            className={`w-[94vw] sm:w-auto py-1.5 pl-3 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "General-Physician" ? "bg-indigo-100 text-black" : "" }`}
          >
            General-Physician
          </p>
          <p
            onClick={() =>
              speciality === "Gynecologist"
                ? navigate("/doctors")
                : navigate("/doctors/Gynecologist")
            }
            className={`w-[94vw] sm:w-auto py-1.5 pl-3 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Gynecologist" ? "bg-indigo-100 text-black" : "" }`}
          >
            Gynecologist
          </p>
          <p
            onClick={() =>
              speciality === "Dermatologist"
                ? navigate("/doctors")
                : navigate("/doctors/Dermatologist")
            }
            className={`w-[94vw] sm:w-auto py-1.5 pl-3 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Dermatologist" ? "bg-indigo-100 text-black" : "" }`}
          >
            Dermatologist
          </p>
          <p
            onClick={() =>
              speciality === "Pediatrician"
                ? navigate("/doctors")
                : navigate("/doctors/Pediatrician")
            }
            className={`w-[94vw] sm:w-auto py-1.5 pl-3 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Pediatrician" ? "bg-indigo-100 text-black" : "" }`}
          >
            Pediatrician
          </p>
          <p
            onClick={() =>
              speciality === "Bones"
                ? navigate("/doctors")
                : navigate("/doctors/Bones")
            }
            className={`w-[94vw] sm:w-auto py-1.5 pl-3 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Bones" ? "bg-indigo-100 text-black" : "" }`}
          >
            Bones
          </p>
          <p
            onClick={() =>
              speciality === "Surgery"
                ? navigate("/doctors")
                : navigate("/doctors/Surgery")
            }
            className={`w-[94vw] sm:w-auto py-1.5 pl-3 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Surgery" ? "bg-indigo-100 text-black" : "" }`}
          >
            Surgery
          </p>
          <p
            onClick={() =>
              speciality === "ENT"
                ? navigate("/doctors")
                : navigate("/doctors/ENT")
            }
            className={`w-[94vw] sm:w-auto py-1.5 pl-3 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "ENT" ? "bg-indigo-100 text-black" : "" }`}
          >
            ENT
          </p>
        </div>
        <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
          {filterDoc.map((item) => (
            <div
              key={uuidv4()}
              onClick={() => navigate(`/appointment/${item._id}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
            >
              <img className="bg-blue-50" src={item.image} alt="doctor" />
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-center text-green-500">
                  <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                  <p>Available</p>
                </div>
                <p className="text-gray-900 text-lg fot-medium">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
