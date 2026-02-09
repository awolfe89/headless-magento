import { gql } from "@apollo/client";

export const CUSTOMER_QUERY = gql`
  query Customer {
    customer {
      firstname
      lastname
      email
      created_at
      addresses {
        id
        firstname
        lastname
        street
        city
        region {
          region_code
          region
          region_id
        }
        postcode
        country_code
        telephone
        default_shipping
        default_billing
      }
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY = gql`
  query CustomerOrders($pageSize: Int!, $currentPage: Int!) {
    customer {
      orders(pageSize: $pageSize, currentPage: $currentPage) {
        total_count
        items {
          number
          order_date
          status
          total {
            grand_total {
              value
              currency
            }
            subtotal {
              value
              currency
            }
          }
          items {
            product_name
            product_sku
            quantity_ordered
            product_sale_price {
              value
              currency
            }
          }
          shipping_address {
            firstname
            lastname
            city
            region
            postcode
          }
        }
      }
    }
  }
`;

export const CUSTOMER_ORDER_DETAIL_QUERY = gql`
  query CustomerOrderDetail($orderNumber: String!) {
    customer {
      orders(filter: { number: { eq: $orderNumber } }) {
        items {
          number
          order_date
          status
          carrier
          shipping_method
          payment_methods {
            name
            type
          }
          items {
            product_name
            product_sku
            product_url_key
            quantity_ordered
            product_sale_price {
              value
              currency
            }
          }
          shipping_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
            telephone
          }
          billing_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
            telephone
          }
          total {
            subtotal {
              value
              currency
            }
            grand_total {
              value
              currency
            }
            total_shipping {
              value
              currency
            }
            total_tax {
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
  }
`;

export const CUSTOMER_ALL_ORDER_ITEMS_QUERY = gql`
  query CustomerAllOrderItems($pageSize: Int!, $currentPage: Int!) {
    customer {
      orders(pageSize: $pageSize, currentPage: $currentPage) {
        total_count
        page_info {
          current_page
          total_pages
        }
        items {
          order_date
          items {
            product_name
            product_sku
            quantity_ordered
            product_sale_price {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_REVIEWS_QUERY = gql`
  query CustomerReviews($pageSize: Int!, $currentPage: Int!) {
    customer {
      reviews(pageSize: $pageSize, currentPage: $currentPage) {
        items {
          summary
          text
          nickname
          average_rating
          created_at
          product {
            name
            sku
            url_key
          }
          ratings_breakdown {
            name
            value
          }
        }
        page_info {
          total_pages
          current_page
        }
      }
    }
  }
`;

export const PRODUCTS_BY_SKU_QUERY = gql`
  query ProductsBySku($skus: [String!]!, $pageSize: Int = 100) {
    products(filter: { sku: { in: $skus } }, pageSize: $pageSize) {
      items {
        uid
        sku
        name
        url_key
        stock_status
        manufacturer
        small_image {
          url
          label
        }
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
      }
    }
  }
`;
