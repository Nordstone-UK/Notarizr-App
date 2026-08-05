import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import TimePicker from '../../../components/TimePicker/TimePicker';
import WeekCalendar from '../../../components/WeekCalendar/WeekCalendar';
import useAgentService from '../../../hooks/useAgentService';
import {SERVICE_BY_AGENT_AND_TYPE} from '../../../../request/queries/getserviceByAgent.query';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'];

export default function AgentMainAvailabilityScreen({navigation}) {
  const serviceType = useSelector(state => state.agentService.serviceType);
  const {data, loading} = useQuery(SERVICE_BY_AGENT_AND_TYPE, {
    variables: {serviceType: serviceType || ''},
  });
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(moment().add(8, 'hours').toDate());
  const [canPrint, setCanPrint] = useState(false);
  const {dispatchAvailability} = useAgentService();
  const mobile = serviceType === 'mobile_notary';
  const serviceData = data?.serviceByAgentAndType;

  useEffect(() => {
    const service = data?.serviceByAgentAndType?.service;
    if (service?.availability) {
      setSelectedDays(service.availability.weekdays || []);
      setStartTime(moment(service.availability.startTime, 'h:mm A').toDate());
      setEndTime(moment(service.availability.endTime, 'h:mm A').toDate());
      setCanPrint(Boolean(service.can_print));
    }
  }, [data]);

  const continueSetup = () => {
    if (selectedDays.length === 0) {
      Toast.show({
        type: 'warning',
        text1: 'Choose your working days',
        text2: 'Select at least one day to continue.',
      });
      return;
    }
    if (!moment(endTime).isAfter(moment(startTime))) {
      Toast.show({
        type: 'warning',
        text1: 'Check your hours',
        text2: 'End time must be later than start time.',
      });
      return;
    }
    dispatchAvailability(
      selectedDays,
      moment(startTime).format('h:mm A'),
      moment(endTime).format('h:mm A'),
      canPrint,
      serviceData,
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator color="#FD6D1F" />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Service availability"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Feather
              name={mobile ? 'map-pin' : 'video'}
              size={20}
              color="#D65322"
            />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.title}>
              {mobile ? 'Mobile notary hours' : 'Remote notary hours'}
            </Text>
            <Text style={styles.subtitle}>
              Clients can request appointments during these times.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working days</Text>
          <Text style={styles.sectionText}>
            Select every day you usually accept bookings.
          </Text>
          <View style={styles.daysCard}>
            <WeekCalendar
              selectedDays={selectedDays}
              setSelectedDays={setSelectedDays}
              weekdays={WEEKDAYS}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available hours</Text>
          <Text style={styles.sectionText}>
            Set one consistent time window for selected days.
          </Text>
          <View style={styles.timeRow}>
            <TimePicker
              date={startTime}
              onConfirm={setStartTime}
              Text="Start time"
            />
            <View style={styles.timeGap} />
            <TimePicker date={endTime} onConfirm={setEndTime} Text="End time" />
          </View>
        </View>

        {mobile && (
          <View style={styles.printRow}>
            <View style={styles.printIcon}>
              <Feather name="printer" size={18} color="#2878A9" />
            </View>
            <View style={styles.printCopy}>
              <Text style={styles.printTitle}>Document printing</Text>
              <Text style={styles.printText}>
                I can print documents before an appointment.
              </Text>
            </View>
            <Switch
              ios_backgroundColor="#D7DBE0"
              onValueChange={setCanPrint}
              trackColor={{false: '#D7DBE0', true: '#BDE8D1'}}
              value={canPrint}
            />
          </View>
        )}
      </ScrollView>
      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={continueSetup}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Feather name="arrow-right" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {padding: 20, paddingBottom: 28, backgroundColor: '#F7F8FA'},
  loadingState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {
    marginTop: 9,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E6EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  introIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  introCopy: {flex: 1, marginLeft: 12},
  title: {color: '#242B36', fontFamily: 'Manrope-Bold', fontSize: 14},
  subtitle: {
    marginTop: 3,
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  section: {marginTop: 24},
  sectionTitle: {color: '#2A303B', fontFamily: 'Manrope-Bold', fontSize: 13},
  sectionText: {
    marginTop: 3,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  daysCard: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3E6EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  timeRow: {flexDirection: 'row', marginTop: 12},
  timeGap: {width: 10},
  printRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3E6EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  printIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EAF4FB',
  },
  printCopy: {flex: 1, minWidth: 0, marginHorizontal: 11},
  printTitle: {color: '#29303B', fontFamily: 'Manrope-Bold', fontSize: 11},
  printText: {
    marginTop: 2,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  actionBar: {
    minHeight: 76,
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: '#DFE2E6',
    borderRadius: 8,
  },
  backButtonText: {color: '#505864', fontFamily: 'Manrope-Bold', fontSize: 12},
  primaryButton: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  primaryButtonText: {
    marginRight: 8,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
});
