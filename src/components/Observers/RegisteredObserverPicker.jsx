import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import useFetchUser from '../../hooks/useFetchUser';
import AppColors from '../../themes/AppColors';
import {getObserverPhone} from '../../utils/observerPhone';

const getName = user =>
  `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
  'Notarizr user';

const getInitials = user =>
  getName(user)
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

export default function RegisteredObserverPicker({
  disabled = false,
  excludedPhones = [],
  excludedUserIds = [],
  onSelect,
  placeholder = 'Search by phone number',
}) {
  const {searchUserByPhone} = useFetchUser();
  const searchRef = useRef(searchUserByPhone);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  searchRef.current = searchUserByPhone;

  const excludedPhoneKey = excludedPhones
    .map(getObserverPhone)
    .filter(Boolean)
    .sort()
    .join('|');
  const excludedUserKey = excludedUserIds
    .filter(Boolean)
    .map(String)
    .sort()
    .join('|');
  const excludedPhoneSet = useMemo(
    () => new Set(excludedPhoneKey ? excludedPhoneKey.split('|') : []),
    [excludedPhoneKey],
  );
  const excludedUserSet = useMemo(
    () => new Set(excludedUserKey ? excludedUserKey.split('|') : []),
    [excludedUserKey],
  );

  useEffect(() => {
    const search = query.trim();
    if (search.length < 2) {
      setResults([]);
      setLoading(false);
      setSearched(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setSearched(false);
    const timeout = setTimeout(async () => {
      try {
        const response = await searchRef.current(search);
        if (!active) {
          return;
        }
        const unique = new Map();
        (Array.isArray(response) ? response : []).forEach(user => {
          const phone = getObserverPhone(user);
          const userId = String(user?._id || '');
          if (
            phone &&
            !excludedPhoneSet.has(phone) &&
            !excludedUserSet.has(userId)
          ) {
            unique.set(userId || phone, user);
          }
        });
        setResults([...unique.values()]);
      } catch (_) {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setLoading(false);
          setSearched(true);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [excludedPhoneSet, excludedUserSet, query]);

  const selectUser = user => {
    onSelect?.(user);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <View>
      <View style={[styles.search, disabled && styles.disabled]}>
        <Feather name="search" size={18} color={AppColors.textSecondary} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          keyboardType="phone-pad"
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={AppColors.textMuted}
          style={styles.input}
          value={query}
        />
        {loading ? (
          <ActivityIndicator color={AppColors.primary} size="small" />
        ) : query ? (
          <TouchableOpacity
            accessibilityLabel="Clear observer search"
            onPress={() => setQuery('')}>
            <Feather name="x" size={18} color={AppColors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {results.length ? (
        <View style={styles.results}>
          {results.map((user, index) => (
            <TouchableOpacity
              activeOpacity={0.75}
              key={user._id || getObserverPhone(user)}
              onPress={() => selectUser(user)}
              style={[
                styles.result,
                index < results.length - 1 && styles.resultBorder,
              ]}>
              {user.profile_picture ? (
                <Image
                  source={{uri: user.profile_picture}}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.initials}>{getInitials(user)}</Text>
                </View>
              )}
              <View style={styles.resultCopy}>
                <Text style={styles.name}>{getName(user)}</Text>
                <Text style={styles.phone}>{getObserverPhone(user)}</Text>
              </View>
              <View style={styles.addIcon}>
                <Feather name="plus" size={17} color={AppColors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : searched && query.trim().length >= 2 && !loading ? (
        <View style={styles.empty}>
          <Feather name="user-x" size={17} color={AppColors.textSecondary} />
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>No registered user found</Text>
            <Text style={styles.emptyText}>
              Only existing Notarizr accounts can join as observers.
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.hint}>
          Type at least two digits to find a registered Notarizr user.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatar: {borderRadius: 22, height: 44, width: 44},
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  disabled: {opacity: 0.55},
  empty: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 8,
    padding: 12,
  },
  emptyCopy: {flex: 1, marginLeft: 10},
  emptyText: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  emptyTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 8,
  },
  initials: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  input: {
    color: AppColors.textPrimary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
    marginHorizontal: 10,
    paddingVertical: 0,
  },
  name: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
  },
  phone: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  result: {alignItems: 'center', flexDirection: 'row', padding: 12},
  resultBorder: {borderBottomColor: AppColors.border, borderBottomWidth: 1},
  resultCopy: {flex: 1, marginHorizontal: 11},
  results: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  search: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
  },
});
