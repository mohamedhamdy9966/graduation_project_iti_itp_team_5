import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets_frontend/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [medicalInsurance, setMedicalInsurance] = useState("");
  const [gender, setGender] = useState("unisex");
  const [allergy, setAllergy] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === "Sign Up") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const { data } = await axios.post(backendUrl + "/api/user/register", {
          name,
          password,
          email,
          mobile,
          birthDate,
          bloodType,
          medicalInsurance,
          gender,
          allergy: {
            list: allergy
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
          password,
          email,
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
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-6 p-8 w-full max-w-md bg-white border border-indigo-100 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl"
      >
        {/* Logo */}
        <img
          src={assets.logo}
          alt="Roshetta logo"
          className="w-36 mx-auto mb-6 transform hover:scale-105 transition-transform duration-300"
        />

        <h1 className="text-3xl font-bold text-indigo-900 text-center">
          {state === "Sign Up" ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-indigo-600 text-center text-sm font-medium">
          Please {state === "Sign Up" ? "create an account" : "log in"} to book
          an appointment
        </p>

        {state === "Sign Up" && (
          <>
            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Mobile
              </label>
              <input
                type="tel"
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                onChange={(e) => setMobile(e.target.value)}
                value={mobile}
                required
                placeholder="Enter your mobile number"
              />
            </div>

            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Birth Date
              </label>
              <input
                type="date"
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                onChange={(e) => setBirthDate(e.target.value)}
                value={birthDate}
                required
                placeholder="Select your birth date"
              />
            </div>

            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Blood Type
              </label>
              <select
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                onChange={(e) => setBloodType(e.target.value)}
                value={bloodType}
                required
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
              </select>
            </div>

            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Gender
              </label>
              <select
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                onChange={(e) => setGender(e.target.value)}
                value={gender}
                required
              >
                <option value="unisex" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Allergies
              </label>
              <input
                type="text"
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                onChange={(e) => setAllergy(e.target.value)}
                value={allergy}
                placeholder="Enter allergies (comma-separated, e.g., Peanuts, Dust)"
              />
            </div>

            <div className="w-full">
              <label className="block text-indigo-800 font-semibold text-sm mb-2">
                Medical Insurance
              </label>
              <select
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                onChange={(e) => setMedicalInsurance(e.target.value)}
                value={medicalInsurance}
                required
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
              </select>
            </div>
          </>
        )}

        <div className="w-full">
          <label className="block text-indigo-800 font-semibold text-sm mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="w-full">
          <label className="block text-indigo-800 font-semibold text-sm mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
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
        </div>

        {state === "Sign Up" && (
          <div className="w-full">
            <label className="block text-indigo-800 font-semibold text-sm mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
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
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-base font-semibold hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md"
        >
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <p className="text-center text-indigo-700 text-sm font-medium">
          {state === "Sign Up"
            ? "Already have an account?"
            : "Create a new account?"}{" "}
          <span
            onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}
            className="text-indigo-500 font-semibold underline cursor-pointer hover:text-indigo-600 transition-colors duration-200"
          >
            {state === "Sign Up" ? "Login Here" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
