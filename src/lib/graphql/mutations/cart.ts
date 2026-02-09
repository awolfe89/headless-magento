import { gql } from "@apollo/client";

export const MERGE_CARTS = gql`
  mutation MergeCarts($sourceCartId: String!, $destinationCartId: String) {
    mergeCarts(
      source_cart_id: $sourceCartId
      destination_cart_id: $destinationCartId
    ) {
      id
      total_quantity
    }
  }
`;

export const CREATE_EMPTY_CART = gql`
  mutation CreateEmptyCart {
    createEmptyCart
  }
`;

export const ADD_PRODUCTS_TO_CART = gql`
  mutation AddProductsToCart(
    $cartId: String!
    $cartItems: [CartItemInput!]!
  ) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        id
        total_quantity
        items {
          uid
          quantity
          product {
            uid
            name
            sku
          }
        }
        prices {
          grand_total {
            value
            currency
          }
        }
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const UPDATE_CART_ITEMS = gql`
  mutation UpdateCartItems(
    $cartId: String!
    $cartItems: [CartItemUpdateInput!]!
  ) {
    updateCartItems(input: { cart_id: $cartId, cart_items: $cartItems }) {
      cart {
        id
        total_quantity
        prices {
          grand_total {
            value
            currency
          }
        }
      }
    }
  }
`;

export const REMOVE_ITEM_FROM_CART = gql`
  mutation RemoveItemFromCart($cartId: String!, $cartItemUid: ID!) {
    removeItemFromCart(
      input: { cart_id: $cartId, cart_item_uid: $cartItemUid }
    ) {
      cart {
        id
        total_quantity
        prices {
          grand_total {
            value
            currency
          }
        }
      }
    }
  }
`;
