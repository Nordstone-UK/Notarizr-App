import {
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  View,
} from 'react-native';
import React, {useState} from 'react';
import SignupButton from '../../components/SingupButton.jsx/SignupButton';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import MainButton from '../../components/MainGradientButton/MainButton';
import {height, heightToDp, width, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import AgentCard from '../../components/AgentCard/AgentCard';
import LegalDocumentCard from '../../components/LegalDocumentCard/LegalDocumentCard';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import ReviewPopup from '../../components/ReviewPopup/ReviewPopup';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useSession} from '../../hooks/useSession';
import Toast from 'react-native-toast-message';

export default function AddObserverScreen({route, navigation}) {
  const {bookingId} = route.params;
  const {handleAddObservers} = useSession();
  const [email, setEmail] = useState();
  const [observerEmail, setObserverEmail] = useState([]);
  const [loading, setLoading] = useState(false);
  const addTextToArray = text => {
    setObserverEmail(prevs => [...prevs, text]);
    setEmail();
  };
  const sendAddObservers = async () => {
    setLoading(true);
    const response = await handleAddObservers(bookingId, observerEmail);
    setLoading(false);
    if (response?.status === '200') {
      Toast.show({
        type: 'success',
        text1: 'Observer added successfully',
      });
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Observer not added',
      });
    }
  };
  const removeItem = index => {
    const updatedList = [...observerEmail];
    updatedList.splice(index, 1);
    setObserverEmail(updatedList);
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Add Observers" />

      <BottomSheetStyle>
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.headingContainer}>
            <Text style={styles.lightHeading}>
              Add observers in your RON session
            </Text>
            <Text style={styles.smallHead}>
              You can add more than one observers
            </Text>
            <View
              style={{marginTop: heightToDp(4), marginBottom: heightToDp(2)}}>
              <LabelTextInput
                leftImageSoucre={require('../../../assets/EmailIcon.png')}
                placeholder={'Enter your observers email'}
                LabelTextInput={'Email Address'}
                defaultValue={email}
                onChangeText={text => setEmail(text)}
                keyboardType={'email-address'}
                Label={true}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: widthToDp(6),
                columnGap: widthToDp(2),
                rowGap: heightToDp(2),
                marginHorizontal: widthToDp(3),
              }}>
              {observerEmail.map((entry, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => removeItem(index)}
                  style={{
                    padding: widthToDp(1.5),
                    borderRadius: 5,
                    backgroundColor: Colors.Orange,
                  }}>
                  <Text style={{color: Colors.white, fontSize: widthToDp(4)}}>
                    {entry}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <GradientButton
              colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
              Title="Add Observers"
              onPress={() => addTextToArray(email)}
            />
            <Text style={styles.smallHead}>Invited Observers:</Text>
            <View
              style={{
                height: heightToDp(50),
                justifyContent: 'flex-end',
              }}>
              <GradientButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title="Invite Observers"
                onPress={() => sendAddObservers()}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PinkBackground,
  },
  contentContainer: {
    marginVertical: heightToDp(3),
  },
  headingContainer: {
    marginHorizontal: widthToDp(5),
    marginBottom: heightToDp(2),
  },
  lightHeading: {
    color: Colors.TextColor,
    fontSize: widthToDp(5),
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(2),
  },
  smallHead: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
    fontFamily: 'Manrope-Bold',
    marginHorizontal: widthToDp(2),
    marginTop: widthToDp(4),
  },
});
