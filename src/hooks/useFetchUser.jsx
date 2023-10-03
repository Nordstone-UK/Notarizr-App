import {useLazyQuery} from '@apollo/client';
import {FETCH_USER_INFO} from '../../request/queries/user.query';
import {useDispatch} from 'react-redux';
import {saveUserInfo} from '../features/user/userSlice';

const useFetchUser = () => {
  const [user] = useLazyQuery(FETCH_USER_INFO);
  const dispatch = useDispatch();
  let info;
  const fetchUserInfo = async () => {
    await user().then(response => {
      dispatch(saveUserInfo(response.data.user));
      console.log('Data before', response.data.user);
      info = response.data.user;
    });
    return info;
  };

  return {fetchUserInfo};
};

export default useFetchUser;
