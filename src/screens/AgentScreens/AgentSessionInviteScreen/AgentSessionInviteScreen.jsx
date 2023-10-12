import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import DocumentComponent from '../../../components/DocumentComponent/DocumentComponent';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import MainButton from '../../../components/MainGradientButton/MainButton';
import moment from 'moment-timezone';
import {Picker} from '@react-native-picker/picker';
import DocumentPicker, {types} from 'react-native-document-picker';
import GradientButton from '../../../components/MainGradientButton/GradientButton';

export default function AgentSessionInviteScreen({navigation}) {
  const [selected, setSelected] = useState('Allow user to choose');
  const [session, setSession] = useState('Let Signer Choose');
  const [selectedTimezone, setSelectedTimezone] = useState(''); // Default value
  const timezoneOptions = moment.tz.names();
  const handleTimezoneSelect = timezone => {
    setSelectedTimezone(timezone);
  };

  const [fileResponse, setFileResponse] = useState([]);

  const handleDocumentSelection = useCallback(async () => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf],
        allowMultiSelection: true,
      });
      setFileResponse(response);
    } catch (err) {
      console.warn(err);
    }
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader Switch={true} />
      <View style={styles.headingContainer}>
        <Text style={styles.Heading}>Invite Signer</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={{paddingVertical: heightToDp(5)}}>
          <LabelTextInput
            LabelTextInput="Client Name"
            placeholder="Enter Name here"
            Label={true}
            labelStyle={{
              color: Colors.TextColor,
            }}
          />
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Observers</Text>
            <Text>
              An Observer is anyone with relevant information for all the
              signing that may need to be on the notarization session.
            </Text>
            <View style={{marginTop: heightToDp(3), alignSelf: 'flex-start'}}>
              <MainButton
                Title="Add Observer"
                colors={[Colors.DisableColor, Colors.DisableColor]}
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
              />
            </View>
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>
              Type of identity Authentication for Session
            </Text>
            <View style={styles.buttonBottom}>
              <MainButton
                Title="Allow user to choose"
                colors={
                  selected === 'Allow user to choose'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setSelected('Allow user to choose')}
              />
              <MainButton
                Title="US Citizens + KBA"
                colors={
                  selected === 'US Citizens + KBA'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setSelected('US Citizens + KBA')}
              />
              <MainButton
                Title="US Citizens/Foreigners + Biometrics"
                colors={
                  selected === 'US Citizens/Foreigners + Biometrics'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() =>
                  setSelected('US Citizens/Foreigners + Biometrics')
                }
              />
            </View>
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Session Schedule</Text>
            <View style={styles.buttonBottom}>
              <MainButton
                Title="Let Signer Choose"
                colors={
                  session === 'Let Signer Choose'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setSession('Let Signer Choose')}
              />
              <MainButton
                Title="Notirize Now"
                colors={
                  session === 'Notirize Now'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setSession('Notirize Now')}
              />
              <MainButton
                Title="Schedule for Later"
                colors={
                  session === 'Schedule for Later'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                GradiStyles={{
                  paddingVertical: heightToDp(1),
                  paddingHorizontal: widthToDp(5),
                }}
                styles={{
                  padding: heightToDp(2),
                  fontSize: widthToDp(3.5),
                }}
                onPress={() => setSession('Schedule for Later')}
              />
            </View>
          </View>
          <LabelTextInput
            LabelTextInput="Date & Time"
            placeholder="Enter here"
            Label={true}
            labelStyle={{
              color: Colors.TextColor,
            }}
            leftImageSoucre={require('../../../../assets/calenderIcon.png')}
          />
          <View style={styles.picker}>
            <Picker
              selectedValue={selectedTimezone}
              onValueChange={handleTimezoneSelect}>
              <Picker.Item
                label="Select a timezone"
                color={Colors.DullTextColor}
              />
              {timezoneOptions.map((timezone, index) => (
                <Picker.Item
                  key={index}
                  label={timezone}
                  value={timezone}
                  color={Colors.DullTextColor}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.headingContainer}>
            <Text style={styles.Heading}>Document</Text>
            <TouchableOpacity
              style={styles.dottedContianer}
              onPress={handleDocumentSelection}>
              <Image source={require('../../../../assets/upload.png')} />
              <View
                style={{
                  flexDirection: 'row',
                  columnGap: widthToDp(2),
                  alignItems: 'center',
                }}>
                <Text style={{color: Colors.TextColor, fontSize: widthToDp(4)}}>
                  Upload
                </Text>
                <Image source={require('../../../../assets/uploadIcon.png')} />
              </View>
              <Text>Upload your File here...</Text>
            </TouchableOpacity>
          </View>
          <GradientButton
            Title="Send Invitation"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            onPress={() => navigation.navigate('WaitingRoomScreen')}
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
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-SemiBold',
  },
  picker: {
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    width: widthToDp(90),
    marginHorizontal: widthToDp(5),
    marginVertical: widthToDp(5),
    borderRadius: 15,
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(5),
    marginVertical: widthToDp(5),
    // marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(2),
  },
  insideContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightToDp(2),
    marginHorizontal: widthToDp(5),
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightToDp(2),
    marginHorizontal: widthToDp(5),
  },
  iconContainer: {
    alignContent: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  insideText: {
    marginHorizontal: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
  },
  greenIcon: {
    width: widthToDp(5),
    height: heightToDp(5),
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
    color: Colors.DullTextColor,
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
  buttonBottom: {
    flexDirection: 'row',
    marginTop: heightToDp(3),
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    rowGap: widthToDp(2),
    columnGap: heightToDp(1),
  },
  buttonFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: widthToDp(90),
    alignSelf: 'center',
    marginVertical: widthToDp(5),
  },
  dottedContianer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderStyle: 'dotted',
    borderWidth: 2,
    borderColor: Colors.DisableColor,
    borderRadius: 5,
    marginVertical: heightToDp(3),
    paddingVertical: heightToDp(2),
    width: widthToDp(80),
  },
});
