import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function RegisterCompletionScreen({navigation}) {
  useEffect(() => {
    // Delay in milliseconds (e.g., 3000ms = 3 seconds)
    const delay = 3000;

    const timer = setTimeout(() => {
      // Navigate to SecondScreen after the specified delay
      navigation.navigate('HomeScreen');
    }, delay);

    // Clear the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [navigation]);
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

          <Text style={styles.text}>
            Congratulations, you have completed your registration!
          </Text>

          {/* <Text style={styles.subheading}>THE OPAL GORUP</Text> */}
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
    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(30),
  },
  groupimage: {
    height: '100%',
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  text: {
    marginHorizontal: widthToDp(21),
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: 25,
    fontWeight: '700',
  },

  complete: {
    alignSelf: 'flex-end',
    position: 'absolute',
    top: heightToDp(120),
  },
});
