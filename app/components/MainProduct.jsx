import {Image, Money} from '@shopify/hydrogen';
import {useState} from 'react';
import PropTypes from 'prop-types';

function MainProduct({product}) {
  const variants = product.variants?.nodes || [];
  const [optionSelected, setOptionSelected] = useState(() => {
    if (!product.selectedOrFirstAvailableVariant?.selectedOptions) {
      return [];
    }
    return Array.from(
      product.selectedOrFirstAvailableVariant.selectedOptions,
      (option) => option.value,
    );
  });

  const currentVariant =
    variants.find(
      (variant) =>
        variant.selectedOptions?.length === optionSelected.length &&
        variant.selectedOptions.every(
          (option, index) => optionSelected[index] === option.value,
        ),
    ) ||
    variants[0] ||
    null;

  if (!product) {
    return <div>Product not found</div>;
  }
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
      <div className="flex flex-wrap">
        {product.images?.nodes &&
          product.images.nodes.map((image, index) => (
            <div className={index === 0 ? 'w-full' : 'w-1/2'} key={image.id}>
              <Image
                className="w-full h-auto"
                src={image.url}
                alt={image.altText || product.title}
                width={image.width}
                height={image.height}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="(min-width: 45em) 50vw, 100vw"
              />
            </div>
          ))}
      </div>
      <div>
        <h1 className="mb-2">{product.title}</h1>
        {currentVariant?.price && (
          <h2 className="mb-2">
            <Money data={currentVariant.price} />
          </h2>
        )}
        {product.description && (
          <div className="mb-2">{product.description}</div>
        )}
        {product.options?.length > 0 && variants.length > 1 && (
          <div className="my-4 pt-4 border-t border-brand-light">
            {product.options.map((option, index) => (
              <div key={option.id}>
                <div className="mb-2">{option.name}</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {option.optionValues?.map((value) => (
                    <button
                      key={value.id}
                      className={
                        optionSelected[index] === value.name
                          ? 'button button-primary'
                          : 'button button-outline'
                      }
                      onClick={() =>
                        setOptionSelected((prev) => {
                          const newOptionSelected = [...prev];
                          newOptionSelected[index] = value.name;
                          return newOptionSelected;
                        })
                      }
                    >
                      {value.name}
                    </button>
                  )) || null}
                </div>
              </div>
            )) || null}
          </div>
        )}
        <button
          type="button"
          className="button button-primary button-large"
          onClick={() => {
            // TODO: Implement add to cart functionality
            console.log('Add to cart:', currentVariant?.id);
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

MainProduct.propTypes = {
  product: PropTypes.object.isRequired,
};

export default MainProduct;
