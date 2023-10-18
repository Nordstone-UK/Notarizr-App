import {
  Image,
  StyleSheet,
  ImageBackground,
  Text,
  ScrollView,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import HomeScreenHeader from '../../components/HomeScreenHeader/HomeScreenHeader';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import {Linking} from 'react-native';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';

export default function CategoryDetailScreen({navigation}) {
  const images = [
    'legalDocIcon',
    'estateDocIcon',
    'medicalDocIcon',
    'businessDocIcon',
  ];
  const getRandomLongerImage = () => {
    const longerImages = ['legalDocIcon', 'businessDocIcon'];
    const randomIndex = Math.floor(Math.random() * longerImages.length);
    const imageName = longerImages[randomIndex];
    return getImageSource(imageName);
  };

  const getRandomSmallerImage = () => {
    const smallerImages = ['estateDocIcon', 'medicalDocIcon'];
    const randomIndex = Math.floor(Math.random() * smallerImages.length);
    const imageName = smallerImages[randomIndex];
    return getImageSource(imageName);
  };
  const getImageSource = imageName => {
    switch (imageName) {
      case 'legalDocIcon':
        return require('../../../assets/legalDocIcon.png');
      case 'estateDocIcon':
        return require('../../../assets/estateDocIcon.png');
      case 'medicalDocIcon':
        return require('../../../assets/medicalDocIcon.png');
      case 'businessDocIcon':
        return require('../../../assets/businessDocIcon.png');
      default:
        return require('../../../assets/legalDocIcon.png'); // Return a default image source or handle the case as per your requirements
    }
  };
  const renderItem = ({item, index}) => {
    let imageSource;
    let imageStyle;

    if (index % 2 === 0) {
      // Even index, render a longer image
      imageSource = getRandomLongerImage();
      imageStyle = styles.longImage;
    } else {
      // Odd index, render a smaller image
      imageSource = getRandomSmallerImage();
      imageStyle = styles.smallImage;
    }
    return (
      <View style={styles.column}>
        <ImageBackground
          source={imageSource}
          imageStyle={{borderRadius: 10}}
          style={imageStyle}>
          <Text
            style={{
              margin: heightToDp(2),
              width: widthToDp(30),
              fontSize: widthToDp(5),
              fontFamily: 'Manrope-Bold',
              color: Colors.TextColor,
            }}>
            {item.title}
          </Text>
        </ImageBackground>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Categories" />
      <View style={{marginHorizontal: widthToDp(3)}}>
        <Text style={styles.Heading}>
          Find all the services offered by Notarizr
        </Text>
      </View>
      <BottomSheetStyle>
        <View
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.CategoryBar}>
            <Text style={styles.Heading}>Categories</Text>
          </View>
          <View style={styles.CategoryPictures}>
            <View style={styles.PictureBar}>
              <FlatList
                data={images}
                renderItem={renderItem}
                keyExtractor={() => Math.random().toString()}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
              />
              {/* <View style={styles.column}>
                <ImageBackground
                  source={require('../../../assets/legalDocIcon.png')}
                  imageStyle={{resizeMode: 'cover', borderRadius: 10}}
                  style={{
                    flex: 1,
                    width: widthToDp(60),
                    height: heightToDp(30),
                  }}>
                  <Text
                    style={{
                      margin: heightToDp(2),
                      width: widthToDp(30),
                      fontSize: widthToDp(5),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Legal Documents
                  </Text>
                </ImageBackground>
              </View>
              <View style={styles.column}>
                <ImageBackground
                  source={require('../../../assets/estateDocIcon.png')}
                  imageStyle={{resizeMode: 'cover', borderRadius: 10}}
                  style={{
                    width: widthToDp(30),
                    height: heightToDp(30),
                  }}>
                  <Text
                    style={{
                      margin: heightToDp(2),
                      fontSize: widthToDp(4),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Legal Documents
                  </Text>
                </ImageBackground>
              </View>
              <View style={styles.column}>
                <ImageBackground
                  source={require('../../../assets/medicalDocIcon.png')}
                  imageStyle={{resizeMode: 'cover', borderRadius: 10}}
                  style={{
                    width: widthToDp(30),
                    height: heightToDp(30),
                    borderRadius: 20,
                  }}>
                  <Text
                    style={{
                      margin: heightToDp(2),
                      width: widthToDp(30),
                      fontSize: widthToDp(4),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Legal Documents
                  </Text>
                </ImageBackground>
              </View>
              <View style={styles.column}>
                <ImageBackground
                  source={require('../../../assets/businessDocIcon.png')}
                  imageStyle={{resizeMode: 'cover', borderRadius: 10}}
                  style={{
                    width: widthToDp(60),
                    height: heightToDp(30),
                    borderRadius: 20,
                  }}>
                  <Text
                    style={{
                      margin: heightToDp(2),
                      width: widthToDp(30),
                      fontSize: widthToDp(5),
                      fontFamily: 'Manrope-Bold',
                      color: Colors.TextColor,
                    }}>
                    Legal Documents
                  </Text>
                </ImageBackground>
              </View> */}
            </View>
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
  columnWrapper: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    justifyContent: 'left',
    marginVertical: heightToDp(1),
    flexWrap: 'wrap',
    margin: 10,
  },
  column: {
    padding: widthToDp(1), // Column gap
  },
  CategoryPictures: {
    marginVertical: heightToDp(2),
  },
  smallImage: {
    flex: 1,
    height: heightToDp(30),
    width: widthToDp(30),
  },
  longImage: {
    flex: 1,
    height: heightToDp(30),
    width: widthToDp(60),
  },
});
