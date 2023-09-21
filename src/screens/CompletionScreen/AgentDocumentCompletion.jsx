import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function AgentDocumentCompletion({navigation}) {
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
            Congratulations,{'\n'} for creating your account, we will review
            your documents and update your registration status
          </Text>
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
    marginTop: heightToDp(20),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    width: widthToDp(50),
    height: widthToDp(50),
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontFamily: 'Manrope-Bold',
  },

  complete: {
    // borderWidth: 1,
    alignSelf: 'flex-end',
    width: widthToDp(70),
    resizeMode: 'contain',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
