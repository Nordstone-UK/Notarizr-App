import { useMutation } from '@apollo/client';
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
import React, { useCallback, useEffect, useState } from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import { heightToDp, widthToDp } from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import Colors from '../../themes/Colors';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import DocumentComponent from '../../components/DocumentComponent/DocumentComponent';
import SplashScreen from 'react-native-splash-screen';
import useRegister from '../../hooks/useRegister';
import useLogin from '../../hooks/useLogin';
import { useSelector } from 'react-redux';
import { uriToBlob } from '../../utils/ImagePicker';
import Toast from 'react-native-toast-message';
import { gql } from 'graphql-tag';
import { useMutation } from '@apollo/client';

const UPDATE_AGENT_PHOTO_AND_CERTIFICATE = gql`
  mutation UpdateAgentPhotoAndCertificate($photoId: String!, $certificate_url: String!) {
    updateAgentPhotoAndCertificate(photoId: $photoId, certificate_url: $certificate_url) {
      message
      status
    }
  }
`;

const UPDATE_NOTARY_SEAL = gql`
  mutation UpdateNotarySeal($notarySeal: String!) {
    updateNotarySeal(notarySeal: $notarySeal) {
      message
      status
    }
  }
`;

export default function AgentVerificationScreen({ navigation, route }) {
  const { onComplete = () => { } } = route.params || {};
  const variables = useSelector(state => state.register);
  const [photoID, setphotoID] = useState(null);
  const [Certificate, setCertificate] = useState(null);
  const [Seal, setSeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const { uploadFiles, handleCompression, uploadFilestoS3, handleRegister } = useRegister();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const { resetStack } = useLogin();

  const [updateAgentPhotoAndCertificate] = useMutation(UPDATE_AGENT_PHOTO_AND_CERTIFICATE);
  const [updateNotarySeal] = useMutation(UPDATE_NOTARY_SEAL);

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

  const selectPhotoID = async () => {
    const response = await uploadFiles();
    if (response) {
      setphotoID(response);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please try again',
      });
      setphotoID(null);
    }
  };

  const selectCertificate = async () => {
    const response = await uploadFiles();
    if (response) {
      setCertificate(response);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please try again',
      });
      setCertificate(null);
    }
  };

  const selectSeal = async () => {
    const response = await uploadFiles();
    if (response) {
      setSeal(response);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please try again',
      });
      setSeal(null);
    }
  };

  const deletePhotoID = () => {
    setphotoID(null);
  };

  const deleteCertificate = () => {
    setCertificate(null);
  };

  const deleteSeal = () => {
    setSeal(null);
  };

  const submitRegister = async () => {
    setLoading(true);
    if (photoID && Certificate && Seal) {
      const photoBlob = await uriToBlob(photoID);
      const certificateBlob = await uriToBlob(Certificate);
      const sealBlob = await uriToBlob(Seal);

      const photoURL = await uploadFilestoS3(photoBlob, variables.firstName);
      const certificateURL = await uploadFilestoS3(certificateBlob, variables.firstName);
      const sealURL = await uploadFilestoS3(sealBlob, variables.firstName);

      const params = {
        ...variables,
        certificateUrl: certificateURL,
        photoId: photoURL,
        notarySeal: sealURL,
      };

      try {
        await updateAgentPhotoAndCertificate({
          variables: {
            photoId: photoURL,
            certificate_url: certificateURL,
          },
        });
        await updateNotarySeal({
          variables: {
            notarySeal: sealURL,
          },
        });

        const isRegister = await handleRegister(params);
        setLoading(false);

        if (isRegister) {
          setLoading(false);
          resetStack('signup');
          if (onComplete) {
            onComplete();
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Problem while registering',
          });
        }
      } catch (error) {
        console.error('Error updating agent info:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Problem while updating agent info',
        });
        setLoading(false);
      }
    } else {
      Toast.show({
        type: 'warning',
        text1: 'Warning!',
        text2: 'Please provide all the documents',
      });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CompanyHeader
        Header="Verification"
        subHeading="Please verify your identity"
        HeaderStyle={{ alignSelf: 'center' }}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />
      <BottomSheetStyle>
        <ScrollView
          style={{ marginTop: heightToDp(5) }}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.text}>
            Please upload the below documents to verify your identity
          </Text>
          <View style={styles.flexContainer}>
            <Text style={styles.subHeading}>1. Picture ID</Text>
            <Text style={styles.subHeading}>2. Notary Certificate</Text>
            <Text style={styles.subHeading}>3. Notary Stamp</Text>
          </View>
          <View style={{ marginVertical: heightToDp(2) }}>
            {!photoID && (
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
                onPress={selectPhotoID}
              />
            )}
            {!Certificate && photoID && (
              <MainButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Upload Notary Certificate"
                GradiStyles={{
                  width: widthToDp(50),
                  paddingVertical: widthToDp(1.5),
                }}
                styles={{
                  paddingHorizontal: widthToDp(0),
                  paddingVertical: widthToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={selectCertificate}
              />
            )}
            {!Seal && photoID && Certificate && (
              <MainButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Upload Notary Seal"
                GradiStyles={{
                  width: widthToDp(50),
                  paddingVertical: widthToDp(1.5),
                }}
                styles={{
                  paddingHorizontal: widthToDp(0),
                  paddingVertical: widthToDp(0),
                  fontSize: widthToDp(4),
                }}
                onPress={selectSeal}
              />
            )}
          </View>
          {photoID && (
            <DocumentComponent
              title="Photo ID"
              fileName={photoID}
              handleDelete={deletePhotoID}
            />
          )}
          {Certificate && (
            <DocumentComponent
              title="Certificate"
              fileName={Certificate}
              handleDelete={deleteCertificate}
            />
          )}
          {Seal && (
            <DocumentComponent
              title="Notary Seal"
              fileName={Seal}
              handleDelete={deleteSeal}
            />
          )}
          <View style={styles.buttonContainer}>
            {photoID && Certificate && Seal && (
              <GradientButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                style={{ width: widthToDp(75) }}
                GradiStyles={{ paddingVertical: widthToDp(2) }}
                title="Submit"
                onPress={submitRegister}
                loading={loading}
              />
            )}
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  text: {
    fontSize: 15,
    color: '#121826',
    marginLeft: widthToDp(6),
  },
  subHeading: {
    fontSize: 16,
    color: '#121826',
    marginLeft: widthToDp(6),
    fontWeight: '600',
  },
  flexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: heightToDp(2),
  },
  buttonContainer: {
    marginVertical: heightToDp(4),
    alignItems: 'center',
  },
});
