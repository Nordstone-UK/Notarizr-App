import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';
import ScreenHeader from '../../components/Navigation/ScreenHeader';
import FaqItem from '../../components/Support/FaqItem';
import useFetchFaq from '../../hooks/useFetchFaq';

const PREVIEW_FAQS = [
  {
    _id: 'faq-1',
    question: 'What should I bring to a mobile notary appointment?',
    answer:
      'Bring a valid government-issued photo ID and the complete unsigned document. Every signer should be present unless your notary confirms otherwise.',
  },
  {
    _id: 'faq-2',
    question: 'How does remote online notarization work?',
    answer:
      'You meet a verified notary in an encrypted video session, confirm your identity, review the document, and sign electronically.',
  },
  {
    _id: 'faq-3',
    question: 'When will I be charged?',
    answer:
      'Your payment method is verified when you book. The final charge is processed after a notary accepts and completes the service.',
  },
  {
    _id: 'faq-4',
    question: 'Can I reschedule or cancel a booking?',
    answer:
      'Open the booking from My Bookings to review its available actions. Cancellation fees may apply close to the appointment time.',
  },
  {
    _id: 'faq-5',
    question: 'Are my documents and messages secure?',
    answer:
      'Notarizr protects documents, identity details, payments, and booking messages using secure transmission and access controls.',
  },
  {
    _id: 'faq-6',
    question: 'How do I contact my assigned notary?',
    answer:
      'Once a notary accepts your request, open Messages or the booking details page to start a protected conversation.',
  },
];
const EMPTY_FAQS = [];

export default function Faqscreen({navigation}) {
  const user = useSelector(state => state.user.user);
  const {faq, loading} = useFetchFaq();
  const [search, setSearch] = useState('');
  const previewMode = Boolean(user?.isHomePreview);
  const items = previewMode ? PREVIEW_FAQS : faq || EMPTY_FAQS;
  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter(
      item =>
        item.question?.toLowerCase().includes(query) ||
        item.answer?.toLowerCase().includes(query),
    );
  }, [items, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader
        fallback="SettingScreen"
        navigation={navigation}
        subtitle="Answers to common questions"
        title="Help and FAQ"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroText}>
            Search booking, payment, and account questions.
          </Text>
          <View style={styles.searchBox}>
            <Feather name="search" size={18} color="#838A95" />
            <TextInput
              onChangeText={setSearch}
              placeholder="Search help"
              placeholderTextColor="#A4A9B1"
              style={styles.searchInput}
              value={search}
            />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Frequently asked</Text>
        {loading && !previewMode ? (
          <ActivityIndicator color="#FD6D1F" style={styles.loader} />
        ) : visibleItems.length ? (
          <View style={styles.list}>
            {visibleItems.map((item, index) => (
              <FaqItem
                item={item}
                key={item._id || item.question}
                last={index === visibleItems.length - 1}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="search" size={24} color="#FD6D1F" />
            <Text style={styles.emptyTitle}>No matching answers</Text>
            <Text style={styles.emptyText}>
              Try a shorter phrase or a different keyword.
            </Text>
          </View>
        )}
        <View style={styles.supportNote}>
          <Feather name="message-circle" size={19} color="#2879B8" />
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>Still need help?</Text>
            <Text style={styles.supportText}>
              Booking conversations remain available from Messages.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  emptyText: {
    color: '#8B919C',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 6,
  },
  emptyTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
    marginTop: 12,
  },
  hero: {
    backgroundColor: '#F5F6F8',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroText: {
    color: '#7D8490',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    marginTop: 5,
  },
  heroTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  list: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E9EBEF',
    borderBottomWidth: 1,
    borderTopColor: '#E9EBEF',
    borderTopWidth: 1,
  },
  loader: {
    marginVertical: 50,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DEE1E6',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: '#202632',
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: '#8B919C',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    paddingHorizontal: 20,
    paddingVertical: 13,
    textTransform: 'uppercase',
  },
  supportCopy: {
    flex: 1,
    marginLeft: 13,
  },
  supportNote: {
    alignItems: 'center',
    backgroundColor: '#EDF4FC',
    borderRadius: 8,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
  },
  supportText: {
    color: '#647383',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  supportTitle: {
    color: '#245E8A',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
});
