import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currencySymbol = "EGP";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [chatbotContext, setChatbotContext] = useState({
    doctors: [],
    labs: [],
  });
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [userToken, setUserToken] = useState(
    localStorage.getItem("userToken")
      ? localStorage.getItem("userToken")
      : false
  );
  const [userData, setUserData] = useState(false);
  const [user, setUser] = useState(false);
  const [drugs, setDrugs] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [currency] = useState("EGP ");
  const [showUserLogin, setShowUserLogin] = useState(false);

  // Create axios instance with base URL
  const axiosInstance = axios.create({
    baseURL: backendUrl,
  });

  // Navigation function (you'll need to import useNavigate in your components)
  const navigate = (path) => {
    window.location.href = path;
  };

const getDoctorsData = async () => {
  try {
    const { data } = await axiosInstance.get("/api/doctor/list");
    if (data.success) {
      setDoctors(data?.doctors || []); // Ensure doctors is an array
    } else {
      toast.error(data.message);
      setDoctors([]); // Set to empty array on failure
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message);
    setDoctors([]); // Set to empty array on error
  }
};

  const getChatbotContext = async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/chatbot-context");
      if (data.success) {
        setChatbotContext(data.context);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const fetchDrugs = async () => {
    try {
      const { data } = await axiosInstance.get("/api/drug/list");
      if (data.success) {
        setDrugs(data.drugs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching drugs:", error);
      toast.error(error.message);
    }
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      if (!userToken || !user) return;

      const { data } = await axiosInstance.get("/api/cart/get", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (data.success) {
        setCartItems(data.cartItems || {});
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  // Sync cart with backend
  const syncCart = async (cartData) => {
    try {
      if (!userToken || !user) return;

      await axiosInstance.patch(
        "/api/cart/update",
        { cartItems: cartData },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  // Add drug to cart
  const addToCart = async (itemId, quantity = 1) => {
    try {
      if (!user) {
        toast.error("Please log in to add items to cart");
        setShowUserLogin(true);
        return;
      }

      let cartData = structuredClone(cartItems);
      if (cartData[itemId]) {
        cartData[itemId] += quantity;
      } else {
        cartData[itemId] = quantity;
      }

      setCartItems(cartData);

      // Sync with backend
      const { data } = await axiosInstance.post(
        "/api/cart/add",
        { drugId: itemId, quantity },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (data.success) {
        toast.success("Added to cart successfully");
        setCartItems(data.cartItems || cartData);
      } else {
        toast.error(data.message);
        // Revert local changes if backend fails
        setCartItems(cartItems);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
      // Revert local changes
      setCartItems(cartItems);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      if (!user) {
        toast.error("Please log in to update cart");
        return;
      }

      let cartData = structuredClone(cartItems);
      if (quantity <= 0) {
        delete cartData[itemId];
      } else {
        cartData[itemId] = quantity;
      }

      setCartItems(cartData);

      // Sync with backend
      await syncCart(cartData);
      toast.success("Cart updated successfully");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };

  // Remove drug from cart
  const removeFromCart = async (itemId) => {
    try {
      if (!user) {
        toast.error("Please log in to remove items");
        return;
      }

      let cartData = structuredClone(cartItems);
      delete cartData[itemId];
      setCartItems(cartData);

      // Sync with backend
      const { data } = await axiosInstance.delete("/api/cart/remove", {
        data: { drugId: itemId },
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (data.success) {
        toast.success("Removed from cart successfully");
        setCartItems(data.cartItems || cartData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  // Get cart item count
  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  // Get cart total amount
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = drugs.find((drug) => drug._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (!user) return;

      const { data } = await axiosInstance.delete("/api/cart/clear", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (data.success) {
        setCartItems({});
        toast.success("Cart cleared successfully");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Load user profile with userToken
  const loadUserProfile = async () => {
    try {
      if (!userToken) return;

      // You'll need to create this endpoint or modify existing one
      const { data } = await axiosInstance.get("/api/user/profile", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (data.success) {
        setUser(data.user);
      } else {
        // Token might be invalid
        localStorage.removeItem("userToken");
        setUserToken(false);
        setUser(false);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      localStorage.removeItem("userToken");
      setUserToken(false);
      setUser(false);
    }
  };

  const value = {
    doctors,
    getDoctorsData,
    chatbotContext,
    getChatbotContext,
    currencySymbol,
    currency,
    token,
    setToken,
    userToken,
    setUserToken,
    backendUrl,
    userData,
    setUserData,
    user,
    setUser,
    loadUserProfileData,
    drugs,
    setDrugs,
    cartItems,
    setCartItems,
    fetchDrugs,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    getCartCount,
    getCartAmount,
    clearCart,
    navigate,
    axios: axiosInstance,
    showUserLogin,
    setShowUserLogin,
  };

  // Load initial data
  useEffect(() => {
    getDoctorsData();
    getChatbotContext();
    fetchDrugs();
  }, []);

  // Load user profile when token changes
  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  useEffect(() => {
    if (userToken) {
      loadUserProfile();
    } else {
      setUser(false);
      setCartItems({});
    }
  }, [userToken]);

  // Fetch cart when user is loaded
  useEffect(() => {
    if (user && userToken) {
      fetchCart();
    }
  }, [user, userToken]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
