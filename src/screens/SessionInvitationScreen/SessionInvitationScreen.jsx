import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment-timezone';
import {useDispatch, useSelector} from 'react-redux';
import {useLazyQuery} from '@apollo/client';
import Toast from 'react-native-toast-message';

import AuthPrimaryButton from '../../components/AuthFlow/AuthPrimaryButton';
import AppColors from '../../themes/AppColors';
import {
  setBookingInfoState,
  setCoordinates,
  setUser,
} from '../../features/booking/bookingSlice';
import {useSession} from '../../hooks/useSession';
import {GET_BOOKING_BY_ID} from '../../../request/queries/getBookingByID.query';
import {
  clearPendingSessionInvite,
  getPendingSessionInvite,
  normalizeSessionInviteParams,
  savePendingSessionInvite,
} from '../../utils/sessionInvitation';

const formatPersonName = person =>
  [person?.first_name, person?.last_name].filter(Boolean).join(' ').trim();

const getSessionTitle = session => {
  const docType = Array.isArray(session?.document_type)
    ? session.document_type?.[0]?.name
    : session?.document_type?.name;
  return docType || 'Remote online notary session';
};

const getAppointmentDate = session =>
  session?.date_time_session || session?.date_of_booking || session?.createdAt;

const getAppointmentLabel = session => {
  const date = getAppointmentDate(session);
  if (!date) {
    return 'Appointment time to be confirmed';
  }
  return moment(date).format('ddd, MMM D [at] h:mm A');
};

const getRoleLabel = ({session, invite, user}) => {
  if (invite?.role) {
    return invite.role;
  }

  const userEmail = String(user?.email || '').toLowerCase();
  const userPhone = String(
    user?.phone_number || user?.phoneNumber || '',
  ).replace(/\s/g, '');
  const clientEmail = String(
    session?.client?.email || session?.client_email || '',
  ).toLowerCase();
  const observerValues = Array.isArray(session?.observers)
    ? session.observers.map(value => String(value || ''))
    : [];

  if (userEmail && clientEmail && userEmail === clientEmail) {
    return 'Primary signer';
  }
  if (
    userPhone &&
    observerValues.some(value => value.replace(/\s/g, '') === userPhone)
  ) {
    return 'Observer';
  }
  if (user?.account_type && user.account_type !== 'client') {
    return 'Notary';
  }
  return 'Invited participant';
};

const getIdentityRequirement = method => {
  if (method === 'user_passport') {
    return 'Passport photo page';
  }
  if (method === 'user_id') {
    return 'Government ID front and back';
  }
  return 'Government ID or passport';
};

function DetailRow({icon, label, value}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Feather name={icon} size={18} color={AppColors.primary} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function PrepItem({children}) {
  return (
    <View style={styles.prepItem}>
      <View style={styles.checkIcon}>
        <Feather name="check" size={13} color={AppColors.success} />
      </View>
      <Text style={styles.prepText}>{children}</Text>
    </View>
  );
}

export default function SessionInvitationScreen({navigation, route}) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const {getSessionByID} = useSession();
  const [getBookingById] = useLazyQuery(GET_BOOKING_BY_ID);
  const getSessionByIDRef = useRef(getSessionByID);
  const getBookingByIdRef = useRef(getBookingById);
  const [invite, setInvite] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [inviteHydrated, setInviteHydrated] = useState(false);

  const routeInvite = useMemo(
    () => normalizeSessionInviteParams(route?.params || {}),
    [route?.params],
  );

  getSessionByIDRef.current = getSessionByID;
  getBookingByIdRef.current = getBookingById;

  useEffect(() => {
    let active = true;

    const hydrateInvite = async () => {
      const nextInvite =
        routeInvite ||
        (await getPendingSessionInvite()) ||
        normalizeSessionInviteParams(route?.params?.sourceUrl);
      if (!active) {
        return;
      }
      setInvite(nextInvite);
      setInviteHydrated(true);
      if (nextInvite) {
        await savePendingSessionInvite(nextInvite);
      }
    };

    hydrateInvite();

    return () => {
      active = false;
    };
  }, [route?.params?.sourceUrl, routeInvite]);

  useEffect(() => {
    if (!inviteHydrated) {
      return undefined;
    }

    let active = true;
    const loadSession = async () => {
      if (!invite) {
        setLoading(false);
        setLoadError('This invitation link is invalid or expired.');
        return;
      }

      if (!invite?.sessionId) {
        setLoading(false);
        setLoadError(
          invite?.inviteToken
            ? 'Sign in to continue. This invite uses a secure token that the mobile API still needs to resolve.'
            : 'This invitation link is missing a session reference.',
        );
        return;
      }

      setLoading(true);
      setLoadError('');
      try {
        const nextSession =
          invite.recordType === 'booking'
            ? (
                await getBookingByIdRef.current({
                  fetchPolicy: 'network-only',
                  variables: {bookingId: invite.sessionId},
                })
              )?.data?.getBookingById?.booking
            : await getSessionByIDRef.current(invite.sessionId);
        if (!active) {
          return;
        }
        if (!nextSession) {
          throw new Error('Session unavailable');
        }
        setSession(nextSession);
      } catch (error) {
        setLoadError(
          user
            ? 'We could not load this invitation. Please check that the link is still active.'
            : 'Sign in or create an account to view the secure invitation details.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, [invite, inviteHydrated, user]);

  const requesterName =
    formatPersonName(session?.agent) ||
    session?.agent?.email ||
    formatPersonName(session?.booked_by) ||
    session?.booked_by?.email ||
    'Your notary';
  const appointmentLabel = getAppointmentLabel(session);
  const roleLabel = getRoleLabel({session, invite, user});
  const identityRequirement = getIdentityRequirement(
    session?.identity_authentication,
  );
  const documentCount = Array.isArray(session?.agent_document)
    ? session.agent_document.length
    : Array.isArray(session?.documents)
    ? session.documents.length
    : 0;
  const statusLabel = session?.status
    ? String(session.status).replace(/_/g, ' ')
    : 'Invitation pending';

  const continueToSession = async () => {
    if (!user) {
      navigation.navigate('LoginScreen', {pendingInvite: invite});
      return;
    }

    if (!session) {
      Toast.show({
        type: 'info',
        text1: 'Invite saved',
        text2: 'We will open it when the session details are available.',
      });
      return;
    }

    dispatch(setBookingInfoState(session));
    dispatch(
      setCoordinates(session?.agent?.current_location?.coordinates || []),
    );
    dispatch(setUser(session?.agent || []));
    await clearPendingSessionInvite();
    navigation.navigate('MedicalBookingScreen');
  };

  const startSignup = () => {
    navigation.navigate('SignupAsScreen', {pendingInvite: invite});
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(user ? 'HomeScreen' : 'LoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.75}
          onPress={goBack}
          style={styles.headerButton}>
          <Feather
            name="chevron-left"
            size={23}
            color={AppColors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session invitation</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <Feather name="shield" size={24} color={AppColors.primary} />
        </View>
        <Text style={styles.eyebrow}>SECURE INVITE</Text>
        <Text style={styles.title}>{getSessionTitle(session)}</Text>
        <Text style={styles.subtitle}>
          Review the appointment details and preparation steps before joining.
        </Text>

        {loading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator color={AppColors.primary} size="small" />
            <Text style={styles.loadingText}>Loading invitation details</Text>
          </View>
        ) : null}

        {!loading && loadError ? (
          <View style={styles.notice}>
            <Feather name="lock" size={18} color={AppColors.warning} />
            <Text style={styles.noticeText}>{loadError}</Text>
          </View>
        ) : null}

        <View style={styles.detailsPanel}>
          <DetailRow icon="user-check" label="Your role" value={roleLabel} />
          <View style={styles.divider} />
          <DetailRow icon="briefcase" label="Notary" value={requesterName} />
          <View style={styles.divider} />
          <DetailRow
            icon="calendar"
            label="Appointment"
            value={appointmentLabel}
          />
          <View style={styles.divider} />
          <DetailRow icon="activity" label="Status" value={statusLabel} />
        </View>

        <View style={styles.prepPanel}>
          <Text style={styles.sectionTitle}>Required preparation</Text>
          <PrepItem>{identityRequirement}</PrepItem>
          <PrepItem>Camera and microphone access</PrepItem>
          <PrepItem>Stable internet connection</PrepItem>
          <PrepItem>Quiet, well-lit location for the session</PrepItem>
          <PrepItem>
            {documentCount
              ? `${documentCount} document${
                  documentCount === 1 ? '' : 's'
                } ready for review`
              : 'Unsigned documents ready for review'}
          </PrepItem>
          <PrepItem>Plan for about 15 to 30 minutes</PrepItem>
        </View>

        <AuthPrimaryButton
          title={user ? 'Continue to session' : 'Sign in to continue'}
          icon="arrow-right"
          onPress={continueToSession}
          style={styles.primaryButton}
        />

        {!user ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={startSignup}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Create an account</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  checkIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.successSoft,
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    marginTop: 1,
    width: 18,
  },
  container: {
    backgroundColor: AppColors.white,
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    marginRight: 12,
    width: 38,
  },
  detailLabel: {
    color: AppColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 14,
  },
  detailValue: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 3,
  },
  detailsPanel: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 22,
    paddingHorizontal: 14,
  },
  divider: {
    backgroundColor: AppColors.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
  eyebrow: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    marginTop: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 54,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  headerButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: 18,
    width: 48,
  },
  loadingPanel: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  loadingText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    marginLeft: 10,
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: AppColors.warningSoft,
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 20,
    padding: 14,
  },
  noticeText: {
    color: AppColors.warning,
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 9,
  },
  prepItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 12,
  },
  prepPanel: {
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    marginTop: 16,
    padding: 16,
  },
  prepText: {
    color: AppColors.textPrimary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
  },
  primaryButton: {
    marginTop: 24,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
  },
  secondaryText: {
    color: AppColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },
  title: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 28,
    lineHeight: 35,
    marginTop: 7,
  },
});
