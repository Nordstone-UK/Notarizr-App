import {StyleSheet, Text, View, Image, ImageBackground} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function CompletionScreen(props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/Group.png')}
        style={styles.groupimage}>
        <View style={styles.completeIcon}>
          {props.iconImage && (
            <Image source={props.iconImage} style={styles.icon} />
          )}
          {/* Add an Icon path on this tag */}
          {props.Title && <Text style={styles.text}>{props.Title}</Text>}
          {/* Add an text on this tag */}
          {props.subHeading && (
            <Text style={styles.subheading}>{props.subHeading}</Text>
          )}
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
    marginTop: heightToDp(15),
  },
  groupimage: {
    height: '100%',
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  text: {
    marginHorizontal: widthToDp(22),
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: 35,
    fontWeight: '700',
  },
  subheading: {
    marginHorizontal: widthToDp(22),
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: 18,
    fontWeight: '600',
  },
  complete: {
    alignSelf: 'flex-end',
    position: 'absolute',
    top: heightToDp(120),
  },
});
