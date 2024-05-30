import {useLazyQuery, useMutation} from '@apollo/client';
import {FETCH_USER_INFO} from '../../request/queries/user.query';
import {useDispatch} from 'react-redux';
import {saveUserInfo} from '../features/user/userSlice';
import {GET_CATEGORIES} from '../../request/queries/getCategories.query';
import {GET_DOCUMENT_TYPES} from '../../request/queries/getPaginatedDocumentTypes.query';
import {UPDATE_USER_ADDRESS} from '../../request/mutations/updateUserAddress.mutation';
import {SEARCH_USER} from '../../request/queries/searchUser.query';
import {EDIT_USER_ADDRESS} from '../../request/mutations/editUserAddress.mutation';
import {DELETE_USER_ADDRESS} from '../../request/mutations/deleteUserAddress.mutation';

const useFetchUser = () => {
  const [user] = useLazyQuery(FETCH_USER_INFO);
  const [getDocuments] = useLazyQuery(GET_DOCUMENT_TYPES);
  const [updateAddress] = useMutation(UPDATE_USER_ADDRESS);
  const [editAddress] = useMutation(EDIT_USER_ADDRESS);
  const [deleteUserAddress] = useMutation(DELETE_USER_ADDRESS);

  const [searchUser] = useLazyQuery(SEARCH_USER);
  const dispatch = useDispatch();
  let info;
  const fetchUserInfo = async () => {
    // const re = await user();
    // console.log('sssssssssssddddddddddddddd', re);
    await user().then(response => {
      info = response.data.user;
      console.log('ingo', info.addresses);
      if (info.profile_picture === null || !info.profile_picture) {
        info.profile_picture =
          'https://notarizr-app-data.s3.us-east-2.amazonaws.com/static/unnamed.jpg';
      }

      dispatch(saveUserInfo(info));
    });
    return info;
  };
  const fetchDocumentTypes = async (page, limit, State, Search) => {
    const request = {
      variables: {
        page: page,
        limit: limit,
        state: State,
        searchString: Search,
      },
    };
    try {
      const response = await getDocuments(request);

      return response.data.getPaginatedDocumentTypes;
    } catch (err) {
      console.log(err);
    }

    // await getDocuments(request).then(response => {
    //   info = response.data.getPaginatedDocumentTypes;
    // });
    // return info;
  };

  const hadleUpdateAddress = async params => {
    const request = {
      variables: {
        ...params,
      },
    };
    console.log('parsd', request);
    try {
      const response = await updateAddress(request);
      console.log('updated address', response);

      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const handleEditAddress = async params => {
    const request = {
      variables: {
        ...params,
      },
    };
    try {
      const response = await editAddress(request);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAddress = async addressId => {
    console.log('addressid', addressId);
    try {
      const response = await deleteUserAddress({
        variables: {
          addressId: addressId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      // Handle error
    }
  };

  const searchUserByEmail = async email => {
    const request = {
      variables: {
        search: email,
        limit: 5,
        page: 1,
      },
    };
    try {
      const response = await searchUser(request);
      return response.data.searchUser.docs;
    } catch (err) {
      console.log(err);
    }
  };
  return {
    fetchUserInfo,
    fetchDocumentTypes,
    hadleUpdateAddress,
    searchUserByEmail,
    handleEditAddress,
    handleDeleteAddress,
  };
};

export default useFetchUser;
