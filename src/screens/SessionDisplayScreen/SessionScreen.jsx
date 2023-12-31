import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import AcceptAgentCard from '../../components/AcceptAgentCard/AcceptAgentCard';

export default function SessionScreen({navigation}) {
  const [isFocused, setIsFocused] = useState('All');

  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader Title="Find all your bookings with our agents here" />
      <BottomSheetStyle>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            contentContainerStyle={{
              paddingHorizontal: widthToDp(3),
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                columnGap: widthToDp(3),
              }}>
              <MainButton
                Title="All"
                colors={
                  isFocused === 'All'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={[
                  {minWidth: widthToDp(20)},
                  isFocused === 'All'
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
                      },
                ]}
                onPress={() => setIsFocused('All')}
              />
              <MainButton
                Title="Active"
                colors={
                  isFocused === 'Active'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={[
                  {minWidth: widthToDp(20)},
                  isFocused === 'Active'
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
                      },
                ]}
                onPress={() => setIsFocused('Active')}
              />
              <MainButton
                Title="Completed"
                colors={
                  isFocused === 'Complete'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={[
                  {minWidth: widthToDp(20)},
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
                      },
                ]}
                onPress={() => setIsFocused('Complete')}
              />
              <MainButton
                Title="Rejected"
                colors={
                  isFocused === 'Rejected'
                    ? [Colors.OrangeGradientStart, Colors.OrangeGradientEnd]
                    : [Colors.DisableColor, Colors.DisableColor]
                }
                styles={[
                  {minWidth: widthToDp(20)},
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
                      },
                ]}
                onPress={() => setIsFocused('Rejected')}
              />
            </View>
          </ScrollView>
          {(isFocused === 'Active' || isFocused === 'All') && (
            <AcceptAgentCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/maleAgentPic.png')}
              bottomRightText="$400"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Online"
              Button={true}
              onPress={() => navigation.navigate('OnlineSessionDetail')}
            />
          )}
          {(isFocused === 'Active' || isFocused === 'All') && (
            <AcceptAgentCard
              image={require('../../../assets/agentLocation.png')}
              source={require('../../../assets/maleAgentPic.png')}
              bottomRightText="$350"
              agentName={'Bunny Joel'}
              agentAddress={'Shop 28, jigara Kalakand Road'}
              task="Online"
              Button={true}
              onPress={() => navigation.navigate('OnlineSessionDetail')}
            />
          )}
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
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
});
