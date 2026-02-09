import { gql } from "@apollo/client";
import { PRODUCT_DETAIL_FIELDS } from "../fragments/product";

export const PRODUCT_DETAIL_QUERY = gql`
  query ProductDetail($urlKey: String!) {
    products(filter: { url_key: { eq: $urlKey } }) {
      items {
        ...ProductDetailFields
      }
    }
  }
  ${PRODUCT_DETAIL_FIELDS}
`;
