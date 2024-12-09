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
import useLogin from '../../hooks/useLogin';
import {useSelector} from 'react-redux';
import {uriToBlob} from '../../utils/ImagePicker';
import Toast from 'react-native-toast-message';
import {UniqueDirectiveNamesRule} from 'graphql';
import {UPDATE_VERIFICATION} from '../../../request/mutations/updateVerification.mutation';
import {useMutation} from '@apollo/client';

export default function AgentVerificationScreen({navigation, route}, props) {
  const [updateVerification] = useMutation(UPDATE_VERIFICATION);

  const {user, onComplete = () => {}} = route.params || {};
  // console.log('c0mpletedfd', user);
  const variables = useSelector(state => state.register);
  const [photoID, setphotoID] = useState(user?.photoId || null);
  const [Certificate, setCertificate] = useState(user?.certificate_url || null);
  const [Seal, setSeal] = useState(user?.notarySeal || null);
  const [loading, setLoading] = useState(false);
  const {
    uploadFiles,
    handleCompression,
    uploadFilestoS3,
    handleRegister,
    handleUpdateSeal,
    handleUpdatecertificate,
  } = useRegister();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const {resetStack} = useLogin();
  console.log('fdfdfdfd', onComplete);
  const handleUpload = documentType => {
    setUploadedDocuments(prevDocuments => [...prevDocuments, documentType]);
    setCurrentStep(currentStep + 1);
  };

  const handleDelete = documentType => {
    setUploadedDocuments(prevDocuments =>
      prevDocuments.filter(doc => doc !== documentType),
    );
    setCurrentStep(currentStep - 1);
  };
  const deletePhotoID = () => {
    Alert.alert(
      'Delete Photo ID',
      'Are you sure you want to delete this Photo ID?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setphotoID(null),
        },
      ],
      {cancelable: true},
    );
  };
  const deleteSeal = () => {
    Alert.alert(
      'Delete Notary Seal',
      'Are you sure you want to delete this Notary Seal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setSeal(null),
        },
      ],
      {cancelable: true},
    );
  };
  const deleteCertificate = () => {
    Alert.alert(
      'Delete Notary Certificate',
      'Are you sure you want to delete this Notary Certificate?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setCertificate(null),
        },
      ],
      {cancelable: true},
    );
  };
  const selectPhotoID = async () => {
    const response = await uploadFiles();

    if (response) {
      console.log('Send: ', response);
      setphotoID(response);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please try again ',
      });
      setphotoID(null);
    }
  };
  const selectCertificate = async () => {
    const response = await uploadFiles();
    if (response) {
      console.log('Send: ', response);
      setCertificate(response);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please try again ',
      });
      setCertificate(null);
    }
  };
  const selectSeal = async () => {
    const response = await uploadFiles();
    if (response) {
      console.log('Send: ', response);
      setSeal(response);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please try again ',
      });
      setSeal(null);
    }
  };
  const isValidUri = uri => {
    if (!uri) return false;

    // Check if the URI is a valid HTTPS URL
    const isHttpsUrl = uri.startsWith('https://');

    // Check if the URI is a valid Android content URI
    const isContentUri = uri.startsWith(
      'content://com.android.providers.media.documents',
    );

    if (isHttpsUrl) return 'https';
    if (isContentUri) return 'content';
    return false; // If neither, return false
  };

  const submitRegister = async () => {
    setLoading(true);
    if (photoID && Certificate && Seal) {
      console.log('validldurldld', isValidUri(Certificate));
      const isPhotoValid = isValidUri(photoID);
      const isCertificateValid = isValidUri(Certificate);
      const isSealValid = isValidUri(Seal);
      if (!isPhotoValid || !isCertificateValid || !isSealValid) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Input',
          text2: 'Please provide valid URLs or content URIs for all documents.',
        });
        setLoading(false);
        return;
      }

      // Process `photoID`
      const photeBlob =
        isPhotoValid === 'content' ? await uriToBlob(photoID) : null;
      const photoURL =
        isPhotoValid === 'https'
          ? photoID
          : await uploadFilestoS3(photeBlob, variables.firstName);

      // Process `Certificate`
      const CertificateBlob =
        isCertificateValid === 'content' ? await uriToBlob(Certificate) : null;
      const CertificateURL =
        isCertificateValid === 'https'
          ? Certificate
          : await uploadFilestoS3(CertificateBlob, variables.firstName);

      // Process `Seal`
      const SealBlob = isSealValid === 'content' ? await uriToBlob(Seal) : null;
      const SealUrl =
        isSealValid === 'https'
          ? Seal
          : await uploadFilestoS3(SealBlob, variables.firstName);

      const params = {
        ...variables,
        certificateUrl: CertificateURL,
        photoId: photoURL,
        notarySeal: SealUrl,
      };

      if (
        (typeof onComplete === 'function' && onComplete.name !== '') ||
        (user && user.notarySeal)
      ) {
        console.log(
          'ddddddddddddddff====================================',
          onComplete.name,
        );
        let certificateVariables = {
          photoId: photoURL,
          certificate_url: CertificateURL,
        };
        let sealVariable = {
          notarySeal: SealUrl,
        };
        let respose1 = await handleUpdateSeal(sealVariable);
        let respose = await handleUpdatecertificate(certificateVariables);
        console.log('resopsonfdf', respose1, respose);
        await onComplete();
        const {data} = await updateVerification({
          variables: {
            _id: user?._id,
            isVerified: false,
          },
        });
        console.log('dadlflfldfldfldfd', data);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Registration completed successfully',
        });
        navigation.goBack();
        return;
      }

      const isRegister = await handleRegister(params);
      setLoading(false);

      if (isRegister) {
        setLoading(false);
        resetStack('signup');
        // navigation.navigate('AgentDocumentCompletion');
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
        Header={user ? 'Edit Your Identity' : 'Verification'}
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
            <Text style={styles.subHeading}>3. Notary Stamp</Text>
          </View>
          <View
            style={{
              marginVertical: heightToDp(2),
            }}>
            {photoID && Certificate && Seal ? null : photoID === null ? (
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
            ) : Certificate === null ? (
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
            ) : (
              <MainButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Upload Notary Stamp"
                GradiStyles={{
                  width: widthToDp(50),
                  paddingVertical: widthToDp(1.5),
                }}
                styles={{
                  paddingHorizontal: widthToDp(0),
                  paddingVertical: widthToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={() => selectSeal()}
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
            {Seal && (
              <DocumentComponent
                Title="Notary Stamp"
                image={require('../../../assets/Pdf.png')}
                onPress={() => deleteSeal()}
              />
            )}
          </View>
          <View
            style={{
              marginVertical: heightToDp(10),
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
    justifyContent: 'space-between',
    marginVertical: heightToDp(2),
    marginHorizontal: heightToDp(5),
    flexWrap: 'wrap',
  },
  subHeading: {
    fontSize: widthToDp(4.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
  },
});
