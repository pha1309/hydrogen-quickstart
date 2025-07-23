import {
  Image,
  Money,
  CartForm,
  getProductOptions,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {useState} from 'react';
import PropTypes from 'prop-types';
import {useAside} from './Aside';
import {useNavigate} from 'react-router';

function MainProduct({product, onCloseQuickView}) {
  const navigate = useNavigate();
  const {open} = useAside();
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

  const productOptions = getProductOptions(product);

  const variantImage = currentVariant?.image?.id
    ? currentVariant.image
    : product.images?.nodes?.[0];

  if (!product) {
    return <div>Product not found</div>;
  }
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
      <div className="flex flex-wrap">
        {variantImage && (
          <div className="w-full">
            <Image
              className="w-full h-auto"
              src={variantImage.url}
              alt={variantImage.altText || product.title}
              width={variantImage.width}
              height={variantImage.height}
              loading="eager"
              sizes="(min-width: 45em) 50vw, 100vw"
            />
          </div>
        )}
        {product.images?.nodes &&
          product.images.nodes.map(
            (image) =>
              image.id !== variantImage.id && (
                <div className="w-1/2" key={image.id}>
                  <Image
                    className="w-full h-auto"
                    src={image.url}
                    alt={image.altText || product.title}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    sizes="(min-width: 45em) 50vw, 100vw"
                  />
                </div>
              ),
          )}
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
        {productOptions.length > 0 && variants.length > 1 && (
          <div className="my-4 pt-4 border-t border-brand-light">
            {productOptions.map((option, index) =>
              option.optionValues.length > 1 ? (
                <div key={option.id}>
                  <div className="mb-2">{option.name}</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {option.optionValues?.map((value) => {
                      const {variantUriQuery, selected} = value;
                      const handleOptionChange = () => {
                        // Update the option selected
                        setOptionSelected((prev) => {
                          const newOptionSelected = [...prev];
                          newOptionSelected[index] = value.name;
                          return newOptionSelected;
                        });
                        if (!onCloseQuickView) {
                          // Is product page, navigate to the variant
                          if (!selected) {
                            try {
                              navigate(`?${variantUriQuery}`, {
                                replace: true,
                                preventScrollReset: true,
                              });
                            } catch (error) {
                              console.error('Navigation failed:', error);
                            }
                          }
                        }
                      };
                      return (
                        <button
                          key={value.id}
                          className={
                            optionSelected[index] === value.name
                              ? 'button button-primary'
                              : 'button button-outline'
                          }
                          onClick={handleOptionChange}
                        >
                          {value.name}
                        </button>
                      );
                    }) || null}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}

        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={
            currentVariant
              ? {
                  lines: [
                    {
                      merchandiseId: currentVariant.id,
                      quantity: 1,
                    },
                  ],
                }
              : {}
          }
        >
          {(fetcher) => {
            // Handle successful form submission
            if (fetcher.data && fetcher.state === 'loading') {
              if (onCloseQuickView) onCloseQuickView();
              open('cart');
            }

            return (
              <button
                disabled={
                  !currentVariant ||
                  !currentVariant?.availableForSale ||
                  fetcher.state !== 'idle'
                }
                type="submit"
                className={`button button-primary button-large ${
                  !currentVariant || !currentVariant?.availableForSale
                    ? 'disabled'
                    : ''
                }`}
              >
                <svg
                  className={`size-4 animate-spin ${
                    fetcher.state === 'idle' ? 'hidden' : 'block'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className={fetcher.state === 'idle' ? 'block' : 'hidden'}>
                  {currentVariant?.availableForSale
                    ? 'Add to cart'
                    : 'Sold out'}
                </span>
              </button>
            );
          }}
        </CartForm>
      </div>
    </div>
  );
}

MainProduct.propTypes = {
  product: PropTypes.object.isRequired,
};

export default MainProduct;
