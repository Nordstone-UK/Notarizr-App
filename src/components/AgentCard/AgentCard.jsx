import {StyleSheet, Text, Image, View} from 'react-native';
import React from 'react';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import LinearGradient from 'react-native-linear-gradient';
import AgentCardPicture from '../AgentCardPicture/AgentCardPicture';

export default function AgentCard(props) {
  const OrangeGradient = string => {
    return (
      <LinearGradient
        style={styles.locationStyle}
        colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text style={styles.placestyle}>{string}</Text>
      </LinearGradient>
    );
  };
  return (
    <View style={styles.cardContainer}>
      <View style={{flexDirection: 'row'}}>
        <View style={{paddingHorizontal: widthToDp(2)}}>
          <AgentCardPicture />
        </View>
        <View
          style={{
            paddingVertical: heightToDp(2),
            paddingHorizontal: widthToDp(2),
          }}>
          <Text style={styles.nameHeading}>
            Advocate{'\n'}Parimal M. Trivedi
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'nowrap',
            }}>
            <Image source={require('../../../assets/locationIcon.png')} />
            {OrangeGradient('At Office')}
            <View>
              <Text style={styles.address}>Shop 28, jigara Kalawad Road</Text>
            </View>
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
    borderColor: '#1212',
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: widthToDp(5),
    paddingTop: heightToDp(2),
    paddingBottom: heightToDp(4),
    marginHorizontal: heightToDp(2),
  },
  nameHeading: {
    fontSize: widthToDp(5),
    width: widthToDp(50),
    paddingVertical: heightToDp(2),
    color: Colors.TextColor,
    fontWeight: '700',
  },
  dateContainer: {
    position: 'absolute',
    bottom: heightToDp(-2),
    paddingHorizontal: widthToDp(6.5),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginLeft: widthToDp(1.5),
    alignItems: 'center',
  },
  ImageProces: {
    color: '#fff',
    backgroundColor: Colors.CardProcessColor,
    fontWeight: '700',
    fontSize: widthToDp(4),
    paddingHorizontal: widthToDp(2.7),
    position: 'absolute',
    marginLeft: widthToDp(1.5),
    bottom: heightToDp(19),
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
    fontSize: widthToDp(4),
    width: widthToDp(40),
  },
  placestyle: {
    color: Colors.white,
    fontSize: widthToDp(4),
  },
  locationStyle: {
    borderRadius: 20,
    paddingHorizontal: widthToDp(2),
    marginHorizontal: widthToDp(0.5),
    height: heightToDp(6),
  },
  orangeline: {
    borderBottomWidth: 1,
    borderColor: Colors.Orange,
    width: widthToDp(70),
    right: widthToDp(6),
    zIndex: -1,
    paddingVertical: heightToDp(2),
  },
  totalStyles: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
  },
  paymentStyle: {
    color: Colors.TextColor,
    fontSize: widthToDp(6),
    fontWeight: '800',
    marginRight: widthToDp(10),
  },
});
