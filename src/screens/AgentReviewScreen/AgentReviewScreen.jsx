import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
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

export default function AgentReviewScreen({navigation}, props) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  const name = 'Advocate Mary Smith';
  const [firstWord, secondWord] = separateStringAfterFirstWord(name);
  function separateStringAfterFirstWord(inputString) {
    const words = inputString.split(' ');

    if (words.length > 1) {
      const firstWord = words[0];
      const restOfTheString = words.slice(1).join(' ');
      return [firstWord, restOfTheString];
    } else {
      return [inputString, ''];
    }
  }
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
    <View style={styles.contianer}>
      <NavigationHeader Title="Agent Review" />
      <ScrollView>
        <Image
          source={require('../../../assets/agentReview.png')}
          style={styles.picture}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{firstWord}</Text>
          <Text style={styles.name}>{secondWord}</Text>
          <GradientText style={styles.placestyle}>5.0</GradientText>
          <Image
            source={require('../../../assets/orangeStar.png')}
            style={styles.star}
          />
          <Text style={styles.rating}>Rating</Text>
        </View>
        <View style={{marginTop: heightToDp(2)}} />
        <BottomSheetStyle>
          <View style={styles.sheetContainer}>
            <Text style={styles.heading}>Description</Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences.
            </Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences.
            </Text>
            <Text style={styles.preference}>
              Please provide us with your booking preferences.
            </Text>
            <View style={styles.addressView}>
              <Image
                source={require('../../../assets/locationIcon.png')}
                style={styles.locationImage}
              />
              <Text style={styles.detail}>
                Legal building, James street, New York
              </Text>
            </View>
          </View>
          <View style={styles.button}>
            <GradientButton
              Title="Book Now"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              onPress={() => navigation.navigate('AgentBookCompletion')}
            />
          </View>
        </BottomSheetStyle>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contianer: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  picture: {
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
