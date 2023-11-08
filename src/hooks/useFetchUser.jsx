import {useLazyQuery} from '@apollo/client';
import {FETCH_USER_INFO} from '../../request/queries/user.query';
import {useDispatch} from 'react-redux';
import {saveUserInfo} from '../features/user/userSlice';
import {GET_CATEGORIES} from '../../request/queries/getCategories.query';
import {GET_DOCUMENT_TYPES} from '../../request/queries/getPaginatedDocumentTypes.query';

const useFetchUser = () => {
  const [user] = useLazyQuery(FETCH_USER_INFO);
  const [getDocuments] = useLazyQuery(GET_DOCUMENT_TYPES);
  const dispatch = useDispatch();
  let info;

  const fetchUserInfo = async () => {
    await user().then(response => {
      dispatch(saveUserInfo(response.data.user));
      // console.log('Hello', response.data);
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
      info = response.data.getPaginatedDocumentTypes;
    });
    return info;
  };
  return {fetchUserInfo, fetchDocumentTypes};
};

export default useFetchUser;
