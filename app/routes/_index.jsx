import {useLoaderData} from 'react-router';
import Slider from '~/components/Slider';
import Collections from '~/components/Collections';
import ListProducts from '~/components/ListProducts';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [slideshowRes, collectionsRes, productsRes] = await Promise.allSettled([
    context.storefront.query(SLIDESHOW_QUERY),
    context.storefront.query(COLLECTIONS_QUERY),
    context.storefront.query(PRODUCTS_QUERY),
  ]);

  return {
    slideshows:
      slideshowRes.status === 'fulfilled'
        ? slideshowRes.value?.metaobjects?.nodes || []
        : [],
    collections:
      collectionsRes.status === 'fulfilled'
        ? collectionsRes.value?.collections?.nodes || []
        : [],
    products:
      productsRes.status === 'fulfilled'
        ? productsRes.value?.collection?.products?.nodes || []
        : [],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return;
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  return (
    <div className="home">
      <Slider slideshows={data.slideshows} />
      <Collections collections={data.collections} />
      <ListProducts products={data.products} />
    </div>
  );
}

const IMAGE_FIELDS_FRAGMENT = `#graphql
fragment ImageFields on Image {
    id
    altText
    height
    width
    url
  }
`;

const SLIDESHOW_QUERY = `#graphql
  query Slideshows($first: Int = 10) {
    metaobjects(first: $first, type: "slideshow") {
      nodes {
        id
        handle
        fields {
          key
          reference {
            ... on MediaImage {
              image {
                ...ImageFields
              }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS_FRAGMENT}
`;

const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int = 4) {
    collections(first: $first) {
      nodes {
        handle
        title
        image {
          ...ImageFields
        }
      }
    }
  }
  ${IMAGE_FIELDS_FRAGMENT}
`;

const PRODUCTS_QUERY = `#graphql
  query Products($handle: String = "frontpage", $first: Int = 4) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          handle
          id
          title
          description
          featuredImage {
            ...ImageFields
          }
          images(first: 3) {
            nodes {
              ...ImageFields
            }
          }
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
          options(first: 3) {
            id
            name
            optionValues {
              name
              id
              firstSelectableVariant {
                availableForSale
                id
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          variants(first: 10) {
            nodes {
              id
              title
              selectedOptions {
                name
                value
              }
              availableForSale
              compareAtPrice {
                amount
                currencyCode
              }
              price {
                amount
                currencyCode
              }
            }
          }
          adjacentVariants {
            availableForSale
            id
            selectedOptions {
              name
              value
            }
          }
          selectedOrFirstAvailableVariant {
            id
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
