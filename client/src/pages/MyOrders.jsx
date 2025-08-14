import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Helmet } from "react-helmet";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency, axios, user } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");

      if (!token) {
        console.error("No token found");
        return;
      }

      const { data } = await axios.get("/api/order/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        console.log("Orders fetched:", data.orders);
        setMyOrders(data.orders);
      } else {
        console.error("Failed to fetch orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const statusColors = {
      "Order Placed": "bg-blue-100 text-blue-800",
      Processing: "bg-yellow-100 text-yellow-800",
      Shipped: "bg-purple-100 text-purple-800",
      "Out for Delivery": "bg-orange-100 text-orange-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      "Payment Failed": "bg-red-100 text-red-800",
      "Pending Payment": "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mt-16 pb-16">
      <Helmet>
        <title>My Orders | Kamma-Pharma</title>
        <meta
          name="description"
          content="View and track your orders at Kamma-Pharma. Check order details, status, and history for your pharmaceutical purchases."
        />
        <meta
          name="keywords"
          content="Kamma-Pharma, my orders, order tracking, pharmacy, pharmaceutical orders, order history"
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.kamma-pharma.com/my-orders" />
      </Helmet>

      <div className="flex flex-col items-start w-full mb-8">
        <h1 className="text-3xl font-medium uppercase">My Orders</h1>
        <div className="w-16 h-0.5 bg-primary rounded-full mt-2"></div>
        <p className="text-gray-600 mt-2">
          {myOrders.length} order{myOrders.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {myOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">
              No Orders Found
            </h2>
            <p className="text-gray-600 mb-8">
              You haven't placed any orders yet.
            </p>
            <button
              onClick={() => (window.location.href = "/drugs")}
              className="bg-primary text-white px-6 py-3 rounded hover:bg-primary-dull transition"
            >
              Start Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-mono text-sm font-medium">
                        {order._id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="text-sm font-medium">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="text-sm font-medium">{order.paymentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-semibold text-primary">
                        {currency}
                        {order.amount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status || "Order Placed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h3 className="font-medium text-gray-800 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      {/* Drug Image */}
                      <div className="w-16 h-16 flex-shrink-0 bg-white rounded border border-gray-200 overflow-hidden">
                        <img
                          src={item.drug?.image?.[0] || "/placeholder-drug.png"}
                          alt={item.drug?.name || "Drug"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder-drug.png";
                          }}
                        />
                      </div>

                      {/* Drug Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">
                          {item.drug?.name || "Product Not Available"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Category: {item.drug?.category || "Medicine"}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity || 1}
                          </span>
                          <span className="text-sm text-gray-600">
                            Unit Price: {currency}
                            {item.drug?.offerPrice?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-medium text-gray-800">
                          {currency}
                          {(
                            (item.drug?.offerPrice || 0) * (item.quantity || 1)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                {order.address && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Delivery Address
                    </h4>
                    <p className="text-sm text-gray-600">
                      {order.address.street && `${order.address.street}, `}
                      {order.address.city && `${order.address.city}, `}
                      {order.address.state && `${order.address.state}, `}
                      {order.address.country || "Egypt"}
                    </p>
                    {order.address.phone && (
                      <p className="text-sm text-gray-600 mt-1">
                        Phone: {order.address.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Status */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {order.paymentType === "COD" ? (
                      <span className="text-orange-600">
                        💰 Cash on Delivery
                      </span>
                    ) : order.isPaid ? (
                      <span className="text-green-600">
                        ✅ Payment Completed
                      </span>
                    ) : (
                      <span className="text-red-600">❌ Payment Pending</span>
                    )}
                  </div>

                  {order.deliveredAt && (
                    <div className="text-sm text-green-600">
                      Delivered on: {formatDate(order.deliveredAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
