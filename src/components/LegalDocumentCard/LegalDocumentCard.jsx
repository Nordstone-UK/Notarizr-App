import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function LegalDocumentCard(props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/agentReactanelPic.png')}
        style={styles.cardPic}
      />
      <Text style={styles.textstyle}>{props.Title}</Text>
      <Text style={styles.pricestyles}>{props.Price || `$350`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderColor: Colors.DisableColor,
    margin: widthToDp(2),
    borderRadius: 10,
    borderWidth: 2,
    // justifyContent: 'space-between',
    alignItems: 'center',
    padding: widthToDp(3),
  },
  cardPic: {
    marginVertical: widthToDp(1),
    padding: widthToDp(12),
  },
  textstyle: {
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    fontWeight: '700',
    marginLeft: widthToDp(2),
  },
  pricestyles: {
    fontSize: widthToDp(5),
    color: Colors.TextColor,
    fontWeight: '700',
    marginLeft: widthToDp(10),
  },
});
