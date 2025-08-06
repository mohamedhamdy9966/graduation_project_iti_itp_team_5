import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Extract payment details from URL parameters if available
    const sessionId = searchParams.get('session_id');
    const paymentIntentId = searchParams.get('payment_intent');
    const appointmentId = searchParams.get('appointment_id');
    
    setPaymentDetails({
      sessionId,
      paymentIntentId,
      appointmentId
    });

    // Auto redirect to appointments after 5 seconds
    const timer = setTimeout(() => {
      navigate('/my-appointments');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Helmet>
        <title>Payment Successful - Your Healthcare Platform</title>
        <meta name="description" content="Your payment has been processed successfully. Your appointment has been confirmed." />
      </Helmet>
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your appointment has been booked and payment has been processed successfully.
          </p>
        </div>

        {paymentDetails?.appointmentId && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">Appointment Details</h3>
            <p className="text-sm text-green-700">
              Appointment ID: {paymentDetails.appointmentId}
            </p>
            {paymentDetails.sessionId && (
              <p className="text-sm text-green-700">
                Transaction ID: {paymentDetails.sessionId}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/my-appointments')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            View My Appointments
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
          </svg>
          Redirecting to appointments in 5 seconds...
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;