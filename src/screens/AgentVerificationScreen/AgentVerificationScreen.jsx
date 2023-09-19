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
import GradientButton from '../../components/MainGradientButton/GradientButton';
import DocumentComponent from '../../components/DocumentComponent/DocumentComponent';

export default function AgentVerificationScreen({navigation}, props) {
  //   const [ColorChange, setColorChange] = useState();
  //   const FocusColorChaneg = () => {
  //     setColorChange(!ColorChange);
  //   };
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Welcome Back to Notarizr"
        subHeading="Hello there, sign in to continue!"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />

      <BottomSheetStyle>
        <ScrollView style={{marginTop: heightToDp(5)}}>
          <Text style={styles.text}>
            Please upload the below documents to verify your identity
          </Text>
          <View style={styles.flexContainer}>
            <Text style={styles.subHeading}>1. Picture ID</Text>
            <Text style={styles.subHeading}>2. Notary Certificate</Text>
          </View>
          <View
            style={{
              marginVertical: heightToDp(2),
            }}>
            <MainButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Upload Documents"
              GradiStyles={{
                width: widthToDp(50),
                paddingVertical: widthToDp(1.5),
              }}
              styles={{
                paddingHorizontal: widthToDp(0),
                paddingVertical: widthToDp(0),
                fontSize: widthToDp(4),
              }}
            />
          </View>
          <View>
            <DocumentComponent
              Title="Picture ID"
              image={require('../../../assets/Pdf.png')}
            />
            <DocumentComponent
              Title="Notary Certificate ID"
              image={require('../../../assets/doc.png')}
            />
          </View>
          <View
            style={{
              marginTop: heightToDp(10),
            }}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Continue"
              viewStyle={props.viewStyle}
              GradiStyles={props.GradiStyles}
              //   onPress={() => navigation.navigate('HomeScreen')}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  text: {
    fontSize: widthToDp(6),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(5),
  },
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: heightToDp(2),
  },
  subHeading: {
    fontSize: widthToDp(4.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
  },
});
