import { gql } from "@apollo/client";

export const CATEGORY_FIELDS = gql`
  fragment CategoryFields on CategoryTree {
    uid
    name
    url_path
    url_key
    position
    children_count
  }
`;
