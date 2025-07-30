import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { LabContext } from "../context/LabContext";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Login = () => {
  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const { setLToken } = useContext(LabContext);
  const [showPassword, setShowPassword] = React.useState(false);

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    state: Yup.string()
      .oneOf(["Admin", "Doctor", "Lab"], "Invalid user type")
      .required("User type is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  // Initial form values
  const initialValues = {
    state: "Admin",
    email: "",
    password: "",
  };

  // Form submission handler
  const onSubmitHandler = async (values, { setSubmitting }) => {
    try {
      if (values.state === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email: values.email,
          password: values.password,
        });
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success("Admin logged in successfully");
        } else {
          toast.error(data.message);
        }
      } else if (values.state === "Doctor") {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email: values.email,
          password: values.password,
        });
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success("Doctor logged in successfully");
        } else {
          toast.error(data.message);
        }
      } else if (values.state === "Lab") {
        const { data } = await axios.post(backendUrl + "/api/lab/login", {
          email: values.email,
          password: values.password,
        });
        if (data.success) {
          localStorage.setItem("lToken", data.token);
          setLToken(data.token);
          toast.success("Lab logged in successfully");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message || "An error occurred during login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-gray-100 p-4">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitHandler}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
              <span className="text-indigo-600">
                <Field name="state" component="span">
                  {({ field }) => field.value}
                </Field>
              </span>{" "}
              Login
            </h2>
            <div className="flex justify-center gap-4 mb-6">
              <label className="flex items-center gap-2">
                <Field
                  type="radio"
                  name="state"
                  value="Admin"
                  className="text-indigo-600 focus:ring-indigo-500"
                  onChange={() => setFieldValue("state", "Admin")}
                />
                <span className="text-sm text-gray-700">Admin</span>
              </label>
              <label className="flex items-center gap-2">
                <Field
                  type="radio"
                  name="state"
                  value="Doctor"
                  className="text-indigo-600 focus:ring-indigo-500"
                  onChange={() => setFieldValue("state", "Doctor")}
                />
                <span className="text-sm text-gray-700">Doctor</span>
              </label>
              <label className="flex items-center gap-2">
                <Field
                  type="radio"
                  name="state"
                  value="Lab"
                  className="text-indigo-600 focus:ring-indigo-500"
                  onChange={() => setFieldValue("state", "Lab")}
                />
                <span className="text-sm text-gray-700">Lab</span>
              </label>
            </div>
            <ErrorMessage
              name="state"
              component="div"
              className="text-red-500 text-sm mb-4 text-center"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Field
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-indigo-600 transition-colors"
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Login
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
