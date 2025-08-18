import React, { useState } from "react";
import { assets } from "../../../../client/src/assets/assets_admin/assets";
import { useDrugContext } from "../../context/DrugContext";
import toast from "react-hot-toast";

const AddDrug = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addDrug } = useDrugContext();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Product description is required");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      toast.error("Please enter a valid offer price");
      return;
    }

    if (parseFloat(offerPrice) > parseFloat(price)) {
      toast.error("Offer price cannot be higher than regular price");
      return;
    }

    // Filter out empty files
    const validFiles = files.filter((file) => file);

    if (validFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: name.trim(),
        description: description
          .trim()
          .split("\n")
          .filter((line) => line.trim()),
        category,
        price: parseFloat(price),
        offerPrice: parseFloat(offerPrice),
        inStock,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));

      // Add all valid files
      validFiles.forEach((file) => {
        formData.append("images", file);
      });

      const success = await addDrug(formData);

      if (success) {
        // Reset form
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
        setInStock(true);
        setFiles([]);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (index, file) => {
    const updatedFiles = [...files];
    updatedFiles[index] = file;
    setFiles(updatedFiles);
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form
        onSubmit={onSubmitHandler}
        className="md:p-10 p-4 space-y-5 max-w-lg"
      >
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Add New Drug
        </h1>

        <div>
          <p className="text-base font-medium mb-2">Product Images</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label
                  key={index}
                  htmlFor={`image${index}`}
                  className="cursor-pointer"
                >
                  <input
                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                    accept="image/*"
                    type="file"
                    id={`image${index}`}
                    hidden
                  />
                  <img
                    className="max-w-24 border-2 border-dashed border-gray-300 rounded-lg p-2 hover:border-indigo-400 transition-colors"
                    src={
                      files[index]
                        ? URL.createObjectURL(files[index])
                        : assets.upload_area
                    }
                    alt="Upload Area"
                    width={100}
                    height={100}
                  />
                </label>
              ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Upload up to 4 images (at least 1 required)
          </p>
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name *
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            id="product-name"
            type="text"
            placeholder="Enter product name"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-indigo-500 transition-colors"
            required
          />
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description *
          </label>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none focus:border-indigo-500 transition-colors"
            placeholder="Enter product description (use new lines for multiple points)"
            required
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">
            Category *
          </label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-indigo-500 transition-colors"
            required
          >
            <option value="">Select Category</option>
            {/* {categories?.map((item, index) => (
              <option key={index} value={item.path}>
                {item.path}
              </option>
            ))} */}
          </select>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Regular Price * (₹)
            </label>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price * (₹)
            </label>
            <input
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              id="offer-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-indigo-500 transition-colors"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="inStock"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="inStock" className="text-base font-medium">
            In Stock
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`cursor-pointer px-8 py-2.5 bg-indigo-500 text-white font-medium rounded hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? "Adding..." : "ADD PRODUCT"}
        </button>
      </form>
    </div>
  );
};

export default AddDrug;
