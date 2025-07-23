import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import {useState} from 'react';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import ProductCard from '~/components/ProductCard';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
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
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();
  const [fullDescription, setFullDescription] = useState(false);

  return (
    <div className="container mx-auto my-10">
      <div className="collection">
        <h1 className="text-center mb-8">{collection.title}</h1>
        <div className="my-8">
          {fullDescription
            ? collection.description
            : collection.description.length > 300
              ? collection.description.slice(0, 300) + '...'
              : collection.description}

          {collection.description.length > 300 && (
            <button
              className="underline underline-offset-3 block cursor-pointer my-4"
              onClick={() => setFullDescription(!fullDescription)}
            >
              {fullDescription ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
        <PaginatedResourceSection
          connection={collection.products}
          resourcesClassName="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {({node: product}) => (
            <ProductCard key={product.id} product={product} />
          )}
        </PaginatedResourceSection>
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      </div>
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment ImageFields on Image {
    id
    altText
    height
    width
    url
  }

  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }

  fragment SelectedVariantFields on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
  }

  fragment ProductItem on Product {
    id
    handle
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
        ...MoneyProductItem
      }
      minVariantPrice {
        ...MoneyProductItem
      }
    }
    options(first: 3) {
      id
      name
      optionValues {
        id
        name
        firstSelectableVariant {
          ...SelectedVariantFields
        }
      }
    }
    variants(first: 10) {
      nodes {
        ...SelectedVariantFields
        title
        image {
          ...ImageFields
        }
        compareAtPrice {
          ...MoneyProductItem
        }
        price {
          ...MoneyProductItem
        }
      }
    }
    adjacentVariants {
      ...SelectedVariantFields
    }
    selectedOrFirstAvailableVariant {
      ...SelectedVariantFields
      price {
        ...MoneyProductItem
      }
      compareAtPrice {
        ...MoneyProductItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
