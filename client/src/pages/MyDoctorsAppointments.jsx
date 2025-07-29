import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyDoctorsAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const months = [
    "",
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };
  const navigate = useNavigate();
  
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const payWithStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/pay-appointment-stripe",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const payWithPaymob = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/pay-appointment-paymob",
        { appointmentId },
        { headers: { token, origin: window.location.origin } }
      );
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div className="px-4 md:px-10 mt-12">
      <p className="pb-3 text-lg font-semibold text-zinc-700 border-b mb-4">
        My Appointments
      </p>
      <div className="space-y-6">
        {appointments.slice(0, 3).map((item) => (
          <div
            key={uuidv4()}
            className="flex flex-col md:flex-row md:items-start gap-4 border rounded-lg p-4 shadow-sm"
          >
            {/* Doctor/Lab Image */}
            <div className="flex-shrink-0">
              <img
                className="w-32 h-32 object-cover rounded bg-indigo-50"
                src={item.docData.image}
                alt={item.labId ? "lab" : "doctor"}
              />
            </div>

            {/* Doctor/Lab Info */}
            <div className="flex-1 text-sm text-zinc-600 space-y-1">
              <p className="text-neutral-800 font-semibold text-base">
                {item.docData.name}
              </p>
              <p>{item.docData.specialty || "Laboratory"}</p>
              <div>
                <p className="text-zinc-700 font-medium mt-2">Address:</p>
                <p className="text-xs">{item.docData.address.line1}</p>
                <p className="text-xs">{item.docData.address.line2}</p>
              </div>
              <p className="text-xs mt-2">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
              <p className="text-xs mt-2">
                <span className="text-sm text-neutral-700 font-medium">
                  Amount:
                </span>{" "}
                EGP {item.amount}
              </p>
            </div>
            <div></div>
            {/* Actions */}
            <div className="flex flex-col justify-between gap-3 mt-4 md:mt-0">
              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border text-stone-500 bg-indigo-50">
                  Paid
                </button>
              )}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <>
                  <button
                    onClick={() => payWithStripe(item._id)}
                    className="text-sm text-stone-500 py-2 px-4 border rounded hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    Pay with Stripe
                  </button>
                  <button
                    onClick={() => payWithPaymob(item._id)}
                    className="text-sm text-stone-500 py-2 px-4 border rounded hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    Pay with Paymob
                  </button>
                </>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-stone-500 py-2 px-4 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel Appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border-red-500 rounded text-red-500">
                  Appointment Cancelled
                </button>
              )}
              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                  Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyDoctorsAppointments;
