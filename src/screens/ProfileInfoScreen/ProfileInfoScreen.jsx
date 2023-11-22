import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, {useEffect} from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import SettingOptions from '../../components/SettingOptions/SettingOptions';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetchUser from '../../hooks/useFetchUser';
export default function ProfileInfoScreen({navigation}) {
  const accountType = useSelector(state => state.register.accountType);
  const {first_name, profile_picture, account_type} = useSelector(
    state => state.user.user,
  );
  const {fetchUserInfo} = useFetchUser();
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
    clearTokenFromStorage();
    navigation.reset({
      index: 0,
      routes: [{name: 'LoginScreen'}],
    });
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserInfo();
      console.log('====================================');
      console.log('ProfileInfoScreen sending...', account_type);
      console.log('====================================');
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{uri: profile_picture}} style={styles.picture} />
      <Text style={styles.textheading}>{first_name}</Text>
      <BottomSheetStyle>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={
                accountType === 'client'
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
          <View style={{marginBottom: heightToDp(2)}}>
            <SettingOptions
              icon={require('../../../assets/settingProfile.png')}
              Title="Profile Details"
              onPress={() => navigation.navigate('ProfileDetailEditScreen')}
            />
            <SettingOptions
              icon={require('../../../assets/greenLocation.png')}
              Title="Address"
              onPress={() => navigation.navigate('AddressDetails')}
            />
            <SettingOptions
              icon={require('../../../assets/blueCard.png')}
              Title="Payment Method"
              onPress={() => navigation.navigate('PaymentUpdateScreen')}
            />

            {account_type !== 'client' && (
              <SettingOptions
                icon={require('../../../assets/license.png')}
                Title="Update License"
                // onPress={() => navigation.navigate('PasswordEditScreen')}
              />
            )}
            {account_type !== 'client' && (
              <SettingOptions
                icon={require('../../../assets/training.png')}
                Title="Trainings"
                // onPress={() => navigation.navigate('PasswordEditScreen')}
              />
            )}
            <SettingOptions
              icon={require('../../../assets/logout.png')}
              Title="Log out"
              onPress={() => handleLogout()}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
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
