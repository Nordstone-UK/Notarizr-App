import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import SplashScreen from 'react-native-splash-screen';
import useCreateBooking from '../../hooks/useCreateBooking';

export default function LocalNotaryAgentReview({route, navigation}, props) {
  const {consoleData} = useCreateBooking();
  const {description, documentType} = route.params;
  const {agent} = description;
  console.log('agent', description);

  useEffect(() => {}, []);

  const GradientText = props => {
    return (
      <MaskedView maskElement={<Text {...props} />}>
        <LinearGradient
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <Text {...props} style={[props.style, {opacity: 0}]} />
        </LinearGradient>
      </MaskedView>
    );
  };
  return (
    <SafeAreaView style={styles.contianer}>
      <NavigationHeader Title="Agent Review" />
      <ScrollView contentContainerStyle={{flex: 1}}>
        <Image source={{uri: agent.profile_picture}} style={styles.picture} />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {agent.first_name} {agent.last_name}
          </Text>
          <GradientText style={styles.placestyle}>
            {agent.rating || '4.0'}
          </GradientText>
          <Image
            source={require('../../../assets/orangeStar.png')}
            style={styles.star}
          />
          <Text style={styles.rating}>Rating</Text>
        </View>
        <View style={{marginTop: heightToDp(2)}} />
        <BottomSheetStyle>
          <ScrollView contentContainerStyle={{flex: 1}}>
            <View style={styles.sheetContainer}>
              <Text style={styles.heading}>Description</Text>
              <Text style={styles.preference}>Email : {agent.email}</Text>
              <Text style={styles.preference}>
                Availability : {description.availability.startTime} to{' '}
                {description.availability.endTime}
              </Text>
              <View>
                <Text style={styles.preference}>Weekdays : </Text>
                <FlatList
                  horizontal
                  data={description.availability.weekdays}
                  renderItem={({item}) => (
                    <Text style={styles.preference}>{item.toUpperCase()}</Text>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
              <View style={styles.addressView}>
                <Image
                  source={require('../../../assets/locationIcon.png')}
                  style={styles.locationImage}
                />
                <Text style={styles.detail}>{agent.location}</Text>
              </View>
            </View>
            <View style={styles.button}>
              <GradientButton
                Title="Select"
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                onPress={() =>
                  navigation.navigate('LocalNotaryDateScreen', {
                    description: description,
                    documentType: documentType,
                  })
                }
              />
            </View>
          </ScrollView>
        </BottomSheetStyle>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contianer: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  picture: {
    width: widthToDp(40),
    height: heightToDp(40),
    alignSelf: 'center',
  },
  nameContainer: {
    marginVertical: heightToDp(2),
    alignSelf: 'center',
  },
  name: {
    alignSelf: 'center',
    fontSize: widthToDp(7),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
  placestyle: {
    fontSize: widthToDp(7),
    fontWeight: '900',
    alignSelf: 'center',
  },
  heading: {
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    marginLeft: widthToDp(3),
    fontFamily: 'Manrope-Bold',
  },
  rating: {
    alignSelf: 'center',
    marginLeft: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
  },
  preference: {
    marginLeft: widthToDp(3),
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Regular',
  },
  star: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  sheetContainer: {
    marginTop: heightToDp(4),
  },
  locationImage: {
    tintColor: Colors.Black,
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightToDp(8),
    marginLeft: widthToDp(4),
  },
  detail: {
    marginLeft: widthToDp(2),
    marginVertical: widthToDp(2),
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Regular',
    color: Colors.DullTextColor,
  },
  button: {
    flex: 1,
    justifyContent: 'flex-end',
    marginVertical: widthToDp(5),
  },
});

// onPress={() => navigation.navigate('LocalNotaryDateScreen')}
