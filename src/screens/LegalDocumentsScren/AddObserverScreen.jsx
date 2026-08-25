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
import GradientButton from '../../components/MainGradientButton/GradientButton';
import {useSession} from '../../hooks/useSession';
import Toast from 'react-native-toast-message';
import {getObserverPhone} from '../../utils/observerPhone';
import RegisteredObserverPicker from '../../components/Observers/RegisteredObserverPicker';

export default function AddObserverScreen({route, navigation}) {
  const {bookingId} = route.params;
  const {handleAddObservers} = useSession();
  const [observerPhones, setObserverPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const addObserverUser = user => {
    const normalizedPhone = getObserverPhone(user);
    if (observerPhones.includes(normalizedPhone)) {
      Toast.show({
        type: 'error',
        text1: 'Observer already added',
      });
      return;
    }

    if (observerPhones.length >= 5) {
      Toast.show({
        type: 'error',
        text1: 'Observer limit reached',
        text2: 'You can invite up to five observers.',
      });
      return;
    }

    setObserverPhones(current => [...current, normalizedPhone]);
  };
  const sendAddObservers = async () => {
    if (!observerPhones.length) {
      Toast.show({
        type: 'error',
        text1: 'Add at least one observer',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await handleAddObservers(bookingId, observerPhones);
      if (response?.status === '200') {
        Toast.show({
          type: 'success',
          text1: 'Observers invited',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Observers could not be invited',
        });
      }
    } finally {
      setLoading(false);
    }
  };
  const removeItem = index => {
    const updatedList = [...observerPhones];
    updatedList.splice(index, 1);
    setObserverPhones(updatedList);
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
              Add observers to your RON session
            </Text>
            <Text style={styles.smallHead}>
              Invite up to five observers by phone number.
            </Text>
            <View style={styles.searchWrap}>
              <RegisteredObserverPicker
                disabled={observerPhones.length >= 5}
                excludedPhones={observerPhones}
                onSelect={addObserverUser}
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
              {observerPhones.map((entry, index) => (
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
            <Text style={styles.smallHead}>Observers to invite</Text>
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
  searchWrap: {
    marginHorizontal: widthToDp(2),
    marginBottom: heightToDp(2),
    marginTop: heightToDp(4),
  },
});
