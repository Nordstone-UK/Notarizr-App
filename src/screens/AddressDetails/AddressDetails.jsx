import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, {useEffect} from 'react';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import Colors from '../../themes/Colors';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import AddressCard from '../../components/AddressCard/AddressCard';
import useFetchUser from '../../hooks/useFetchUser';
import {useSelector} from 'react-redux';

export default function AddressDetails({navigation}) {
  const {fetchUserInfo} = useFetchUser();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Home screen sending...');
      fetchUserInfo();
    });
    return unsubscribe;
  }, [navigation]);
  const {location} = useSelector(state => state.user.user);
  console.log(location);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Address" />
      <Text style={styles.textheading}>Please find all your addresses</Text>
      <BottomSheetStyle>
        <AddressCard location={location} />
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <GradientButton
            Title="Add Address"
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            GradiStyles={{borderRadius: 15}}
            onPress={() => navigation.navigate('NewAddressScreen')}
          />
        </View>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
    marginBottom: widthToDp(8),
  },
  picture: {
    alignSelf: 'center',
    marginVertical: heightToDp(25),
  },
  iconContainer: {
    flexDirection: 'row',
    margin: widthToDp(4),
    justifyContent: 'flex-start',
  },
  icon: {
    marginHorizontal: widthToDp(2),
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    width: widthToDp(80),
    marginBottom: heightToDp(3),
    textAlign: 'center',
  },
});
