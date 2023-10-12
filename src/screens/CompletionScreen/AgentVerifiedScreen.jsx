import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgentVerfiedScreen({navigation}) {
  const clearTokenFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('token');
      console.log('Token cleared from AsyncStorage');
    } catch (error) {
      console.error('Error clearing token from AsyncStorage:', error);
    }
  };
  const handleLogout = () => {
    clearTokenFromStorage();
    navigation.reset({
      index: 0,
      routes: [{name: 'LoginScreen'}],
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.completeIcon}>
        <Image
          source={require('../../../assets/question.png')}
          style={styles.icon}
        />
        <Text style={styles.text}>
          Please Wait, {'\n'} your application is being reviewed.
        </Text>
        <TouchableOpacity onPress={() => handleLogout()}>
          <Image
            source={require('../../../assets/logout.png')}
            style={styles.complete}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  completeIcon: {
    marginTop: heightToDp(25),
  },
  groupimage: {
    flex: 1,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: heightToDp(2),
    width: widthToDp(50),
    height: widthToDp(50),
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
    color: Colors.TextColor,
    fontSize: widthToDp(7),
    fontFamily: 'Manrope-Bold',
  },
  complete: {
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});
