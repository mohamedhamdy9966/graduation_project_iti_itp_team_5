import { useState } from "react";
import { createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const LabContext = createContext();

const LabContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [lToken, setLToken] = useState(
    localStorage.getItem("lToken") ? localStorage.getItem("lToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/lab/appointments", {
        headers: { lToken },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/lab/complete-appointment",
        { appointmentId },
        { headers: { lToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/lab/cancel-appointment",
        { appointmentId },
        { headers: { lToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/lab/dashboard", {
        headers: { lToken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/lab/profile", {
        headers: { lToken },
      });
      if (data.success) {
        setProfileData(data.profileData);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    lToken,
    setLToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
  };
  return (
    <LabContext.Provider value={value}>{props.children}</LabContext.Provider>
  );
};

export default LabContextProvider;
