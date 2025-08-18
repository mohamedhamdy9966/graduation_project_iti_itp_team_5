import React, { useEffect, useState } from "react";
import { useDrugContext } from "../../context/DrugContext";
import toast from "react-hot-toast";

const DrugList = () => {
  const { drugs, loading, getAllDrugs, changeStock, removeDrug } =
    useDrugContext();
  const [currency] = useState("₹"); // You can adjust this based on your needs

  useEffect(() => {
    getAllDrugs();
  }, []);

  const handleStockToggle = async (drugId, currentStock) => {
    const success = await changeStock(drugId, !currentStock);
    if (!success) {
      console.error("Failed to update stock");
    }
  };

  const handleRemoveDrug = async (drugId, drugName) => {
    if (
      window.confirm(
        `Are you sure you want to remove "${drugName}"? This action cannot be undone.`
      )
    ) {
      const success = await removeDrug(drugId);
      if (!success) {
        console.error("Failed to remove drug");
      }
    }
  };

  if (loading) {
    return (
      <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading drugs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            All Drugs ({drugs.length})
          </h2>
          <div className="text-sm text-gray-500">
            Total Products: {drugs.length} | In Stock:{" "}
            {drugs.filter((d) => d.inStock).length}
          </div>
        </div>

        {drugs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No drugs found
            </h3>
            <p className="text-gray-500">
              Start by adding your first drug product.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">
                      Prices
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Stock Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {drugs.map((drug) => (
                    <tr
                      key={drug._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              src={
                                drug.image?.[0] ||
                                "https://via.placeholder.com/80x80"
                              }
                              alt={drug.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80x80?text=No+Image";
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {drug.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {Array.isArray(drug.description)
                                ? drug.description.join(" ").substring(0, 50) +
                                  "..."
                                : drug.description?.substring(0, 50) + "..."}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Added:{" "}
                              {new Date(drug.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {drug.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-green-600">
                              {currency}
                              {drug.offerPrice || drug.price}
                            </span>
                            {drug.price !== drug.offerPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {currency}
                                {drug.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={drug.inStock}
                            onChange={() =>
                              handleStockToggle(drug._id, drug.inStock)
                            }
                          />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200 ease-in-out">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></div>
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            {drug.inStock ? (
                              <span className="text-green-600">In Stock</span>
                            ) : (
                              <span className="text-red-600">Out of Stock</span>
                            )}
                          </span>
                        </label>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleRemoveDrug(drug._id, drug.name)
                            }
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugList;
