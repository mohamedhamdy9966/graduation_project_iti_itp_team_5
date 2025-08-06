import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    // Extract error details from URL parameters if available
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const appointmentId = searchParams.get("appointment_id");

    setErrorDetails({
      error,
      errorDescription,
      appointmentId,
    });
  }, [searchParams]);

  const handleRetryPayment = () => {
    if (errorDetails?.appointmentId) {
      // Navigate back to appointments where user can retry payment
      navigate("/my-appointments");
    } else {
      // Navigate to doctors to book a new appointment
      navigate("/doctors");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Helmet>
        <title>Payment Failed - Your Healthcare Platform</title>
        <meta
          name="description"
          content="Payment could not be processed. Please try again or use a different payment method."
        />
      </Helmet>

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600">
            Your payment could not be processed. Please try again or use a
            different payment method.
          </p>
        </div>

        {errorDetails?.error && (
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
            <p className="text-sm text-red-700">
              {errorDetails.errorDescription || errorDetails.error}
            </p>
            {errorDetails.appointmentId && (
              <p className="text-sm text-red-700 mt-1">
                Appointment ID: {errorDetails.appointmentId}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {errorDetails?.appointmentId
              ? "Retry Payment"
              : "Book New Appointment"}
          </button>

          <button
            onClick={() => navigate("/my-appointments")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            View My Appointments
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Need Help?</p>
          <p className="text-sm text-blue-700">
            If you continue to experience issues, please contact our support
            team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
