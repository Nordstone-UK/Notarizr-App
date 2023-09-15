import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function PaymentCompletionScreen(props) {
  const message = 'Congratulations, your booking is completed!';
  const [firstMsg, secondMsg] = separateStringAfterFirstWord(message);
  function separateStringAfterFirstWord(inputString) {
    const words = inputString.split(' ');

    if (words.length > 1) {
      const firstWord = words[0];
      const restOfTheString = words.slice(1).join(' ');
      return [firstWord, restOfTheString];
    } else {
      // If there is only one word, return it as the first part and an empty string as the second part.
      return [inputString, ''];
    }
  }
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/Group.png')}
        style={styles.groupimage}>
        <View style={styles.completeIcon}>
          <Image
            source={require('../../../assets/completedIcon.png')}
            style={styles.icon}
          />

          <Text style={styles.text}>{firstMsg}</Text>
          <Text style={styles.text}>{secondMsg}</Text>
        </View>
        <Image
          source={require('../../../assets/complete.png')}
          style={styles.complete}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(30),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  text: {
    // marginHorizontal: widthToDp(21),
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: 25,
    fontWeight: '700',
  },

  complete: {
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
});
