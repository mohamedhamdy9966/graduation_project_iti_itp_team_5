import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../../../client/src/assets/assets_admin/assets";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet";

const AllOrders = () => {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      const { data } = await axios.get("/api/order/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setHasFetched(true);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>

        {hasFetched && orders.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No orders yet.</div>
        )}

        {orders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col md:items-center md:flex-row gap-5 p-5 max-w-4xl rounded-md border border-gray-300 text-gray-800"
          >
            <div className="flex flex-col gap-4 max-w-80">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <img
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                    src={item.product.image?.[0] || assets.box_icon}
                    alt={item.product.name}
                  />
                  <p className="font-medium">
                    {item.product.name}{" "}
                    <span
                      className={`text-indigo-500 ${
                        item.quantity < 2 && "hidden"
                      }`}
                    >
                      x {item.quantity}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <div className="text-sm md:text-base text-black/60">
              <p className="text-black/80">
                {order.address.firstName} {order.address.lastName}
              </p>
              <div>
                <p>
                  {order.address.street}, {order.address.city}
                </p>
                <p>
                  {order.address.state}, {order.address.zipcode},{" "}
                  {order.address.country}
                </p>
                <p>{order.address.phone}</p>
              </div>
            </div>

            <p className="font-medium text-lg my-auto">
              {currency}
              {order.amount}
            </p>

            <div className="flex flex-col text-sm md:text-base text-black/60">
              <p>Method: {order.paymentType}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllOrders;