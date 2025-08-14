import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet";

const Cart = () => {
  const {
    drugs, // Changed from products to drugs
    currency,
    cartItems,
    removeFromCart,
    updateCartItem,
    navigate,
    getCartAmount,
    getCartCount,
    axios,
    user,
    setCartItems,
    setShowUserLogin,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [cartAddresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [isLoading, setIsLoading] = useState(false);

  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const drug = drugs.find((item) => item._id === key);
      if (drug) {
        drug.quantity = cartItems[key];
        tempArray.push(drug);
      }
    }
    setCartArray(tempArray);
  };

  const getUserAddress = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const { data } = await axios.get("/api/address/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to fetch addresses");
    }
  };

  const getShippingFee = () => {
    const stateFee = {
      Cairo: 50,
      Giza: 60,
      Alexandria: 70,
      PortSaid: 65,
      Suez: 65,
      Dakahlia: 40,
      Sharqia: 70,
      Qalyubia: 60,
      KafrElSheikh: 40,
      Gharbia: 30,
      Monufia: 50,
      Beheira: 65,
      Ismailia: 65,
      Faiyum: 80,
      BeniSuef: 85,
      Minya: 90,
      Asyut: 95,
      Sohag: 100,
      Qena: 100,
      Aswan: 100,
      Luxor: 100,
      RedSea: 120,
      NewValley: 130,
      Matrouh: 120,
      NorthSinai: 150,
      SouthSinai: 140,
      Damietta: 75,
      Helwan: 60,
      October: 60,
    };
    return selectedAddress?.state ? stateFee[selectedAddress.state] || 50 : 50;
  };

  const cartAmount = getCartAmount();
  const shipping = getShippingFee();
  const tax = 0; // Tax is 0% as per your controller
  const totalAmountTaxShipping = cartAmount + shipping + tax;

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      setShowUserLogin(true);
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (cartArray.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("userToken");

    try {
      // Prepare order items - matching your orderController structure
      const orderItems = cartArray.map((item) => ({
        drug: item._id, // Changed from product to drug
        quantity: item.quantity,
      }));

      if (paymentOption === "COD") {
        const { data } = await axios.post(
          "/api/order/cod",
          {
            items: orderItems,
            address: selectedAddress._id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message || "Failed to place order");
        }
      } else {
        // Online payment with Paymob
        const { data } = await axios.post(
          "/api/order/paymob",
          {
            items: orderItems,
            address: selectedAddress._id,
            shippingFee: shipping,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              origin: window.location.origin,
            },
          }
        );

        if (data.success && data.url) {
          // Clear cart before redirect
          setCartItems({});
          window.location.replace(data.url);
        } else {
          toast.error(data.message || "Failed to process payment");
        }
      }
    } catch (error) {
      console.error("placeOrder error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (drugs?.length > 0 && cartItems) {
      getCart();
    }
  }, [drugs, cartItems]);

  useEffect(() => {
    if (user) {
      getUserAddress();
    }
  }, [user]);

  // Show loading or empty state
  if (!drugs || drugs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading drugs...</p>
      </div>
    );
  }

  if (!cartItems || Object.keys(cartItems).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 mt-16">
        <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
        <button
          onClick={() => {
            navigate("/drugs");
            scrollTo(0, 0);
          }}
          className="bg-primary text-white px-6 py-3 rounded hover:bg-primary-dull transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row mt-16 gap-8">
      <Helmet>
        <title>Shopping Cart | Kamma-Pharma</title>
        <meta
          name="description"
          content="View and manage your shopping cart at Kamma-Pharma. Add, remove, or update pharmaceutical products and proceed to checkout with secure payment options."
        />
        <meta
          name="keywords"
          content="Kamma-Pharma, shopping cart, pharmacy, pharmaceutical products, checkout, online pharmacy"
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.kamma-pharma.com/cart" />
      </Helmet>

      {/* Cart Items Section */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary">{getCartCount()} Items</span>
        </h1>

        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b">
          <p className="text-left">Drug Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        <div className="space-y-4 md:space-y-0">
          {cartArray.map((drug, index) => (
            <div
              key={index}
              className="flex md:grid md:grid-cols-[2fr_1fr_1fr] text-gray-700 items-center p-4 md:p-0 md:py-4 border-b border-gray-200 gap-4"
            >
              {/* Drug Details */}
              <div className="flex items-center gap-4 flex-1 md:flex-none">
                <div
                  onClick={() => {
                    navigate(`/drugs/${drug._id}`);
                    scrollTo(0, 0);
                  }}
                  className="cursor-pointer w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border border-gray-300 rounded bg-white"
                >
                  <img
                    className="max-w-full h-full object-cover rounded"
                    src={drug.image?.[0] || "/placeholder-drug.png"}
                    alt={drug.name}
                    onError={(e) => {
                      e.target.src = "/placeholder-drug.png";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {drug.name}
                  </h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Category: {drug.category || "Medicine"}</p>
                    <p>
                      Price: {currency}
                      {drug.offerPrice}
                    </p>
                    <div className="flex items-center gap-2">
                      <span>Qty:</span>
                      <select
                        onChange={(e) =>
                          updateCartItem(drug._id, Number(e.target.value))
                        }
                        value={cartItems[drug._id] || 1}
                        className="border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                      >
                        {Array.from(
                          { length: Math.max(9, cartItems[drug._id] || 1) },
                          (_, i) => i + 1
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-center md:block hidden">
                <p className="font-medium text-lg">
                  {currency}
                  {(drug.offerPrice * drug.quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove Button */}
              <div className="text-center">
                <button
                  onClick={() => removeFromCart(drug._id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition"
                  title="Remove from cart"
                >
                  <img
                    src={assets.remove_icon}
                    className="w-5 h-5"
                    alt="remove"
                  />
                </button>
              </div>

              {/* Mobile Subtotal */}
              <div className="md:hidden text-right">
                <p className="font-medium text-lg text-primary">
                  {currency}
                  {(drug.offerPrice * drug.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            navigate("/drugs");
            scrollTo(0, 0);
          }}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium hover:text-primary-dull transition"
        >
          <img
            src={assets.arrow_right_icon_colored}
            alt="arrow"
            className="group-hover:-translate-x-1 transition transform rotate-180"
          />
          Continue Shopping
        </button>
      </div>

      {/* Order Summary Section */}
      <div className="w-full md:max-w-[360px] bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-xl font-medium mb-4">Order Summary</h2>
        <hr className="border-gray-300 mb-6" />

        {/* Delivery Address */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase mb-2">Delivery Address</p>
          <div className="relative">
            <div className="flex justify-between items-start">
              <p className="text-gray-600 text-sm flex-1 pr-2">
                {selectedAddress
                  ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                  : "No address selected"}
              </p>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="text-primary hover:underline text-sm whitespace-nowrap"
              >
                Change
              </button>
            </div>

            {showAddress && (
              <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-white border border-gray-300 rounded shadow-lg z-10">
                {cartAddresses.length > 0 ? (
                  cartAddresses.map((address, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddress(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-100 text-sm text-gray-600 border-b border-gray-100 last:border-b-0"
                    >
                      {address.street}, {address.city}, {address.state},{" "}
                      {address.country}
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-gray-500 text-sm">
                    No saved addresses
                  </p>
                )}
                <button
                  onClick={() => {
                    navigate("/add-address");
                    setShowAddress(false);
                  }}
                  className="w-full text-center p-3 text-primary hover:bg-primary hover:text-white transition"
                >
                  + Add New Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase mb-2">Payment Method</p>
          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            value={paymentOption}
            className="w-full border border-gray-300 bg-white px-3 py-2 rounded outline-none focus:border-primary"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment (Paymob)</option>
          </select>
        </div>

        <hr className="border-gray-300 mb-4" />

        {/* Order Totals */}
        <div className="text-gray-600 space-y-2 mb-6">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              {currency}
              {cartAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="text-green-600">
              {currency}
              {shipping}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>
              {currency}
              {tax.toFixed(2)}
            </span>
          </div>
          <hr className="border-gray-300" />
          <div className="flex justify-between text-lg font-medium text-gray-800">
            <span>Total:</span>
            <span>
              {currency}
              {totalAmountTaxShipping.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={placeOrder}
          disabled={isLoading || !selectedAddress || cartArray.length === 0}
          className="w-full py-3 bg-primary text-white font-medium rounded hover:bg-primary-dull transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Processing..."
            : paymentOption === "COD"
            ? "Place Order"
            : "Proceed to Checkout"}
        </button>

        {!selectedAddress && (
          <p className="text-red-500 text-xs text-center mt-2">
            Please select a delivery address
          </p>
        )}
      </div>
    </div>
  );
};

export default Cart;
