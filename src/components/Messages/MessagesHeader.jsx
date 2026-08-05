import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ORANGE = '#FD6D1F';

export default function MessagesHeader({
  filter,
  onChangeFilter,
  onChangeSearch,
  search,
  totalCount,
  unreadCount,
  subtitle = 'Conversations with your notaries',
}) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadSummary}>
            <Text style={styles.unreadSummaryText}>{unreadCount} unread</Text>
          </View>
        )}
      </View>

      <View style={styles.searchShell}>
        <Feather name="search" size={18} color="#7A818D" />
        <TextInput
          accessibilityLabel="Search conversations"
          autoCapitalize="none"
          onChangeText={onChangeSearch}
          placeholder="Search conversations"
          placeholderTextColor="#A0A5AE"
          style={styles.searchInput}
          value={search}
        />
        {search.length > 0 && (
          <TouchableOpacity
            accessibilityLabel="Clear search"
            activeOpacity={0.65}
            onPress={() => onChangeSearch('')}
            style={styles.clearButton}>
            <Feather name="x" size={16} color="#7A818D" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onChangeFilter('all')}
            style={[styles.segment, filter === 'all' && styles.activeSegment]}>
            <Text
              style={[
                styles.segmentLabel,
                filter === 'all' && styles.activeSegmentLabel,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onChangeFilter('unread')}
            style={[
              styles.segment,
              filter === 'unread' && styles.activeSegment,
            ]}>
            <Text
              style={[
                styles.segmentLabel,
                filter === 'unread' && styles.activeSegmentLabel,
              ]}>
              Unread
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.totalText}>
          {totalCount} {totalCount === 1 ? 'conversation' : 'conversations'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 26,
  },
  subtitle: {
    marginTop: 2,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  unreadSummary: {
    marginTop: 2,
    marginLeft: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  unreadSummaryText: {
    color: ORANGE,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  searchShell: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingLeft: 14,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
  },
  searchInput: {
    flex: 1,
    height: 46,
    marginLeft: 10,
    paddingVertical: 0,
    color: '#171C26',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  clearButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  segmentedControl: {
    width: 156,
    height: 36,
    flexDirection: 'row',
    padding: 3,
    borderRadius: 8,
    backgroundColor: '#F0F2F4',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeSegment: {
    borderWidth: 1,
    borderColor: '#E2E4E8',
    backgroundColor: '#FFFFFF',
  },
  segmentLabel: {
    color: '#7A818D',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  activeSegmentLabel: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
  },
  totalText: {
    color: '#9298A2',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
});
