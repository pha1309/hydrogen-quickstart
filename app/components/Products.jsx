import ProductCard from './ProductCard';
import PropTypes from 'prop-types';

function Products({products = []}) {
  if (products.length === 0) return null;
  return (
    <div className="container mx-auto my-10">
      <h2 className="text-center mb-8">Our Products</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </div>
  );
}

Products.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
};

export default Products;
