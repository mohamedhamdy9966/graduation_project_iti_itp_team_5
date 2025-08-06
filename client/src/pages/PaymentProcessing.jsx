import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const PaymentProcessing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect after 10 seconds if still processing
    const timer = setTimeout(() => {
      navigate("/my-appointments");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Helmet>
        <title>Processing Payment - Your Healthcare Platform</title>
        <meta
          name="description"
          content="Processing your payment. Please wait while we confirm your transaction."
        />
      </Helmet>

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Payment...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment. Do not close this page.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              This may take a few moments. We'll redirect you automatically once
              complete.
            </p>
          </div>

          <button
            onClick={() => navigate("/my-appointments")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Check Appointments Manually
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessing;
