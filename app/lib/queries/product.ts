/**
 * Storefront API – Product queries & fragments
 *
 * Used on the PDP and anywhere a full product payload is needed.
 * For lightweight product cards (PLPs, carousels), use the
 * COLLECTION_PRODUCT_FRAGMENT from collection.ts instead.
 */

export const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFull on ProductVariant {
    id
    title
    sku
    availableForSale
    quantityAvailable
    currentlyNotInStock
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    unitPrice {
      amount
      currencyCode
    }
    image {
      id
      url
      altText
      width
      height
    }
    selectedOptions {
      name
      value
    }
    product {
      title
      handle
    }
  }
` as const;

export const PRODUCT_FRAGMENT = `#graphql
  fragment ProductFull on Product {
    id
    title
    handle
    vendor
    productType
    description
    descriptionHtml
    tags
    publishedAt
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariantFull
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariantFull
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariantFull
    }
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    media(first: 10) {
      nodes {
        mediaContentType
        alt
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
        ... on Video {
          id
          sources {
            url
            mimeType
            width
            height
          }
        }
      }
    }
    seo {
      title
      description
    }
    metafields(identifiers: [
      { namespace: "custom", key: "materials" },
      { namespace: "custom", key: "care_instructions" },
      { namespace: "custom", key: "size_guide" },
      { namespace: "custom", key: "origin" }
    ]) {
      namespace
      key
      value
      type
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

export const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductFull
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
