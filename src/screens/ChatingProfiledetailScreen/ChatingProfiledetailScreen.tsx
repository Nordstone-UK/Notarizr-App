import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import { heightToDp, widthToDp } from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import { useSelector } from 'react-redux';
import PhoneTextInput from '../../components/countryCode/PhoneTextInput';
import Toast from 'react-native-toast-message';
import { useLazyQuery } from '@apollo/client';
import { IS_EMAIL_VALID } from '../../../request/queries/isEmailValid.query';
import { captureImage, chooseFile } from '../../utils/ImagePicker';
import useUpdate from '../../hooks/useUpdate';
import useRegister from '../../hooks/useRegister';
import useFetchUser from '../../hooks/useFetchUser';
import MultiLineTextInput from '../../components/MultiLineTextInput/MultiLineTextInput';
import { removeCountryCode } from '../../utils/CountryCode';
import CustomDatePicker from '../../components/CustomDatePicker/CustomDatePicker';

export default function ChatingProfiledetailScreen({ navigation, route }, props) {

  console.log("routeeeee", route)
  const { receiver } = route.params
  let profileEdit = false;
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Profile Details" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, paddingBottom: heightToDp(10) }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View>
            <Image source={receiver?.profile_picture
              ? { uri: receiver.profile_picture }
              : require('../../../assets/UserIcon.png')} style={styles.picture} />

          </View>
          <Text style={styles.textheading}>
            {receiver.first_name} {receiver.last_name}
          </Text>
          <Text style={styles.textsubheading}>{receiver.email}</Text>
          <BottomSheetStyle>
            <View style={{ paddingBottom: widthToDp(5) }}>
              <LabelTextInput
                leftImageSoucre={require('../../../assets/profileTabIcon.png')}
                Label={true}
                defaultValue={receiver.first_name}
                LabelTextInput={'First Name'}

                editable={profileEdit}
              />
              <LabelTextInput
                leftImageSoucre={require('../../../assets/profileTabIcon.png')}
                placeholder={'Enter your last name'}
                defaultValue={receiver.last_name}
                Label={true}
                LabelTextInput={'Last Name'}
                editable={profileEdit}
              />

              <LabelTextInput
                leftImageSoucre={require('../../../assets/EmailIcon.png')}
                placeholder={'Enter your email address'}
                LabelTextInput={
                  'Email Address'
                }
                defaultValue={receiver.email}
                Label={true}


                editable={false}
              />

              {/* <CustomDatePicker

                Text="Date Of Birth"
                mode="date"
                date={receiver?.date || new Date()}
                labelStyle={{}}
                containerStyle={{
                  paddingVertical: widthToDp(4),
                  width: widthToDp(90),
                  alignSelf: 'center',
                }}
                textStyle={{}}
                editable={profileEdit}
              /> */}
              {/* <LabelTextInput
                leftImageSoucre={require('../../../assets/locationIcon.png')}
                Label={true}
                placeholder={'Enter your address'}
                defaultValue={receiver?.location}
                LabelTextInput={'Address'}

                editable={profileEdit}
              /> */}
              {/* {account_type !== 'client' && (
                <MultiLineTextInput
                  Label={true}
                  placeholder={'Enter description here'}
                  defaultValue={description}
                  LabelTextInput={'Description'}
                  onChangeText={text => setDescription(text)}
                  editable={profileEdit}
                />
              )} */}

            </View>
          </BottomSheetStyle>
        </ScrollView>
      </KeyboardAvoidingView>
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
    width: widthToDp(25),
    height: heightToDp(25),
    borderRadius: 50,
  },
  camera: {
    position: 'absolute',
    left: widthToDp(55),
    top: heightToDp(18),
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    width: widthToDp(80),
    paddingVertical: heightToDp(2),
    alignSelf: 'center',
    borderRadius: 15,
    marginTop: heightToDp(5),
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  textsubheading: {
    fontSize: widthToDp(4.5),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
    marginBottom: heightToDp(2),
  },
});
