import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import UserAvatar from '../../components/UserAvatar/UserAvatar';

const DetailRow = ({icon, label, value}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>
      <Feather name={icon} size={18} color="#FD6D1F" />
    </View>
    <View style={styles.detailCopy}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text selectable style={styles.detailValue}>
        {value || 'Not provided'}
      </Text>
    </View>
  </View>
);

export default function ChatingProfiledetailScreen({route}) {
  const receiver = route.params?.receiver || {};
  const fullName = [receiver.first_name, receiver.last_name]
    .filter(Boolean)
    .join(' ');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationHeader Title="Profile details" />
      <ScrollView contentContainerStyle={styles.content}>
        <UserAvatar
          name={fullName}
          size={96}
          source={receiver.profile_picture}
        />
        <Text style={styles.name}>{fullName || 'Notarizr member'}</Text>
        <Text style={styles.role}>
          {receiver.account_type === 'client'
            ? 'Notarizr client'
            : 'Notary professional'}
        </Text>

        <View style={styles.card}>
          <DetailRow icon="mail" label="Email address" value={receiver.email} />
          <View style={styles.divider} />
          <DetailRow
            icon="phone"
            label="Phone number"
            value={receiver.phone_number}
          />
          {receiver.location ? (
            <>
              <View style={styles.divider} />
              <DetailRow
                icon="map-pin"
                label="Location"
                value={receiver.location}
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {alignItems: 'center', padding: 24},
  name: {
    marginTop: 16,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  role: {
    marginTop: 4,
    color: '#858C98',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
  },
  card: {
    width: '100%',
    marginTop: 28,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  detailRow: {minHeight: 76, flexDirection: 'row', alignItems: 'center'},
  detailIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#FFF0E7',
  },
  detailCopy: {flex: 1, minWidth: 0, marginLeft: 14},
  detailLabel: {
    color: '#9198A3',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  detailValue: {
    marginTop: 3,
    color: '#242B37',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
  },
  divider: {height: 1, marginLeft: 56, backgroundColor: '#ECEEF1'},
});
