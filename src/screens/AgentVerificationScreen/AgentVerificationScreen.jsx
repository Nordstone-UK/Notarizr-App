import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  View,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import DocumentComponent from '../../components/DocumentComponent/DocumentComponent';
import SplashScreen from 'react-native-splash-screen';
import useRegister from '../../hooks/useRegister';
import {useSelector} from 'react-redux';
import {uriToBlob} from '../../utils/ImagePicker';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';

export default function AgentVerificationScreen({navigation}, props) {
  const variables = useSelector(state => state.register);
  const [photoID, setphotoID] = useState(null);
  const [Certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const {uploadFiles, handleCompression, uploadFilestoS3, handleRegister} =
    useRegister();
  const deletePhotoID = () => {
    setphotoID(null);
  };
  const deleteCertificate = () => {
    setCertificate(null);
  };
  const selectPhotoID = async () => {
    const response = await uploadFiles();
    // console.log(response);
    setphotoID(response);
  };
  const selectCertificate = async () => {
    const response = await uploadFiles();
    setCertificate(response);
  };
  const submitRegister = async () => {
    setLoading(true);
    if (photoID && Certificate) {
       const photeBlob = await uriToBlob(photoID);
       console.log('====================================');
       console.log("photoblob",photeBlob);
       console.log('====================================');
      const CertificateBlob = await uriToBlob(Certificate);

      console.log('====================================');
      console.log("CertificateBlob",CertificateBlob);
      console.log('====================================');

    

      const photoURL = await uploadFilestoS3(photeBlob,variables.firstName);
      const CertificateURL = await uploadFilestoS3(
        CertificateBlob,
        variables.firstName
      
      );

      const params = {
        ...variables,
        certificateUrl: CertificateURL,
        photoId: photoURL,
      };

      const isRegister = await handleRegister(params);
      setLoading(false);

      if (isRegister) {
        setLoading(false);
        navigation.navigate('AgentDocumentCompletion');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Problem while registering',
        });
      }
    } else {
      Toast.show({
        type: 'warning',
        text1: 'Warning!',
        text2: 'Please provide all the documents',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CompanyHeader
        Header="Verification"
        subHeading="Please verify your identity"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />
      <BottomSheetStyle>
        <ScrollView
          style={{marginTop: heightToDp(5)}}
          showsVerticalScrollIndicator={false}>
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
            {photoID && Certificate ? null : photoID === null ? (
              <MainButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Upload Photo ID"
                GradiStyles={{
                  width: widthToDp(50),
                  paddingVertical: widthToDp(1.5),
                }}
                styles={{
                  paddingHorizontal: widthToDp(0),
                  paddingVertical: widthToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={() => selectPhotoID()}
              />
            ) : (
              <MainButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Upload Certificate"
                GradiStyles={{
                  width: widthToDp(50),
                  paddingVertical: widthToDp(1.5),
                }}
                styles={{
                  paddingHorizontal: widthToDp(0),
                  paddingVertical: widthToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={() => selectCertificate()}
              />
            )}
          </View>
          <View>
            {photoID && (
              <DocumentComponent
                Title="Picture ID"
                image={require('../../../assets/Pdf.png')}
                onPress={() => deletePhotoID()}
              />
            )}
            {Certificate && (
              <DocumentComponent
                Title="Notary Certificate ID"
                image={require('../../../assets/doc.png')}
                onPress={() => deleteCertificate()}
              />
            )}
          </View>
          <View
            style={{
              marginTop: heightToDp(10),
            }}>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Continue"
              loading={loading}
              viewStyle={props.viewStyle}
              GradiStyles={props.GradiStyles}
              onPress={() => submitRegister()}
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
