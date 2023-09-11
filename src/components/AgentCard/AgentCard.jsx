import {StyleSheet, Text, Image, View} from 'react-native';
import React from 'react';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LinearGradient from 'react-native-linear-gradient';

export default function AgentCard(props) {
  return (
    <View style={styles.cardContainer}>
      <View style={{flexDirection: 'row'}}>
        <Image
          source={require('../../../assets/agentCardPic.png')}
          style={styles.cardImage}
        />
        <Text style={styles.ImageProces}>On Process</Text>
        <LinearGradient
          style={styles.dateContainer}
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <Text style={styles.dateStyle}>12:30</Text>
          <Text style={styles.dateStyle}>22</Text>
          <Text style={styles.dateStyle}>Sep</Text>
        </LinearGradient>
        <View>
          <Text style={styles.nameHeading}>Advocate Parimal M. Trivedi</Text>
          <View style={{flexDirection: 'row'}}>
            <Image source={require('../../../assets/locationIcon.png')} />

            <View>
              <LinearGradient
                style={styles.locationStyle}
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Text style={styles.placestyle}>At Office</Text>
              </LinearGradient>
            </View>
            <Text style={styles.address}>
              Shop 28, {'\n'} jigara Kalawad Road
            </Text>
          </View>
          <View style={styles.orangeline} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: heightToDp(5),
            }}>
            <Text style={styles.totalStyles}>Total</Text>
            <Text style={styles.paymentStyle}>$400</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 10,
    margin: widthToDp(5),
    paddingVertical: heightToDp(5),
    marginHorizontal: heightToDp(2),
  },
  nameHeading: {
    fontSize: widthToDp(6),
    width: widthToDp(60),
    color: Colors.TextColor,
    fontWeight: '700',
  },
  dateContainer: {
    position: 'absolute',
    bottom: 10,
    paddingHorizontal: widthToDp(6.5),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginLeft: widthToDp(1.5),
    alignItems: 'center',
  },
  ImageProces: {
    color: '#fff',
    backgroundColor: Colors.CardProcessColor,
    fontWeight: '600',
    fontSize: widthToDp(5),
    position: 'absolute',
    marginLeft: widthToDp(1.5),
    bottom: heightToDp(22),
  },
  cardImage: {
    margin: widthToDp(1.5),
    width: widthToDp(26),
  },
  dateStyle: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: widthToDp(5),
  },
  address: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    // width: widthToDp(50),
  },
  placestyle: {
    color: Colors.white,
    fontSize: widthToDp(5),
  },
  locationStyle: {
    borderRadius: 10,
    paddingHorizontal: widthToDp(2),
  },
  orangeline: {
    borderBottomWidth: 2,
    borderColor: Colors.Orange,
    width: widthToDp(70),
    right: widthToDp(4),
    zIndex: -1,
    paddingVertical: heightToDp(2),
  },
  totalStyles: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontWeight: '600',
  },
  paymentStyle: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '800',
    marginRight: widthToDp(15),
  },
});
