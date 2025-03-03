import gql from 'graphql-tag';

export const GetSettingR = gql`
    query GetSettingR {
        getSettingR {
            message
            status
            data {
                privacyPolicy
                termsAndConditions
                contact {
                    phoneNumber
                    email
                }
            }
        }
    }
`;
