import React from "react";
import { specialityData } from "../assets/assets_frontend/assets";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const DoctorSpecialty = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-gray-800" id="doctorSpecialty">
      <h2 className="text-3xl font-medium">Find by specialty</h2>
      <p className="sm:w-1/3 text-center text-sm">Simply Browse through extensive </p>
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
        {specialityData.map((item) => (
          <Link onClick={()=>scrollTo(0,0)} key={uuidv4()} className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500" to={`/doctors/${item.speciality}`}>
            <img className="w-16 sm:w-24 mb-2" src={item.image} />
            <p>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DoctorSpecialty;
