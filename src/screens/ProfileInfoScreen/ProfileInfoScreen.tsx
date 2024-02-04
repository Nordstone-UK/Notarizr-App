import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import SettingOptions from '../../components/SettingOptions/SettingOptions';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetchUser from '../../hooks/useFetchUser';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import MainButton from '../../components/MainGradientButton/MainButton';
import LoginBottomSheet from '../../components/CustomBottomSheet/LoginBottomSheet';
import {saveUserInfo} from '../../features/user/userSlice';
export default function ProfileInfoScreen({navigation}: any) {
  const user = useSelector(state => state.user.user);
  const {fetchUserInfo} = useFetchUser();
  const dispatch = useDispatch();

  const clearTokenFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('token');
      const token = await AsyncStorage.getItem('token');
      // console.log('Token cleared from AsyncStorage', token);
    } catch (error) {
      console.error('Error clearing token from AsyncStorage:', error);
    }
  };
  const handleLogout = () => {
    if (user) {
      clearTokenFromStorage();
      dispatch(saveUserInfo(null));
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      });
    }
  };
  useEffect(() => {
    if (user != null) {
      const unsubscribe = navigation.addListener('focus', () => {
        fetchUserInfo();
      });
      return unsubscribe;
    }
  }, [navigation]);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      {user != null ? (
        <View>
          <Image source={{uri: user?.profile_picture}} style={styles.picture} />
          <Text style={styles.textheading}>{user?.first_name}</Text>
        </View>
      ) : (
        <View>
          <Image
            source={require('../../../assets/mainLogo.png')}
            style={styles.picture}
          />
          <Text style={styles.textheading}>Login to see your information</Text>
        </View>
      )}
      <BottomSheetStyle>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: heightToDp(20)}}>
          {user != null && (
            <View style={styles.iconContainer}>
              <TouchableOpacity
                onPress={
                  user?.account_type === 'client'
                    ? () => navigation.navigate('ProfileDetailEditScreen')
                    : () => navigation.navigate('AgentProfileEditScreen')
                }>
                <Image
                  source={require('../../../assets/editIcon.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('SettingScreen')}>
                <Image
                  source={require('../../../assets/settingIcon.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          )}
          <View style={{marginBottom: heightToDp(2)}}>
            <SettingOptions
              icon={require('../../../assets/settingProfile.png')}
              Title="Profile Details"
              onPress={() =>
                user != null
                  ? navigation.navigate('ProfileDetailEditScreen')
                  : handleOpenModal()
              }
            />
            <SettingOptions
              icon={require('../../../assets/greenLocation.png')}
              Title="Address"
              onPress={() =>
                user != null
                  ? navigation.navigate('AddressDetails')
                  : handleOpenModal()
              }
            />
            {user != null && user?.account_type !== 'client' && (
              <SettingOptions
                icon={require('../../../assets/blueCard.png')}
                Title="Payment Method"
                onPress={() => navigation.navigate('PaymentUpdateScreen')}
              />
            )}

            {user != null && user?.account_type !== 'client' && (
              <SettingOptions
                icon={require('../../../assets/license.png')}
                Title="Update License and Notary Seal"
                // onPress={() => navigation.navigate('PasswordEditScreen')}
              />
            )}
            {user != null && user?.account_type !== 'client' && (
              <SettingOptions
                icon={require('../../../assets/training.png')}
                Title="Trainings"
                // onPress={() => navigation.navigate('PasswordEditScreen')}
              />
            )}
            {user != null && (
              <SettingOptions
                icon={require('../../../assets/logout.png')}
                Title="Log out"
                onPress={() => handleLogout()}
              />
            )}
          </View>
        </ScrollView>
      </BottomSheetStyle>
      <LoginBottomSheet
        isVisible={isModalVisible}
        onCloseModal={handleCloseModal}
        Title="Please Login to see your profile"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  picture: {
    alignSelf: 'center',
    marginTop: heightToDp(5),
    width: widthToDp(30),
    height: heightToDp(30),
    borderRadius: 100,
  },
  iconContainer: {
    flexDirection: 'row',
    margin: widthToDp(4),
  },
  icon: {
    marginHorizontal: widthToDp(2),
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    marginVertical: heightToDp(3),
  },
});
