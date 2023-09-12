import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';

export default function AgentReviewScreen(props) {
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
      </View>
      <View style={{marginTop: heightToDp(2)}} />
      <BottomSheetStyle>
        <Text>Description</Text>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  contianer: {
    height: '100%',
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
    fontWeight: '600',
  },
  placestyle: {
    // color: Colors.white,
    fontSize: widthToDp(7),
    fontWeight: '900',
    alignSelf: 'center',
  },
  locationStyle: {
    // borderRadius: 20,
    // paddingHorizontal: widthToDp(2),
    // marginHorizontal: widthToDp(0.5),
    backgroundColor: 'transparent',
  },
  star: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
});
