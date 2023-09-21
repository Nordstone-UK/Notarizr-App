import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {ITEM_WIDTH, heightToDp, widthToDp} from '../../utils/Responsive';

export default function RegisterCompletionScreen({navigation}) {
  useEffect(() => {
    const delay = 3000;

    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      });
    }, delay);

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
            Congratulations,{'\n'} you have completed your registration!
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
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(25),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
    width: widthToDp(50),
    height: widthToDp(50),
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: widthToDp(7),
    fontFamily: 'Manrope-Bold',
  },

  complete: {
    alignSelf: 'flex-end',
    width: widthToDp(70),
    resizeMode: 'contain',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
