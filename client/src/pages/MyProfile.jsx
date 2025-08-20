import React, { useContext, useState } from "react";
import { Helmet } from "react-helmet";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
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
      formData.append("allergy", JSON.stringify(userData.allergy || {}));

      if (image) {
        formData.append("imageProfile", image);
      }

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
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
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // دالة لتوليد الأحرف الأولى من الاسم للصورة الافتراضية
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    userData && (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-[#B2EBF2] mt-8 mb-12">
        <Helmet>
          <title>My Profile - Your Healthcare Platform</title>
          <meta
            name="description"
            content="Manage your profile on Your Healthcare Platform. Update your personal information, medical insurance, and allergies to streamline your healthcare experience."
          />
          <meta
            name="keywords"
            content="user profile, manage profile, healthcare, medical information, update profile"
          />
          <link
            rel="canonical"
            href="https://www.yourhealthcare.com/my-profile"
          />
          <meta
            property="og:title"
            content="My Profile - Your Healthcare Platform"
          />
          <meta
            property="og:description"
            content="Manage your profile on Your Healthcare Platform. Update your personal information, medical insurance, and allergies to streamline your healthcare experience."
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content="https://www.yourhealthcare.com/my-profile"
          />
          <meta property="og:image" content={userData.image} />
        </Helmet>
        <div className="space-y-8">
          {/* قسم الصورة والاسم */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#B2EBF2] to-white p-6 rounded-xl">
            <div className="relative group">
              {isEdit ? (
                <label htmlFor="image" className="cursor-pointer">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#B2EBF2] shadow-md">
                    {image || userData.image ? (
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={image ? URL.createObjectURL(image) : userData.image}
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#00BCD4] text-white text-4xl font-bold">
                        {getInitials(userData.name)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#0097A7] bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <img
                        className="w-8 h-8 invert"
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
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#B2EBF2] shadow-md">
                  {userData.image ? (
                    <img
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      src={userData.image}
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#00BCD4] text-white text-4xl font-bold">
                      {getInitials(userData.name)}
                    </div>
                  )}
                </div>
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
                  className="text-3xl font-bold text-[#009688] bg-white p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00BCD4] transition-all duration-200"
                />
              ) : (
                <h2 className="text-3xl font-bold text-[#009688]">
                  {userData.name}
                </h2>
              )}
              <p className="text-[#00BCD4] mt-1">{userData.email}</p>
            </div>
          </div>

          <hr className="border-[#B2EBF2]" />

          {/* معلومات الاتصال */}
          <div>
            <h3 className="text-xl font-semibold text-[#009688] mb-4 border-b-2 border-[#B2EBF2] pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[#212121]">
              <label className="font-semibold text-sm text-[#757575]">Email:</label>
              <p className="sm:col-span-2 text-[#212121] font-medium">
                {userData.email}
              </p>

              <label className="font-semibold text-sm text-[#757575]">Phone:</label>
              {isEdit ? (
                <input
                  type="tel"
                  value={userData.mobile}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                  className="sm:col-span-2 p-3 border border-[#B2EBF2] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] transition-all duration-200"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="sm:col-span-2 text-[#212121] font-medium">
                  {userData.mobile}
                </p>
              )}

              <label className="font-semibold text-sm text-[#757575]">Address:</label>
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
                    className="w-full p-3 border border-[#B2EBF2] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] transition-all duration-200"
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
                    className="w-full p-3 border border-[#B2EBF2] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] transition-all duration-200"
                    placeholder="Address Line 2"
                  />
                </div>
              ) : (
                <p className="sm:col-span-2 text-[#212121] font-medium">
                  {userData.address.line1}
                  {userData.address.line2 && <br />}
                  {userData.address.line2}
                </p>
              )}

              <label className="font-semibold text-sm text-[#757575]">
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
                  className="sm:col-span-2 p-3 border border-[#B2EBF2] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] transition-all duration-200"
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
                <p className="sm:col-span-2 text-[#212121] font-medium">
                  {userData.medicalInsurance}
                </p>
              )}
            </div>
          </div>

          {/* المعلومات الأساسية */}
          <div>
            <h3 className="text-xl font-semibold text-[#009688] mb-4 border-b-2 border-[#B2EBF2] pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#212121]">
              <div>
                <label className="font-semibold text-sm text-[#757575]">Gender:</label>
                {isEdit ? (
                  <select
                    value={userData.gender}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-[#B2EBF2] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] transition-all duration-200"
                  >
                    <option value="unisex" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-[#212121] font-medium">
                    {userData.gender}
                  </p>
                )}
              </div>
              <div>
                <label className="font-semibold text-sm text-[#757575]">Birthdate:</label>
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
                    className="w-full p-3 border border-[#B2EBF2] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] transition-all duration-200"
                  />
                ) : (
                  <p className="text-[#212121] font-medium">
                    {userData.birthDate}
                  </p>
                )}
              </div>
              <div>
                <label className="font-semibold text-sm text-[#757575]">Blood Type:</label>
                <p className="text-[#212121] font-medium">
                  {userData.bloodType || "Not specified"}
                </p>
              </div>
              <div>
                <label className="font-semibold text-sm text-[#757575]">Allergies:</label>
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
                    className="w-full p-3 border border-[#B2EBF2] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4] transition-all duration-200"
                    placeholder="Enter allergies (comma-separated)"
                  />
                ) : (
                  <p className="text-[#212121] font-medium">
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

          {/* زر التعديل/الحفظ */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={isEdit ? updateUserProfileData : () => setIsEdit(true)}
              className="px-8 py-3 bg-gradient-to-r from-[#00BCD4] to-[#009688] text-white rounded-lg font-semibold text-base hover:from-[#0097A7] hover:to-[#00897B] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:ring-offset-2 transition-all duration-300 shadow-md"
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