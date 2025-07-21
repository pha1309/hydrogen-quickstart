import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

function Collections({collections}) {
  if (collections.length === 0) return null;
  return (
    <div className="container mx-auto my-10">
      <div className="text-center mb-8">
        <h2>Collections</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <Link
            to={`/collections/${collection.handle}`}
            key={collection.handle}
          >
            {collection.image && (
              <div className="relative">
                <Image
                  className="w-full h-auto"
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  loading="lazy"
                  width={collection.image.width}
                  height={collection.image.height}
                />
              </div>
            )}
            <h3 className="mt-2 text-center">{collection.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Collections;
