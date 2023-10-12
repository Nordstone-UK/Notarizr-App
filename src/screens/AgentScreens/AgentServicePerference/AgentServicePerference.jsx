import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import HomeScreenHeader from '../../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../../themes/Colors';
import {heightToDp, widthToDp} from '../../../utils/Responsive';
import BottomSheetStyle from '../../../components/BotttonSheetStyle/BottomSheetStyle';
import AgentHomeHeader from '../../../components/AgentHomeHeader/AgentHomeHeader';
import MainButton from '../../../components/MainGradientButton/MainButton';
import useAgentService from '../../../hooks/useAgentService';

export default function AgentServicePereference({route, navigation}) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = {
    legal: '651edebe6ab4a249f611000d',
    business: '651ede7d6ab4a249f610ffe9',
    medical: '651edeab6ab4a249f6110005',
    estate: '651ede9e6ab4a249f610fffd',
  };
  const {dispatchCategory} = useAgentService();

  const toggleStringInArray = name => {
    const index = selectedCategories.indexOf(name);

    if (index === -1) {
      // If the string is not in the array, add it
      setSelectedCategories([...selectedCategories, name]);
    } else {
      // If the string is in the array, remove it
      const updatedArray = selectedCategories.filter((item, i) => i !== index);
      setSelectedCategories(updatedArray);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <AgentHomeHeader Switch={true} Title="Profile Setup" />
      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>
              Please select your preferred categories
            </Text>
          </View>
          <View style={styles.CategoryPictures}>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                style={styles.pictureCheck}
                onPress={() => toggleStringInArray(categories.legal)}>
                <Image
                  source={require('../../../../assets/legalDocIcon.png')}
                />
                {selectedCategories.includes(categories.legal) && (
                  <Image
                    source={require('../../../../assets/checkIcon.png')}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pictureCheck}
                onPress={() => toggleStringInArray(categories.estate)}>
                <Image
                  source={require('../../../../assets/estateDocIcon.png')}
                />
                {selectedCategories.includes(categories.estate) && (
                  <Image
                    source={require('../../../../assets/checkIcon.png')}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                style={styles.pictureCheck}
                onPress={() => toggleStringInArray(categories.medical)}>
                <Image
                  source={require('../../../../assets/medicalDocIcon.png')}
                />
                {selectedCategories.includes(categories.medical) && (
                  <Image
                    source={require('../../../../assets/checkIcon.png')}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pictureCheck}
                onPress={() => toggleStringInArray(categories.business)}>
                <Image
                  source={require('../../../../assets/businessDocIcon.png')}
                />
                {selectedCategories.includes(categories.business) && (
                  <Image
                    source={require('../../../../assets/checkIcon.png')}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomButton}>
          <View style={styles.flexInput}>
            <MainButton
              Title="Back"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                paddingHorizontal: widthToDp(15),
                paddingVertical: heightToDp(3),
                borderRadius: 5,
              }}
              styles={{
                paddingHorizontal: widthToDp(0),
                paddingVertical: heightToDp(0),
                fontSize: widthToDp(4),
              }}
              onPress={() => navigation.goBack()}
            />
            <MainButton
              Title="Next"
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              GradiStyles={{
                paddingHorizontal: widthToDp(15),
                paddingVertical: heightToDp(3),
                borderRadius: 5,
              }}
              styles={{
                paddingHorizontal: widthToDp(0),
                paddingVertical: heightToDp(0),
                fontSize: widthToDp(4),
              }}
              onPress={() => dispatchCategory(selectedCategories)}
            />
          </View>
        </View>
      </BottomSheetStyle>
    </SafeAreaView>
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
  pictureCheck: {
    position: 'relative',
  },
  checkIcon: {
    position: 'absolute',
    right: widthToDp(2),
    top: widthToDp(2),
  },
  flexInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: widthToDp(4),
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: heightToDp(5),
  },
});
