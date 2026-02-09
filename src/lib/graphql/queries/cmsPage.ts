import { gql } from "@apollo/client";

export const CMS_PAGE_QUERY = gql`
  query CmsPage($identifier: String!) {
    cmsPage(identifier: $identifier) {
      identifier
      title
      content
      content_heading
      meta_title
      meta_description
    }
  }
`;

export const CMS_BLOCKS_QUERY = gql`
  query CmsBlocks($identifiers: [String!]!) {
    cmsBlocks(identifiers: $identifiers) {
      items {
        identifier
        title
        content
      }
    }
  }
`;
