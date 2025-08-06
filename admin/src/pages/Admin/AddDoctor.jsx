import React, { useContext } from "react";
import { assets } from "../../../../client/src/assets/assets_admin/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddDoctor = () => {
  const { backendUrl, aToken } = useContext(AdminContext);

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    docImg: Yup.mixed().test(
      "fileType",
      "Only image files are allowed",
      (value) =>
        !value || ["image/jpeg", "image/png", "image/gif"].includes(value.type)
    ),
    name: Yup.string().required("Doctor name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile: Yup.string()
      .matches(/^[0-9]{11}$/, "Mobile number must be 11 digits")
      .required("Mobile number is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    experience: Yup.string().required("Experience is required"),
    fees: Yup.number()
      .min(0, "Fees must be a positive number")
      .required("Fees is required"),
    about: Yup.string().required("About is required"),
    specialty: Yup.string().required("Specialty is required"),
    degree: Yup.string().required("Degree is required"),
    address1: Yup.string().required("Street address is required"),
    address2: Yup.string().required("City, State, ZIP is required"),
  });

  // Initial form values
  const initialValues = {
    docImg: null,
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    experience: "1 Year",
    fees: "",
    about: "",
    specialty: "General Physician",
    degree: "",
    address1: "",
    address2: "",
  };

  // Form submission handler
  const onSubmitHandler = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      if (values.docImg) {
        formData.append("image", values.docImg);
      }
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("mobile", values.mobile);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);
      formData.append("experience", values.experience);
      formData.append("fees", Number(values.fees));
      formData.append("about", values.about);
      formData.append("specialty", values.specialty);
      formData.append("degree", values.degree);
      formData.append(
        "address",
        JSON.stringify({ line1: values.address1, line2: values.address2 })
      );

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Doctor</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitHandler}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center mb-8">
              <label htmlFor="doc-img" className="cursor-pointer group">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition-all duration-200 flex items-center justify-center">
                  <Field name="docImg">
                    {({ field }) =>
                      field.value ? (
                        <img
                          src={URL.createObjectURL(field.value)}
                          alt="Doctor preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <img
                            src={assets.upload_area}
                            alt="Upload area"
                            className="w-12 h-12 mx-auto mb-2"
                          />
                          <p className="text-sm text-gray-500">
                            Upload Doctor Picture (Optional)
                          </p>
                        </div>
                      )
                    }
                  </Field>
                </div>
              </label>
              <input
                type="file"
                id="doc-img"
                className="hidden"
                accept="image/*"
                onChange={(event) => {
                  setFieldValue("docImg", event.currentTarget.files[0]);
                }}
              />
              <ErrorMessage
                name="docImg"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Form Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name
                  </label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Email
                  </label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <Field
                    type="text"
                    name="mobile"
                    placeholder="Phone Number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="mobile"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Create Password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <Field
                    as="select"
                    name="experience"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="4 Years">4 Years</option>
                    <option value="5 Years">5 Years</option>
                    <option value="6 Years">6 Years</option>
                    <option value="7 Years">7 Years</option>
                    <option value="8 Years">8 Years</option>
                    <option value="9 Years">9 Years</option>
                    <option value="10 Years">10 Years</option>
                  </Field>
                  <ErrorMessage
                    name="experience"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fees
                  </label>
                  <Field
                    type="number"
                    name="fees"
                    placeholder="Fees Amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="fees"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty
                  </label>
                  <Field
                    as="select"
                    name="specialty"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Surgery">Surgery</option>
                    <option value="ENT">ENT</option>
                    <option value="Bones">Bones</option>
                  </Field>
                  <ErrorMessage
                    name="specialty"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education
                  </label>
                  <Field
                    type="text"
                    name="degree"
                    placeholder="Degrees & Qualifications"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="degree"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Field
                    type="text"
                    name="address1"
                    placeholder="Street Address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="address1"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                  <Field
                    type="text"
                    name="address2"
                    placeholder="City, State, ZIP"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="address2"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
            </div>

            {/* About Doctor Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Doctor
              </label>
              <Field
                as="textarea"
                name="about"
                rows={5}
                placeholder="Brief professional bio, specialties, and achievements..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage
                name="about"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
              >
                Add Doctor
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddDoctor;
