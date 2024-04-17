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
import {convertToJsonObject} from '../../utils/ImagePicker';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import {Button} from '@rneui/base';
import useCustomerSuport from '../../hooks/useCustomerSupport';

export default function MobileNotaryDateScreen({route, navigation}) {
  const dispatch = useDispatch();
  const bookingData = useSelector(state => state.booking.booking);
  // const [selectedDate, setSelectedDate] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [documents, setDocuments] = useState();
  // const [startTime, setStartTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  // const [date, setDate] = useState(new Date());
  console.log('isenaglere', bookingData.totalPrice);
  let urlResponse;
  const {uploadMultipleFiles, uploadAllDocuments} = useRegister();
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const {handleCallSupport} = useCustomerSuport();
  const submitAddressDetails = async () => {
    setLoading(true);
    if (documents) {
      // urlResponse = await uploadAllDocuments(documents);
      if (documents.length > 0) {
        urlResponse = await uploadAllDocuments(documents);

        const totalPriceWithDocuments =
          bookingData.totalPrice + 10 * documents.length;
        dispatch(
          setBookingInfoState({
            ...bookingData,
            documents: urlResponse,
            totalPrice: totalPriceWithDocuments,
          }),
        );
      } else {
        dispatch(
          setBookingInfoState({
            ...bookingData,
            documents: [],
          }),
        );
      }
    } else {
      dispatch(
        setBookingInfoState({
          ...bookingData,
          documents: [],
        }),
      );
    }

    setLoading(false);
    navigation.navigate('NearbyLoadingScreen', {
      serviceType: 'mobile_notary',
    });
    setLoading(false);
  };
  useEffect(() => {}, []);

  const selectDocuments = async () => {
    const response = await uploadMultipleFiles();
    dispatch(setNumberOfDocs(response.length));
    setDocuments(response);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        Title="Booking"
        midImg={require('../../../assets/supportIcon.png')}
        midImgPress={() => handleCallSupport()}
        lastImg={require('../../../assets/bellIcon.png')}
      />
      <Text style={styles.heading}>Please select a Document</Text>
      <BottomSheetStyle>
        <ScrollView scrollEnabled={true}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: widthToDp(2),
            }}>
            <Text style={styles.insideText}>
              Do you want us to print the document?
            </Text>
            <View
              style={{
                flex: 1,
              }}>
              <Switch
                trackColor={{false: '#767577', true: Colors.Orange}}
                thumbColor={isEnabled ? Colors.Orange : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </View>

          {isEnabled &&
            (documents ? (
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: widthToDp(5),
                  marginVertical: widthToDp(2),
                  flexWrap: 'wrap',
                  columnGap: widthToDp(2),
                  rowGap: widthToDp(2),
                }}>
                <Text style={styles.detail}>
                  To utilize this service $10 would be charged for each
                  document.
                </Text>
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
              <>
                <Text
                  style={[
                    styles.detail,
                    {
                      marginLeft: widthToDp(3),
                      marginRight: widthToDp(5),
                      alignSelf: 'center',
                    },
                  ]}>
                  To utilize this service $10 would be charged for each
                  document.
                </Text>
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
                    <Text
                      style={{color: Colors.TextColor, fontSize: widthToDp(4)}}>
                      Upload
                    </Text>
                    <Image source={require('../../../assets/uploadIcon.png')} />
                  </View>
                  <Text>Upload your documents here...</Text>
                </TouchableOpacity>
              </>
            ))}

          <GradientButton
            Title="Book a Service"
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
          <View style={styles.dashedContainer}>
            <Text
              style={{
                color: Colors.TextColor,
                fontFamily: 'Manrope-Bold',
                fontSize: widthToDp(4),
              }}>
              Note:
            </Text>
            <Text
              style={{
                color: Colors.TextColor,
                fontFamily: 'Manrope-Regular',
                fontSize: widthToDp(3.5),
              }}>
              By continuing you agree to our terms that all signings are
              scheduled for a one-hour duration. Any additional time beyond this
              will incur an extra charge of
              <Text style={{fontFamily: 'Manrope-Bold'}}> +$25 </Text>per
              half-hour.
            </Text>
          </View>
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
    // padding: widthToDp(4),
    // alignItems: 'center',
  },
  namebar: {
    flexDirection: 'row',
    alignContent: 'center',
    margin: widthToDp(5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
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
    marginLeft: widthToDp(2),
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
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

{
  {
    /* <View style={styles.dateContainer}>
            {TimeAvailable.map((slot, index) => (
              <TouchableOpacity
                key={index}
                // style={styles.slot}
                onPress={() => setSelectedTime(slot.start + ' - ' + slot.end)}>
                <LinearGradient
                  style={styles.slot}
                  colors={
                    selectedTime === slot.start + ' - ' + slot.end
                      ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                      : [Colors.white, Colors.white]
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === slot.start + ' - ' + slot.end && {
                        color: Colors.white,
                      },
                    ]}>
                    {slot.start} - {slot.end}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View> */
  }
  /* <View
  style={{
    backgroundColor: Colors.white,
    elevation: 20,
    borderRadius: 10,
    marginHorizontal: widthToDp(2),
  }}>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
    <TouchableOpacity onPress={handlePrevMonth}>
      <Image
        source={require('../../../assets/monthLeft.png')}
        style={styles.month}
      />
    </TouchableOpacity>
    <Text style={styles.monthHead}>
      {currentMonth} {currentYear}
    </Text>
    <TouchableOpacity onPress={handleNextMonth}>
      <Image
        source={require('../../../assets/monthRight.png')}
        style={styles.month}
      />
    </TouchableOpacity>
  </View>
  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
    {dateInfo.map((dateObj, index) => (
      <TouchableOpacity
        key={index}
        style={{
          marginHorizontal: widthToDp(2),
          marginVertical: widthToDp(5),
        }}
        onPress={() => setIsFocused(dateObj.date)}>
        <LinearGradient
          style={styles.locationStyle}
          colors={
            isFocused === dateObj.date
              ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
              : [Colors.white, Colors.white]
          }
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <View
            style={[
              {
                paddingHorizontal: widthToDp(4),
                paddingVertical: widthToDp(2),
                alignItems: 'center',
              },
            ]}>
            <Text
              style={
                isFocused === dateObj.date ? styles.textWhite : styles.text
              }>
              {currentMonth}
            </Text>
            <Text
              style={
                isFocused === dateObj.date
                  ? styles.dateHeadingWhite
                  : styles.dateHeading
              }>
              {dateObj.date}
            </Text>
            <Text
              style={
                isFocused === dateObj.date ? styles.textWhite : styles.text
              }>
              {dateObj.day}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>; */
}
