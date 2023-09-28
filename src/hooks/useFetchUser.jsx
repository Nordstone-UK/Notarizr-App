import {useLazyQuery} from '@apollo/client';
import {FETCH_USER_INFO} from '../../request/queries/uesr.query';
import {useDispatch} from 'react-redux';
import {saveUserInfo} from '../features/user/userSlice';

const useFetchUser = () => {
  const [user] = useLazyQuery(FETCH_USER_INFO);
  const dispatch = useDispatch();

  const fetchUserInfo = async () => {
    await user().then(response => {
      // console.log(response.data);
      dispatch(saveUserInfo(response.data.user));
    });
  };

  return {fetchUserInfo};
};

export default useFetchUser;
