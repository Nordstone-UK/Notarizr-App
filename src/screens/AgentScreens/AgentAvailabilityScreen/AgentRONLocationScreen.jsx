import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import {heightToDp, width, widthToDp} from '../../../utils/Responsive';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import TypesofServiceButton from '../../../components/TypesofServiceButton/TypesofServiceButton';
import Colors from '../../../themes/Colors';
import MainBookingScreen from '../../MainBookingScreen/MainBookingScreen';
import MainButton from '../../../components/MainGradientButton/MainButton';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import {useSelector} from 'react-redux';
import useAgentService from '../../../hooks/useAgentService';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {Button} from '@rneui/base';

export default function AgentRONLocationScreen({navigation}) {
  const {location} = useSelector(state => state.user.user);

  const [cityArray, setCityArray] = useState([location]);
  const [Location, setLocation] = useState('');
  const agentService = useSelector(state => state.agentService);
  // console.log(user);
  const {handleRegistration} = useAgentService();

  const createService = () => {
    const Location = cityArray;
    console.log(Location);
    const params = {
      ...agentService,
      location: Location,
    };
    handleRegistration(params);
  };
  function checkAndAddCity(city) {
    if (cityArray.includes(city)) {
      Toast.show({
        type: 'error',
        text1: 'City already added',
      });
    } else {
      setCityArray(prevArray => [...prevArray, city]);
      console.log('Added:', city);
    }
  }
  function removeCity(city) {
    setCityArray(prevArray => prevArray.filter(item => item !== city));
  }
  return (
    <View style={styles.container}>
      <AgentHomeHeader />
      <View style={styles.headingContainer}>
        <Text style={styles.Heading}>Profile Setup</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.insideHeading}>
            Please enter your preferred locations
          </Text>
          <LabelTextInput
            rightImageSoucre={require('../../../../assets/addIcon.png')}
            rightImagePress={() => {
              checkAndAddCity(Location), setLocation('');
            }}
            placeholder={'Enter your desired locations'}
            LabelTextInput={'Locations'}
            onChangeText={text => setLocation(text)}
            Label={true}
            defaultValue={Location}
          />
          <View style={styles.buttonFlex}>
            {cityArray.map((city, index) => (
              <TouchableOpacity key={index} onPress={() => removeCity(city)}>
                <LinearGradient
                  colors={[
                    Colors.OrangeGradientStart,
                    Colors.OrangeGradientEnd,
                  ]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.gradientstyles}>
                  <View style={styles.buttonToucableOpacity}>
                    <Text style={styles.buttonText}>{city}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.bottomFlex}>
          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title="Complete"
            onPress={() => createService()}
          />
        </View>
      </BottomSheetStyle>
    </View>
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
    fontFamily: 'Manrope-Regular',
  },
  buttonToucableOpacity: {
    fontSize: widthToDp(4),
  },
  Heading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },
  headingContainer: {
    marginLeft: widthToDp(4),
    marginBottom: heightToDp(2),
  },
  insideHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
    marginVertical: widthToDp(3),
    marginHorizontal: widthToDp(5),
  },
  gradientstyles: {
    borderRadius: 10,
    alignSelf: 'center',
    paddingHorizontal: widthToDp(10),
    minWidth: widthToDp(40),
    paddingVertical: heightToDp(2),
  },
  buttonText: {
    color: '#fff',
    fontSize: widthToDp(4),
    textAlign: 'center',
    fontFamily: 'Manrope-Bold',
  },
  buttonFlex: {
    flexDirection: 'row',
    marginVertical: heightToDp(2),
    flexWrap: 'wrap',
    rowGap: widthToDp(2),
    columnGap: widthToDp(2),
    marginHorizontal: widthToDp(5),
  },
  bottomFlex: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: heightToDp(5),
  },
});
