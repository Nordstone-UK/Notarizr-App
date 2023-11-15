import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
// import LabelTextInput from '../LabelTextInput/LabelTextInput';
// import GradientButton from '../MainGradientButton/GradientButton';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';

export default function UploadDocsSheet(props) {
  return (
    <View style={styles.bottonSheet}>
      <TouchableOpacity onPress={props.SignaturePagePress}>
        <Text style={styles.text}>Signature Page</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={props.NotaryBlockPress}>
        <Text style={styles.text}>Notary Block</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={props.NotaryBlockPress}>
        <Text style={[styles.text, {color: Colors.Red}]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottonSheet: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  text: {
    marginVertical: heightToDp(3),
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-SemiBold',
    alignSelf: 'center',
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  coloredStar: {
    fontSize: 30,
    marginRight: 10,
    color: 'yellow',
  },
  transparentStar: {
    fontSize: 30,
    marginRight: 10,
    color: 'transparent',
  },
});
