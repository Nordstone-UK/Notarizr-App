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
import Colors from '../../themes/Colors';

export default function ProfilePictureScreen() {
  const [image, setImage] = useState('');
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Profile Image"
        subHeading="Please provide us with your profile image"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />

      <BottomSheetStyle>
        <Text style={styles.textRemove}>Remove</Text>
        {image ? null : (
          <MainButton
            colors={['#fff', '#fff']}
            Title="Upload Picture"
            width={{width: widthToDp(80)}}
            viewStyle={{
              borderWidth: 2,
              borderColor: Colors.Orange,
              borderRadius: 10,
            }}
            styles={{color: Colors.Orange}}
          />
        )}
        <MainButton
          colors={['#D3D5DA', '#D3D5DA']}
          Title="Continue"
          width={{width: widthToDp(80)}}
        />
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF2DC',
  },
  textRemove: {
    textAlign: 'right',
    top: heightToDp(2),
    right: widthToDp(5),
    color: Colors.Orange,
    fontWeight: '700',
  },
});
