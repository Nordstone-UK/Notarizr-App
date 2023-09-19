import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {Linking} from 'react-native';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';

export default function CategoryDetailScreen({navigation}) {
  return (
    <View style={styles.container}>
      <NavigationHeader
        Title="Categories"
        midImg={require('../../../assets/Search.png')}
        lastImg={require('../../../assets/bellIcon.png')}
      />

      <View style={{marginHorizontal: widthToDp(3)}}>
        <Text style={styles.Heading}>
          Find all the services offered by Notarizr
        </Text>
        <LabelTextInput
          leftImageSoucre={require('../../../assets/Search.png')}
          placeholder={'Search'}
          InputStyles={{
            padding: widthToDp(2),
          }}
        />
      </View>
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Categories</Text>
          </View>
          <View style={styles.CategoryPictures}>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LegalDocScreen')}>
                <Image source={require('../../../assets/legalDocIcon.png')} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RealEstateDocScreen')}>
                <Image source={require('../../../assets/estateDocIcon.png')} />
              </TouchableOpacity>
            </View>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MainBookingScreen', {
                    name: 'Medical Documents',
                  })
                }>
                <Image source={require('../../../assets/medicalDocIcon.png')} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('BusinessDocScreen')}>
                <Image
                  source={require('../../../assets/businessDocIcon.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  Heading: {
    fontSize: widthToDp(6.5),
    fontWeight: '700',
    color: Colors.TextColor,
    paddingLeft: widthToDp(2),
  },
  contentContainer: {
    paddingVertical: heightToDp(5),
  },
  subheading: {
    fontSize: widthToDp(4),
    fontWeight: '700',
    color: Colors.TextColor,
    alignSelf: 'center',
    paddingRight: widthToDp(2),
  },
  CategoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: heightToDp(3),
    marginHorizontal: widthToDp(5),
  },
  PictureBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(1),
  },
  CategoryPictures: {
    marginVertical: heightToDp(2),
  },
});
