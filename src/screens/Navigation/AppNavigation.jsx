import {View, Text} from 'react-native';
import React from 'react';
import OnboardingScreen2 from '../OnboardingScreens/OnboardingScreen2';
import OnboardingScreen3 from '../OnboardingScreens/OnboardingScreen3';
import SignupAsScreen from '../SingupAsScreen/SignupAsScreen';
import LoginScreen from '../LogIn&SignupScreens/LoginScreen';
import OnboardingScreen1 from '../OnboardingScreens/OnboardingScreen1';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from '../HomeScreen.jsx/HomeScreen';
import LegalDocScreen from '../LegalDocumentsScren/LegalDocScreen';
import ProfilePictureScreen from '../LogIn&SignupScreens/ProfilePictureScreen';
import SignUpDetailScreen from '../LogIn&SignupScreens/SignUpDetailScreen';
import MainBookingScreen from '../MainBookingScreen/MainBookingScreen';
import RegisterCompletionScreen from '../LogIn&SignupScreens/RegisterCompletionScreen';
import AgentReviewScreen from '../AgentReviewScreen/AgentReviewScreen';
import AgentBookCompletion from '../CompletionScreen/AgentBookCompletion';
import AllBookingScreen from '../AllBookingScreen/AllBookingScreen';
import MedicalBookingScreen from '../AllBookingScreen/MedicalBookingScreen';
import ChatScreen from '../ChatScreens/ChatScreen';
import PaymentScreen from '../PaymentScreen/PaymentScreen';
import PaymentCompletionScreen from '../CompletionScreen/PaymentCompletionScreen';
import SignUpScreen from '../LogIn&SignupScreens/SignUpScreen';
import RejectedByAgentScreen from '../CompletionScreen/RejectedByAgentScreen';
import WaitingRoomScreen from '../CallRoomScreen/WaitingRoomScreen';
import FinalBookingScreen from '../FinalBookingScreen/FinalBookingScreen';
import ProfileInfoScreen from '../ProfileInfoScreen/ProfileInfoScreen';
import ProfileDetailEditScreen from '../ProfileDetailEditScreen/ProfileDetailEditScreen';
import PasswordEditScreen from '../PasswordEditScreen/PasswordEditScreen';
import PaymentUpdateScreen from '../PaymentUpdateScreen/PaymentUpdateScreen';
import AddCardScreen from '../AddCardScreen/AddCardScreen';
import AddressDetails from '../AddressDetails/AddressDetails';
import NewAddressScreen from '../NewAddressScreen/NewAddressScreen';
import SettingScreen from '../SettingScreen/settingScreen';
import ChatContactScreen from '../ChatContactScreen/ChatContactScreen';
import BookingPreferenceScreen from '../BookingPreference/BookingPreferenceScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from '../../components/Ionicons/Ionicons';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import OnlineNotaryScreen from '../OnlineNotaryScreen/OnlineNotaryScreen';
import NearbyLoadingScreen from '../NearbyLoadingScreen/NearbyLoadingScreen';
import mapScreen from '../../../MapScreen';
import MapScreen from '../../../MapScreen';
import AcceptAgentCard from '../../components/AcceptAgentCard/AcceptAgentCard';
import SessionScreen from '../SessionDisplayScreen/SessionScreen';
import OnlineSessionDetail from '../OnlineSessionDetail/OnlineSessionDetail';
import LocalNotaryBookingScreen from '../LocalNotaryBookingScreen.jsx/LocalNotaryBookingScreen';
import LocalNotaryAgentReview from '../LocalNotaryBookingScreen.jsx/LocalNotaryAgentReview';
import LocalNotaryMapScreen from '../LocalNotaryBookingScreen.jsx/LocalNotaryMapScreen';
import LocalNotaryDateScreen from '../LocalNotaryBookingScreen.jsx/LocalNotaryDateScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {height: heightToDp(17)},
        tabBarIcon: ({focused}) => {
          return <Ionicons focused={focused} name={route.name} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AllBookingScreen" component={AllBookingScreen} />
      <Tab.Screen name="ChatContactScreen" component={ChatContactScreen} />
      <Tab.Screen name="ProfileInfoScreen" component={ProfileInfoScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="OnboardingScreen1"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="OnboardingScreen1" component={OnboardingScreen1} />
        <Stack.Screen name="OnboardingScreen2" component={OnboardingScreen2} />
        <Stack.Screen name="OnboardingScreen3" component={OnboardingScreen3} />
        <Stack.Screen name="SignupAsScreen" component={SignupAsScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen
          name="ProfilePictureScreen"
          component={ProfilePictureScreen}
        />
        <Stack.Screen
          name="SignUpDetailScreen"
          component={SignUpDetailScreen}
        />
        <Stack.Screen name="HomeScreen" component={TabNavigation} />
        <Stack.Screen
          name="LegalDocScreen"
          component={LegalDocScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MainBookingScreen"
          component={MainBookingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RegisterCompletionScreen"
          component={RegisterCompletionScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="AgentReviewScreen" component={AgentReviewScreen} />
        <Stack.Screen
          name="AgentBookCompletion"
          component={AgentBookCompletion}
        />
        <Stack.Screen
          name="OnlineNotaryScreen"
          component={OnlineNotaryScreen}
        />
        <Stack.Screen
          name="MedicalBookingScreen"
          component={MedicalBookingScreen}
        />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen
          name="PaymentCompletionScreen"
          component={PaymentCompletionScreen}
        />
        <Stack.Screen
          name="RejectedByAgentScreen"
          component={RejectedByAgentScreen}
        />
        <Stack.Screen name="WaitingRoomScreen" component={WaitingRoomScreen} />
        <Stack.Screen
          name="FinalBookingScreen"
          component={FinalBookingScreen}
        />
        <Stack.Screen
          name="OnlineSessionDetail"
          component={OnlineSessionDetail}
        />
        <Stack.Screen
          name="ProfileDetailEditScreen"
          component={ProfileDetailEditScreen}
        />
        <Stack.Screen
          name="PasswordEditScreen"
          component={PasswordEditScreen}
        />
        <Stack.Screen
          name="PaymentUpdateScreen"
          component={PaymentUpdateScreen}
        />
        <Stack.Screen name="AddCardScreen" component={AddCardScreen} />
        <Stack.Screen name="AddressDetails" component={AddressDetails} />
        <Stack.Screen name="NewAddressScreen" component={NewAddressScreen} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
        <Stack.Screen
          name="NearbyLoadingScreen"
          component={NearbyLoadingScreen}
        />
        <Stack.Screen
          name="BookingPreferenceScreen"
          component={BookingPreferenceScreen}
        />
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="SessionScreen" component={SessionScreen} />
        <Stack.Screen
          name="LocalNotaryBookingScreen"
          component={LocalNotaryBookingScreen}
        />
        <Stack.Screen
          name="LocalNotaryAgentReview"
          component={LocalNotaryAgentReview}
        />
        <Stack.Screen
          name="LocalNotaryMapScreen"
          component={LocalNotaryMapScreen}
        />
        <Stack.Screen
          name="LocalNotaryDateScreen"
          component={LocalNotaryDateScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
