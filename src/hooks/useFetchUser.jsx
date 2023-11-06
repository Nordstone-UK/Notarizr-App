import {useLazyQuery} from '@apollo/client';
import {FETCH_USER_INFO} from '../../request/queries/user.query';
import {useDispatch} from 'react-redux';
import {saveUserInfo} from '../features/user/userSlice';
import {GET_CATEGORIES} from '../../request/queries/getCategories.query';

const useFetchUser = () => {
  const [user] = useLazyQuery(FETCH_USER_INFO);
  const [getCategories] = useLazyQuery(GET_CATEGORIES);
  const dispatch = useDispatch();
  let info;
  const fetchUserInfo = async () => {
    await user().then(response => {
      dispatch(saveUserInfo(response.data.user));
      fetchCategories();
      info = response.data.user;
    });
    return info;
  };
  const fetchCategories = async () => {
    await getCategories()
      .then(response => {
        // console.log(
        //   'Categories Response',
        //   response.data.getCategories.categories,
        // );
      })
      .catch(error => {
        console.error(error);
      });
  };
  return {fetchUserInfo, fetchCategories};
};

export default useFetchUser;
