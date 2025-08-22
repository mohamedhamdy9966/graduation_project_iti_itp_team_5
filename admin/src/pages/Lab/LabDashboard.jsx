import React, { useContext, useEffect } from "react";
import { LabContext } from "../../context/LabContext";
import { assets } from "../../assets/assets";
import { v4 as uuidv4 } from "uuid";
import { AppContext } from "../../context/AppContext";

const LabDashboard = () => {
  const {
    lToken,
    dashData,
    setDashData,
    getDashData,
    cancelAppointment,
    completeAppointment,
  } = useContext(LabContext);
  const { currency, slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (lToken) {
      getDashData();
    }
  }, [lToken]);
  return (
    <div className="m-5">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.earning_icon} alt="lab" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {currency}
              {dashData.earnings}
            </p>
            <p className="text-gray-400">Earnings</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.appointment_icon} alt="lab" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashData.appointments}
            </p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.patients_icon} alt="doctor" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashData.patients}
            </p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
          <img src={assets.list_icon} alt="list-icon" />
          <p className="font-semibold">Latest Bookings</p>
        </div>

        <div className="pt-4 border border-t-0">
          {dashData?.latestAppointments?.map((item) => (
            <div
              className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
              key={uuidv4()}
            >
              <img
                className="rounded-full w-10"
                src={item.userData.image}
                alt="doctor-image"
              />
              <div className="flex-1 text-sm">
                <p className="text-gray-800 font-medium">
                  {item.userData.name}
                </p>
                <p className="text-gray-600">{slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-400 text-xs font-medium">Completed</p>
              ) : (
                <div className="flex">
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className="w-10 cursor-pointer"
                    src={assets.cancel_icon}
                    alt="cancel"
                  />
                  <img
                    onClick={() => completeAppointment(item._id)}
                    className="w-10 cursor-pointer"
                    src={assets.tick_icon}
                    alt="tick"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
