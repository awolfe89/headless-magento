import { gql } from "@apollo/client";
import { PRODUCT_FIELDS } from "../fragments/product";

export const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts(
    $search: String!
    $pageSize: Int = 25
    $currentPage: Int = 1
    $sort: ProductAttributeSortInput = {}
  ) {
    products(
      search: $search
      pageSize: $pageSize
      currentPage: $currentPage
      sort: $sort
    ) {
      total_count
      page_info {
        current_page
        page_size
        total_pages
      }
      items {
        ...ProductFields
      }
      aggregations {
        attribute_code
        label
        count
        options {
          label
          value
          count
        }
      }
    }
  }
  ${PRODUCT_FIELDS}
`;

export const SEARCH_SUGGESTIONS_QUERY = gql`
  query SearchSuggestions($search: String!) {
    products(search: $search, pageSize: 6) {
      total_count
      items {
        uid
        name
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
    }
  }
`;

