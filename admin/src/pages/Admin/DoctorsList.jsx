import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeDoctorAvailability } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h2 className="text-lg font-medium">All Doctors</h2>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors &&
          doctors.length > 0 &&
          doctors.map((item) =>
            item && item._id ? (
              <div
                className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
                key={item._id}
              >
                <img
                  className="bg-indigo-50 group-hover:bg-blue-600 transition-all duration-500"
                  src={item.image}
                  alt="image"
                />
                <div className="p-4">
                  <p className="text-neutral-800 text-lg font-medium">
                    {item.name}
                  </p>
                  <p className="text-zinc-600 text-sm">{item.specialty}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <input
                      onChange={() => changeDoctorAvailability(item._id)}
                      type="checkbox"
                      checked={item.available ?? false}
                    />
                    <p>Available</p>
                  </div>
                </div>
              </div>
            ) : null
          )}
      </div>
    </div>
  );
};

export default DoctorsList;
