import {Link} from 'react-router';

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
            to={`/collections/${collection.node.handle}`}
            key={collection.node.handle}
          >
            <div className="relative">
              <img
                className="w-full h-auto"
                src={collection.node.image.url}
                alt={collection.node.image.altText || collection.node.title}
                loading="lazy"
                width={collection.node.image.width}
                height={collection.node.image.height}
              />
            </div>
            <h3 className="mt-2 text-center">{collection.node.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Collections;
