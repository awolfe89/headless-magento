import { gql } from "@apollo/client";

export const BLOG_POSTS_QUERY = gql`
  query BlogPosts(
    $filter: BlogPostsFilterInput
    $pageSize: Int = 12
    $currentPage: Int = 1
    $sort: [String]
  ) {
    blogPosts(
      filter: $filter
      pageSize: $pageSize
      currentPage: $currentPage
      sort: $sort
    ) {
      total_count
      total_pages
      items {
        post_id
        identifier
        title
        short_filtered_content
        featured_image
        featured_list_image
        first_image
        publish_time
        author {
          author_id
          title
        }
        categories {
          category_id
          identifier
          title
        }
        tags {
          tag_id
          identifier
          title
        }
      }
    }
  }
`;

export const BLOG_POST_QUERY = gql`
  query BlogPost($id: String!) {
    blogPost(id: $id) {
      post_id
      identifier
      title
      meta_title
      meta_description
      content_heading
      filtered_content
      short_filtered_content
      featured_image
      featured_img_alt
      publish_time
      author {
        author_id
        title
      }
      categories {
        category_id
        identifier
        title
      }
      tags {
        tag_id
        identifier
        title
      }
      related_posts {
        post_id
        identifier
        title
        short_filtered_content
        featured_image
        first_image
        publish_time
        author {
          author_id
          title
        }
        categories {
          category_id
          identifier
          title
        }
      }
      related_products
    }
  }
`;

export const BLOG_CATEGORIES_QUERY = gql`
  query BlogCategories {
    blogCategories {
      items {
        category_id
        identifier
        title
        posts_count
      }
    }
  }
`;

export const BLOG_CATEGORY_QUERY = gql`
  query BlogCategory($id: String!) {
    blogCategory(id: $id) {
      category_id
      identifier
      title
      meta_title
      meta_description
      content
    }
  }
`;
