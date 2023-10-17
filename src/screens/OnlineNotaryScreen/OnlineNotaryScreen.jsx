import {
  Image,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  View,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import TypesofServiceButton from '../../components/TypesofServiceButton/TypesofServiceButton';
import useGetService from '../../hooks/useGetService';

export default function OnlineNotaryScreen({route, navigation}) {
  const documentType = route.params;
  const {RONfetchAPI} = useGetService();
  const [isDisabled, setIsDisabled] = useState(false);
  console.log('documentType', documentType);
  const handleFetchAPI = async () => {
    setIsDisabled(true);
    navigation.navigate('NearbyLoadingScreen', {
      documentType: documentType,
    });
    await RONfetchAPI('ron', documentType);
    setIsDisabled(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Booking" />
      <View style={styles.headingContainer}>
        <Text style={styles.lightHeading}>Selected Service</Text>
        <Text style={styles.Heading}>Medical documents</Text>
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <Text style={styles.insideHeading}>
            Please choose the mode of service you wish to avail
          </Text>
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.Pink}}
            Title="Available Agents"
            Image={require('../../../assets/service1Pic.png')}
            isDisabled={isDisabled}
            onPress={
              () => handleFetchAPI()
              // () => navigation.navigate('NearbyLoadingScreen')
            }
          />
          <TypesofServiceButton
            backgroundColor={{backgroundColor: Colors.LightBlue}}
            Title="Sessions"
            Image={require('../../../assets/service2Pic.png')}
            onPress={() => navigation.navigate('SessionScreen')}
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
});
