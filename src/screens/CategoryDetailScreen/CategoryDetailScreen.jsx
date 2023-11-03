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
import MultiLineTextInput from '../../components/MultiLineTextInput/MultiLineTextInput';

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
              <TouchableOpacity
                onPress={() => navigation.navigate('LegalDocScreen')}
                style={{position: 'relative'}}>
                <Text style={styles.LongImage}>Legal Documents</Text>
                <Image
                  source={require('../../../assets/legalDocIcon.png')}
                  style={styles.ImageLong}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RealEstateDocScreen')}
                style={{position: 'relative'}}>
                <Text style={styles.ShortImage}>Real Estate Documents</Text>
                <Image
                  source={require('../../../assets/estateDocIcon.png')}
                  style={styles.ImageShort}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.PictureBar}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MedicalDocScreen')}
                style={{position: 'relative'}}>
                <Text style={styles.ShortImage}>Medical Documents</Text>
                <Image
                  source={require('../../../assets/medicalDocIcon.png')}
                  style={styles.ImageShort}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('BusinessDocScreen')}
                style={{position: 'relative'}}>
                <Text style={styles.LongImage}>Business Documents</Text>
                <Image
                  source={require('../../../assets/businessDocIcon.png')}
                  style={styles.ImageLong}
                />
              </TouchableOpacity>
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
    justifyContent: 'space-evenly',
    marginVertical: heightToDp(1),
  },
  column: {
    padding: widthToDp(1), // Column gap
  },
  CategoryPictures: {
    marginVertical: heightToDp(2),
  },
  LongImage: {
    position: 'absolute',
    zIndex: 99,
    margin: widthToDp(2),
    fontSize: widthToDp(5.5),
    marginTop: widthToDp(1),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
    marginRight: widthToDp(20),
  },
  ShortImage: {
    position: 'absolute',
    zIndex: 1,
    margin: widthToDp(2),
    fontSize: widthToDp(4),
    marginTop: widthToDp(1),
    fontFamily: 'Manrope-Bold',
    color: Colors.TextColor,
  },
  ImageShort: {
    width: widthToDp(30),
    height: heightToDp(30),
    borderRadius: 10,
  },
  ImageLong: {
    width: widthToDp(60),
    height: heightToDp(30),
    borderRadius: 10,
  },
});

{
  /* <FlatList
                data={images}
                renderItem={renderItem}
                keyExtractor={() => Math.random().toString()}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
              /> */
}
// const renderItem = ({item, index}) => {
//   let imageSource;
//   let imageStyle;

//   if (index % 2 === 0) {
//     // Even index, render a longer image
//     imageSource = getRandomLongerImage();
//     imageStyle = styles.longImage;
//   } else {
//     // Odd index, render a smaller image
//     imageSource = getRandomSmallerImage();
//     imageStyle = styles.smallImage;
//   }
//   return (
//     <View style={styles.column}>
//       <ImageBackground
//         source={imageSource}
//         imageStyle={{borderRadius: 10}}
//         style={imageStyle}>
//         <Text
//           style={{
//             margin: heightToDp(2),
//             width: widthToDp(30),
//             fontSize: widthToDp(5),
//             fontFamily: 'Manrope-Bold',
//             color: Colors.TextColor,
//           }}>
//           {item.title}
//         </Text>
//       </ImageBackground>
//     </View>
//   );
// };
{
  /* <MultiLineTextInput
            leftImageSoucre={require('../../../assets/NameIcon.png')}
            placeholder={'Enter your first name'}
            Label={true}
            LabelTextInput={'First Name'}
            onChangeText={text => setfirstName(text)}
          /> */
}
