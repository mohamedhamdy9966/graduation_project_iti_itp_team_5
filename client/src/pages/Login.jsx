import React, { useContext, useEffect } from "react";
import { Helmet } from "react-helmet";
import { assets } from "../assets/assets_frontend/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = React.useState("Sign Up");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Yup validation schema
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
        const { data } = await axios.post(backendUrl + "/api/user/register", {
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
          toast.success("Account created successfully");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/user/login", {
          password: values.password,
          email: values.email,
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Logged in successfully");
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

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <Helmet>
        <title>
          {state === "Sign Up" ? "Sign Up" : "Login"} - Your Healthcare Platform
        </title>
        <meta
          name="description"
          content={
            state === "Sign Up"
              ? "Create an account on Your Healthcare Platform to book appointments with top doctors and manage your medical information."
              : "Log in to Your Healthcare Platform to access your account and book appointments with trusted medical professionals."
          }
        />
        <meta
          name="keywords"
          content={
            state === "Sign Up"
              ? "sign up, create account, healthcare, book doctor appointments, medical platform"
              : "login, access account, healthcare, book doctor appointments, medical platform"
          }
        />
        <link
          rel="canonical"
          href={`https://www.yourhealthcare.com/${
            state === "Sign Up" ? "signup" : "login"
          }`}
        />
        <meta
          property="og:title"
          content={`${
            state === "Sign Up" ? "Sign Up" : "Login"
          } - Your Healthcare Platform`}
        />
        <meta
          property="og:description"
          content={
            state === "Sign Up"
              ? "Create an account on Your Healthcare Platform to book appointments with top doctors and manage your medical information."
              : "Log in to Your Healthcare Platform to access your account and book appointments with trusted medical professionals."
          }
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://www.yourhealthcare.com/${
            state === "Sign Up" ? "signup" : "login"
          }`}
        />
        <meta property="og:image" content={assets.logo} />
      </Helmet>
      <Formik
        initialValues={initialValues}
        validationSchema={state === "Sign Up" ? signUpSchema : loginSchema}
        onSubmit={onSubmitHandler}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-6 p-8 w-full max-w-md bg-white border border-indigo-100 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
            <img
              src={assets.logo}
              alt="Roshetta logo"
              className="w-36 mx-auto mb-6 transform hover:scale-105 transition-transform duration-300"
            />

            <h1 className="text-3xl font-bold text-indigo-900 text-center">
              {state === "Sign Up" ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-indigo-600 text-center text-sm font-medium">
              Please {state === "Sign Up" ? "create an account" : "log in"} to
              book an appointment
            </p>

            {state === "Sign Up" && (
              <>
                <div className="w-full">
                  <label className="block text-indigo-800 font-semibold text-sm mb-2">
                    Full Name
                  </label>
                  <Field
                    type="text"
                    name="name"
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-indigo-800 font-semibold text-sm mb-2">
                    Mobile
                  </label>
                  <Field
                    type="tel"
                    name="mobile"
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your mobile number"
                  />
                  <ErrorMessage
                    name="mobile"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-indigo-800 font-semibold text-sm mb-2">
                    Birth Date
                  </label>
                  <Field
                    type="date"
                    name="birthDate"
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    placeholder="Select your birth date"
                  />
                  <ErrorMessage
                    name="birthDate"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-indigo-800 font-semibold text-sm mb-2">
                    Blood Type
                  </label>
                  <Field
                    as="select"
                    name="bloodType"
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" disabled>
                      Select Blood Type
                    </option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Field>
                  <ErrorMessage
                    name="bloodType"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-indigo-800 font-semibold text-sm mb-2">
                    Gender
                  </label>
                  <Field
                    as="select"
                    name="gender"
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Field>
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-indigo-800 font-semibold text-sm mb-2">
                    Allergies
                  </label>
                  <Field
                    type="text"
                    name="allergy"
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter allergies (comma-separated, e.g., Peanuts, Dust)"
                  />
                  <ErrorMessage
                    name="allergy"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-indigo-800 font-semibold text-sm mb-2">
                    Medical Insurance
                  </label>
                  <Field
                    as="select"
                    name="medicalInsurance"
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" disabled>
                      Select Insurance Provider
                    </option>
                    <option value="None">None</option>
                    <option value="Blue Cross Blue Shield">
                      Blue Cross Blue Shield
                    </option>
                    <option value="Aetna">Aetna</option>
                    <option value="Cigna">Cigna</option>
                    <option value="UnitedHealthcare">UnitedHealthcare</option>
                    <option value="Medicare">Medicare</option>
                    <option value="Medicaid">Medicaid</option>
                  </Field>
                  <ErrorMessage
                    name="medicalInsurance"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </>
            )}

            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Email
              </label>
              <Field
                type="email"
                name="email"
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
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
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {state === "Sign Up" && (
              <div className="w-full">
                <label className="block text-indigo-800 font-semibold text-sm mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Field
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
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
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-base font-semibold hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md disabled:opacity-50"
            >
              {state === "Sign Up" ? "Create Account" : "Login"}
            </button>

            <p className="text-center text-indigo-700 text-sm font-medium">
              {state === "Sign Up"
                ? "Already have an account?"
                : "Create a new account?"}{" "}
              <span
                onClick={() =>
                  setState(state === "Sign Up" ? "Login" : "Sign Up")
                }
                className="text-indigo-500 font-semibold underline cursor-pointer hover:text-indigo-600 transition-colors duration-200"
              >
                {state === "Sign Up" ? "Login Here" : "Sign Up"}
              </span>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
