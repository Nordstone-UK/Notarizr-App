import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';

function ServiceOption({description, icon, onPress, title, tone}) {
  const blue = tone === 'blue';
  return (
    <TouchableOpacity
      activeOpacity={0.74}
      onPress={onPress}
      style={styles.option}>
      <View style={[styles.optionIcon, blue && styles.blueIcon]}>
        <Feather name={icon} size={21} color={blue ? '#2878A9' : '#D65322'} />
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionText}>{description}</Text>
      </View>
      <Feather
        name="arrow-up-right"
        size={19}
        color={blue ? '#2878A9' : '#D65322'}
      />
    </TouchableOpacity>
  );
}

export default function AgentRemoteOnlineNotaryScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Remote online notary"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="video" size={25} color="#2878A9" />
          </View>
          <Text style={styles.title}>Remote notary tools</Text>
          <Text style={styles.subtitle}>
            Start a direct client session or manage when clients can request
            remote appointments.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choose an action</Text>
        <ServiceOption
          description="Invite a client, add documents and schedule a secure session."
          icon="user-plus"
          onPress={() => navigation.navigate('AgentSessionInviteScreen')}
          title="Create client session"
        />
        <ServiceOption
          description="Set weekly hours and states covered by your remote service."
          icon="calendar"
          onPress={() => navigation.navigate('AgentMainAvailabilityScreen')}
          title="Manage availability"
          tone="blue"
        />

        <View style={styles.note}>
          <Feather name="shield" size={18} color="#168A52" />
          <Text style={styles.noteText}>
            Remote sessions use Notarizr identity checks, secure documents and
            protected video rooms.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {padding: 20, paddingBottom: 34, backgroundColor: '#F7F8FA'},
  hero: {
    alignItems: 'center',
    padding: 22,
    borderWidth: 1,
    borderColor: '#DCE8EF',
    borderRadius: 8,
    backgroundColor: '#EDF6FB',
  },
  heroIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#DDEFF8',
  },
  title: {
    marginTop: 14,
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  subtitle: {
    marginTop: 6,
    color: '#627380',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 3,
    color: '#303642',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  option: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E5E9',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  optionIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  blueIcon: {backgroundColor: '#EAF4FB'},
  optionCopy: {flex: 1, minWidth: 0, marginHorizontal: 12},
  optionTitle: {color: '#242B36', fontFamily: 'Manrope-Bold', fontSize: 13},
  optionText: {
    marginTop: 3,
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#EAF7EF',
  },
  noteText: {
    flex: 1,
    marginLeft: 9,
    color: '#4F7060',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
});
