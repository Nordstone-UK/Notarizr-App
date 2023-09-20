import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../../themes/Colors';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import {widthToDp} from '../../../utils/Responsive';
import TypesofServiceButton from '../../../components/TypesofServiceButton/TypesofServiceButton';

export default function AgentProfileEditScreen({navigation}) {
  return (
    <View style={styles.container}>
      <AgentHomeHeader Title="Profile Setup" Switch={true} />
      <BottomSheetStyle>
        <ScrollView>
          <View style={styles.headContainer}>
            <Text style={styles.heading}>
              Please choose the mode of your service
            </Text>
          </View>
          <View>
            <TypesofServiceButton
              backgroundColor={{backgroundColor: Colors.Pink}}
              Title="Mobile Notary"
              buttonTitle="Select"
              Image={require('../../../../assets/service1Pic.png')}
              colors={[Colors.DisableColor, Colors.DisableColor]}
              //   onPress={() => navigation.navigate('LocalNotaryMapScreen')}
            />
            <TypesofServiceButton
              backgroundColor={{backgroundColor: Colors.LightBlue}}
              Title="Remote Online Notary"
              buttonTitle="Selected"
              Image={require('../../../../assets/service2Pic.png')}
              //   onPress={() => navigation.navigate('OnlineNotaryScreen')}
            />
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  heading: {
    fontSize: widthToDp(5.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginHorizontal: widthToDp(5),
  },
  headContainer: {
    marginVertical: widthToDp(3),
  },
});
