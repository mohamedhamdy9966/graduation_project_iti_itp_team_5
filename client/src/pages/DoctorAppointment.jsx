import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import { v4 as uuidv4 } from "uuid";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorAppointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const daysOfWeek = ["SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"];
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const doc = doctors.find((doc) => doc._id === docId);
    setDocInfo(doc);
  }, [doctors, docId]);

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }
    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }
    try {
      const date = docSlots[slotIndex][0].dateTime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;
      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!docInfo) return;

    setDocSlots([]);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (i === 0) {
        // For today, start from next hour or 10 AM, whichever is later
        const nextHour = Math.max(currentDate.getHours() + 1, 10);
        currentDate.setHours(nextHour);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        // For future days, start from 10 AM
        currentDate.setHours(10, 0, 0, 0);
      }

      let timeSlots = [];

      // Generate time slots every 30 minutes
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        // Check if slot is available (not booked)
        const slotsBooked = docInfo.slotsBooked || {};
        const isSlotAvailable = !(
          slotsBooked[slotDate] && slotsBooked[slotDate].includes(slotTime)
        );

        if (isSlotAvailable) {
          // Add available slots to array
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime,
          });
        }

        // Increment current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  }, [docInfo]);

  if (!docInfo) return null;

  return (
    <div className="px-4 md:px-16 pt-8">
      {/* Doctor Info Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={docInfo.image}
          alt="doctor"
          className="w-full md:max-w-[280px] rounded-lg shadow"
        />
        <div className="flex-1 border border-gray-300 rounded-lg p-6 bg-white">
          <div className="flex items-center gap-2 text-2xl font-semibold text-gray-800">
            {docInfo.name}
            <img className="w-5" src={assets.verified_icon} alt="verified" />
          </div>
          <div className="flex items-center gap-3 text-sm mt-1 text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.specialty}
            </p>
            <span className="py-1 px-3 border rounded-full text-xs">
              {docInfo.experience}
            </span>
          </div>
          <div className="mt-4">
            <p className="flex items-center gap-1 font-medium text-sm text-gray-800">
              About <img src={assets.info_icon} alt="info" />
            </p>
            <p className="text-gray-500 mt-1 text-sm leading-relaxed">
              {docInfo.about}
            </p>
          </div>
          <p className="mt-4 font-medium text-gray-600">
            Appointment Fee:{" "}
            <span className="text-gray-800">
              {currencySymbol}
              {docInfo.fees}
            </span>
          </p>
        </div>
      </div>

      {/* Booking Section */}
      <div className="mt-10 text-gray-800">
        <p className="font-semibold mb-3">Booking Slots</p>

        {/* Date Slots */}
        <div className="flex overflow-x-auto gap-3 pb-3">
          {docSlots.map((slots, index) => (
            <div
              key={uuidv4()}
              onClick={() => setSlotIndex(index)}
              className={`min-w-[70px] text-center py-4 rounded-lg cursor-pointer transition-all ${
                slotIndex === index
                  ? "bg-blue-500 text-white"
                  : "border border-gray-300 bg-white"
              }`}
            >
              <p>{slots[0] && daysOfWeek[slots[0].dateTime.getDay()]}</p>
              <p>{slots[0] && slots[0].dateTime.getDate()}</p>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="flex overflow-x-auto gap-3 mt-4">
          {docSlots[slotIndex]?.map((slot) => (
            <p
              key={uuidv4()}
              onClick={() => setSlotTime(slot.time)}
              className={`text-sm flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition-all ${
                slot.time === slotTime
                  ? "bg-blue-500 text-white"
                  : "border border-gray-300 text-gray-600"
              }`}
            >
              {slot.time}
            </p>
          ))}
        </div>

        <button
          onClick={bookAppointment}
          disabled={!slotTime}
          className={`mt-6 px-10 py-3 rounded-full text-sm transition-all ${
            slotTime
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Book an Appointment
        </button>
      </div>

      {/* Related Doctors */}
      <div className="mt-16">
        <RelatedDoctors docId={docId} specialty={docInfo.specialty} />
      </div>
    </div>
  );
};

export default DoctorAppointment;
