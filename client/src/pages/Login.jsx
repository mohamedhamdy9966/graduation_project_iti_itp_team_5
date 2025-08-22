import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
// import { logo } from "../assets/assets";
import logo from "../assets/logo8.png";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaTint,
  FaVenusMars,
  FaShieldAlt,
  FaAllergies,
  FaGoogle,
  FaApple,
} from "react-icons/fa";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState("Sign Up");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");

  // Yup validation schemas
  const loginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const signUpSchema = Yup.object().shape({
    name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile: Yup.string()
      .matches(/^[0-9]{10,}$/, "Invalid mobile number")
      .required("Mobile number is required"),
    birthDate: Yup.date().required("Birth date is required"),
    bloodType: Yup.string()
      .oneOf(
        ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        "Invalid blood type"
      )
      .required("Blood type is required"),
    gender: Yup.string()
      .oneOf(["Male", "Female", "Other"], "Invalid gender")
      .required("Gender is required"),
    medicalInsurance: Yup.string().required("Medical insurance is required"),
    allergy: Yup.string(),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  // Initial form values
  const initialValues = {
    name: "",
    email: "",
    mobile: "",
    birthDate: "",
    bloodType: "",
    medicalInsurance: "",
    gender: "",
    allergy: "",
    password: "",
    confirmPassword: "",
  };

  // Form submission handler
  const onSubmitHandler = async (values, { setSubmitting }) => {
    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name: values.name,
          password: values.password,
          email: values.email,
          mobile: values.mobile,
          birthDate: values.birthDate,
          bloodType: values.bloodType,
          medicalInsurance: values.medicalInsurance,
          gender: values.gender,
          allergy: {
            list: values.allergy
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          },
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message);
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else if (state === "Login") {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email: values.email,
          password: values.password,
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message);
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (values, { setSubmitting }) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/send-reset-otp`,
        {
          email: values.email,
        }
      );
      if (data.success) {
        toast.success(data.message);
        setEmailForReset(values.email);
        navigate("/reset-password", {
          state: { userId: data.userId, email: values.email },
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Google Sign-In success handler
  const handleGoogleSuccess = async (response) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/google-auth`, {
        token: response.credential,
      });
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success("Google authentication successful");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Google authentication failed");
    }
  };

  // Google Sign-In failure handler
  const handleGoogleFailure = (error) => {
    console.error("Google Sign-In error:", error);
    toast.error("Google Sign-In failed");
  };

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    window.AppleID.auth.init({
      clientId: import.meta.env.VITE_APPLE_CLIENT_ID, // from Apple Developer console
      scope: "name email",
      redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI, // must match your Apple app settings
      usePopup: true,
    });
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center  justify-center bg-gradient-to-b from-[#B2EBF2] to-white px-4">
        <Helmet>
          <title>
            Roshetta |{" "}
            {state === "Sign Up"
              ? "Create Account"
              : forgotPassword
              ? "Reset Password"
              : "Login"}
          </title>
        </Helmet>
        <div className="w-full max-w-md my-10 bg-white p-8 rounded-2xl shadow-lg border border-[#BDBDBD]">
          <div className="flex justify-center mb-6">
            <div className="flex items-center mb-4">
              <img
                src={logo}
                width={45}
                height={45}
                alt="Logo5"
                className="mr-0 mb-2"
              />
              <span
                className="text-2xl font-bold mr-2 text-[#0097A7]"
                style={{ fontFamily: "var(--logo-font)", letterSpacing: "1px" }}
              >
                Roshetta
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-[#0097A7] mb-6">
            {state === "Sign Up"
              ? "Create Account"
              : forgotPassword
              ? "Reset Password"
              : "Login"}
          </h2>

          {forgotPassword ? (
            <Formik
              initialValues={{ email: "" }}
              validationSchema={forgotPasswordSchema}
              onSubmit={handleForgotPassword}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-[#212121] text-sm font-semibold mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-[#009688]" />
                      </div>
                      <Field
                        type="email"
                        name="email"
                        className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#00BCD4] to-[#0097A7] text-white rounded-lg text-base font-semibold hover:from-[#0097A7] hover:to-[#00838F] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:ring-offset-2 transition-all duration-300 shadow-md disabled:opacity-50"
                  >
                    Send Reset OTP
                  </button>
                  <p className="text-center text-[#757575] text-sm font-medium mt-4">
                    Back to{" "}
                    <span
                      onClick={() => setForgotPassword(false)}
                      className="text-[#009688] font-semibold underline cursor-pointer hover:text-[#00897B] transition-colors duration-200"
                    >
                      Login
                    </span>
                  </p>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={
                state === "Sign Up" ? signUpSchema : loginSchema
              }
              onSubmit={onSubmitHandler}
            >
              {({ isSubmitting }) => (
                <Form>
                  {state === "Sign Up" && (
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block text-[#212121] text-sm font-semibold mb-2"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-[#009688]" />
                        </div>
                        <Field
                          type="text"
                          name="name"
                          className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-[#212121] text-sm font-semibold mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-[#009688]" />
                      </div>
                      <Field
                        type="email"
                        name="email"
                        className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  {state === "Sign Up" && (
                    <>
                      <div className="mb-4">
                        <label
                          htmlFor="mobile"
                          className="block text-[#212121] text-sm font-semibold mb-2"
                        >
                          Mobile Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="text-[#009688]" />
                          </div>
                          <Field
                            type="text"
                            name="mobile"
                            className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                            placeholder="Enter your mobile number"
                          />
                        </div>
                        <ErrorMessage
                          name="mobile"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="birthDate"
                          className="block text-[#212121] text-sm font-semibold mb-2"
                        >
                          Birth Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaBirthdayCake className="text-[#009688]" />
                          </div>
                          <Field
                            type="date"
                            name="birthDate"
                            className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <ErrorMessage
                          name="birthDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="bloodType"
                          className="block text-[#212121] text-sm font-semibold mb-2"
                        >
                          Blood Type
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaTint className="text-[#009688]" />
                          </div>
                          <Field
                            as="select"
                            name="bloodType"
                            className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200 appearance-none"
                          >
                            <option value="">Select Blood Type</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </Field>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg
                              className="w-4 h-4 text-[#757575]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <ErrorMessage
                          name="bloodType"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="gender"
                          className="block text-[#212121] text-sm font-semibold mb-2"
                        >
                          Gender
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaVenusMars className="text-[#009688]" />
                          </div>
                          <Field
                            as="select"
                            name="gender"
                            className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200 appearance-none"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Field>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg
                              className="w-4 h-4 text-[#757575]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <ErrorMessage
                          name="gender"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="medicalInsurance"
                          className="block text-[#212121] text-sm font-semibold mb-2"
                        >
                          Medical Insurance
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaShieldAlt className="text-[#009688]" />
                          </div>
                          <Field
                            type="text"
                            name="medicalInsurance"
                            className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                            placeholder="Enter your medical insurance"
                          />
                        </div>
                        <ErrorMessage
                          name="medicalInsurance"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="allergy"
                          className="block text-[#212121] text-sm font-semibold mb-2"
                        >
                          Allergies (optional, comma-separated)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaAllergies className="text-[#009688]" />
                          </div>
                          <Field
                            type="text"
                            name="allergy"
                            className="w-full pl-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                            placeholder="e.g., Peanuts, Penicillin"
                          />
                        </div>
                        <ErrorMessage
                          name="allergy"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </>
                  )}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="block text-[#212121] text-sm font-semibold mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-[#009688]" />
                      </div>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="w-full pl-10 pr-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#757575] hover:text-[#009688] transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <AiOutlineEyeInvisible className="h-5 w-5" />
                        ) : (
                          <AiOutlineEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  {state === "Sign Up" && (
                    <div className="mb-4">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-[#212121] text-sm font-semibold mb-2"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-[#009688]" />
                        </div>
                        <Field
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className="w-full pl-10 pr-10 p-3 border border-[#BDBDBD] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all duration-200"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#757575] hover:text-[#009688] transition-colors"
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
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#00BCD4] to-[#0097A7] text-white rounded-lg text-base font-semibold hover:from-[#0097A7] hover:to-[#00838F] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:ring-offset-2 transition-all duration-300 shadow-md disabled:opacity-50"
                  >
                    {state === "Sign Up" ? "Create Account" : "Login"}
                  </button>
                  {state === "Login" && (
                    <p className="text-center text-[#757575] text-sm font-medium mt-4">
                      Forgot Password?{" "}
                      <span
                        onClick={() => setForgotPassword(true)}
                        className="text-[#009688] font-semibold underline cursor-pointer hover:text-[#00897B] transition-colors duration-200"
                      >
                        Reset Password
                      </span>
                    </p>
                  )}
                  <p className="text-center text-[#757575] text-sm font-medium mt-4">
                    {state === "Sign Up"
                      ? "Already have an account?"
                      : "Create a new account?"}{" "}
                    <span
                      onClick={() => {
                        setState(state === "Sign Up" ? "Login" : "Sign Up");
                        setForgotPassword(false);
                      }}
                      className="text-[#009688] font-semibold underline cursor-pointer hover:text-[#00897B] transition-colors duration-200"
                    >
                      {state === "Sign Up" ? "Login Here" : "Sign Up"}
                    </span>
                  </p>
                  {/* Google Sign-In Button */}
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#BDBDBD]"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-[#757575] font-medium">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                        text="continue_with"
                        shape="rectangular"
                        width="100%"
                        theme="outline"
                        logo_alignment="left"
                        render={(renderProps) => (
                          <button
                            onClick={renderProps.onClick}
                            disabled={renderProps.disabled}
                            className="w-full flex items-center justify-center py-3 border border-[#BDBDBD] rounded-lg bg-white text-[#212121] text-base font-semibold hover:bg-[#B2EBF2] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:ring-offset-2 transition-all duration-300 shadow-sm"
                          >
                            <FaGoogle className="mr-2 text-[#009688]" />
                            Continue with Google
                          </button>
                        )}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        try {
                          const response = await window.AppleID.auth.signIn();
                          const { data } = await axios.post(
                            `${backendUrl}/api/user/apple-auth`,
                            {
                              identityToken: response.authorization.id_token,
                              authorizationCode: response.authorization.code,
                              user: response.user, // only on first login
                            }
                          );

                          if (data.success) {
                            localStorage.setItem("token", data.token);
                            setToken(data.token);
                            toast.success("Apple authentication successful");
                            navigate("/");
                          } else {
                            toast.error(data.message);
                          }
                        } catch (err) {
                          console.error("Apple Sign-In error:", err);
                          toast.error("Apple Sign-In failed");
                        }
                      }}
                      className="w-full flex items-center justify-center py-3 border border-[#BDBDBD] rounded-lg bg-black text-white text-base font-semibold hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:ring-offset-2 transition-all duration-300 shadow-sm"
                    >
                      <FaApple className="mr-2 text-white text-lg" />
                      Continue with Apple
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
