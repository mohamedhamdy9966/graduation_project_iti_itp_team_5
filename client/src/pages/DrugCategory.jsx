import { categories } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

const DrugCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();
  const searchCategory = categories.find(
    (item) => item.path.toLowerCase() === category
  );
  const filteredProducts = products?.filter(
    (product) => product.category.toLowerCase() === category
  );

  return (
    <div>
      <Helmet>
        <title>
          {searchCategory
            ? `${searchCategory.text} | Kamma-Pharma`
            : "Product Category | Kamma-Pharma"}
        </title>
        <meta
          name="description"
          content={
            searchCategory
              ? `Browse ${searchCategory.text} products at Kamma-Pharma. Find high-quality pharmaceutical items with fast delivery.`
              : "Explore pharmaceutical products by category at Kamma-Pharma. Find medicines, supplements, and healthcare items with fast delivery."
          }
        />
        <meta
          name="keywords"
          content={`Kamma-Pharma, ${
            searchCategory
              ? searchCategory.text.toLowerCase()
              : "pharmaceutical products"
          }, pharmacy, medicines, online pharmacy, healthcare`}
        />
        <meta name="robots" content="index, follow" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="canonical"
          href={`https://www.kamma-pharma.com/products/${category}`}
        />
      </Helmet>
      {searchCategory && (
        <div className="flex flex-col items-end w-max">
          <p className="text-2xl font-medium">
            {searchCategory.text.toLocaleUpperCase()}
          </p>
          <div className="w-16 h-0.5 bg-primary rounded-full"></div>
        </div>
      )}
      {filteredProducts?.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-2xl font-medium text-primary">
            No Products Available Now.
          </p>
        </div>
      )}
    </div>
  );
};

export default DrugCategory;