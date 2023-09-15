import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import MainButton from '../../../components/MainGradientButton/MainButton';
import ClientServiceCard from '../../../components/ClientServiceCard/ClientServiceCard';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import Colors from '../../../themes/Colors';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';

export default function AgentAllBookingScreen({navigation}) {
  const [isFocused, setIsFocused] = useState('Active');

  return (
    <View style={styles.container}>
      <AgentHomeHeader
        Title="One Click and Select our services."
        SearchEnabled={true}
      />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              alignContent: 'center',
              marginBottom: widthToDp(2),
            }}>
            <MainButton
              Title="Active"
              colors={
                isFocused === 'Active'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'Active'
                  ? {
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
                  : {
                      color: Colors.DullTextColor,
                      paddingHorizontal: widthToDp(2),
                      paddingVertical: widthToDp(1),
                      fontSize: widthToDp(5),
                    }
              }
              onPress={() => setIsFocused('Active')}
            />
            <MainButton
              Title="Completed"
              colors={
                isFocused === 'Complete'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'Complete'
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
              onPress={() => setIsFocused('Complete')}
            />
            <MainButton
              Title="Rejected"
              colors={
                isFocused === 'Rejected'
                  ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                  : [Colors.DisableColor, Colors.DisableColor]
              }
              styles={
                isFocused === 'Rejected'
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
              onPress={() => setIsFocused('Rejected')}
            />
          </View>
          {isFocused === 'Active' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
            />
          )}
          {isFocused === 'Active' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              WorkStatus="In Progress"
            />
          )}
          {isFocused === 'Complete' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              WorkStatus="Completed"
            />
          )}
          {isFocused === 'Complete' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              WorkStatus="Completed"
            />
          )}
          {isFocused === 'Rejected' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              time={true}
              Canceled={true}
            />
          )}
          {isFocused === 'Rejected' && (
            <ClientServiceCard
              image={require('../../../../assets/agentLocation.png')}
              source={require('../../../../assets/maleAgentPic.png')}
              bottomLeftText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Mobile"
              OrangeText="At Home"
              Work={true}
              Canceled={true}
            />
          )}
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
  Heading: {
    fontSize: widthToDp(6.5),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    paddingLeft: widthToDp(2),
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
  subheading: {
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    alignSelf: 'center',
    paddingRight: widthToDp(2),
  },
  CategoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: heightToDp(3),
  },
  PictureBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(1),
  },
  CategoryPictures: {
    marginVertical: heightToDp(2),
  },
});
