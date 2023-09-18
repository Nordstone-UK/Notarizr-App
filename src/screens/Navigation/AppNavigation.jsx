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
import MapScreen from '../../../MapScreen';
import AcceptAgentCard from '../../components/AcceptAgentCard/AcceptAgentCard';
import SessionScreen from '../SessionDisplayScreen/SessionScreen';
import OnlineSessionDetail from '../OnlineSessionDetail/OnlineSessionDetail';
import LocalNotaryBookingScreen from '../LocalNotaryBookingScreen.jsx/LocalNotaryBookingScreen';
import LocalNotaryAgentReview from '../LocalNotaryBookingScreen.jsx/LocalNotaryAgentReview';
import LocalNotaryMapScreen from '../LocalNotaryBookingScreen.jsx/LocalNotaryMapScreen';
import LocalNotaryDateScreen from '../LocalNotaryBookingScreen.jsx/LocalNotaryDateScreen';
import RealEstateDocScreen from '../LegalDocumentsScren/RealEstateDocScreen';
import BusinessDocScreen from '../LegalDocumentsScren/BusinessDocScreen';
import CompletionScreen from '../CompletionScreen/CompletionScreen';
import AgentHomeScreen from '../AgentScreens/AgentHomeScreen/AgentHomeScreen';
import AgentCompletedBooking from '../AgentScreens/AgentBookingDetails/AgentCompletedBooking';
import AgentAllBookingScreen from '../AgentScreens/AgentAllBookingScreen/AgentAllBookingScreen';
import ClientBookingScreen from '../AgentScreens/ClientBookingScreen/ClientBookingScreen';
import AgentMainBookingScreen from '../AgentScreens/AgentMainBookingScreen/AgentMainBookingScreen';
import AgentMainAvailabilityScreen from '../AgentScreens/AgentAvailabilityScreen/AgentAvailabilityScreen';
import AgentLocationScreen from '../AgentScreens/AgentAvailabilityScreen/AgentLocationScreen';
import BookingAcceptedScreen from '../CompletionScreen/BookingAcceptedScreen';
import AgentMobileNotaryStartScreen from '../AgentScreens/AgentMobileNotartScreen/AgentMobileNotaryStartScreen';
import AgentMobileNotaryDocScreen from '../AgentScreens/AgentMobileNotartScreen/AgentMobileNotaryDocScreen';
import AgentBookingComplete from '../CompletionScreen/AgentBookingComplete';
import AgentMobileNotarySummaryScreen from '../AgentScreens/AgentMobileNotartScreen/AgentMobileNotarySummaryScreen';
import AgentSessionInviteScreen from '../AgentScreens/AgentSessionInviteScreen/AgentSessionInviteScreen';
import AgentRemoteOnlineNotaryScreen from '../AgentScreens/AgentRemoteOnlineNotaryScreen/AgentRemoteOnlineNotaryScreen';

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
        initialRouteName="AgentRemoteOnlineNotaryScreen"
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
          name="RealEstateDocScreen"
          component={RealEstateDocScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BusinessDocScreen"
          component={BusinessDocScreen}
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
        <Stack.Screen name="CompletionScreen" component={CompletionScreen} />
        <Stack.Screen name="AgentHomeScreen" component={AgentHomeScreen} />
        <Stack.Screen
          name="AgentMainBookingScreen"
          component={AgentMainBookingScreen}
        />
        <Stack.Screen
          name="ClientBookingScreen"
          component={ClientBookingScreen}
        />
        <Stack.Screen
          name="AgentAllBookingScreen"
          component={AgentAllBookingScreen}
        />
        <Stack.Screen
          name="AgentCompletedBooking"
          component={AgentCompletedBooking}
        />
        <Stack.Screen
          name="AgentMainAvailabilityScreen"
          component={AgentMainAvailabilityScreen}
        />
        <Stack.Screen
          name="AgentLocationScreen"
          component={AgentLocationScreen}
        />
        <Stack.Screen
          name="BookingAcceptedScreen"
          component={BookingAcceptedScreen}
        />
        <Stack.Screen
          name="AgentMobileNotaryStartScreen"
          component={AgentMobileNotaryStartScreen}
        />
        <Stack.Screen
          name="AgentMobileNotaryDocScreen"
          component={AgentMobileNotaryDocScreen}
        />
        <Stack.Screen
          name="AgentBookingComplete"
          component={AgentBookingComplete}
        />
        <Stack.Screen
          name="AgentMobileNotarySummaryScreen"
          component={AgentMobileNotarySummaryScreen}
        />
        <Stack.Screen
          name="AgentSessionInviteScreen"
          component={AgentSessionInviteScreen}
        />
        <Stack.Screen
          name="AgentRemoteOnlineNotaryScreen"
          component={AgentRemoteOnlineNotaryScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
