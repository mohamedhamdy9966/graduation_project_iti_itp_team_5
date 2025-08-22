import React, { useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { AdminContext } from "../../context/AdminContext";

const LabsList = () => {
  const { labs, aToken, getAllLabs, changeLabAvailability } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllLabs();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h2 className="text-lg font-medium">All Labs ({labs?.length || 0})</h2>

      {!labs || labs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No labs found. Add some labs to see them here.
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
          {labs.map((item) => (
            <div
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
              key={item._id || uuidv4()}
            >
              <img
                className="bg-indigo-50 group-hover:bg-blue-600 transition-all duration-500 w-full h-48 object-cover"
                src={item.image}
                alt="Lab image"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
              <div className="p-4">
                <p className="text-neutral-800 text-lg font-medium">
                  {item.name}
                </p>

                {/* Display services properly */}
                <div className="text-zinc-600 text-sm mb-2">
                  <p className="font-medium">Services:</p>
                  {Array.isArray(item.services) ? (
                    <div className="flex flex-wrap gap-1">
                      {item.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 px-2 py-1 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {item.services.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.services.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {item.services || "No services specified"}
                    </span>
                  )}
                </div>

                {/* Display fees */}
                <p className="text-green-600 text-sm font-medium mb-2">
                  Fees: ${item.fees || "N/A"}
                </p>

                {/* Availability toggle */}
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <input
                    onChange={() => changeLabAvailability(item._id)}
                    type="checkbox"
                    checked={item.available}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <p
                    className={
                      item.available ? "text-green-600" : "text-red-600"
                    }
                  >
                    {item.available ? "Available" : "Not Available"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabsList;
