import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get userId and email from location state
  const { userId, email } = location.state || {};

  // Redirect if no userId or email
  useEffect(() => {
    if (!userId || !email) {
      toast.error("Invalid request. Please initiate password reset again.");
      navigate("/login");
    }
  }, [userId, email, navigate]);

  // Yup validation schema
  const resetSchema = Yup.object().shape({
    otp: Yup.string()
      .matches(/^\d{6}$/, "OTP must be a 6-digit number")
      .required("OTP is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  // Form submission handler
  const onSubmitHandler = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/reset-password`,
        {
          userId,
          otp: values.otp,
          newPassword: values.newPassword,
        }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/send-reset-otp`,
        {
          email,
        }
      );
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <Helmet>
        <title>Reset Password - Your Healthcare Platform</title>
        <meta
          name="description"
          content="Reset your password for Your Healthcare Platform using the OTP sent to your email."
        />
        <meta
          name="keywords"
          content="reset password, OTP verification, healthcare, medical platform"
        />
        <link
          rel="canonical"
          href="https://www.yourhealthcare.com/reset-password"
        />
        <meta
          property="og:title"
          content="Reset Password - Your Healthcare Platform"
        />
        <meta
          property="og:description"
          content="Reset your password for Your Healthcare Platform using the OTP sent to your email."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://www.yourhealthcare.com/reset-password"
        />
        <meta property="og:image" content={assets.logo} />
      </Helmet>
      <Formik
        initialValues={{ otp: "", newPassword: "", confirmPassword: "" }}
        validationSchema={resetSchema}
        onSubmit={onSubmitHandler}
      >
        {() => (
          <Form className="flex flex-col gap-6 p-8 w-full max-w-md bg-white border border-indigo-100 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
            <img
              src={assets.logo}
              alt="Roshetta logo"
              className="w-36 mx-auto mb-6 transform hover:scale-105 transition-transform duration-300"
            />
            <h1 className="text-3xl font-bold text-indigo-900 text-center">
              Reset Password
            </h1>
            <p className="text-indigo-600 text-center text-sm font-medium">
              Enter the 6-digit OTP sent to your email and your new password
            </p>
            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                OTP
              </label>
              <Field
                type="text"
                name="otp"
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter 6-digit OTP"
              />
              <ErrorMessage
                name="otp"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                New Password
              </label>
              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-500 hover:text-indigo-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible className="h-5 w-5" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <ErrorMessage
                name="newPassword"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-500 hover:text-indigo-600 transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible className="h-5 w-5" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-base font-semibold hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md disabled:opacity-50"
            >
              Reset Password
            </button>
            <p className="text-center text-indigo-700 text-sm font-medium">
              Didn't receive OTP?{" "}
              <span
                onClick={handleResendOtp}
                className="text-indigo-500 font-semibold underline cursor-pointer hover:text-indigo-600 transition-colors duration-200"
              >
                Resend OTP
              </span>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ResetPassword;
