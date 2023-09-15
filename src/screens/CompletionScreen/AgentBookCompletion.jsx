import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function AgentBookCompletion({navigation}) {
  useEffect(() => {
    const delay = 3000;

    const timer = setTimeout(() => {
      navigation.navigate('HomeScreen');
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
            Congratulations,{'\n'} you have booked an agent!
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
