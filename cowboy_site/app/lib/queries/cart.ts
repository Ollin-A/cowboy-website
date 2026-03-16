/**
 * Storefront API – Cart mutations & queries
 *
 * Note: Hydrogen's built-in cart helper (context.cart) already handles
 * most cart operations automatically using the CART_QUERY_FRAGMENT from
 * lib/fragments.ts. These standalone mutations are provided for cases
 * where you need direct control outside the Hydrogen cart abstraction.
 */

const CART_LINE_FRAGMENT = `#graphql
  fragment CartLineFields on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        amount
        currencyCode
      }
      amountPerQuantity {
        amount
        currencyCode
      }
      compareAtAmountPerQuantity {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        availableForSale
        sku
        image {
          id
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        product {
          id
          handle
          title
          vendor
          featuredImage {
            url
            altText
          }
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

const CART_FRAGMENT = `#graphql
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    note
    updatedAt
    buyerIdentity {
      countryCode
      email
      phone
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
    }
    lines(first: 100) {
      nodes {
        ...CartLineFields
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
  ${CART_LINE_FRAGMENT}
` as const;

/** Fetch an existing cart by ID */
export const CART_QUERY = `#graphql
  query Cart($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
` as const;

/** Create a new cart (optionally with initial lines) */
export const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate(
    $input: CartInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
` as const;

/** Add lines to an existing cart */
export const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
` as const;

/** Update quantities / attributes on existing cart lines */
export const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation CartLinesUpdate(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
` as const;

/** Remove lines from a cart */
export const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove(
    $cartId: ID!
    $lineIds: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
` as const;
