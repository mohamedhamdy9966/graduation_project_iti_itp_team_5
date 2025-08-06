import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { AppContext } from "../context/AppContext";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";

const MyDoctorsAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const getUserAppointments = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        console.log("Appointments loaded:", data.appointments.length);
        setAppointments(data.appointments.reverse());

        // Check for recent payments
        const recentlyPaid = data.appointments.filter(
          (apt) => apt.payment && apt.paymentStatus === "completed"
        );

        if (recentlyPaid.length > 0) {
          console.log("Recently paid appointments:", recentlyPaid.length);
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced payment success handling
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const appointmentId = searchParams.get("appointment_id");

    if (sessionId && appointmentId) {
      console.log("Payment success detected, refreshing appointments...");
      toast.success("Payment successful! Your appointment is confirmed.");

      // Clear URL params immediately
      navigate("/my-appointments", { replace: true });

      // Multiple refresh attempts to ensure webhook processing
      const refreshAttempts = [1000, 3000, 5000, 8000]; // 1s, 3s, 5s, 8s

      refreshAttempts.forEach((delay, index) => {
        setTimeout(() => {
          console.log(`Refresh attempt ${index + 1} after payment success`);
          getUserAppointments();
        }, delay);
      });
    }
  }, [searchParams, navigate]);

  // Enhanced auto-refresh logic
  useEffect(() => {
    if (appointments.length === 0) return;

    const pendingPayments = appointments.filter(
      (apt) => !apt.payment && !apt.cancelled && !apt.isCompleted
    );

    const processingPayments = appointments.filter(
      (apt) => apt.paymentStatus === "pending" && !apt.cancelled
    );

    // Refresh more frequently if there are pending/processing payments
    if (pendingPayments.length > 0 || processingPayments.length > 0) {
      console.log(
        `Auto-refresh active: ${pendingPayments.length} pending, ${processingPayments.length} processing`
      );

      const interval = setInterval(() => {
        console.log("Auto-refreshing appointments...");
        getUserAppointments();
      }, 15000); // 15 seconds for faster updates

      return () => clearInterval(interval);
    }
  }, [appointments]);

  // Verify specific appointment status
  const verifyPaymentStatus = async (appointmentId) => {
    try {
      console.log("Verifying payment status for:", appointmentId);

      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        const appointment = data.appointments.find(
          (apt) => apt._id === appointmentId
        );
        if (
          appointment &&
          appointment.payment &&
          appointment.paymentStatus === "completed"
        ) {
          toast.success("Payment confirmed! Refreshing appointments...");
          getUserAppointments();
        }
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
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
      console.log("Initiating Stripe payment for:", appointmentId);

      const { data } = await axios.post(
        backendUrl + "/api/user/pay-appointment-stripe",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        console.log("Redirecting to Stripe checkout...");
        // Store appointment ID for verification after payment
        localStorage.setItem("pendingPayment", appointmentId);
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error(error.message);
    }
  };

  const payWithPaymob = async (appointmentId) => {
    try {
      console.log("Initiating Paymob payment for:", appointmentId);

      const { data } = await axios.post(
        backendUrl + "/api/user/pay-appointment-paymob",
        { appointmentId },
        { headers: { token, origin: window.location.origin } }
      );

      if (data.success) {
        console.log("Redirecting to Paymob checkout...");
        // Store appointment ID for verification after payment
        localStorage.setItem("pendingPayment", appointmentId);
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Paymob payment error:", error);
      toast.error(error.message);
    }
  };

  const getPaymentStatusBadge = (appointment) => {
    if (appointment.cancelled) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Cancelled
        </span>
      );
    }

    if (appointment.isCompleted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    }

    if (appointment.payment && appointment.paymentStatus === "completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Paid ✓
        </span>
      );
    }

    if (appointment.paymentStatus === "pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Processing Payment...
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Payment Required
      </span>
    );
  };

  // Check for pending payment verification on component mount
  useEffect(() => {
    const pendingPayment = localStorage.getItem("pendingPayment");
    if (pendingPayment && token) {
      console.log("Checking pending payment:", pendingPayment);

      // Remove from localStorage
      localStorage.removeItem("pendingPayment");

      // Verify payment status after a delay
      setTimeout(() => {
        verifyPaymentStatus(pendingPayment);
      }, 2000);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getUserAppointments(true);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 mt-12">
      <Helmet>
        <title>My Appointments - Your Healthcare Platform</title>
        <meta
          name="description"
          content="View and manage your doctor and lab appointments on Your Healthcare Platform. Pay, cancel, or track your medical appointments easily."
        />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <p className="text-lg font-semibold text-zinc-700">
          My Appointments ({appointments.length})
        </p>
        <button
          onClick={() => getUserAppointments(false)}
          className={`px-4 py-2 rounded transition-colors ${
            refreshing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Status indicator for pending payments */}
      {appointments.some((apt) => apt.paymentStatus === "pending") && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⏱️ Some payments are being processed. Status will update
            automatically.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments found.</p>
          </div>
        ) : (
          appointments.map((item) => (
            <div
              key={uuidv4()}
              className={`flex flex-col md:flex-row md:items-start gap-4 border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
                item.payment && item.paymentStatus === "completed"
                  ? "border-green-200 bg-green-50"
                  : item.paymentStatus === "pending"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex-shrink-0">
                <img
                  className="w-32 h-32 object-cover rounded-lg bg-indigo-50"
                  src={item.docData.image}
                  alt={item.labId ? "lab" : "doctor"}
                />
              </div>

              <div className="flex-1 text-sm text-zinc-600 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-neutral-800 font-semibold text-base">
                    {item.docData.name}
                  </p>
                  {getPaymentStatusBadge(item)}
                </div>

                <p className="text-gray-600">
                  {item.docData.specialty || "Laboratory"}
                </p>

                <div>
                  <p className="text-zinc-700 font-medium">Address:</p>
                  <p className="text-xs text-gray-600">
                    {item.docData.address.line1}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.docData.address.line2}
                  </p>
                </div>

                <p className="text-sm">
                  <span className="font-medium text-neutral-700">
                    Date & Time:
                  </span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>

                <p className="text-sm">
                  <span className="font-medium text-neutral-700">Amount:</span>{" "}
                  EGP {item.amount}
                </p>

                {item.paymentStatus === "completed" && item.paidAmount && (
                  <p className="text-sm text-green-600">
                    <span className="font-medium">Paid Amount:</span> EGP{" "}
                    {item.paidAmount}
                  </p>
                )}

                {item.stripeSessionId && (
                  <p className="text-xs text-gray-500">
                    Transaction ID: {item.stripeSessionId}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                {!item.cancelled &&
                  item.payment &&
                  item.paymentStatus === "completed" &&
                  !item.isCompleted && (
                    <button className="py-2 px-4 bg-green-50 border border-green-200 text-green-700 rounded font-medium">
                      ✓ Paid - Confirmed
                    </button>
                  )}

                {item.paymentStatus === "pending" && (
                  <button
                    onClick={() => verifyPaymentStatus(item._id)}
                    className="py-2 px-4 border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50 transition-all duration-300"
                  >
                    Check Payment Status
                  </button>
                )}

                {!item.cancelled &&
                  !item.payment &&
                  !item.isCompleted &&
                  item.paymentStatus !== "pending" && (
                    <>
                      <button
                        onClick={() => payWithStripe(item._id)}
                        className="py-2 px-4 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-all duration-300"
                      >
                        Pay with Stripe
                      </button>
                      <button
                        onClick={() => payWithPaymob(item._id)}
                        className="py-2 px-4 border border-purple-500 text-purple-500 rounded hover:bg-purple-500 hover:text-white transition-all duration-300"
                      >
                        Pay with Paymob
                      </button>
                    </>
                  )}

                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="py-2 px-4 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    Cancel Appointment
                  </button>
                )}

                {item.cancelled && (
                  <button className="py-2 px-4 border border-red-500 text-red-500 rounded opacity-60 cursor-not-allowed">
                    Appointment Cancelled
                  </button>
                )}

                {item.isCompleted && (
                  <button className="py-2 px-4 border border-green-500 text-green-500 rounded opacity-60 cursor-not-allowed">
                    Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyDoctorsAppointments;
