import {useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import MainProduct from './MainProduct';

function ProductCard({product}) {
  const [showQuickView, setShowQuickView] = useState(false);

  const handleQuickView = (e) => {
    e.preventDefault();

    setShowQuickView(true);
  };

  return (
    <div>
      <div className="relative group">
        <Link to={`/products/${product.handle}`}>
          <Image
            className="w-full h-auto"
            aspectRatio="1/1"
            src={product.featuredImage?.url}
            alt={product.featuredImage?.altText || product.title}
            loading="lazy"
            width={product.featuredImage?.width}
            height={product.featuredImage?.height}
          />
        </Link>
        <div className="absolute z-10 right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            className="button button-primary w-10 h-10 rounded-full p-0 font-bold"
            onClick={handleQuickView}
            aria-label={`Quick view for ${product.title}`}
            type="button"
          >
            +
          </button>
        </div>
      </div>
      <div className="bg-brand-light px-4 py-2">
        <h3>
          <Link to={`/products/${product.handle}`}>{product.title}</Link>
        </h3>
        {Number(product.priceRange.maxVariantPrice.amount) >
        Number(product.priceRange.minVariantPrice.amount) ? (
          <div className="flex items-center gap-2">
            <Money data={product.priceRange.minVariantPrice} />
            <span>-</span>
            <Money data={product.priceRange.maxVariantPrice} />
          </div>
        ) : (
          <Money data={product.priceRange.minVariantPrice} />
        )}
      </div>

      {showQuickView && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 cursor-pointer"
            onClick={() => setShowQuickView(false)}
            aria-label="Close modal"
          ></div>
          <div
            className="popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal"
          >
            <div className="flex justify-end mb-4">
              <button
                className="button w-10 h-10 rounded-full p-0 font-bold"
                onClick={() => setShowQuickView(false)}
                aria-label="Close quick view"
                type="button"
              >
                x
              </button>
            </div>
            <MainProduct product={product} />
          </div>
        </>
      )}
    </div>
  );
}

export default ProductCard;
