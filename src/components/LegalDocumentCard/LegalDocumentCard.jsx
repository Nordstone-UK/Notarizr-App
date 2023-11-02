import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function LegalDocumentCard(props) {
  return (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
      <Image source={props?.source} style={styles.cardPic} />
      <View style={styles.nameContainer}>
        <Text
          style={[
            styles.textstyle,
            props.searchQuery && {backgroundColor: 'yellow'},
          ]}>
          {props.Title}
        </Text>
        <Text style={styles.pricestyles}>${props.Price || `350`}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginVertical: widthToDp(2),
    marginHorizontal: widthToDp(3),
    borderRadius: 10,
    alignItems: 'center',
    padding: widthToDp(1),
    elevation: 30,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: widthToDp(70),
  },
  cardPic: {
    width: widthToDp(),
    height: widthToDp(20),
    resizeMode: 'contain',
    marginVertical: widthToDp(1),
    padding: widthToDp(10),
  },
  textstyle: {
    fontSize: widthToDp(4.5),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    marginLeft: widthToDp(2),
  },
  pricestyles: {
    fontSize: widthToDp(4),
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
  },
});
