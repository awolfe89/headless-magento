import { gql } from "@apollo/client";

export const GENERATE_CUSTOMER_TOKEN = gql`
  mutation GenerateCustomerToken($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer(
    $firstname: String!
    $lastname: String!
    $email: String!
    $password: String!
  ) {
    createCustomer(
      input: {
        firstname: $firstname
        lastname: $lastname
        email: $email
        password: $password
      }
    ) {
      customer {
        firstname
        lastname
        email
      }
    }
  }
`;

export const CHANGE_CUSTOMER_PASSWORD = gql`
  mutation ChangeCustomerPassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    changeCustomerPassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      email
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($firstname: String!, $lastname: String!) {
    updateCustomer(input: { firstname: $firstname, lastname: $lastname }) {
      customer {
        firstname
        lastname
        email
      }
    }
  }
`;

export const CREATE_CUSTOMER_ADDRESS = gql`
  mutation CreateCustomerAddress($input: CustomerAddressInput!) {
    createCustomerAddress(input: $input) {
      id
      firstname
      lastname
      street
      city
      region {
        region_code
      }
      postcode
      country_code
      telephone
      default_shipping
      default_billing
    }
  }
`;

export const UPDATE_CUSTOMER_ADDRESS = gql`
  mutation UpdateCustomerAddress($id: Int!, $input: CustomerAddressInput!) {
    updateCustomerAddress(id: $id, input: $input) {
      id
      firstname
      lastname
      street
      city
      region {
        region_code
      }
      postcode
      country_code
      telephone
      default_shipping
      default_billing
    }
  }
`;

export const DELETE_CUSTOMER_ADDRESS = gql`
  mutation DeleteCustomerAddress($id: Int!) {
    deleteCustomerAddress(id: $id)
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordResetEmail($email: String!) {
    requestPasswordResetEmail(email: $email)
  }
`;

export const REVOKE_CUSTOMER_TOKEN = gql`
  mutation RevokeCustomerToken {
    revokeCustomerToken {
      result
    }
  }
`;
