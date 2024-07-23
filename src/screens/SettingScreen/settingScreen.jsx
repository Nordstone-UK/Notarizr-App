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
import {useSelector} from 'react-redux';
import {UPDATE_ACCOUNT_TYPE} from '../../../request/mutations/updateAccountType.mutation';
import {useMutation} from '@apollo/client';

export default function SettingScreen({navigation}, props) {
  const User = useSelector(state => state?.user?.user);

  console.log('Userssssssssssssssss', User);
  const [accountType, setAccountType] = useState(User.account_type);
  const [updateAccountType] = useMutation(UPDATE_ACCOUNT_TYPE);

  const toggleAccountType = async () => {
    const newAccountType =
      accountType === 'individual-agent' ? 'client' : 'individual-agent';
    if (!User.registered_for.includes(newAccountType)) {
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
      if (data.updateAccountType.status === 'success') {
        setAccountType(newAccountType);
      } else {
        // Handle error, show a message, etc.
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
          />
          <SettingOptions
            icon={require('../../../assets/accountSwitch.png')}
            Title={`Switch to ${accountType === 'agent' ? 'Client' : 'Agent'}`}
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
