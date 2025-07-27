import React, { useContext, useState } from "react";
import { assets } from "../../../../client/src/assets/assets_admin/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AddLab = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fees, setFees] = useState("");
  const [specialty, setSpecialty] = useState("CBC");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { backendUrl, lToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (!docImg) {
        return toast.error("Image not selected");
      }
      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("mobile", mobile);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      formData.append("fees", Number(fees));
      formData.append("specialty", specialty);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-lab",
        formData,
        { headers: { lToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setDocImg(false);
        setName("");
        setEmail("");
        setMobile("");
        setPassword("");
        setConfirmPassword("");
        setAddress1("");
        setAddress2("");
        setFees("");
        setSpecialty("CBC");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New lab</h1>

      <form onSubmit={onSubmitHandler} className="space-y-6">
        {/* Image Upload Section */}
        <div className="flex flex-col items-center mb-8">
          <label htmlFor="doc-img" className="cursor-pointer group">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition-all duration-200 flex items-center justify-center">
              {docImg ? (
                <img
                  src={URL.createObjectURL(docImg)}
                  alt="lab preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <img
                    src={assets.upload_area}
                    alt="Upload area"
                    className="w-12 h-12 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500">Upload lab Picture</p>
                </div>
              )}
            </div>
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            className="hidden"
            accept="image/*"
          />
        </div>

        {/* Form Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                lab Name
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                lab Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                onChange={(e) => setMobile(e.target.value)}
                value={mobile}
                type="text"
                placeholder="Phone Number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Create Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fees
              </label>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                type="number"
                placeholder="Fees Amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <select
                onChange={(e) => setSpecialty(e.target.value)}
                value={specialty}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CBC">CBC</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Surgery">Surgery</option>
                <option value="ENT">ENT</option>
                <option value="Bones">Bones</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                type="text"
                placeholder="Street Address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                type="text"
                placeholder="City, State, ZIP"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Add Lab
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLab;
