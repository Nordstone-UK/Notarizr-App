import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useQuery} from '@apollo/client';

import {GetSettingR} from '../../../request/queries/getSetting.query';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';

const ContactDetailScreen = () => {
  const {loading, error, data} = useQuery(GetSettingR);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </SafeAreaView>
    );
  }

  const {phoneNumber, email} = data.getSettingR.data.contact;
  console.log('Contact Data:', data.getSettingR.data.contact);

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="Contact Us" />
      <BottomSheetStyle>
        <View style={styles.content}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => console.log('Calling:', phoneNumber)}>
              <MaterialIcons name="phone" size={24} color="#FF9800" />
              <Text style={styles.text}>{phoneNumber}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => console.log('Opening Email:', email)}>
              <MaterialIcons name="email" size={24} color="#FF9800" />
              <Text style={styles.text}>{email}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetStyle>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  content: {
    // justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
  },
});

export default ContactDetailScreen;
