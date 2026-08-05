import React, {useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import useAgentService from '../../../hooks/useAgentService';
import {statesData} from '../../../data/statesData';

export default function AgentRONLocationScreen({route, navigation}) {
  const {canPrint = false, serviceData} = route.params || {};
  const agentService = useSelector(state => state.agentService);
  const [selectedStates, setSelectedStates] = useState(
    serviceData?.service?.location || [],
  );
  const [saving, setSaving] = useState(false);
  const {handleRegistration, handleUpdateService} = useAgentService();
  const existingService = serviceData?.service;

  const saveService = async () => {
    if (selectedStates.length === 0) {
      Toast.show({
        type: 'warning',
        text1: 'Choose a service area',
        text2: 'Select at least one state to continue.',
      });
      return;
    }

    setSaving(true);
    try {
      const params = {
        ...agentService,
        location: selectedStates,
        canPrint,
        ...(existingService?._id ? {id: existingService._id} : {}),
      };
      if (existingService) {
        await handleUpdateService(params);
      } else {
        await handleRegistration(params);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Service areas not saved',
        text2: 'Please try again in a moment.',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeState = state =>
    setSelectedStates(current => current.filter(item => item !== state));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Service areas"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Feather name="map" size={21} color="#2878A9" />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.title}>Where can clients book you?</Text>
            <Text style={styles.subtitle}>
              Choose the states covered by this service profile.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select states</Text>
          <Text style={styles.sectionText}>
            You can update this list whenever your coverage changes.
          </Text>
          <View style={styles.selectWrap}>
            <MultipleSelectList
              badgeStyles={styles.dropdownBadge}
              badgeTextStyles={styles.dropdownBadgeText}
              boxStyles={styles.dropdownBox}
              checkBoxStyles={styles.checkBox}
              data={statesData.map(state => ({
                key: state.value,
                value: state.label,
              }))}
              dropdownStyles={styles.dropdown}
              dropdownTextStyles={styles.dropdownText}
              inputStyles={styles.dropdownInput}
              label="States"
              labelStyles={styles.dropdownLabel}
              placeholder="Search and select states"
              save="value"
              setSelected={setSelectedStates}
            />
          </View>
        </View>

        {selectedStates.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>Selected coverage</Text>
            <View style={styles.chips}>
              {selectedStates.map(state => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={state}
                  onPress={() => removeState(state)}
                  style={styles.chip}>
                  <Text style={styles.chipText}>{state}</Text>
                  <Feather name="x" size={13} color="#D65322" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.note}>
          <Feather name="info" size={17} color="#2878A9" />
          <Text style={styles.noteText}>
            Only accept work where your commission and local regulations allow
            you to perform notarizations.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.78}
          disabled={saving}
          onPress={saveService}
          style={styles.primaryButton}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>
                {existingService ? 'Update service' : 'Complete setup'}
              </Text>
              <Feather name="check" size={17} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {padding: 20, paddingBottom: 28, backgroundColor: '#F7F8FA'},
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EAF4FB',
  },
  introCopy: {flex: 1, marginLeft: 12},
  title: {color: '#242B36', fontFamily: 'Manrope-Bold', fontSize: 14},
  subtitle: {
    marginTop: 3,
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  section: {marginTop: 24},
  sectionTitle: {color: '#2A303B', fontFamily: 'Manrope-Bold', fontSize: 13},
  sectionText: {
    marginTop: 3,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  selectWrap: {marginTop: 12},
  dropdownBox: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  dropdown: {
    maxHeight: 270,
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  dropdownInput: {
    color: '#303642',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  dropdownText: {color: '#4C5460', fontFamily: 'Manrope-Regular', fontSize: 11},
  dropdownLabel: {color: '#303642', fontFamily: 'Manrope-Bold', fontSize: 11},
  dropdownBadge: {borderRadius: 6, backgroundColor: '#FFF0E7'},
  dropdownBadgeText: {
    color: '#D65322',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  checkBox: {borderColor: '#AAB0B8'},
  selectedSection: {marginTop: 22},
  chips: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 8},
  chip: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F0D5C7',
    borderRadius: 8,
    backgroundColor: '#FFF7F2',
  },
  chipText: {
    marginRight: 6,
    color: '#B74A1E',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#EAF4FB',
  },
  noteText: {
    flex: 1,
    marginLeft: 9,
    color: '#4C6678',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  actionBar: {
    minHeight: 76,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
