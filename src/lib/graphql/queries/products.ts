import { gql } from "@apollo/client";
import { PRODUCT_FIELDS } from "../fragments/product";

export const CATEGORY_PRODUCTS_QUERY = gql`
  query CategoryProducts(
    $categoryUids: [String!]!
    $pageSize: Int = 25
    $currentPage: Int = 1
    $sort: ProductAttributeSortInput = {}
    $filter: ProductAttributeFilterInput = {}
  ) {
    products(
      filter: { category_uid: { in: $categoryUids } }
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

export const CATEGORY_SIBLING_PRODUCTS_QUERY = gql`
  query CategorySiblingProducts($categoryUid: String!, $pageSize: Int = 12) {
    products(
      filter: { category_uid: { eq: $categoryUid } }
      pageSize: $pageSize
      sort: { position: ASC }
    ) {
      items {
        ...ProductFields
      }
    }
  }
  ${PRODUCT_FIELDS}
`;

export const FILTERED_PRODUCTS_QUERY = gql`
  query FilteredProducts(
    $filter: ProductAttributeFilterInput!
    $pageSize: Int = 25
    $currentPage: Int = 1
    $sort: ProductAttributeSortInput = {}
  ) {
    products(
      filter: $filter
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
