import { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet";

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
    required
  />
);

const AddAddress = () => {
  const states = [
    { name: "Cairo", fee: 50 },
    { name: "Giza", fee: 60 },
    { name: "Alexandria", fee: 70 },
    { name: "PortSaid", fee: 65 },
    { name: "Suez", fee: 65 },
    { name: "Dakahlia", fee: 40 },
    { name: "Sharqia", fee: 70 },
    { name: "Qalyubia", fee: 60 },
    { name: "Kafr El Sheikh", fee: 40 },
    { name: "Gharbia", fee: 30 },
    { name: "Monufia", fee: 50 },
    { name: "Beheira", fee: 65 },
    { name: "Ismailia", fee: 65 },
    { name: "Faiyum", fee: 80 },
    { name: "BeniSuef", fee: 85 },
    { name: "Minya", fee: 90 },
    { name: "Asyut", fee: 95 },
    { name: "Sohag", fee: 100 },
    { name: "Qena", fee: 100 },
    { name: "Luxor", fee: 90 },
    { name: "Aswan", fee: 100 },
    { name: "RedSea", fee: 120 },
    { name: "NewValley", fee: 130 },
    { name: "Matrouh", fee: 120 },
    { name: "NorthSinai", fee: 150 },
    { name: "SouthSinai", fee: 140 },
    { name: "Damietta", fee: 75 },
    { name: "Helwan", fee: 60 },
    { name: "October", fee: 60 },
  ];

  const { axios, user, navigate } = useAppContext();
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.post(
        "/api/address/add",
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/cart");
    }
  }, []);

  return (
    <div className="mt-16 pb-16">
      <Helmet>
        <title>Add Shipping Address | Kamma-Pharma</title>
        <meta
          name="description"
          content="Add your shipping address to complete your order with Kamma-Pharma. Securely provide your details for fast and reliable delivery of pharmaceutical products."
        />
        <meta
          name="keywords"
          content="Kamma-Pharma, shipping address, pharmacy delivery, pharmaceutical services"
        />
        <meta name="robots" content="index, follow" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.kamma-pharma.com/add-address" />
      </Helmet>
      <p className="text-2xl md:text-3xl text-gray-500">
        Add Shipping <span className="font-semibold text-primary">Address</span>
      </p>
      <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-3 mt-6 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                handleChange={handleChange}
                address={address}
                name="firstName"
                type="text"
                placeholder="First Name"
              />
              <InputField
                handleChange={handleChange}
                address={address}
                name="lastName"
                type="text"
                placeholder="Last Name"
              />
            </div>
            <InputField
              handleChange={handleChange}
              address={address}
              name="email"
              type="email"
              placeholder="Email Address"
            />
            <InputField
              handleChange={handleChange}
              address={address}
              name="street"
              type="text"
              placeholder="Street"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                handleChange={handleChange}
                address={address}
                name="city"
                type="text"
                placeholder="City"
              />
              <select
                name="state"
                value={address.state}
                onChange={handleChange}
                className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
                required
              >
                <option value="">Select State</option>
                {states.map((item, idx) => (
                  <option key={idx} value={item.name}>
                    {item.name} (+{item.fee} EGP)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                handleChange={handleChange}
                address={address}
                name="zipcode"
                type="text"
                inputMode="numeric"
                placeholder="Zip Code"
              />
              <InputField
                handleChange={handleChange}
                address={address}
                name="country"
                type="text"
                placeholder="Country"
              />
            </div>
            <InputField
              handleChange={handleChange}
              address={address}
              name="phone"
              type="text"
              inputMode="numeric"
              placeholder="Phone"
            />
            <button className="w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase">
              Save Address
            </button>
          </form>
        </div>
        <img
          className="md:mr-16 mb-16 md:mt-0"
          src={assets.add_address_iamge}
          alt="add address"
        />
      </div>
    </div>
  );
};

export default AddAddress;