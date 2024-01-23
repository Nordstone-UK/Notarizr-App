import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, width, widthToDp} from '../../utils/Responsive';

import CustomCalendar from '../../components/CustomCalendar/CustomCalendar';
import moment from 'moment';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import useRegister from '../../hooks/useRegister';
import TimePicker from '../../components/TimePicker/TimePicker';
import {useDispatch, useSelector} from 'react-redux';
import {
  setBookingInfoState,
  setNumberOfDocs,
} from '../../features/booking/bookingSlice';

import useCustomerSuport from '../../hooks/useCustomerSupport';
import MainButton from '../../components/MainGradientButton/MainButton';

export default function AuthenticationScreen({route, navigation}) {
  const dispatch = useDispatch();
  const bookingData = useSelector(state => state.booking.booking);
  const [isFocused, setIsFocused] = useState('ID Card');
  const [isEnabled, setIsEnabled] = useState(false);
  const [documents, setDocuments] = useState();
  const [loading, setLoading] = useState(false);
  // const [date, setDate] = useState(new Date());

  let urlResponse;
  const {uploadMultipleFiles, uploadAllDocuments} = useRegister();
  const {handleCallSupport} = useCustomerSuport();
  const submitAddressDetails = async () => {
    setLoading(true);
    if (documents) {
      urlResponse = await uploadAllDocuments(documents);
    }
    dispatch(
      setBookingInfoState({
        ...bookingData,
        documents: urlResponse,
      }),
    );
    setLoading(false);
    // navigation.navigate('NearbyLoadingScreen', {
    //   serviceType: 'mobile_notary',
    // });
    setLoading(false);
  };

  const selectDocuments = async () => {
    const response = await uploadMultipleFiles();
    setDocuments(response);
  };
  const handleFocusChange = value => {
    setIsFocused(value);
    setDocuments(null);
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        midImg={require('../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
        lastImg={require('../../../assets/bellIcon.png')}
      />
      <Text style={styles.heading}>
        Please select a document for verification
      </Text>
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true}>
          <View style={styles.flexContainer}>
            <MainButton
              Title="ID Card"
              colors={
                isFocused === 'ID Card'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'ID Card'
                  ? {
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.TextColor,
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
              }
              onPress={() => handleFocusChange('ID Card')}
            />
            <MainButton
              Title="Passport"
              colors={
                isFocused === 'Passport'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'Passport'
                  ? {
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.TextColor,
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
              }
              onPress={() => handleFocusChange('Passport')}
            />
          </View>

          {isFocused === 'ID Card' && (
            <Text style={[styles.detail]}>
              Please upload front and back side your ID Card
            </Text>
          )}
          {isFocused === 'Passport' && (
            <Text style={[styles.detail]}>
              Please upload a picture of youur Passport
            </Text>
          )}
          {documents ? (
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: widthToDp(8),
                marginVertical: widthToDp(2),
                flexWrap: 'wrap',
                columnGap: widthToDp(2),
                rowGap: widthToDp(2),
              }}>
              {documents &&
                documents.map((image, index) => (
                  <Image
                    key={index}
                    source={require('../../../assets/docPic.png')}
                    style={{width: widthToDp(10), height: heightToDp(10)}}
                  />
                ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dottedContianer}
              onPress={() => selectDocuments()}>
              <Image source={require('../../../assets/upload.png')} />
              <View
                style={{
                  flexDirection: 'row',
                  columnGap: widthToDp(2),
                  alignItems: 'center',
                }}>
                <Text style={{color: Colors.TextColor, fontSize: widthToDp(4)}}>
                  Upload
                </Text>
                <Image source={require('../../../assets/uploadIcon.png')} />
              </View>
              <Text>Upload your documents here...</Text>
            </TouchableOpacity>
          )}
          <GradientButton
            Title="Verify Identity"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            GradiStyles={{
              marginVertical: heightToDp(5),
            }}
            styles={{
              fontSize: widthToDp(5),
            }}
            onPress={() => submitAddressDetails()}
            loading={loading}
          />
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  dateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: widthToDp(5),
  },
  timeText: {
    color: Colors.TextColor,
  },
  dashedContainer: {
    marginHorizontal: widthToDp(5),
    borderWidth: 3,
    borderColor: Colors.DullTextColor,
    borderStyle: 'dashed',
    backgroundColor: Colors.PinkBackground,
    borderRadius: 10,
    padding: widthToDp(2),
  },
  slot: {
    borderRadius: 10,
    padding: 10,
    margin: 5,
    elevation: 15,
  },
  imagestyles: {
    width: widthToDp(15),
    height: heightToDp(15),
  },
  locationStyle: {
    borderRadius: 5,
  },
  namebar: {
    flexDirection: 'row',
    alignContent: 'center',
    margin: widthToDp(5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexContainer: {
    marginTop: heightToDp(5),
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  text: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-SemiBold',
  },
  dateHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(8),
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
  dateHeadingWhite: {
    color: Colors.white,
    fontSize: widthToDp(8),
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
  textWhite: {
    color: Colors.white,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
  },
  icon: {
    marginLeft: widthToDp(5),
    width: widthToDp(7),
    height: heightToDp(7),
  },
  textHeading: {
    alignSelf: 'center',
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-SemiBold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
  },
  monthHead: {
    alignSelf: 'center',
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-SemiBold',
    color: Colors.TextColor,
  },
  month: {
    tintColor: Colors.TextColor,
    marginHorizontal: widthToDp(7),
  },
  heading: {
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(5),
  },
  headingContainer: {
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginLeft: widthToDp(6),
    // marginVertical: widthToDp(4),
  },
  insideText: {
    marginHorizontal: widthToDp(6),
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
  },
  nameContainer: {
    marginVertical: heightToDp(2),
    alignSelf: 'center',
  },
  name: {
    alignSelf: 'center',
    fontSize: widthToDp(7),
    color: Colors.TextColor,
    fontWeight: '600',
  },
  placestyle: {
    fontSize: widthToDp(7),
    fontWeight: '900',
    alignSelf: 'center',
  },

  preference: {
    marginLeft: widthToDp(4),
    marginVertical: widthToDp(1),
    fontSize: widthToDp(4),
    color: Colors.DullTextColor,
  },
  detail: {
    marginTop: widthToDp(3),
    marginHorizontal: heightToDp(8),
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    alignSelf: 'center',
    fontFamily: 'Manrope-SemiBold',
  },
  star: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  sheetContainer: {},
  locationImage: {
    tintColor: Colors.DullTextColor,
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: widthToDp(4),
  },
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: heightToDp(5),
  },
  dottedContianer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderStyle: 'dotted',
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    borderRadius: 5,
    marginTop: heightToDp(5),
    paddingVertical: heightToDp(2),
    width: widthToDp(80),
  },
});
