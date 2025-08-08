import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { Helmet } from "react-helmet";
// import { translations } from "./locales";

const DrugDetails = () => {
  const { products, navigate, currency, addToCart, lang } = useAppContext();
  // const t = translations[lang];
  const { id } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const product = products.find((item) => item._id === id);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();
      productsCopy = productsCopy.filter(
        (item) => product.category === item.category
      );
      setRelatedProducts(productsCopy.slice(0, 5));
    }
  }, [products]);

  useEffect(() => {
    product?.image?.length
      ? setThumbnail(product.image[0])
      : setThumbnail(null);
  }, [product]);

  return (
    product && (
      <div className="mt-12">
        <Helmet>
          <title>
            {lang === "ar"
              ? `${product.name} | كاما فارما`
              : `${product.name} | Kamma-Pharma`}
          </title>
          <meta
            name="description"
            content={
              lang === "ar"
                ? `اكتشف ${
                    product.name
                  } في كاما فارما، منتج من فئة ${product.category.toLowerCase()}. اطلع على التفاصيل والأسعار وأضف إلى السلة لتوصيل سريع.`
                : `Discover ${
                    product.name
                  } at Kamma-Pharma, a ${product.category.toLowerCase()} product. View details, pricing, and add to cart for fast delivery.`
            }
          />
          <meta
            name="keywords"
            content={
              lang === "ar"
                ? `كاما فارما, ${product.name.toLowerCase()}, ${product.category.toLowerCase()}, صيدلية عبر الإنترنت, منتجات صحية, إضافة إلى السلة`
                : `Kamma-Pharma, ${product.name.toLowerCase()}, ${product.category.toLowerCase()}, online pharmacy, healthcare, add to cart`
            }
          />
          <meta name="robots" content="index, follow" />
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta property="og:type" content="product" />
          <meta property="og:site_name" content="Kamma-Pharma" />
          <meta
            property="og:title"
            content={
              lang === "ar"
                ? `${product.name} | كاما فارما`
                : `${product.name} | Kamma-Pharma`
            }
          />
          <meta
            property="og:description"
            content={
              lang === "ar"
                ? `اكتشف ${
                    product.name
                  } في كاما فارما، منتج من فئة ${product.category.toLowerCase()}. اطلع على التفاصيل والأسعار وأضف إلى السلة لتوصيل سريع.`
                : `Discover ${
                    product.name
                  } at Kamma-Pharma, a ${product.category.toLowerCase()} product. View details, pricing, and add to cart for fast delivery.`
            }
          />
          <meta property="og:image" content={product.image[0]} />
          <meta property="og:price:amount" content={product.offerPrice} />
          <meta property="og:price:currency" content={currency} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={
              lang === "ar"
                ? `${product.name} | كاما فارما`
                : `${product.name} | Kamma-Pharma`
            }
          />
          <meta
            name="twitter:description"
            content={
              lang === "ar"
                ? `اكتشف ${
                    product.name
                  } في كاما فارما، منتج من فئة ${product.category.toLowerCase()}. اطلع على التفاصيل والأسعار وأضف إلى السلة لتوصيل سريع.`
                : `Discover ${
                    product.name
                  } at Kamma-Pharma, a ${product.category.toLowerCase()} product. View details, pricing, and add to cart for fast delivery.`
            }
          />
          <meta name="twitter:image" content={product.image[0]} />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <meta name="theme-color" content="#00a651" />
          <link
            rel="canonical"
            href={`https://www.kamma-pharma.com/products/${product?.category.toLowerCase()}/${id}`}
          />
        </Helmet>
        <p>
          <Link to={"/"}>{lang === "ar" ? "الرئيسية" : "Home"}</Link> /
          <Link to={"/products"}>
            {lang === "ar" ? "المنتجات" : "Products"}
          </Link>{" "}
          /
          <Link to={`/products/${product.category.toLowerCase()}`}>
            {product.category}
          </Link>{" "}
          /<span className="text-primary"> {product.name}</span>
        </p>

        <div className="flex flex-col md:flex-row gap-16 mt-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-3">
              {product.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setThumbnail(image)}
                  className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setThumbnail(image)}
                  aria-label={
                    lang === "ar"
                      ? `عرض الصورة المصغرة ${index + 1}`
                      : `View thumbnail ${index + 1}`
                  }
                >
                  <img
                    src={image}
                    alt={
                      lang === "ar"
                        ? `الصورة المصغرة ${index + 1} لـ ${product.name}`
                        : `Thumbnail ${index + 1} for ${product.name}`
                    }
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden relative group">
              <img
                src={thumbnail}
                alt={
                  lang === "ar"
                    ? `صورة المنتج المختار ${product.name}`
                    : `Selected product image ${product.name}`
                }
                className="w-full h-auto transition-transform duration-300 group-hover:scale-500 group-hover:origin-center"
                style={{ cursor: "zoom-in" }}
                loading="lazy"
              />
            </div>
          </div>

          <div className="text-sm w-full md:w-1/2">
            <h1 className="text-3xl font-medium">{product.name}</h1>

            <div className="flex items-center gap-0.5 mt-1">
              {Array(5)
                .fill("")
                .map((_, i) => (
                  <img
                    key={i}
                    src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                    alt={lang === "ar" ? "نجمة التقييم" : "Rating star"}
                    className="md:w-4 w-3.5"
                  />
                ))}
              <p className="text-base ml-2">(4)</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-500/70 line-through">
                {lang === "ar" ? "السعر الأصلي:" : "MRP:"} {currency}
                {product.price}
              </p>
              <p className="text-2xl font-medium">
                {lang === "ar" ? "السعر بعد الخصم:" : "MRP:"} {currency}
                {product.offerPrice}
              </p>
              <span className="text-gray-500/70">
                {lang === "ar"
                  ? "(شامل جميع الضرائب)"
                  : "(inclusive of all taxes)"}
              </span>
            </div>

            <p className="text-base font-medium mt-6">
              {lang === "ar" ? "حول المنتج" : "About Product"}
            </p>
            <ul className="list-disc ml-4 text-gray-500/70">
              {product.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>

            <div className="flex items-center mt-10 gap-4 text-base">
              <button
                onClick={() => addToCart(product._id)}
                className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
                aria-label={
                  lang === "ar"
                    ? `إضافة ${product.name} إلى السلة`
                    : `Add ${product.name} to cart`
                }
              >
                {lang === "ar" ? "إضافة إلى السلة" : "Add to Cart"}
              </button>
              <button
                onClick={() => {
                  addToCart(product._id);
                  navigate("/cart");
                }}
                className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition"
                aria-label={
                  lang === "ar"
                    ? `شراء ${product.name} الآن`
                    : `Buy ${product.name} now`
                }
              >
                {lang === "ar" ? "شراء الآن" : "Buy now"}
              </button>
            </div>
          </div>
        </div>
        {/* related products */}
        <div className="flex flex-col items-center mt-20">
          <div className="flex flex-col items-center w-max">
            <p className="text-3xl font-medium">
              {lang === "ar" ? "منتجات ذات صلة" : "Related Products"}
            </p>
            <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
            {relatedProducts
              .filter((product) => product.inStock)
              .map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
          </div>
          <button
            onClick={() => {
              navigate("/products");
              scrollTo(0, 0);
            }}
            className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition"
            aria-label={
              lang === "ar" ? "عرض المزيد من المنتجات" : "See more products"
            }
          >
            {lang === "ar" ? "عرض المزيد" : "See More"}
          </button>
        </div>
      </div>
    )
  );
};

export default DrugDetails;