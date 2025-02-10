import {
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import {heightToDp, width, widthToDp} from '../../../utils/Responsive';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import LabelTextInput from '../../../components/LabelTextInput/LabelTextInput';
import GradientButton from '../../../components/MainGradientButton/GradientButton';
import {useSelector} from 'react-redux';
import useAgentService from '../../../hooks/useAgentService';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {statesData} from '../../../data/statesData';
import {MultipleSelectList} from 'react-native-dropdown-select-list';

export default function AgentRONLocationScreen({route, navigation}) {
  const {location} = useSelector(state => state.user.user);
  const {canPrint, serviceData} = route.params;
  const [isDisabled, setIsDisabled] = useState(false);
  const [cityArray, setCityArray] = useState([location]);
  const [locationInput, setLocationInput] = useState('');
  const [selectedStates, setSelectedStates] = useState(
    serviceData?.service?.location || [],
  );
  const agentService = useSelector(state => state.agentService);
  const {handleRegistration, handleUpdateService} = useAgentService();
  useEffect(() => {
    const updatedCityArray = [
      ...new Set([...cityArray, ...selectedStates]), // Merge arrays and remove duplicates
    ];
    setCityArray(updatedCityArray);
  }, [selectedStates]);

  const createService = async () => {
    setIsDisabled(true);
    try {
      const locations = [...selectedStates];
      const params = {
        ...agentService,
        location: locations,
        canPrint: canPrint,
      };
      await handleRegistration(params);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error creating service',
        text2: error.message,
      });
    } finally {
      setIsDisabled(false);
    }
  };
  console.log('soreidfdf', serviceData);
  const updateService = async () => {
    setIsDisabled(true);
    try {
      const locations = [...selectedStates];
      const params = {
        ...agentService,
        id: serviceData?.service?._id,
        location: locations,
        canPrint: canPrint,
      };
      await handleUpdateService(params);
      Toast.show({
        type: 'success',
        text1: 'Service updated successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error updating service',
        text2: error.message,
      });
    } finally {
      setIsDisabled(false);
    }
  };

  const checkAndAddCity = city => {
    if (!city.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Enter a City Name',
      });
      return;
    }

    if (cityArray.includes(city)) {
      Toast.show({
        type: 'error',
        text1: 'City already added',
      });
      return;
    }

    setCityArray(prevArray => [...prevArray, city]);
  };

  const removeCity = city => {
    setCityArray(prevArray => prevArray.filter(item => item !== city));
    setSelectedStates(prevStates => prevStates.filter(state => state !== city));
  };

  console.log('selelcg', selectedStates);
  return (
    <SafeAreaView style={styles.container}>
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
          <View
            style={{
              marginTop: widthToDp(2),
              paddingHorizontal: widthToDp(5),
            }}>
            <MultipleSelectList
              setSelected={setSelectedStates}
              data={statesData.map(state => ({
                value: state.label,
              }))}
              save="value"
              label="States"
              placeholder="Select states"
              boxStyles={{
                borderColor: Colors.Orange,
                borderWidth: 2,
                borderRadius: widthToDp(5),
              }}
              dropdownStyles={{
                borderColor: Colors.Orange,
                borderWidth: 2,
                borderRadius: widthToDp(5),
                maxHeight: widthToDp(75),
              }}
              inputStyles={{color: Colors.TextColor}}
              badgeStyles={{backgroundColor: Colors.Orange}}
              dropdownTextStyles={{color: Colors.TextColor}}
              checkBoxStyles={{tintColor: Colors.TextColor}}
              labelStyles={{
                color: Colors.TextColor,
                fontSize: widthToDp(4),
              }}
              badgeTextStyles={{
                fontSize: widthToDp(3.2),
                color: Colors.white,
                fontFamily: 'Manrope-SemiBold',
              }}
              notFoundText={
                <Text style={{color: Colors.TextColor}}>
                  No States Found...
                </Text>
              }
            />
          </View>
          {/* <LabelTextInput
            rightImageSoucre={require('../../../../assets/addIcon.png')}
            rightImagePress={() => {
              checkAndAddCity(locationInput);
              setLocationInput('');
            }}
            placeholder={'Enter your desired locations'}
            LabelTextInput={'Cities'}
            onChangeText={setLocationInput}
            Label={true}
            value={locationInput}
          /> */}

          <View style={styles.buttonFlex}>
            {selectedStates.map((city, index) => (
              // <TouchableOpacity key={index}
              // onPress={() => removeCity(city)}>
              <LinearGradient
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradientstyles}>
                <View style={styles.buttonToucableOpacity}>
                  <Text style={styles.buttonText}>{city}</Text>
                </View>
              </LinearGradient>
              // </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.bottomFlex}>
          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title={serviceData?.service ? 'Update' : 'Complete'}
            onPress={serviceData?.service ? updateService : createService}
            isDisabled={isDisabled}
          />
        </View>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  contentContainer: {
    paddingBottom: heightToDp(10),
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
    paddingHorizontal: widthToDp(5),
    // minWidth: widthToDp(40),
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
