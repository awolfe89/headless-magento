import { gql } from "@apollo/client";

/**
 * Fetches all brand subcategories under "Shop by Brand" (category ID 6).
 */
export const BRANDS_QUERY = gql`
  query Brands {
    categories(filters: { ids: { eq: "6" } }) {
      items {
        uid
        name
        children {
          uid
          name
          url_path
          url_key
          image
          product_count
        }
      }
    }
  }
`;
