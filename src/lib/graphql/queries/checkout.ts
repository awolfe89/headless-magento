import { gql } from "@apollo/client";

/**
 * Full cart query used during checkout — includes addresses,
 * shipping methods, payment methods, and applied coupons.
 */
export const CHECKOUT_CART_QUERY = gql`
  query CheckoutCart($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      email
      total_quantity
      items {
        uid
        quantity
        product {
          name
          sku
          small_image {
            url
            label
          }
        }
        prices {
          row_total {
            value
            currency
          }
        }
      }
      shipping_addresses {
        firstname
        lastname
        street
        city
        region {
          code
          label
        }
        postcode
        country {
          code
          label
        }
        telephone
        available_shipping_methods {
          carrier_code
          carrier_title
          method_code
          method_title
          amount {
            value
            currency
          }
          price_excl_tax {
            value
            currency
          }
          available
        }
        selected_shipping_method {
          carrier_code
          carrier_title
          method_code
          method_title
          amount {
            value
            currency
          }
        }
      }
      billing_address {
        firstname
        lastname
        street
        city
        region {
          code
          label
        }
        postcode
        country {
          code
          label
        }
        telephone
      }
      available_payment_methods {
        code
        title
      }
      selected_payment_method {
        code
        title
      }
      applied_coupons {
        code
      }
      prices {
        subtotal_excluding_tax {
          value
          currency
        }
        subtotal_including_tax {
          value
          currency
        }
        applied_taxes {
          label
          amount {
            value
            currency
          }
        }
        discounts {
          label
          amount {
            value
            currency
          }
        }
        grand_total {
          value
          currency
        }
      }
    }
  }
`;
