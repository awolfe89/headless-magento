import { gql } from "@apollo/client";

export const SET_GUEST_EMAIL = gql`
  mutation SetGuestEmail($cartId: String!, $email: String!) {
    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart {
        email
      }
    }
  }
`;

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress(
    $cartId: String!
    $address: CartAddressInput!
  ) {
    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [{ address: $address }]
      }
    ) {
      cart {
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
          }
        }
      }
    }
  }
`;

export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethod(
    $cartId: String!
    $carrierCode: String!
    $methodCode: String!
  ) {
    setShippingMethodsOnCart(
      input: {
        cart_id: $cartId
        shipping_methods: [
          { carrier_code: $carrierCode, method_code: $methodCode }
        ]
      }
    ) {
      cart {
        shipping_addresses {
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
      }
    }
  }
`;

export const SET_BILLING_ADDRESS = gql`
  mutation SetBillingAddress(
    $cartId: String!
    $address: CartAddressInput!
  ) {
    setBillingAddressOnCart(
      input: { cart_id: $cartId, billing_address: { address: $address } }
    ) {
      cart {
        billing_address {
          firstname
          lastname
          street
          city
          region {
            code
          }
          postcode
          country {
            code
          }
        }
      }
    }
  }
`;

export const SET_PAYMENT_METHOD = gql`
  mutation SetPaymentMethod($cartId: String!, $paymentCode: String!) {
    setPaymentMethodOnCart(
      input: { cart_id: $cartId, payment_method: { code: $paymentCode } }
    ) {
      cart {
        selected_payment_method {
          code
          title
        }
      }
    }
  }
`;

export const PLACE_ORDER = gql`
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
      }
    }
  }
`;

export const APPLY_COUPON = gql`
  mutation ApplyCoupon($cartId: String!, $couponCode: String!) {
    applyCouponToCart(input: { cart_id: $cartId, coupon_code: $couponCode }) {
      cart {
        applied_coupons {
          code
        }
        prices {
          grand_total {
            value
            currency
          }
          discounts {
            label
            amount {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

export const REMOVE_COUPON = gql`
  mutation RemoveCoupon($cartId: String!) {
    removeCouponFromCart(input: { cart_id: $cartId }) {
      cart {
        applied_coupons {
          code
        }
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
