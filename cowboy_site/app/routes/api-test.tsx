import {useState} from 'react';
import {useLoaderData, useSearchParams, Link} from 'react-router';
import type {Route} from './+types/api-test';
import {COLLECTIONS_QUERY, COLLECTION_QUERY} from '~/lib/queries/collection';

export const meta: Route.MetaFunction = () => {
  return [{title: 'API Connection Test'}];
};

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const collectionHandle = url.searchParams.get('collection') || null;
  const cursor = url.searchParams.get('cursor') || null;
  const direction = url.searchParams.get('direction') || 'next';

  // 1. Fetch all collections
  const collectionsResponse = await storefront.query(COLLECTIONS_QUERY, {
    variables: {first: 50},
  });

  // 2. If a collection handle is specified, fetch its products
  let collectionResponse = null;
  if (collectionHandle) {
    const paginationVars =
      direction === 'prev'
        ? {last: 24, startCursor: cursor}
        : {first: 24, endCursor: cursor};

    collectionResponse = await storefront.query(COLLECTION_QUERY, {
      variables: {handle: collectionHandle, ...paginationVars},
    });
  }

  return {
    collections: collectionsResponse,
    selectedCollection: collectionResponse,
    selectedHandle: collectionHandle,
  };
}

export default function ApiTest() {
  const {collections, selectedCollection, selectedHandle} =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    collections: true,
    products: true,
  });

  const toggle = (key: string) =>
    setExpandedSections((prev) => ({...prev, [key]: !prev[key]}));

  const collectionNodes = collections?.collections?.nodes || [];
  const collection = selectedCollection?.collection || null;
  const pageInfo = collection?.products?.pageInfo;

  return (
    <div
      style={{
        fontFamily: 'monospace',
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <h1 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>
        Storefront API Test
      </h1>
      <p style={{color: '#666', marginBottom: '2rem'}}>
        Verifying connection to Shopify Storefront API. Raw JSON responses
        below.
      </p>

      {/* ── Collections List ── */}
      <section style={{marginBottom: '2rem'}}>
        <button
          onClick={() => toggle('collections')}
          style={{
            background: '#3F1E1F',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            width: '100%',
            textAlign: 'left',
          }}
        >
          {expandedSections.collections ? '▼' : '▶'} Collections (
          {collectionNodes.length})
        </button>

        {expandedSections.collections && (
          <div style={{border: '1px solid #ddd', borderTop: 'none'}}>
            {/* Quick links to load each collection */}
            <div
              style={{
                padding: '1rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                borderBottom: '1px solid #eee',
              }}
            >
              {collectionNodes.map((c: any) => (
                <Link
                  key={c.handle}
                  to={`/api-test?collection=${c.handle}`}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background:
                      selectedHandle === c.handle ? '#3F1E1F' : '#f5f5f5',
                    color: selectedHandle === c.handle ? '#fff' : '#333',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    borderRadius: '2px',
                  }}
                >
                  {c.title}
                </Link>
              ))}
            </div>

            {/* Raw JSON */}
            <pre
              style={{
                padding: '1rem',
                overflow: 'auto',
                maxHeight: '400px',
                fontSize: '0.75rem',
                margin: 0,
                background: '#fafafa',
              }}
            >
              {JSON.stringify(collections, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* ── Selected Collection Products ── */}
      {selectedHandle && (
        <section style={{marginBottom: '2rem'}}>
          <button
            onClick={() => toggle('products')}
            style={{
              background: '#3F1E1F',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              width: '100%',
              textAlign: 'left',
            }}
          >
            {expandedSections.products ? '▼' : '▶'} Products in "
            {collection?.title || selectedHandle}" (
            {collection?.products?.nodes?.length || 0} on this page)
          </button>

          {expandedSections.products && (
            <div style={{border: '1px solid #ddd', borderTop: 'none'}}>
              {/* Pagination controls */}
              {pageInfo && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    gap: '1rem',
                    borderBottom: '1px solid #eee',
                    alignItems: 'center',
                  }}
                >
                  {pageInfo.hasPreviousPage ? (
                    <Link
                      to={`/api-test?collection=${selectedHandle}&cursor=${pageInfo.startCursor}&direction=prev`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f5f5f5',
                        textDecoration: 'none',
                        color: '#333',
                        fontSize: '0.75rem',
                      }}
                    >
                      ← Previous page
                    </Link>
                  ) : (
                    <span
                      style={{fontSize: '0.75rem', color: '#bbb'}}
                    >
                      ← Previous page
                    </span>
                  )}

                  {pageInfo.hasNextPage ? (
                    <Link
                      to={`/api-test?collection=${selectedHandle}&cursor=${pageInfo.endCursor}&direction=next`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f5f5f5',
                        textDecoration: 'none',
                        color: '#333',
                        fontSize: '0.75rem',
                      }}
                    >
                      Next page →
                    </Link>
                  ) : (
                    <span
                      style={{fontSize: '0.75rem', color: '#bbb'}}
                    >
                      Next page →
                    </span>
                  )}

                  <span style={{fontSize: '0.7rem', color: '#999', marginLeft: 'auto'}}>
                    startCursor: {pageInfo.startCursor || '(none)'} | endCursor:{' '}
                    {pageInfo.endCursor || '(none)'}
                  </span>
                </div>
              )}

              {/* Product summary table */}
              {collection?.products?.nodes?.length > 0 && (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.75rem',
                  }}
                >
                  <thead>
                    <tr style={{background: '#f9f9f9', textAlign: 'left'}}>
                      <th style={{padding: '0.5rem'}}>Title</th>
                      <th style={{padding: '0.5rem'}}>Handle</th>
                      <th style={{padding: '0.5rem'}}>Price</th>
                      <th style={{padding: '0.5rem'}}>Available</th>
                      <th style={{padding: '0.5rem'}}>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collection.products.nodes.map((p: any) => (
                      <tr
                        key={p.id}
                        style={{borderTop: '1px solid #eee'}}
                      >
                        <td style={{padding: '0.5rem'}}>{p.title}</td>
                        <td style={{padding: '0.5rem'}}>{p.handle}</td>
                        <td style={{padding: '0.5rem'}}>
                          {p.priceRange?.minVariantPrice?.amount}{' '}
                          {p.priceRange?.minVariantPrice?.currencyCode}
                        </td>
                        <td style={{padding: '0.5rem'}}>
                          {p.availableForSale ? '✓' : '✗'}
                        </td>
                        <td style={{padding: '0.5rem'}}>
                          {p.featuredImage?.url ? (
                            <img
                              src={p.featuredImage.url}
                              alt={p.featuredImage.altText || p.title}
                              style={{width: 40, height: 40, objectFit: 'cover'}}
                            />
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Raw JSON */}
              <pre
                style={{
                  padding: '1rem',
                  overflow: 'auto',
                  maxHeight: '500px',
                  fontSize: '0.75rem',
                  margin: 0,
                  background: '#fafafa',
                  borderTop: '1px solid #eee',
                }}
              >
                {JSON.stringify(selectedCollection, null, 2)}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* ── Environment Info ── */}
      <section>
        <button
          onClick={() => toggle('env')}
          style={{
            background: '#666',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            width: '100%',
            textAlign: 'left',
          }}
        >
          {expandedSections.env ? '▼' : '▶'} Connection Info
        </button>
        {expandedSections.env && (
          <div
            style={{
              border: '1px solid #ddd',
              borderTop: 'none',
              padding: '1rem',
              fontSize: '0.75rem',
              background: '#fafafa',
            }}
          >
            <p>
              The storefront client is configured via Hydrogen's{' '}
              <code>createHydrogenContext</code>. It reads{' '}
              <code>PUBLIC_STORE_DOMAIN</code> and{' '}
              <code>PUBLIC_STOREFRONT_API_TOKEN</code> from the environment.
            </p>
            <p style={{marginTop: '0.5rem'}}>
              If you see data above, the API connection is working. If you see
              errors, verify your <code>.env</code> file has valid Shopify
              credentials.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
