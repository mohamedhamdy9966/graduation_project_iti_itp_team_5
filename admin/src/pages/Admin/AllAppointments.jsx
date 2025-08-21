import React, { useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

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
        {/* Header Row */}
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
              key={uuidv4()}
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            >
              {/* Index */}
              <p className="max-sm:hidden">{index + 1}</p>

              {/* Patient Info */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full"
                  src={item?.userData?.image || assets.default_user}
                  alt="user-image"
                />
                <p>{item?.userData?.name || "Unknown User"}</p>
              </div>

              {/* Age */}
              <p className="max-sm:hidden">
                {item?.userData?.birthDate
                  ? calculateAge(item.userData.birthDate)
                  : "-"}
              </p>

              {/* Date & Time */}
              <p>
                {item?.slotDate ? slotDateFormat(item.slotDate) : "N/A"},{" "}
                {item?.slotTime || "N/A"}
              </p>

              {/* Provider Info */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full bg-gray-200"
                  src={
                    item?.type === "doctor"
                      ? item?.docData?.image || assets.default_doctor
                      : item?.labData?.image || assets.default_lab
                  }
                  alt={item?.type === "doctor" ? "doctor-image" : "lab-image"}
                />
                <p>
                  {item?.type === "doctor"
                    ? item?.docData?.name || "Unknown Doctor"
                    : item?.labData?.name || "Unknown Lab"}
                </p>
              </div>

              {/* Fees */}
              <p>
                {currency}
                {item?.amount ?? 0}
              </p>

              {/* Actions */}
              {item?.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item?.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item?._id, item?.type)}
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
