import {useLoaderData} from 'react-router';
import Slider from '~/components/Slider';
import Collections from '~/components/Collections';

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
  const [metaobjectsRes, collectionsRes] = await Promise.all([
    context.storefront.query(SLIDESHOW_QUERY),
    context.storefront.query(COLLECTIONS_QUERY),
  ]);

  return {
    slideshows: metaobjectsRes?.metaobjects?.nodes || [],
    collections: collectionsRes?.collections?.edges || [],
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
    </div>
  );
}

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
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int = 4) {
    collections(first: $first) {
      edges {
        node {
          handle
          title
          image {
            altText
            width
            height
            url
          }
        }
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
