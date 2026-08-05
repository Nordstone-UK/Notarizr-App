import React, {useState} from 'react';
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
import Toast from 'react-native-toast-message';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import useAgentService from '../../../hooks/useAgentService';

const CATEGORIES = [
  {
    id: '651edebe6ab4a249f611000d',
    title: 'Legal',
    description: 'Affidavits, powers of attorney and agreements',
    icon: 'briefcase',
    tone: '#FFF0E7',
    color: '#D65322',
  },
  {
    id: '651ede9e6ab4a249f610fffd',
    title: 'Estate',
    description: 'Wills, trusts and estate planning documents',
    icon: 'home',
    tone: '#EAF4FB',
    color: '#2878A9',
  },
  {
    id: '651edeab6ab4a249f6110005',
    title: 'Medical',
    description: 'Healthcare directives and medical authorizations',
    icon: 'heart',
    tone: '#FCEEEE',
    color: '#C44242',
  },
  {
    id: '651ede7d6ab4a249f610ffe9',
    title: 'Business',
    description: 'Corporate records and commercial documents',
    icon: 'file-text',
    tone: '#EAF7EF',
    color: '#168A52',
  },
];

export default function AgentServicePereference({navigation}) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const {dispatchCategory} = useAgentService();

  const toggleCategory = id =>
    setSelectedCategories(current =>
      current.includes(id)
        ? current.filter(categoryId => categoryId !== id)
        : [...current, id],
    );

  const continueSetup = () => {
    if (selectedCategories.length === 0) {
      Toast.show({
        type: 'warning',
        text1: 'Choose at least one category',
      });
      return;
    }
    dispatchCategory(selectedCategories);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Document categories"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What do you notarize?</Text>
        <Text style={styles.subtitle}>
          Select every category you are qualified and prepared to handle.
        </Text>
        <View style={styles.grid}>
          {CATEGORIES.map(category => {
            const selected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                accessibilityState={{selected}}
                activeOpacity={0.75}
                key={category.id}
                onPress={() => toggleCategory(category.id)}
                style={[styles.card, selected && styles.selectedCard]}>
                <View
                  style={[styles.iconBox, {backgroundColor: category.tone}]}>
                  <Feather
                    name={category.icon}
                    size={20}
                    color={category.color}
                  />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{category.title}</Text>
                  <Text style={styles.cardText}>{category.description}</Text>
                </View>
                <View
                  style={[
                    styles.selection,
                    selected && styles.selectedControl,
                  ]}>
                  {selected && (
                    <Feather name="check" size={13} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.actionBar}>
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
  title: {color: '#1D2430', fontFamily: 'Manrope-Bold', fontSize: 20},
  subtitle: {
    marginTop: 5,
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
  },
  grid: {marginTop: 16},
  card: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E5E9',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedCard: {borderColor: '#FD6D1F', backgroundColor: '#FFF9F5'},
  iconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cardCopy: {flex: 1, minWidth: 0, marginHorizontal: 12},
  cardTitle: {color: '#242B36', fontFamily: 'Manrope-Bold', fontSize: 13},
  cardText: {
    marginTop: 3,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 14,
  },
  selection: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8CDD4',
    borderRadius: 7,
  },
  selectedControl: {borderColor: '#FD6D1F', backgroundColor: '#FD6D1F'},
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
