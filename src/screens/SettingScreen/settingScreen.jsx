import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {ChatClient} from 'react-native-agora-chat';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import SettingOptions from '../../components/SettingOptions/SettingOptions';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons
import {useDispatch, useSelector} from 'react-redux';
import {UPDATE_ACCOUNT_TYPE} from '../../../request/mutations/updateAccountType.mutation';
import {useMutation} from '@apollo/client';
import {DELETE_ACCOUNT} from '../../../request/mutations/deleteAccount.mutation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {saveUserInfo} from '../../features/user/userSlice';

export default function SettingScreen({navigation}, props) {
  const dispatch = useDispatch();
  const chatClient = ChatClient.getInstance();
  const User = useSelector(state => state?.user?.user || {});
  if (!User) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading user data...</Text>
      </SafeAreaView>
    );
  }
  const [accountType, setAccountType] = useState(User?.account_type || '');
  const [updateAccountType] = useMutation(UPDATE_ACCOUNT_TYPE);
  const [deleteAccount] = useMutation(DELETE_ACCOUNT);
  const clearTokenFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('token');
      const token = await AsyncStorage.getItem('token');
      // console.log('Token cleared from AsyncStorage', token);
    } catch (error) {
      console.error('Error clearing token from AsyncStorage:', error);
    }
  };
  const handleLogout = async () => {
    if (User) {
      clearTokenFromStorage();
      dispatch(saveUserInfo(null));
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      });
      if (chatClient && chatClient.isInitialized) {
        await chatClient.logout();
      }
    }
  };
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const {data} = await deleteAccount({
                variables: {userId: User._id}, // Pass the user's ID to the mutation
              });
              if (data.deleteUserR.status === '200') {
                Alert.alert(
                  'Account Deleted',
                  'Your account has been deleted successfully.',
                );
                handleLogout();
              } else {
                Alert.alert(
                  'Error',
                  'Failed to delete account. Please try again later.',
                );
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again.',
              );
            }
          },
        },
      ],
    );
  };
  const toggleAccountType = async () => {
    const newAccountType =
      accountType === 'individual-agent' ? 'client' : 'individual-agent';
    if (
      User.registered_for.length === 1 &&
      User.registered_for.includes('client') &&
      newAccountType === 'individual-agent'
    ) {
      // Navigate to the AgentVerificationScreen for the first time
      navigation.navigate('AgentVerificationScreen', {
        onComplete: async () => {
          await handleAccountTypeUpdate(newAccountType);
        },
      });
    } else if (!User.registered_for.includes(newAccountType)) {
      Alert.alert(
        'Account Type Update',
        `Would you like to add "${newAccountType}" to your account types?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              await handleAccountTypeUpdate(newAccountType);
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Switch Account Type',
        `Would you like to switch to the "${newAccountType}" account type?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              await handleAccountTypeUpdate(newAccountType);
            },
          },
        ],
      );
    }
  };
  const handleAccountTypeUpdate = async newAccountType => {
    try {
      const {data} = await updateAccountType({
        variables: {account_type: newAccountType},
      });
      console.log('datedfdfdfd', data.updateAccountType.status);
      if (data.updateAccountType.status === '200') {
        setAccountType(newAccountType);
      } else {
        console.error(data.updateAccountType.message);
      }
    } catch (error) {
      console.error('Error updating account type:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Setting" />
      <BottomSheetStyle>
        <ScrollView style={{marginTop: heightToDp(5)}}>
          <SettingOptions
            icon={require('../../../assets/privacy.png')}
            Title="Privacy Policy"
          />
          <SettingOptions
            icon={require('../../../assets/security.png')}
            Title="Security"
          />
          <SettingOptions
            icon={require('../../../assets/terms.png')}
            Title="Terms & Conditions"
          />
          <SettingOptions
            icon={require('../../../assets/delete.png')}
            Title="Delete Account"
            onPress={handleDeleteAccount}
          />
          <SettingOptions
            icon={require('../../../assets/accountSwitch.png')}
            Title={`Switch to ${
              accountType === 'individual-agent' ? 'Client' : 'Agent'
            }`}
            onPress={toggleAccountType}
          />
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
});
