import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append("userId", userData._id);
      formData.append("name", userData.name);
      formData.append("phone", userData.mobile);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("birthDate", userData.birthDate);
      formData.append("medicalInsurance", userData.medicalInsurance);
      // Send allergy as an object with a list property
      formData.append("allergy", JSON.stringify(userData.allergy || {}));

      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    userData && (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-indigo-100 mt-8 mb-12">
        <div className="space-y-8">
          {/* Profile Image and Name */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-indigo-50 to-white p-6 rounded-xl">
            <div className="relative group">
              {isEdit ? (
                <label htmlFor="image" className="cursor-pointer">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 shadow-md">
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={image ? URL.createObjectURL(image) : userData.image}
                      alt="Profile"
                    />
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <img
                        className="w-8 h-8"
                        src={assets.upload_icon}
                        alt="Upload icon"
                      />
                    </div>
                  </div>
                  <input
                    onChange={(e) => setImage(e.target.files[0])}
                    type="file"
                    id="image"
                    accept="image/*"
                    hidden
                  />
                </label>
              ) : (
                <img
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-md transition-transform duration-300 hover:scale-105"
                  src={userData.image}
                  alt="Profile"
                />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {isEdit ? (
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="text-3xl font-bold text-indigo-900 bg-indigo-50/50 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                />
              ) : (
                <h2 className="text-3xl font-bold text-indigo-900">
                  {userData.name}
                </h2>
              )}
              <p className="text-indigo-600 mt-1">{userData.email}</p>
            </div>
          </div>

          <hr className="border-indigo-100" />

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-indigo-800">
              <label className="font-semibold text-sm">Email:</label>
              <p className="sm:col-span-2 text-indigo-600 font-medium">
                {userData.email}
              </p>

              <label className="font-semibold text-sm">Phone:</label>
              {isEdit ? (
                <input
                  type="tel"
                  value={userData.mobile}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                  className="sm:col-span-2 p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="sm:col-span-2 text-indigo-600 font-medium">
                  {userData.mobile}
                </p>
              )}

              <label className="font-semibold text-sm">Address:</label>
              {isEdit ? (
                <div className="sm:col-span-2 space-y-3">
                  <input
                    type="text"
                    value={userData.address.line1}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                    placeholder="Address Line 1"
                  />
                  <input
                    type="text"
                    value={userData.address.line2}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                    placeholder="Address Line 2"
                  />
                </div>
              ) : (
                <p className="sm:col-span-2 text-indigo-600 font-medium">
                  {userData.address.line1}
                  {userData.address.line2 && <br />}
                  {userData.address.line2}
                </p>
              )}

              <label className="font-semibold text-sm">
                Medical Insurance:
              </label>
              {isEdit ? (
                <select
                  value={userData.medicalInsurance}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      medicalInsurance: e.target.value,
                    }))
                  }
                  className="sm:col-span-2 p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
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
              ) : (
                <p className="sm:col-span-2 text-indigo-600 font-medium">
                  {userData.medicalInsurance}
                </p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-indigo-800">
              <div>
                <label className="font-semibold text-sm">Gender:</label>
                {isEdit ? (
                  <select
                    value={userData.gender}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                  >
                    <option value="unisex" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-indigo-600 font-medium">
                    {userData.gender}
                  </p>
                )}
              </div>
              <div>
                <label className="font-semibold text-sm">Birthdate:</label>
                {isEdit ? (
                  <input
                    type="date"
                    value={userData.birthDate}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        birthDate: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                  />
                ) : (
                  <p className="text-indigo-600 font-medium">
                    {userData.birthDate}
                  </p>
                )}
              </div>
              <div>
                <label className="font-semibold text-sm">Blood Type:</label>
                <p className="text-indigo-600 font-medium">
                  {userData.bloodType}
                </p>
              </div>
              <div>
                <label className="font-semibold text-sm">Allergies:</label>
                {isEdit ? (
                  <input
                    type="text"
                    value={
                      userData.allergy && typeof userData.allergy === "object"
                        ? userData.allergy.list.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        allergy: {
                          list: e.target.value.split(", ").filter(Boolean),
                        },
                      }))
                    }
                    className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                    placeholder="Enter allergies (comma-separated)"
                  />
                ) : (
                  <p className="text-indigo-600 font-medium">
                    {userData.allergy &&
                    typeof userData.allergy === "object" &&
                    userData.allergy.list.length > 0
                      ? userData.allergy.list.join(", ")
                      : "None"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={isEdit ? updateUserProfileData : () => setIsEdit(true)}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold text-base hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md"
            >
              {isEdit ? "Save Changes" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default MyProfile;
