import { gql } from "@apollo/client";

export const COUNTRY_REGIONS_QUERY = gql`
  query CountryRegions($countryId: String!) {
    country(id: $countryId) {
      id
      full_name_english
      available_regions {
        id
        code
        name
      }
    }
  }
`;

export interface Region {
  id: number;
  code: string;
  name: string;
}
