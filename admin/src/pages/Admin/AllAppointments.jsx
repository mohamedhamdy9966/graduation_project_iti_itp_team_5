import React from "react";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../../../client/src/assets/assets_admin/assets";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);
  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Provider</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>
        {appointments?.length > 0 ? (
          appointments.map((item, index) => (
            <div
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
              key={uuidv4()}
            >
              <p className="max-sm:hidden">{index + 1}</p>
              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full"
                  src={item.userData.image}
                  alt="user-image"
                />
                <p>{item.userData.name}</p>
              </div>
              <p className="max-sm:hidden">
                {calculateAge(item.userData.birthDate)}
              </p>
              <p>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>
              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full bg-gray-200"
                  src={
                    item.type === "doctor"
                      ? item.docData.image
                      : item.labData.image
                  }
                  alt={item.type === "doctor" ? "doctor-image" : "lab-image"}
                />
                <p>
                  {item.type === "doctor"
                    ? item.docData.name
                    : item.labData.name}
                </p>
              </div>
              <p>
                {currency}
                {item.amount}
              </p>
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id, item.type)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt="cancel"
                />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center py-4">
            No appointments found
          </p>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;
