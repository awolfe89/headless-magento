import { gql } from "@apollo/client";

export const CREATE_PRODUCT_REVIEW = gql`
  mutation CreateProductReview(
    $sku: String!
    $nickname: String!
    $summary: String!
    $text: String!
    $ratings: [ProductReviewRatingInput!]!
  ) {
    createProductReview(
      input: {
        sku: $sku
        nickname: $nickname
        summary: $summary
        text: $text
        ratings: $ratings
      }
    ) {
      review {
        nickname
        summary
        text
        average_rating
        ratings_breakdown {
          name
          value
        }
      }
    }
  }
`;

export const PRODUCT_REVIEW_RATINGS_METADATA = gql`
  query ProductReviewRatingsMetadata {
    productReviewRatingsMetadata {
      items {
        id
        name
        values {
          value_id
          value
        }
      }
    }
  }
`;
