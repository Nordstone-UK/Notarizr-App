import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function CompletionScreen(props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Group.png')}
        style={styles.groupimage}
      />
      <View style={styles.completeIcon}>
        <Image source={props.Icon} style={styles.icon} />
        {/* Add an Icon path on this tag */}
        <Text style={styles.text}>{props.Title || null}</Text>
        {/* Add an text on this tag */}
      </View>
      <Image
        source={require('../../../assets/complete.png')}
        style={styles.complete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.PinkBackground,
    position: 'relative',
  },
  completeIcon: {
    position: 'absolute',
    alignSelf: 'center',
    marginTop: heightToDp(15),
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
  },
  text: {
    marginHorizontal: widthToDp(22),
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: 24,
    fontWeight: '700',
  },
  complete: {
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: heightToDp(2),
  },
});
