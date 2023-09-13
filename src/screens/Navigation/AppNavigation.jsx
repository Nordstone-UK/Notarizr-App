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
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
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
const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="OnboardingScreen1">
        {/* <Stack.Screen
          name="OnboardingScreen1"
          component={OnboardingScreen1}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OnboardingScreen2"
          component={OnboardingScreen2}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OnboardingScreen3"
          component={OnboardingScreen3}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignupAsScreen"
          component={SignupAsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="ProfilePictureScreen"
          component={ProfilePictureScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUpDetailScreen"
          component={SignUpDetailScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{headerShown: false}}
        />
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
        /> */}
        {/* <Stack.Screen
          name="AgentReviewScreen"
          component={AgentReviewScreen}
          options={{headerShown: false}}
        /> */}
        {/* <Stack.Screen
          name="AgentBookCompletion"
          component={AgentBookCompletion}
          options={{headerShown: false}}
        /> */}
        {/* <Stack.Screen
          name="AllBookingScreen"
          component={AllBookingScreen}
          options={{headerShown: false}}
        /> */}
        {/* <Stack.Screen
          name="MedicalBookingScreen"
          component={MedicalBookingScreen}
          options={{headerShown: false}}
        /> */}
        {/* <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{headerShown: false}}
        /> */}
        {/* <Stack.Screen
          name="PaymentScreen"
          component={PaymentScreen}
          options={{headerShown: false}}
        /> */}
        {/* <Stack.Screen
          name="PaymentCompletionScreen"
          component={PaymentCompletionScreen}
          options={{headerShown: false}}
        /> */}
        {/* <Stack.Screen
          name="RejectedByAgentScreen"
          component={RejectedByAgentScreen}
          options={{headerShown: false}}
        /> */}
        <Stack.Screen
          name="WaitingRoomScreen"
          component={WaitingRoomScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
