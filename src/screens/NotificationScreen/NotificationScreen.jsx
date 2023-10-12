import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';

import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import GradientButton from '../../components/MainGradientButton/GradientButton';
export default function NotificationScreen({navigation}) {
  const [notification, setNotification] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Notfications" />
      <BottomSheetStyle>
        {notification ? (
          <ScrollView scrollEnabled={true}></ScrollView>
        ) : (
          <ImageBackground
            source={require('../../../assets/Group.png')}
            style={styles.backImage}>
            <Image
              source={require('../../../assets/completedIcon.png')}
              style={styles.image}
            />
            <Text style={styles.HeadingText}>
              Hooray! You have no new notifications.
            </Text>
          </ImageBackground>
        )}
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  backImage: {
    flex: 1,
    alignItems: 'center',
    resizeMode: 'contain',
  },
  image: {
    width: widthToDp(50),
    height: heightToDp(50),
    marginTop: heightToDp(25),
  },
  HeadingText: {
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    fontSize: widthToDp(7),
    textAlign: 'center',
  },
});
