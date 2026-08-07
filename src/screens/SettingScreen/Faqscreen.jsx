import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ScreenHeader from '../../components/Navigation/ScreenHeader';
import FaqItem from '../../components/Support/FaqItem';
import useCustomerSuport from '../../hooks/useCustomerSupport';
import useFetchFaq from '../../hooks/useFetchFaq';
import AppColors from '../../themes/AppColors';

const FALLBACK_FAQS = [
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

const TOPICS = [
  {label: 'Booking', icon: 'calendar'},
  {label: 'Payments', icon: 'credit-card'},
  {label: 'Security', icon: 'shield'},
];

export default function Faqscreen({navigation}) {
  const {faq, error, loading, refetchFaq} = useFetchFaq();
  const {handleCallSupport} = useCustomerSuport();
  const [search, setSearch] = useState('');
  const items = faq.length ? faq : FALLBACK_FAQS;
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
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.surface} />
      <ScreenHeader
        fallback="SettingScreen"
        navigation={navigation}
        subtitle="Support center"
        title="Help and FAQ"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Feather name="life-buoy" size={14} color={AppColors.primary} />
            <Text style={styles.heroBadgeText}>NOTARIZR SUPPORT</Text>
          </View>
          <Text style={styles.heroTitle}>What can we help you find?</Text>
          <Text style={styles.heroText}>
            Fast answers for appointments, payments, and your account.
          </Text>
          <View style={styles.searchBox}>
            <View style={styles.searchIcon}>
              <Feather name="search" size={17} color={AppColors.primary} />
            </View>
            <TextInput
              onChangeText={setSearch}
              placeholder="Search a question or keyword"
              placeholderTextColor={AppColors.textMuted}
              returnKeyType="search"
              style={styles.searchInput}
              value={search}
            />
            {Boolean(search) && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather
                  name="x-circle"
                  size={17}
                  color={AppColors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.topicRow}>
          {TOPICS.map(topic => (
            <TouchableOpacity
              activeOpacity={0.75}
              key={topic.label}
              onPress={() => setSearch(topic.label)}
              style={styles.topicCard}>
              <View style={styles.topicIcon}>
                <Feather
                  name={topic.icon}
                  size={17}
                  color={AppColors.primary}
                />
              </View>
              <Text style={styles.topicText}>{topic.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              {search ? 'Search results' : 'Frequently asked'}
            </Text>
            <Text style={styles.sectionMeta}>
              {visibleItems.length}{' '}
              {visibleItems.length === 1 ? 'answer' : 'answers'}
            </Text>
          </View>
          {error && (
            <TouchableOpacity onPress={refetchFaq} style={styles.refreshButton}>
              <Feather name="refresh-cw" size={13} color={AppColors.primary} />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && !faq.length ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={AppColors.primary} />
            <Text style={styles.loaderText}>Finding the best answers...</Text>
          </View>
        ) : visibleItems.length ? (
          <View style={styles.list}>
            {visibleItems.map((item, index) => (
              <FaqItem
                index={index}
                item={item}
                key={item._id || item.question}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="search" size={22} color={AppColors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No exact match yet</Text>
            <Text style={styles.emptyText}>
              Try a shorter phrase or speak directly with our support team.
            </Text>
          </View>
        )}

        <View style={styles.supportCard}>
          <View style={styles.supportIcon}>
            <Feather name="headphones" size={22} color={AppColors.white} />
          </View>
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>Need a human touch?</Text>
            <Text style={styles.supportText}>
              Our support team can help with an active booking.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={handleCallSupport}
            style={styles.callButton}>
            <Feather name="phone" size={15} color={AppColors.primary} />
            <Text style={styles.callText}>Call</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  callButton: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  callText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
    marginLeft: 6,
  },
  content: {paddingBottom: 28, backgroundColor: AppColors.background},
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 30,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    marginTop: 13,
  },
  hero: {
    backgroundColor: AppColors.textPrimary,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heroBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  heroBadgeText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
    letterSpacing: 0.7,
    marginLeft: 7,
  },
  heroText: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 310,
  },
  heroTitle: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    lineHeight: 29,
    marginTop: 17,
  },
  list: {marginHorizontal: 16},
  loaderText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    marginTop: 10,
  },
  loaderWrap: {alignItems: 'center', paddingVertical: 44},
  refreshButton: {alignItems: 'center', flexDirection: 'row', padding: 7},
  refreshText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    marginLeft: 6,
  },
  safeArea: {backgroundColor: AppColors.background, flex: 1},
  searchBox: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 20,
    minHeight: 52,
    paddingHorizontal: 10,
  },
  searchIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  searchInput: {
    color: AppColors.textPrimary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    marginLeft: 10,
    paddingVertical: 10,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 17,
  },
  sectionMeta: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    marginTop: 2,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  supportCard: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 15,
  },
  supportCopy: {flex: 1, marginHorizontal: 12},
  supportIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  supportText: {
    color: AppColors.primarySoft,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  supportTitle: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  topicCard: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 13,
  },
  topicIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  topicRow: {flexDirection: 'row', marginHorizontal: 12, marginTop: 14},
  topicText: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    marginTop: 7,
  },
});
