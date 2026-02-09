import { gql } from "@apollo/client";

export const ROOT_CATEGORIES_QUERY = gql`
  query RootCategories {
    categories(filters: { parent_id: { eq: "2" } }) {
      items {
        uid
        name
        url_path
        url_key
        position
        children_count
        image
        children {
          uid
          name
          url_path
          url_key
          position
          children_count
          image
        }
      }
    }
  }
`;

export const CATEGORY_BY_URL_QUERY = gql`
  query CategoryByUrl($urlPath: String!) {
    categories(filters: { url_path: { eq: $urlPath } }) {
      items {
        uid
        name
        description
        url_path
        image
        children_count
        meta_title
        meta_description
        breadcrumbs {
          category_uid
          category_name
          category_url_path
        }
        children {
          uid
          name
          url_path
          url_key
          children_count
          image
          product_count
          children {
            uid
            name
            url_path
            url_key
            product_count
          }
        }
      }
    }
  }
`;
