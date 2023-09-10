import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';

export default function SignUpDetailScreen() {
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Profile Details"
        subHeading="Please provide us with your profile details"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />

      <BottomSheetStyle>
        <ScrollView style={{marginVertical: heightToDp(10)}}>
          <LabelTextInput
            leftImageSoucre={require('../../../assets/NameIcon.png')}
            placeholder={'Enter your full name'}
            LabelTextInput={'Full Name'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/phoneIcon.png')}
            placeholder={'Enter your phone number'}
            LabelTextInput={'Phone No.'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/calenderIcon.png')}
            placeholder={'Enter your date of birth'}
            LabelTextInput={'Date of Birth'}
          />
          <LabelTextInput
            leftImageSoucre={require('../../../assets/locationIcon.png')}
            placeholder={'Enter your city'}
            LabelTextInput={'City'}
          />
          <MainButton
            colors={['#D3D5DA', '#D3D5DA']}
            Title="Continue"
            width={{width: widthToDp(80)}}
          />
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF2DC',
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
  input: {
    alignSelf: 'center',
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#424242',
    marginLeft: widthToDp(3),
    width: widthToDp(80),
  },
  icon: {
    padding: widthToDp(2),
    marginTop: widthToDp(3),
  },
  conta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, // Add any additional styling you want for the container
  },
  input: {
    flex: 1, // Take up all available space in the container
    padding: 8, // Adjust padding as needed
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 10,
    position: 'absolute',
    right: 10, // Adjust the right position as needed
  },
});
