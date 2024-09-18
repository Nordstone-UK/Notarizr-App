import React, { useCallback, useRef, useState } from 'react';
import Signature from 'react-native-signature-canvas';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select'; // Import the picker
import { widthToDp } from '../../../utils/Responsive';
import { uploadSignatureOnS3 } from '../../../utils/s3Helper';
import { launchImageLibrary } from 'react-native-image-picker'; // Import the image picker
import useUpdate from '../../../hooks/useUpdate';
import useFetchUser from '../../../hooks/useFetchUser';
import { useLiveblocks } from '../../../store/liveblocks';
import useRegister from '../../../hooks/useRegister';
import { TextInput } from 'react-native';
import { FlatList } from 'react-native';
import Colors from '../../../themes/Colors';

interface DrawSignComponentProps {
  isVisible: boolean;
  onClose: () => void;
  signs?: { notarySeal?: string; notarysigns?: { signUrl: string }[] };
  onStampChanges: (stampImage: string) => void;
}
const fontStyles = [
  { label: 'DancingScript-VariableFont_wght', value: 'DancingScript-VariableFont_wght' },
  { label: 'JacquesFrancoisShadow', value: 'JacquesFrancoisShadow-Regular' },
  { label: 'Manrope-Bold', value: 'Manrope-Bold' },
  { label: 'PlaywriteCU ', value: 'PlaywriteCU-ExtraLight' },
  { label: 'Poppins-Regular', value: 'Poppins-Regular' },
  { label: 'ProtestGuerrilla', value: 'ProtestGuerrilla-Regular' },
  { label: 'Poppins-SemiBold', value: 'Poppins-SemiBold' },
  { label: 'SofadiOne', value: 'SofadiOne-Regular' },
];

const DrawSignTypeModal: React.FC<DrawSignComponentProps> = ({ isVisible, onClose, signs, onStampChanges }) => {
  console.log("udsfffffffff", signs)
  const { fetchUserInfo, handleDeleteSign } = useFetchUser();
  const insertObject = useLiveblocks(state => state.insertObject);
  const { uploadimageToS3 } = useRegister();
  const { handleNotarysignUpdate } = useUpdate();
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedSignType, setSelectedSignType] = useState(''); // New state for selected sign type
  const [signatureData, setSignatureData] = useState(null);
  const [inputText, setInputText] = useState('');
  const [signaturePadVisible, setSignaturePadVisible] = useState(false);
  const [uploadedImageUri, setUploadedImageUri] = useState(null);
  const [signModalVisible, setSignModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFontStyle, setSelectedFontStyle] = useState(fontStyles[0].value);


  const signaturePadRef = useRef(null);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    if (option === 'draw') {
      setSignaturePadVisible(true);
    } else if (option === 'upload') {
      setSignaturePadVisible(false);
      handleImageUpload(); // Trigger image upload process
    } else {
      setSignaturePadVisible(false);
    }
  };

  const handleSignature = async (signature) => {
    console.log("Signature received:", signature);
    try {
      let signaturesigns = await uploadSignatureOnS3(signature);
      const signupdated = await handleNotarysignUpdate(signaturesigns);
      if (signupdated) {
        await fetchUserInfo();
      }
      setSignatureData(signature);
      insertObject(new Date().toISOString(), {
        type: 'image',
        sourceUrl: signaturesigns,
        position: {
          x: 100,
          y: 100,
        },
      });
      setSignaturePadVisible(false);
    } catch (error) {
      console.error("Error handling signature:", error);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
      });

      if (result.didCancel) {
        console.log('User canceled image picker');
        return;
      }

      if (result.errorCode) {
        console.log('ImagePicker Error:', result.errorMessage);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        const s3Url = await uploadimageToS3(uri);
        setUploadedImageUri(s3Url);
        insertObject(new Date().toISOString(), {
          type: 'image',
          sourceUrl: s3Url,
          position: {
            x: 100,
            y: 100,
          },
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };
  const handleImageLoadStart = () => {
    setLoading(true)

  };

  const handleImageLoadEnd = () => {
    setLoading(false)
  };
  const handleSignSelect = (stampImage: string) => {
    console.log("stamf", stampImage)
    setSignModalVisible(false);
    onStampChanges(stampImage);
  };
  const handleSignDelete = async (signId: string) => {
    console.log("signd", signId)
    try {
      const signupdated = await handleDeleteSign(signId);
      // if (response.data.deleteNotarySignR.status === 'success') {

      if (signupdated) {
        console.log("sgnd", signupdated)
        await fetchUserInfo();
      }
      // setSignToDelete(null);
      // setStampModalVisible(false);
      // setSignModalVisible(false);
      // Optionally, update the stamps list after deletion
      // }
    } catch (error) {
      console.error('Error deleting sign:', error);
    }
  };

  const SignItem = React.memo(({ item, onSelect, onDelete }: { item: { signUrl: string, id: string }, onSelect: (url: string) => void, onDelete: (id: string) => void }) => {
    return (
      <View style={styles.signItemContainer}>
        <TouchableOpacity onPress={() => onSelect(item.signUrl)}>
          <Image
            source={{ uri: item.signUrl }}
            style={{ width: 100, height: 100 }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
          <Icon name="times" size={20} color="red" />
        </TouchableOpacity>
      </View>
    );
  });
  const renderSignModal = React.useCallback(
    ({ item }: { item: { signUrl: string, id: string } }) => {
      return (
        <SignItem
          item={item}
          onSelect={handleSignSelect}
          onDelete={handleSignDelete}
        />
      );
    },
    [handleSignSelect, handleSignDelete]
  );
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeading}>
            Choose signature type
          </Text>
          <View style={styles.optionsContainer}>
            {['choose', 'draw', 'type', 'upload'].map(option => (
              <TouchableOpacity key={option} style={styles.optionButton} onPress={() => handleSelectOption(option)}>
                <Text style={styles.optionText}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedOption === 'choose' && (
            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>Select a signature</Text>
              <View style={styles.modalContainer}>
                <View style={styles.modal}>
                  {/* {loading ? (
                    <ActivityIndicator
                      size="large"
                      color={Colors.OrangeGradientStart}
                      style={styles.centeredActivityIndicator}
                    />
                  ) : null} */}
                  {signs?.notarysigns && signs.notarysigns.length > 0 ? (
                    <View style={{ maxHeight: 300 }}>
                      <FlatList
                        data={signs?.notarysigns}
                        renderItem={renderSignModal}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={2}
                        contentContainerStyle={{ flexGrow: 1 }}
                      />
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>Please add a signature</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {selectedOption === 'draw' && signaturePadVisible && (
            <View style={styles.signatureContainer}>
              <Text style={styles.contentText}>Draw your signature here.</Text>
              <Signature
                ref={signaturePadRef}
                onOK={handleSignature}
                onClear={() => console.log("Signature cleared")}
                onEmpty={() => console.log('Signature is empty')}
                descriptionText="Sign"
                clearText="Clear"
                confirmText="Save"
                webStyle={styles.signatureWebStyle}
              />
            </View>
          )}

          {selectedOption === 'upload' && (
            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>Upload your signature image here.</Text>
              {uploadedImageUri && (
                <Image
                  source={{ uri: uploadedImageUri }}
                  style={styles.uploadedImage}
                />
              )}
            </View>
          )}

          {selectedOption === 'type' && (
            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>Type your signature.</Text>
              <TextInput
                style={[styles.textInput, { fontFamily: selectedFontStyle }]} // Apply dynamic font style
                placeholder="Type something..."
                onChangeText={setInputText}
                value={inputText}
              />
              <View style={styles.styledTextContainer}>
                <Picker
                  selectedValue={selectedFontStyle}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedFontStyle(itemValue)}

                >
                  {fontStyles.map((font, index) => {
                    console.log("Mapping font:", font); // Log each font being mapped
                    return (
                      <Picker.Item style={{ fontFamily: font.value }} key={index} label={font.label} value={font.value} />
                    );
                  })}
                </Picker>
                <Text style={[styles.styledText, { fontFamily: selectedFontStyle }]}>{inputText}</Text>
              </View>
            </View>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: widthToDp(90),
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeading: {
    fontFamily: "DancingScript-VariableFont_wght",
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FF7F00',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 10,
    // backgroundColor: 'black',
  },
  signatureContainer: {
    width: '100%',
    height: 500,
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#333',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    resizeMode: 'contain',
    borderRadius: 5,
  },
  closeButton: {
    marginTop: 20,
  },
  closeText: {
    color: 'gray',
    fontSize: 16,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  styledTextContainer: {
    width: '100%',
    alignItems: 'center',
  },
  styledText: {
    fontSize: 20,
    color: '#FF7F00',
    // fontWeight: 'bold',
  },
  signModalContainer: {
    maxHeight: 300, // Limit max height to 300px
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  signItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  signatureWebStyle: `
    .m-signature-pad {
      border: none !important;
      box-shadow: none !important;
      background-color: transparent !important;
    }
    .m-signature-pad--footer {
      display: flex;
      justify-content: space-between; 
      align-items: center;
      border-top: 1px solid #ddd;
      padding: 10px;
      margin-top:20px;
    }
    .m-signature-pad--footer .button {
      height: 50px;
      font-size: 18px;
       flex: 1; /* Ensures both buttons have equal width */
      margin: 0 10px;
    }
    .m-signature-pad--footer .button.clear {
      background-color: #FF7F00 !important;
      color: white !important;
    }
    .m-signature-pad--footer .button.save {
      background-color: #4CAF50 !important;
      color: white !important;
    }
  `,
});

export default DrawSignTypeModal
