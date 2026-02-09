import { gql } from "@apollo/client";

export const CART_QUERY = gql`
  query Cart($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      total_quantity
      prices {
        grand_total {
          value
          currency
        }
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
      }
      applied_coupons {
        code
      }
      items {
        uid
        quantity
        product {
          uid
          name
          sku
          url_key
          small_image {
            url
            label
          }
          price_range {
            minimum_price {
              final_price {
                value
                currency
              }
            }
          }
        }
        prices {
          row_total {
            value
            currency
          }
          row_total_including_tax {
            value
            currency
          }
        }
        ... on ConfigurableCartItem {
          configurable_options {
            option_label
            value_label
          }
        }
      }
    }
  }
`;
