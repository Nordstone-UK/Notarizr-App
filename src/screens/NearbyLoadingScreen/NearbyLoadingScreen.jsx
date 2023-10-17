import {Image, StyleSheet, Text, SafeAreaView} from 'react-native';
import React, {useEffect} from 'react';
import Colors from '../../themes/Colors';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import useGetService from '../../hooks/useGetService';

export default function NearbyLoadingScreen({route, navigation}) {
  const {documentType} = route.params;
  const {RONfetchAPI} = useGetService();

  useEffect(() => {
    RONfetchAPI(documentType);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Loading" />
      <Image
        source={require('../../../assets/Loading.png')}
        style={styles.loading}
      />
      <Text style={styles.heading}>Wait for the available agents</Text>
      <Text style={styles.subhheading}>We will automatically match agents</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  loading: {
    alignSelf: 'center',
  },
  heading: {
    alignSelf: 'center',
    marginTop: heightToDp(5),
    fontSize: widthToDp(7),
    fontFamily: 'Manrop-Bold',
    color: Colors.TextColor,
    width: widthToDp(80),
    textAlign: 'center',
  },
  subhheading: {
    alignSelf: 'center',
    marginTop: heightToDp(5),
    fontSize: widthToDp(5),
    fontFamily: 'Manrop-Bold',
    color: Colors.TextColor,
    textAlign: 'center',
  },
});
