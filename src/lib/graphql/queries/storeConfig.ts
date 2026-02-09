import { gql } from "@apollo/client";

export const STORE_CONFIG_QUERY = gql`
  query StoreConfig {
    storeConfig {
      store_name
      store_code
      base_url
      base_media_url
      base_currency_code
      default_title
      default_description
      copyright
      logo_src
      logo_alt
      header_logo_src
    }
  }
`;
