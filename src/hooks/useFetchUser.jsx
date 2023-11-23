import {useLazyQuery, useMutation} from '@apollo/client';
import {FETCH_USER_INFO} from '../../request/queries/user.query';
import {useDispatch} from 'react-redux';
import {saveUserInfo} from '../features/user/userSlice';
import {GET_CATEGORIES} from '../../request/queries/getCategories.query';
import {GET_DOCUMENT_TYPES} from '../../request/queries/getPaginatedDocumentTypes.query';
import {UPDATE_USER_ADDRESS} from '../../request/mutations/updateUserAddress.mutation';

const useFetchUser = () => {
  const [user] = useLazyQuery(FETCH_USER_INFO);
  const [getDocuments] = useLazyQuery(GET_DOCUMENT_TYPES);
  const [updateAddress] = useMutation(UPDATE_USER_ADDRESS);
  const dispatch = useDispatch();
  let info;

  const fetchUserInfo = async () => {
    await user().then(response => {
      dispatch(saveUserInfo(response.data.user));
      info = response.data.user;
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

    await getDocuments(request).then(response => {
      console.log('====================================');
      console.log(response.data.getPaginatedDocumentTypes.status);
      console.log('====================================');
      info = response.data.getPaginatedDocumentTypes;
    });
    return info;
  };

  const hadleUpdateAddress = async params => {
    const request = {
      variables: {
        ...params,
      },
    };
    try {
      const response = await updateAddress(request);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  return {fetchUserInfo, fetchDocumentTypes, hadleUpdateAddress};
};

export default useFetchUser;
