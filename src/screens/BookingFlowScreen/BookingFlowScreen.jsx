import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMutation, useQuery} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useStripe} from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import DatePicker from 'react-native-date-picker';
import Pdf from 'react-native-pdf';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SelectList} from 'react-native-dropdown-select-list';
import BookingChoice from '../../components/BookingFlow/BookingChoice';
import BookingFlowFooter from '../../components/BookingFlow/BookingFlowFooter';
import BookingFlowHeader from '../../components/BookingFlow/BookingFlowHeader';
import BookingFlowSection from '../../components/BookingFlow/BookingFlowSection';
import PricingBreakdown from '../../components/BookingFlow/PricingBreakdown';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import useRegister from '../../hooks/useRegister';
import usePricingApi from '../../hooks/usePricingApi';
import useStripeApi from '../../hooks/useStripeApi';
import {CREATE_BOOKING} from '../../../request/mutations/createBooking.mutation';
import {UPDATE_BOOKING_STATUS} from '../../../request/mutations/updateBookingStatus.mutation';
import {GET_MATCHED_AGENT} from '../../../request/queries/matchAgent.query';
import {GET_BOOKING_BY_ID} from '../../../request/queries/getBookingByID.query';
import {getBookingDisplayId} from '../../utils/bookingPresentation';
import {statesData} from '../../data/statesData';

const PRINT_COPY_PRICE = 5;
const ADDITIONAL_SIGNER_PRICE = 5;
const ADDITIONAL_SEAL_PRICE = 8;
const PLATFORM_WITNESS_PRICE = 10;
const SERVICE_SETTINGS_KEY = 'notarizr_client_service_settings';
const MAX_DOCUMENT_UPLOAD_BYTES = 10 * 1024 * 1024;
const FULL_PREVIEW_STEPS = [
  'full',
  'fullReview',
  'fullParticipants',
  'fullDocuments',
  'fullDocumentPreview',
];
const STATE_OPTIONS = statesData.map(state => ({
  key: state.value,
  value: state.label,
}));
const DOCUMENT_CATEGORY_OPTIONS = [
  {key: 'general_notary', value: 'General notary work', eligible: true},
  {key: 'estate_planning', value: 'Estate planning', eligible: true},
  {key: 'real_estate', value: 'Real estate or closing', eligible: true},
  {key: 'power_of_attorney', value: 'Power of attorney', eligible: true},
  {key: 'affidavit', value: 'Affidavit or sworn statement', eligible: true},
  {key: 'business', value: 'Business document', eligible: true},
  {
    key: 'vital_record',
    value: 'Birth, death, marriage or vital record',
    eligible: false,
    reason:
      'Vital records usually require the issuing agency or a certified copy workflow.',
  },
  {
    key: 'immigration_i9',
    value: 'I-9 or immigration verification',
    eligible: false,
    reason:
      'This document type often has special identity and employer-agent rules.',
  },
  {
    key: 'already_signed',
    value: 'Document already signed',
    eligible: false,
    reason:
      'RON generally requires signing in the notary session unless the notary confirms otherwise.',
  },
  {key: 'other', value: 'Other or not sure', eligible: true},
];
const LANGUAGE_OPTIONS = [
  {key: 'English', value: 'English', eligible: true},
  {key: 'Spanish', value: 'Spanish', eligible: true},
  {
    key: 'Other',
    value: 'Other language',
    eligible: false,
    reason:
      'We need support to confirm an eligible notary and any interpreter requirements.',
  },
];
const NOTARIAL_ACT_OPTIONS = [
  {key: 'acknowledgment', value: 'Acknowledgment'},
  {key: 'jurat', value: 'Jurat / oath'},
  {key: 'signature_witnessing', value: 'Signature witnessing'},
  {key: 'copy_certification', value: 'Copy certification'},
  {key: 'oath_affirmation', value: 'Oath or affirmation'},
  {key: 'unsure', value: 'Not sure'},
];
const PARTICIPANT_ROLE_OPTIONS = [
  {key: 'signer', value: 'Signer'},
  {key: 'witness', value: 'Witness'},
  {key: 'observer', value: 'Observer'},
  {key: 'recipient', value: 'Recipient'},
];
const COMPLETENESS_ITEMS = [
  {
    key: 'readable',
    label: 'Document is readable',
    subtitle: 'Pages are clear, upright and not cut off.',
  },
  {
    key: 'complete',
    label: 'All pages are included',
    subtitle: 'No missing schedules, signature pages or attachments.',
  },
  {
    key: 'unsigned',
    label: 'Notarial signature areas are unsigned',
    subtitle: 'The notary can confirm any pre-signed sections if needed.',
  },
];
const IDENTITY_METHODS = {
  signer: 'Government ID, selfie match and knowledge check',
  witness: 'Government ID and selfie match',
  observer: 'Email verification',
  recipient: 'Email verification',
};
const VERIFIED_IDENTITY_STATUSES = ['verified', 'manual_review', 'alternate'];
const getMinimumBookingDate = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDateId = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

const parseDateId = date => new Date(`${date}T12:00:00`);

const formatDateLabel = date =>
  parseDateId(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const formatTimeLabel = date =>
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const getDefaultBookingTime = () => {
  const date = new Date();
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0);
  date.setHours(date.getHours() + 1);
  return formatTimeLabel(date);
};

const getNotarizeNowTimeLabel = () => {
  const date = new Date();
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0);
  return formatTimeLabel(date);
};

const getAvailableSlotOptions = selectedDate => {
  const day = parseDateId(selectedDate);
  const now = new Date();
  const sameDay = formatDateId(now) === selectedDate;
  const hours = [9, 11, 14, 16];
  const minutes = [0, 30, 0, 30];

  return hours
    .map((hour, index) => {
      const slot = new Date(day);
      slot.setHours(hour, minutes[index], 0, 0);
      return {
        id: `${selectedDate}-${hour}-${minutes[index]}`,
        date: selectedDate,
        time: formatTimeLabel(slot),
      };
    })
    .filter(slot => {
      if (!sameDay) {
        return true;
      }
      return parseTimeValue(slot.time).getTime() > now.getTime();
    })
    .slice(0, 4);
};

const parseTimeValue = value => {
  const date = new Date();
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) {
    return date;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatFileSize = size => {
  if (!size) {
    return 'File ready';
  }
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatCurrency = value => `$${Number(value || 0).toFixed(2)}`;

const formatPaymentStatusText = value => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return 'Pending';
  }

  return normalized
    .replace(/^local\s+/i, '')
    .replace(/^test\s+/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
};

const isDisplayablePaymentReference = value => {
  const normalized = String(value || '');
  return Boolean(normalized && !normalized.startsWith('local_payment_intent_'));
};

const isValidEmail = value => /\S+@\S+\.\S+/.test(String(value || '').trim());

const isImageDocument = document =>
  document?.type?.startsWith('image/') ||
  /\.(jpe?g|png|heic|webp)$/i.test(document?.name || '');

const isPdfDocument = document =>
  document?.type === 'application/pdf' || /\.pdf$/i.test(document?.name || '');

const isPreviewOnlyDocument = document =>
  String(document?.uri || '').startsWith('preview://');

const buildAppointmentDate = (date, time) => {
  const [, clock, meridiem] = time.match(/^(\d{1,2}:\d{2})\s(AM|PM)$/) || [];
  if (!clock) {
    return parseDateId(date).toISOString();
  }
  const [hourText, minute] = clock.split(':');
  let hour = Number(hourText);
  if (meridiem === 'PM' && hour !== 12) {
    hour += 12;
  }
  if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }
  const appointmentDate = parseDateId(date);
  appointmentDate.setHours(hour, Number(minute), 0, 0);
  return appointmentDate.toISOString();
};

const getOptionLabel = (options, key, fallback = 'Not selected') =>
  options.find(option => option.key === key)?.value || fallback;

const createDefaultParticipants = user => {
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  return [
    {
      id: 'primary-signer',
      role: 'signer',
      fullName,
      email: user?.email || '',
      phone: user?.phone_number || '',
      inviteStatus: 'ready',
    },
  ];
};

const createFullPreviewParticipants = user => {
  const [primarySigner] = createDefaultParticipants(user);
  return [
    {
      ...primarySigner,
      fullName: primarySigner.fullName || 'Alex Morgan',
      email: primarySigner.email || 'alex.us.local@notarizr.test',
      phone: primarySigner.phone || '+12025550147',
      inviteStatus: 'queued',
    },
    {
      id: 'preview-additional-signer',
      role: 'signer',
      fullName: 'Jordan Lee',
      email: 'jordan.signer@notarizr.test',
      phone: '+12025550162',
      inviteStatus: 'queued',
    },
    {
      id: 'preview-witness',
      role: 'witness',
      fullName: 'Taylor Brooks',
      email: 'taylor.witness@notarizr.test',
      phone: '+12025550183',
      inviteStatus: 'queued',
    },
    {
      id: 'preview-observer',
      role: 'observer',
      fullName: 'Morgan Patel',
      email: 'morgan.observer@notarizr.test',
      phone: '+12025550194',
      inviteStatus: 'queued',
    },
    {
      id: 'preview-recipient',
      role: 'recipient',
      fullName: 'Casey Rivera',
      email: 'casey.recipient@notarizr.test',
      phone: '+12025550205',
      inviteStatus: 'queued',
    },
  ];
};

const getParticipantStatus = participant => {
  if (!participant.fullName.trim() || !isValidEmail(participant.email)) {
    return {
      color: '#B33B3B',
      icon: 'alert-circle',
      label: 'Needs info',
      tone: 'blocked',
    };
  }
  if (participant.inviteStatus === 'sent') {
    return {
      color: '#168A52',
      icon: 'send',
      label: 'Invitation sent',
      tone: 'ready',
    };
  }
  if (participant.inviteStatus === 'queued') {
    return {
      color: '#168A52',
      icon: 'send',
      label: 'Invite queued',
      tone: 'ready',
    };
  }
  if (participant.inviteStatus === 'failed') {
    return {
      color: '#B33B3B',
      icon: 'alert-circle',
      label: 'Invite failed',
      tone: 'blocked',
    };
  }
  return {
    color: '#A86900',
    icon: 'clock',
    label: 'Ready to invite',
    tone: 'pending',
  };
};

const getParticipantIdentityMethod = participant =>
  IDENTITY_METHODS[participant.role] || IDENTITY_METHODS.signer;

const createIdentityCheck = participant => ({
  method: getParticipantIdentityMethod(participant),
  retriesRemaining: participant.role === 'signer' ? 2 : 1,
  status: 'not_started',
});

const getIdentityStatus = check => {
  if (check?.status === 'verified') {
    return {
      color: '#168A52',
      icon: 'check-circle',
      label: 'Verified',
      message: 'Identity check passed.',
    };
  }
  if (check?.status === 'captured') {
    return {
      color: '#A86900',
      icon: 'clock',
      label: 'Capture complete',
      message: 'Waiting for verification result.',
    };
  }
  if (check?.status === 'manual_review') {
    return {
      color: '#A86900',
      icon: 'alert-circle',
      label: 'Manual review',
      message: 'Support will review this signer before the session.',
    };
  }
  if (check?.status === 'alternate') {
    return {
      color: '#2378C3',
      icon: 'shuffle',
      label: 'Alternate method',
      message: 'Alternate verification path selected.',
    };
  }
  if (check?.status === 'failed') {
    return {
      color: '#B33B3B',
      icon: 'x-circle',
      label: 'Retry needed',
      message: 'Capture failed. Retry or choose another path.',
    };
  }
  return {
    color: '#8C929C',
    icon: 'shield',
    label: 'Not started',
    message: 'ID capture has not started yet.',
  };
};

const validateDocumentSelection = document => {
  const fileName = String(document?.name || document?.uri || '');
  const fileSize = Number(document?.size || 0);

  if (!/\.pdf$/i.test(fileName)) {
    return 'Please upload PDF only.';
  }

  if (fileSize > MAX_DOCUMENT_UPLOAD_BYTES) {
    return 'Each PDF must be 10 MB or smaller.';
  }

  return '';
};

const getEligibilityResult = ({
  documentCategory,
  languagePreference,
  signerCountry,
  signerState,
  documentJurisdiction,
}) => {
  const missing = [];
  if (!signerCountry) {
    missing.push('signer physical location');
  }
  if (signerCountry === 'US' && !signerState) {
    missing.push('signer state');
  }
  if (!documentJurisdiction) {
    missing.push('document jurisdiction');
  }
  if (!documentCategory) {
    missing.push('document category');
  }
  if (!languagePreference) {
    missing.push('language');
  }

  if (missing.length) {
    return {
      eligible: false,
      severity: 'incomplete',
      title: 'Eligibility details required',
      message: `Add ${missing.join(', ')} before continuing.`,
    };
  }

  if (signerCountry !== 'US') {
    return {
      eligible: false,
      severity: 'blocked',
      title: 'RON not available for this location yet',
      message:
        'This mobile flow currently supports signers physically located in the United States. Contact support before payment.',
    };
  }

  const category = DOCUMENT_CATEGORY_OPTIONS.find(
    option => option.key === documentCategory,
  );
  if (category && category.eligible === false) {
    return {
      eligible: false,
      severity: 'blocked',
      title: 'Document may not be eligible for RON',
      message: category.reason,
    };
  }

  const language = LANGUAGE_OPTIONS.find(
    option => option.key === languagePreference,
  );
  if (language && language.eligible === false) {
    return {
      eligible: false,
      severity: 'blocked',
      title: 'Language support must be confirmed',
      message: language.reason,
    };
  }

  if (documentCategory === 'other') {
    return {
      eligible: true,
      severity: 'warning',
      title: 'Notary review required',
      message:
        'You can continue, but the notary may ask for more detail before accepting the session.',
    };
  }

  return {
    eligible: true,
    severity: 'eligible',
    title: 'RON eligible to continue',
    message:
      'Final eligibility is confirmed by the assigned notary before the live session.',
  };
};

function SegmentedControl({onChange, value}) {
  return (
    <View style={styles.segmentedControl}>
      {[
        {label: 'Myself', value: 'self'},
        {label: 'Someone else', value: 'other'},
      ].map(option => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.7}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.selectedSegment]}>
            <Text
              style={[
                styles.segmentText,
                selected && styles.selectedSegmentText,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SelectField({
  data,
  label,
  onChange,
  placeholder,
  searchPlaceholder,
  value,
}) {
  const selectedOption = data.find(option => option.key === value);
  const defaultOption = selectedOption
    ? {key: selectedOption.key, value: selectedOption.value}
    : undefined;

  return (
    <View style={styles.selectField}>
      <Text style={styles.selectLabel}>{label}</Text>
      <SelectList
        boxStyles={styles.selectBox}
        data={data.map(option => ({key: option.key, value: option.value}))}
        defaultOption={defaultOption}
        dropdownStyles={styles.selectDropdown}
        dropdownTextStyles={styles.selectDropdownText}
        inputStyles={styles.selectInput}
        placeholder={placeholder}
        save="key"
        searchPlaceholder={searchPlaceholder || 'Search'}
        setSelected={onChange}
      />
    </View>
  );
}

function RONEligibilityStep({
  documentCategory,
  documentJurisdiction,
  eligibilityResult,
  languagePreference,
  onChangeDocumentCategory,
  onChangeDocumentJurisdiction,
  onChangeLanguagePreference,
  onChangeSignerCountry,
  onChangeSignerState,
  signerCountry,
  signerState,
}) {
  const statusIcon =
    eligibilityResult.severity === 'eligible'
      ? 'check-circle'
      : eligibilityResult.severity === 'warning'
      ? 'alert-circle'
      : 'x-circle';
  const statusStyle =
    eligibilityResult.severity === 'eligible'
      ? styles.eligibilitySuccess
      : eligibilityResult.severity === 'warning'
      ? styles.eligibilityWarning
      : styles.eligibilityBlocked;
  const statusIconColor =
    eligibilityResult.severity === 'eligible'
      ? '#168A52'
      : eligibilityResult.severity === 'warning'
      ? '#A86900'
      : '#B33B3B';
  const statusTextStyle =
    eligibilityResult.severity === 'eligible'
      ? styles.eligibilitySuccessText
      : eligibilityResult.severity === 'warning'
      ? styles.eligibilityWarningText
      : styles.eligibilityBlockedText;

  return (
    <>
      <BookingFlowSection
        subtitle="RON is online, but the notary still needs to confirm where the signer is physically located at signing time."
        title="RON eligibility">
        <Text style={styles.fieldGroupTitle}>Signer physical location</Text>
        <View style={styles.countryToggle}>
          {[
            {label: 'United States', value: 'US'},
            {label: 'Outside U.S.', value: 'OTHER'},
          ].map(option => {
            const selected = signerCountry === option.value;
            return (
              <TouchableOpacity
                activeOpacity={0.72}
                key={option.value}
                onPress={() => onChangeSignerCountry(option.value)}
                style={[
                  styles.countryOption,
                  selected && styles.countryActive,
                ]}>
                <Text
                  style={[
                    styles.countryOptionText,
                    selected && styles.countryActiveText,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {signerCountry === 'US' ? (
          <SelectField
            data={STATE_OPTIONS}
            label="Signer state at signing time"
            onChange={onChangeSignerState}
            placeholder="Select signer state"
            searchPlaceholder="Search states"
            value={signerState}
          />
        ) : null}

        <SelectField
          data={STATE_OPTIONS}
          label="Document jurisdiction"
          onChange={onChangeDocumentJurisdiction}
          placeholder="Select document jurisdiction"
          searchPlaceholder="Search states"
          value={documentJurisdiction}
        />
        <SelectField
          data={DOCUMENT_CATEGORY_OPTIONS}
          label="Document category"
          onChange={onChangeDocumentCategory}
          placeholder="Select document category"
          searchPlaceholder="Search categories"
          value={documentCategory}
        />
        <SelectField
          data={LANGUAGE_OPTIONS}
          label="Language"
          onChange={onChangeLanguagePreference}
          placeholder="Select language"
          searchPlaceholder="Search languages"
          value={languagePreference}
        />

        <View style={styles.readOnlyServiceType}>
          <View style={styles.readOnlyIcon}>
            <Feather name="video" size={17} color="#FD6D1F" />
          </View>
          <View style={styles.readOnlyCopy}>
            <Text style={styles.readOnlyLabel}>Service type</Text>
            <Text style={styles.readOnlyValue}>Remote online notarization</Text>
          </View>
        </View>

        <View style={[styles.eligibilityStatus, statusStyle]}>
          <Feather name={statusIcon} size={17} color={statusIconColor} />
          <View style={styles.eligibilityStatusCopy}>
            <Text style={[styles.eligibilityStatusTitle, statusTextStyle]}>
              {eligibilityResult.title}
            </Text>
            <Text style={[styles.eligibilityStatusMessage, statusTextStyle]}>
              {eligibilityResult.message}
            </Text>
          </View>
        </View>
      </BookingFlowSection>
    </>
  );
}

function AppointmentStep({
  addresses,
  bookingFor,
  datePickerOpen,
  isMobile,
  onManageAddresses,
  onChangeBookingFor,
  onChangeOtherName,
  onChangeOtherPhone,
  onChangeScheduleMode,
  onSelectAddress,
  onSelectDate,
  onSelectSlot,
  onSelectTime,
  onToggleDatePicker,
  onToggleTimePicker,
  otherName,
  otherPhone,
  scheduleMode,
  selectedAddress,
  selectedDate,
  selectedSlotId,
  selectedTime,
  slotOptions,
  timePickerOpen,
}) {
  return (
    <>
      <BookingFlowSection
        subtitle="Choose a preferred appointment slot."
        title="Date and time">
        <View style={styles.scheduleModeGrid}>
          {[
            {
              icon: 'zap',
              label: 'Notarize now',
              subtitle: 'Request the next available online notary',
              value: 'now',
            },
            {
              icon: 'calendar',
              label: 'Schedule',
              subtitle: 'Choose from available appointment slots',
              value: 'scheduled',
            },
          ].map(option => {
            const selected = scheduleMode === option.value;
            return (
              <TouchableOpacity
                activeOpacity={0.72}
                key={option.value}
                onPress={() => onChangeScheduleMode(option.value)}
                style={[
                  styles.scheduleModeCard,
                  selected && styles.selectedScheduleModeCard,
                ]}>
                <Feather
                  name={option.icon}
                  size={18}
                  color={selected ? '#FD6D1F' : '#8C929C'}
                />
                <Text
                  style={[
                    styles.scheduleModeLabel,
                    selected && styles.selectedScheduleModeLabel,
                  ]}>
                  {option.label}
                </Text>
                <Text style={styles.scheduleModeSubtitle}>
                  {option.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {scheduleMode === 'scheduled' ? (
          <>
            <TouchableOpacity
              activeOpacity={0.72}
              onPress={() => onToggleDatePicker(true)}
              style={styles.datePickerField}>
              <View style={styles.datePickerIcon}>
                <Feather name="calendar" size={20} color="#FD6D1F" />
              </View>
              <View style={styles.datePickerCopy}>
                <Text style={styles.datePickerLabel}>Preferred date</Text>
                <Text style={styles.datePickerValue}>
                  {formatDateLabel(selectedDate)}
                </Text>
              </View>
              <View style={styles.datePickerAction}>
                <Text style={styles.datePickerActionText}>Change</Text>
                <Feather name="chevron-right" size={18} color="#FD6D1F" />
              </View>
            </TouchableOpacity>
            <DatePicker
              date={parseDateId(selectedDate)}
              minimumDate={getMinimumBookingDate()}
              modal
              mode="date"
              onCancel={() => onToggleDatePicker(false)}
              onConfirm={date => {
                onToggleDatePicker(false);
                onSelectDate(formatDateId(date));
              }}
              open={datePickerOpen}
              title="Choose appointment date"
            />
            <View style={styles.slotGrid}>
              {slotOptions.map(slot => {
                const selected = selectedSlotId === slot.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.72}
                    key={slot.id}
                    onPress={() => onSelectSlot(slot)}
                    style={[styles.slotPill, selected && styles.selectedSlot]}>
                    <Text
                      style={[
                        styles.slotText,
                        selected && styles.selectedSlotText,
                      ]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              activeOpacity={0.72}
              onPress={() => onToggleTimePicker(true)}
              style={[styles.datePickerField, styles.timePickerField]}>
              <View style={styles.datePickerIcon}>
                <Feather name="clock" size={20} color="#FD6D1F" />
              </View>
              <View style={styles.datePickerCopy}>
                <Text style={styles.datePickerLabel}>Custom time</Text>
                <Text style={styles.datePickerValue}>{selectedTime}</Text>
              </View>
              <View style={styles.datePickerAction}>
                <Text style={styles.datePickerActionText}>Change</Text>
                <Feather name="chevron-right" size={18} color="#FD6D1F" />
              </View>
            </TouchableOpacity>
            <DatePicker
              date={parseTimeValue(selectedTime)}
              modal
              mode="time"
              onCancel={() => onToggleTimePicker(false)}
              onConfirm={date => {
                onToggleTimePicker(false);
                onSelectTime(formatTimeLabel(date));
              }}
              open={timePickerOpen}
              title="Choose appointment time"
            />
          </>
        ) : (
          <View style={styles.nowSummary}>
            <Feather name="zap" size={17} color="#168A52" />
            <Text style={styles.nowSummaryText}>
              We will request the next available notary. Estimated start:{' '}
              {selectedTime}.
            </Text>
          </View>
        )}
        <View style={styles.timeHint}>
          <Feather name="info" size={16} color="#2378C3" />
          <Text style={styles.timeHintText}>
            Choose any time that works for you. Your notary will confirm the
            request.
          </Text>
        </View>
      </BookingFlowSection>

      <BookingFlowSection
        subtitle="Tell us who will sign the documents."
        title="Who is this for?">
        <SegmentedControl onChange={onChangeBookingFor} value={bookingFor} />
        {bookingFor === 'other' ? (
          <View style={styles.formFields}>
            <View style={styles.inputShell}>
              <Feather name="user" size={17} color="#7D8490" />
              <TextInput
                onChangeText={onChangeOtherName}
                placeholder="Full name"
                placeholderTextColor="#A2A7B0"
                style={styles.textInput}
                value={otherName}
              />
            </View>
            <View style={styles.inputShell}>
              <Feather name="phone" size={17} color="#7D8490" />
              <TextInput
                keyboardType="phone-pad"
                onChangeText={onChangeOtherPhone}
                placeholder="Phone number"
                placeholderTextColor="#A2A7B0"
                style={styles.textInput}
                value={otherPhone}
              />
            </View>
          </View>
        ) : null}
      </BookingFlowSection>

      {isMobile ? (
        <BookingFlowSection
          subtitle="Select where the notary should meet you."
          title="Meeting address">
          {addresses.map(address => (
            <BookingChoice
              key={address._id || address.location}
              icon="map-pin"
              label={address.location}
              onPress={() => onSelectAddress(address)}
              selected={
                (selectedAddress?._id || selectedAddress?.location) ===
                (address._id || address.location)
              }
              subtitle={
                address.tag ? `${address.tag} address` : 'Saved address'
              }
            />
          ))}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onManageAddresses}
            style={styles.addAddressButton}>
            <Feather name="settings" size={16} color="#FD6D1F" />
            <Text style={styles.addAddressText}>Manage saved addresses</Text>
          </TouchableOpacity>
        </BookingFlowSection>
      ) : (
        <BookingFlowSection
          subtitle="Your appointment uses encrypted video and identity checks."
          title="Session format">
          <BookingChoice
            icon="video"
            label="Secure video appointment"
            onPress={() => {}}
            selected
            subtitle="Join from your phone, tablet, or computer"
          />
        </BookingFlowSection>
      )}
    </>
  );
}

function PrintOption({label, onPress, selected, subtitle}) {
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{selected}}
      activeOpacity={0.72}
      onPress={onPress}
      style={[styles.printOption, selected && styles.selectedPrintOption]}>
      <View style={[styles.radio, selected && styles.selectedRadio]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.printOptionCopy}>
        <Text
          style={[
            styles.printOptionLabel,
            selected && styles.selectedPrintOptionLabel,
          ]}>
          {label}
        </Text>
        <Text style={styles.printOptionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ConfirmationToggle({checked, label, onPress, subtitle}) {
  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={[styles.confirmationToggle, checked && styles.checkedToggle]}>
      <View style={[styles.checkbox, checked && styles.checkedBox]}>
        {checked ? <Feather name="check" size={13} color="#FFFFFF" /> : null}
      </View>
      <View style={styles.confirmationToggleCopy}>
        <Text style={styles.confirmationToggleLabel}>{label}</Text>
        <Text style={styles.confirmationToggleSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ParticipantStep({
  onAddParticipant,
  onRemoveParticipant,
  onSendInvitations,
  onUpdateParticipant,
  participants,
}) {
  return (
    <BookingFlowSection
      subtitle="Add every person who should be in the session or receive the final document."
      title="Participants">
      <View style={styles.participantList}>
        {participants.map((participant, index) => {
          const status = getParticipantStatus(participant);
          return (
            <View key={participant.id} style={styles.participantCard}>
              <View style={styles.participantHeader}>
                <View>
                  <Text style={styles.participantTitle}>
                    {getOptionLabel(PARTICIPANT_ROLE_OPTIONS, participant.role)}{' '}
                    {index + 1}
                  </Text>
                  <View style={styles.participantStatusRow}>
                    <Feather
                      name={status.icon}
                      size={13}
                      color={status.color}
                    />
                    <Text
                      style={[
                        styles.participantStatusText,
                        {color: status.color},
                      ]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
                {participant.id === 'primary-signer' ? null : (
                  <TouchableOpacity
                    accessibilityLabel="Remove participant"
                    onPress={() => onRemoveParticipant(participant.id)}
                    style={styles.participantRemove}>
                    <Feather name="trash-2" size={16} color="#C93C3C" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.rolePills}>
                {PARTICIPANT_ROLE_OPTIONS.map(option => {
                  const selected = participant.role === option.key;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.72}
                      key={option.key}
                      onPress={() =>
                        onUpdateParticipant(participant.id, {
                          role: option.key,
                          inviteStatus: 'ready',
                        })
                      }
                      style={[
                        styles.rolePill,
                        selected && styles.selectedRolePill,
                      ]}>
                      <Text
                        style={[
                          styles.rolePillText,
                          selected && styles.selectedRolePillText,
                        ]}>
                        {option.value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputShell}>
                <Feather name="user" size={17} color="#7D8490" />
                <TextInput
                  onChangeText={value =>
                    onUpdateParticipant(participant.id, {
                      fullName: value,
                      inviteStatus: 'ready',
                    })
                  }
                  placeholder="Full name"
                  placeholderTextColor="#A2A7B0"
                  style={styles.textInput}
                  value={participant.fullName}
                />
              </View>
              <View style={styles.inputShell}>
                <Feather name="mail" size={17} color="#7D8490" />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={value =>
                    onUpdateParticipant(participant.id, {
                      email: value,
                      inviteStatus: 'ready',
                    })
                  }
                  placeholder="Email"
                  placeholderTextColor="#A2A7B0"
                  style={styles.textInput}
                  value={participant.email}
                />
              </View>
              <View style={styles.inputShell}>
                <Feather name="phone" size={17} color="#7D8490" />
                <TextInput
                  keyboardType="phone-pad"
                  onChangeText={value =>
                    onUpdateParticipant(participant.id, {
                      phone: value,
                      inviteStatus: 'ready',
                    })
                  }
                  placeholder="Phone (optional)"
                  placeholderTextColor="#A2A7B0"
                  style={styles.textInput}
                  value={participant.phone}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.participantActions}>
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={onAddParticipant}
          style={styles.addParticipantButton}>
          <Feather name="user-plus" size={16} color="#D65322" />
          <Text style={styles.addParticipantText}>Add person</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={onSendInvitations}
          style={styles.sendInviteButton}>
          <Feather name="send" size={16} color="#FFFFFF" />
          <Text style={styles.sendInviteText}>Send invites</Text>
        </TouchableOpacity>
      </View>
    </BookingFlowSection>
  );
}

function UploadAndPrintStep({
  additionalSeals,
  additionalSignatures,
  completionChecks,
  deadlineDate,
  deadlinePickerOpen,
  isMobile,
  notarialAct,
  notes,
  onChangeCompletionCheck,
  onChangeDeadlineDate,
  onChangeDeadlinePickerOpen,
  onChangeNotes,
  onChangeNotarialAct,
  onChangePrintCopies,
  onChangeSeals,
  onChangeSigners,
  onChangeWitnesses,
  onChooseDocuments,
  onRemoveDocument,
  onReplaceDocument,
  onTogglePrint,
  openInitialPreview,
  platformWitnesses,
  printCopies,
  uploadedDocuments,
  wantsPrint,
}) {
  const uploaded = uploadedDocuments.length > 0;
  const [previewDocument, setPreviewDocument] = useState(null);
  const openedInitialPreviewRef = useRef(false);

  useEffect(() => {
    if (
      openInitialPreview &&
      !openedInitialPreviewRef.current &&
      uploadedDocuments[0]
    ) {
      openedInitialPreviewRef.current = true;
      setPreviewDocument(uploadedDocuments[0]);
    }
  }, [openInitialPreview, uploadedDocuments]);

  return (
    <>
      <BookingFlowSection
        subtitle={
          isMobile
            ? wantsPrint
              ? 'Required so the notary can prepare your printouts.'
              : 'Optional for mobile notary. You can bring the document with you.'
            : 'Upload a readable copy for the assigned notary.'
        }
        title={isMobile ? 'Document upload (optional)' : 'Document upload'}>
        {uploaded ? (
          <View style={styles.documentList}>
            <Text style={styles.documentCostHint}>
              {uploadedDocuments.length}{' '}
              {uploadedDocuments.length === 1 ? 'document' : 'documents'}{' '}
              attached — set how many seals, signers and witnesses this
              notarization needs below.
            </Text>
            {uploadedDocuments.map((document, index) => (
              <View key={document.id} style={styles.uploadedDocumentCard}>
                <TouchableOpacity
                  accessibilityLabel={`Preview ${document.name}`}
                  activeOpacity={0.75}
                  onPress={() => setPreviewDocument(document)}
                  style={styles.documentPreviewButton}>
                  {isImageDocument(document) ? (
                    <Image
                      resizeMode="cover"
                      source={{uri: document.uri}}
                      style={styles.documentThumbnail}
                    />
                  ) : isPdfDocument(document) &&
                    !isPreviewOnlyDocument(document) ? (
                    <View pointerEvents="none" style={styles.documentThumbnail}>
                      <Pdf
                        page={1}
                        singlePage
                        source={{uri: document.uri}}
                        style={styles.documentPdfThumbnail}
                      />
                    </View>
                  ) : (
                    <View style={styles.documentFileIcon}>
                      <Feather name="file" size={21} color="#FD6D1F" />
                    </View>
                  )}
                  <View style={styles.documentFileCopy}>
                    <Text numberOfLines={1} style={styles.documentFileName}>
                      {document.name || `Document ${index + 1}`}
                    </Text>
                    <Text style={styles.documentFileMeta}>
                      {formatFileSize(document.size)} · Tap to preview
                    </Text>
                  </View>
                  <Feather name="eye" size={18} color="#737B87" />
                </TouchableOpacity>
                <View style={styles.documentActions}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onReplaceDocument(document.id)}
                    style={styles.documentActionButton}>
                    <Feather name="edit-2" size={15} color="#D65322" />
                    <Text style={styles.documentEditText}>Replace</Text>
                  </TouchableOpacity>
                  <View style={styles.documentActionDivider} />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onRemoveDocument(document.id)}
                    style={styles.documentActionButton}>
                    <Feather name="trash-2" size={15} color="#C93C3C" />
                    <Text style={styles.documentRemoveText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              activeOpacity={0.72}
              onPress={onChooseDocuments}
              style={styles.addDocumentButton}>
              <Feather name="plus" size={17} color="#D65322" />
              <Text style={styles.addDocumentText}>Add another document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.74}
            onPress={onChooseDocuments}
            style={styles.uploadArea}>
            <View style={styles.uploadIcon}>
              <Feather name="upload-cloud" size={23} color="#FD6D1F" />
            </View>
            <View style={styles.uploadCopy}>
              <Text style={styles.uploadTitle}>Choose documents</Text>
              <Text style={styles.uploadSubtitle}>
                Please upload PDF only · Up to 10 MB
              </Text>
            </View>
            <Text style={styles.uploadAction}>Browse</Text>
          </TouchableOpacity>
        )}
      </BookingFlowSection>

      {isMobile ? (
        <BookingFlowSection
          subtitle={`Printed copies cost $${PRINT_COPY_PRICE.toFixed(
            2,
          )} each. A document upload is required if you choose yes.`}
          title="Do you need printed copies?">
          <View style={styles.printOptions}>
            <PrintOption
              label="No, I'll bring it"
              onPress={() => onTogglePrint(false)}
              selected={!wantsPrint}
              subtitle="No printing charge"
            />
            <PrintOption
              label="Yes, print it"
              onPress={() => onTogglePrint(true)}
              selected={wantsPrint}
              subtitle={`$${PRINT_COPY_PRICE.toFixed(2)} per copy`}
            />
          </View>
          {wantsPrint ? (
            <View style={styles.printQuantityRow}>
              <View>
                <Text style={styles.stepperLabel}>Number of printouts</Text>
                <Text style={styles.stepperHint}>
                  Added cost: ${(printCopies * PRINT_COPY_PRICE).toFixed(2)}
                </Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  accessibilityLabel="Remove printed copy"
                  disabled={printCopies === 1}
                  onPress={() =>
                    onChangePrintCopies(Math.max(1, printCopies - 1))
                  }
                  style={styles.stepperButton}>
                  <Feather
                    name="minus"
                    size={17}
                    color={printCopies === 1 ? '#C4C8CE' : '#303642'}
                  />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{printCopies}</Text>
                <TouchableOpacity
                  accessibilityLabel="Add printed copy"
                  disabled={printCopies === 10}
                  onPress={() =>
                    onChangePrintCopies(Math.min(10, printCopies + 1))
                  }
                  style={styles.stepperButton}>
                  <Feather name="plus" size={17} color="#303642" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </BookingFlowSection>
      ) : null}

      <BookingFlowSection
        subtitle="Confirm what the notary should prepare before the appointment."
        title="Document preparation">
        <SelectField
          data={NOTARIAL_ACT_OPTIONS}
          label="Requested notarial act"
          onChange={onChangeNotarialAct}
          placeholder="Select act"
          searchPlaceholder="Search acts"
          value={notarialAct}
        />
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={() => onChangeDeadlinePickerOpen(true)}
          style={styles.deadlineField}>
          <View style={styles.datePickerIcon}>
            <Feather name="flag" size={20} color="#FD6D1F" />
          </View>
          <View style={styles.datePickerCopy}>
            <Text style={styles.datePickerLabel}>Deadline</Text>
            <Text style={styles.datePickerValue}>
              {formatDateLabel(deadlineDate)}
            </Text>
          </View>
          <View style={styles.datePickerAction}>
            <Text style={styles.datePickerActionText}>Change</Text>
            <Feather name="chevron-right" size={18} color="#FD6D1F" />
          </View>
        </TouchableOpacity>
        <DatePicker
          date={parseDateId(deadlineDate)}
          minimumDate={getMinimumBookingDate()}
          modal
          mode="date"
          onCancel={() => onChangeDeadlinePickerOpen(false)}
          onConfirm={date => {
            onChangeDeadlinePickerOpen(false);
            onChangeDeadlineDate(formatDateId(date));
          }}
          open={deadlinePickerOpen}
          title="Choose document deadline"
        />
        <View style={styles.completenessList}>
          {COMPLETENESS_ITEMS.map(item => (
            <ConfirmationToggle
              checked={Boolean(completionChecks[item.key])}
              key={item.key}
              label={item.label}
              onPress={() => onChangeCompletionCheck(item.key)}
              subtitle={item.subtitle}
            />
          ))}
        </View>
        <View style={styles.notesShell}>
          <TextInput
            multiline
            onChangeText={onChangeNotes}
            placeholder="Special instructions for your notary"
            placeholderTextColor="#A2A7B0"
            style={styles.notesInput}
            textAlignVertical="top"
            value={notes}
          />
        </View>
      </BookingFlowSection>

      <BookingFlowSection
        subtitle="Your first seal and signer are included in the base price. Extra stamps, signers and witnesses each add to the estimate."
        title="Signing details">
        <View style={styles.stepperRow}>
          <View>
            <Text style={styles.stepperLabel}>
              Additional signatures required
            </Text>
            <Text style={styles.stepperHint}>
              ${ADDITIONAL_SIGNER_PRICE.toFixed(2)} each
              {additionalSignatures > 0
                ? ` · $${(
                    additionalSignatures * ADDITIONAL_SIGNER_PRICE
                  ).toFixed(2)} added`
                : ''}
            </Text>
          </View>
          <View style={styles.stepper}>
            <TouchableOpacity
              accessibilityLabel="Remove signer"
              activeOpacity={0.7}
              disabled={additionalSignatures === 0}
              onPress={() =>
                onChangeSigners(Math.max(0, additionalSignatures - 1))
              }
              style={styles.stepperButton}>
              <Feather
                name="minus"
                size={17}
                color={additionalSignatures === 0 ? '#C4C8CE' : '#303642'}
              />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{additionalSignatures}</Text>
            <TouchableOpacity
              accessibilityLabel="Add signer"
              activeOpacity={0.7}
              disabled={additionalSignatures === 10}
              onPress={() =>
                onChangeSigners(Math.min(10, additionalSignatures + 1))
              }
              style={styles.stepperButton}>
              <Feather name="plus" size={17} color="#303642" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.stepperRow}>
          <View>
            <Text style={styles.stepperLabel}>Additional seals</Text>
            <Text style={styles.stepperHint}>
              ${ADDITIONAL_SEAL_PRICE.toFixed(2)} each
              {additionalSeals > 0
                ? ` · $${(additionalSeals * ADDITIONAL_SEAL_PRICE).toFixed(
                    2,
                  )} added`
                : ''}
            </Text>
          </View>
          <View style={styles.stepper}>
            <TouchableOpacity
              accessibilityLabel="Remove seal"
              activeOpacity={0.7}
              disabled={additionalSeals === 0}
              onPress={() => onChangeSeals(Math.max(0, additionalSeals - 1))}
              style={styles.stepperButton}>
              <Feather
                name="minus"
                size={17}
                color={additionalSeals === 0 ? '#C4C8CE' : '#303642'}
              />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{additionalSeals}</Text>
            <TouchableOpacity
              accessibilityLabel="Add seal"
              activeOpacity={0.7}
              disabled={additionalSeals === 10}
              onPress={() => onChangeSeals(Math.min(10, additionalSeals + 1))}
              style={styles.stepperButton}>
              <Feather name="plus" size={17} color="#303642" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.stepperRow}>
          <View>
            <Text style={styles.stepperLabel}>Notarizr-provided witnesses</Text>
            <Text style={styles.stepperHint}>
              ${PLATFORM_WITNESS_PRICE.toFixed(2)} each
              {platformWitnesses > 0
                ? ` · $${(platformWitnesses * PLATFORM_WITNESS_PRICE).toFixed(
                    2,
                  )} added`
                : ''}
            </Text>
          </View>
          <View style={styles.stepper}>
            <TouchableOpacity
              accessibilityLabel="Remove witness"
              activeOpacity={0.7}
              disabled={platformWitnesses === 0}
              onPress={() =>
                onChangeWitnesses(Math.max(0, platformWitnesses - 1))
              }
              style={styles.stepperButton}>
              <Feather
                name="minus"
                size={17}
                color={platformWitnesses === 0 ? '#C4C8CE' : '#303642'}
              />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{platformWitnesses}</Text>
            <TouchableOpacity
              accessibilityLabel="Add witness"
              activeOpacity={0.7}
              disabled={platformWitnesses === 5}
              onPress={() =>
                onChangeWitnesses(Math.min(5, platformWitnesses + 1))
              }
              style={styles.stepperButton}>
              <Feather name="plus" size={17} color="#303642" />
            </TouchableOpacity>
          </View>
        </View>
      </BookingFlowSection>

      <Modal
        animationType="slide"
        onRequestClose={() => setPreviewDocument(null)}
        transparent
        visible={Boolean(previewDocument)}>
        <View style={styles.previewBackdrop}>
          <View style={styles.previewSheet}>
            <View style={styles.previewHeader}>
              <View style={styles.previewHeadingCopy}>
                <Text numberOfLines={1} style={styles.previewTitle}>
                  {previewDocument?.name}
                </Text>
                <Text style={styles.previewSubtitle}>
                  {formatFileSize(previewDocument?.size)}
                </Text>
              </View>
              <TouchableOpacity
                accessibilityLabel="Close preview"
                onPress={() => setPreviewDocument(null)}
                style={styles.previewCloseButton}>
                <Feather name="x" size={21} color="#303642" />
              </TouchableOpacity>
            </View>
            <View style={styles.previewBody}>
              {isImageDocument(previewDocument) ? (
                <Image
                  resizeMode="contain"
                  source={{uri: previewDocument?.uri}}
                  style={styles.imagePreview}
                />
              ) : isPdfDocument(previewDocument) &&
                !isPreviewOnlyDocument(previewDocument) ? (
                <Pdf
                  source={{uri: previewDocument?.uri}}
                  style={styles.pdfPreview}
                />
              ) : (
                <View style={styles.genericPreview}>
                  <View style={styles.genericPreviewIcon}>
                    <Feather name="file" size={36} color="#FD6D1F" />
                  </View>
                  <Text style={styles.genericPreviewTitle}>
                    {isPreviewOnlyDocument(previewDocument)
                      ? 'Sample document attached'
                      : 'Preview unavailable'}
                  </Text>
                  <Text style={styles.genericPreviewText}>
                    {isPreviewOnlyDocument(previewDocument)
                      ? 'This test document is ready for the booking preview.'
                      : 'This file is selected and ready to attach.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function IdentityVerificationStep({
  identityChecks,
  onCaptureId,
  onChooseAlternate,
  onManualReview,
  onRetryIdentity,
  participants,
}) {
  const signerParticipants = useMemo(
    () => participants.filter(participant => participant.role === 'signer'),
    [participants],
  );

  return (
    <BookingFlowSection
      subtitle="Complete or route identity checks for every signer before review."
      title="Identity verification">
      <View style={styles.identityList}>
        {signerParticipants.map((participant, index) => {
          const check =
            identityChecks[participant.id] || createIdentityCheck(participant);
          const status = getIdentityStatus(check);
          const canRetry =
            check.status === 'failed' && Number(check.retriesRemaining) > 0;

          return (
            <View key={participant.id} style={styles.identityCard}>
              <View style={styles.identityHeader}>
                <View style={styles.identityAvatar}>
                  <Feather name="user-check" size={19} color="#FD6D1F" />
                </View>
                <View style={styles.identityHeadingCopy}>
                  <Text style={styles.identityName}>
                    {participant.fullName || `Signer ${index + 1}`}
                  </Text>
                  <Text style={styles.identityMethod}>{check.method}</Text>
                </View>
              </View>

              <View style={styles.identityStatusBox}>
                <Feather name={status.icon} size={16} color={status.color} />
                <View style={styles.identityStatusCopy}>
                  <Text
                    style={[styles.identityStatusTitle, {color: status.color}]}>
                    {status.label}
                  </Text>
                  <Text style={styles.identityStatusText}>
                    {status.message}
                  </Text>
                </View>
              </View>

              <View style={styles.identityMetaRow}>
                <Text style={styles.identityMetaLabel}>Permitted retries</Text>
                <Text style={styles.identityMetaValue}>
                  {check.retriesRemaining} remaining
                </Text>
              </View>

              <View style={styles.identityActions}>
                <TouchableOpacity
                  activeOpacity={0.72}
                  onPress={() => onCaptureId(participant.id)}
                  style={styles.identityPrimaryAction}>
                  <Feather name="camera" size={15} color="#FFFFFF" />
                  <Text style={styles.identityPrimaryText}>Capture ID</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.72}
                  disabled={!canRetry}
                  onPress={() => onRetryIdentity(participant.id)}
                  style={[
                    styles.identitySecondaryAction,
                    !canRetry && styles.disabledIdentityAction,
                  ]}>
                  <Feather
                    name="rotate-ccw"
                    size={15}
                    color={canRetry ? '#D65322' : '#AEB4BC'}
                  />
                  <Text
                    style={[
                      styles.identitySecondaryText,
                      !canRetry && styles.disabledIdentityText,
                    ]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.identityRouteActions}>
                <TouchableOpacity
                  activeOpacity={0.72}
                  onPress={() => onManualReview(participant.id)}
                  style={styles.identityRouteButton}>
                  <Feather name="user-check" size={14} color="#A86900" />
                  <Text style={styles.identityManualText}>Manual review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.72}
                  onPress={() => onChooseAlternate(participant.id)}
                  style={styles.identityRouteButton}>
                  <Feather name="shuffle" size={14} color="#2378C3" />
                  <Text style={styles.identityAlternateText}>
                    Alternate method
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </BookingFlowSection>
  );
}

function SummaryRow({icon, label, last, onEdit, value}) {
  return (
    <View style={[styles.summaryRow, last && styles.lastSummaryRow]}>
      <View style={styles.summaryIcon}>
        <Feather name={icon} size={16} color="#FD6D1F" />
      </View>
      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
      {onEdit ? (
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={onEdit}
          style={styles.summaryEditButton}>
          <Feather name="edit-2" size={14} color="#D65322" />
          <Text style={styles.summaryEditText}>Edit</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ReviewStep({
  additionalSeals,
  additionalSignatures,
  appointmentDisplay,
  bookingFor,
  dateLabel,
  documentPrepSummary,
  documentType,
  eligibilitySummary,
  identitySummary,
  isMobile,
  location,
  onEditAppointment,
  onEditDocuments,
  onEditEligibility,
  onEditIdentity,
  onEditParticipants,
  otherName,
  participants,
  platformWitnesses,
  printCopies,
  printingCharge,
  priceQuote,
  priceQuoteLoading,
  serviceName,
  time,
  uploadedDocumentsCount = 0,
}) {
  return (
    <>
      <BookingFlowSection
        subtitle="Check the details before sending your request."
        title="Booking summary">
        <View style={styles.summaryList}>
          <SummaryRow icon="briefcase" label="Service" value={serviceName} />
          <SummaryRow
            icon="calendar"
            label="Appointment"
            onEdit={onEditAppointment}
            value={appointmentDisplay || `${dateLabel} at ${time}`}
          />
          <SummaryRow
            icon={isMobile ? 'map-pin' : 'video'}
            label={isMobile ? 'Meeting address' : 'Signer location'}
            onEdit={isMobile ? onEditAppointment : onEditEligibility}
            value={location}
          />
          {!isMobile ? (
            <>
              <SummaryRow
                icon="map"
                label="Document jurisdiction"
                onEdit={onEditEligibility}
                value={eligibilitySummary?.documentJurisdiction}
              />
              <SummaryRow
                icon="tag"
                label="Category and language"
                onEdit={onEditEligibility}
                value={`${eligibilitySummary?.documentCategory} · ${eligibilitySummary?.language}`}
              />
            </>
          ) : null}
          <SummaryRow
            icon="file-text"
            label="Documents"
            onEdit={onEditDocuments}
            value={
              uploadedDocumentsCount > 0
                ? `${uploadedDocumentsCount} ${
                    uploadedDocumentsCount === 1 ? 'document' : 'documents'
                  }${documentType ? ` (${documentType})` : ''} to notarize`
                : 'Bring to appointment'
            }
          />
          <SummaryRow
            icon="check-square"
            label="Preparation"
            onEdit={onEditDocuments}
            value={`${documentPrepSummary.notarialAct} by ${documentPrepSummary.deadline}`}
          />
          <SummaryRow
            icon="users"
            label="Participants"
            onEdit={onEditParticipants}
            value={`${participants.length} ${
              participants.length === 1 ? 'person' : 'people'
            } added`}
          />
          <SummaryRow
            icon="shield"
            label="Identity checks"
            onEdit={onEditIdentity}
            value={identitySummary}
          />
          {isMobile ? (
            <SummaryRow
              icon="printer"
              label="Printed copies"
              onEdit={onEditDocuments}
              value={
                printCopies > 0
                  ? `${printCopies} ${printCopies === 1 ? 'copy' : 'copies'}`
                  : 'Not requested'
              }
            />
          ) : null}
          <SummaryRow
            icon="edit-3"
            label="Seals, signers & witnesses"
            last
            onEdit={onEditDocuments}
            value={`${additionalSeals} extra ${
              additionalSeals === 1 ? 'seal' : 'seals'
            }, ${additionalSignatures} extra ${
              additionalSignatures === 1 ? 'signer' : 'signers'
            }, ${platformWitnesses} ${
              platformWitnesses === 1 ? 'witness' : 'witnesses'
            } for ${bookingFor === 'self' ? 'my booking' : otherName}`}
          />
        </View>
      </BookingFlowSection>

      <BookingFlowSection
        subtitle="You will only be charged after a notary accepts."
        title="Estimated total">
        <PricingBreakdown
          breakdown={priceQuote}
          initiallyExpanded
          printingCharge={printingCharge}
          printingCopies={printCopies}
        />
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={onEditDocuments}
          style={styles.priceEditButton}>
          <Feather name="edit-2" size={15} color="#D65322" />
          <Text style={styles.priceEditText}>Edit price inputs</Text>
        </TouchableOpacity>
        {priceQuoteLoading ? (
          <Text style={styles.quoteLoadingText}>Updating price…</Text>
        ) : null}
        <View style={styles.paymentNotice}>
          <Feather name="shield" size={16} color="#168A52" />
          <Text style={styles.paymentNoticeText}>
            Payment details are encrypted and protected.
          </Text>
        </View>
      </BookingFlowSection>
    </>
  );
}

function PaymentAuthorizationStep({
  paymentAuthorization,
  price,
  priceQuote,
  priceQuoteLoading,
  printingCharge,
  printCopies,
}) {
  const status = paymentAuthorization?.status || 'idle';
  const statusMeta =
    status === 'authorized'
      ? {
          color: '#168A52',
          icon: 'check-circle',
          label: 'Authorized',
          message:
            paymentAuthorization?.message ||
            'Payment authorization is linked to this request.',
        }
      : status === 'failed'
      ? {
          color: '#B33B3B',
          icon: 'alert-circle',
          label: 'Needs attention',
          message:
            paymentAuthorization?.message ||
            'Your request was saved. You can retry payment without starting over.',
        }
      : status === 'deferred'
      ? {
          color: '#A86900',
          icon: 'clock',
          label: 'Deferred',
          message:
            paymentAuthorization?.message ||
            'Payment authorization will be requested when a notary is assigned.',
        }
      : status === 'authorizing'
      ? {
          color: '#2874C9',
          icon: 'loader',
          label: 'Authorizing',
          message: 'Opening secure payment authorization.',
        }
      : {
          color: '#646B76',
          icon: 'credit-card',
          label: 'Ready',
          message:
            'Authorize payment after your request is saved. If authorization fails, the request stays intact.',
        };

  return (
    <>
      <BookingFlowSection
        subtitle="Review the itemized total and authorize payment securely."
        title="Payment">
        <PricingBreakdown
          breakdown={priceQuote}
          initiallyExpanded
          printingCharge={printingCharge}
          printingCopies={printCopies}
        />
        {priceQuoteLoading ? (
          <Text style={styles.quoteLoadingText}>Updating price…</Text>
        ) : null}
        <View style={styles.paymentSummaryCard}>
          <View style={styles.paymentSummaryHeader}>
            <View>
              <Text style={styles.paymentSummaryLabel}>
                Amount to authorize
              </Text>
              <Text style={styles.paymentSummaryAmount}>
                {formatCurrency(price)}
              </Text>
            </View>
            <View style={styles.paymentMethodBadge}>
              <Feather name="lock" size={13} color="#168A52" />
              <Text style={styles.paymentMethodText}>Secure</Text>
            </View>
          </View>
          <View style={styles.paymentInfoRow}>
            <Feather
              name={statusMeta.icon}
              size={17}
              color={statusMeta.color}
            />
            <View style={styles.paymentInfoCopy}>
              <Text
                style={[styles.paymentInfoTitle, {color: statusMeta.color}]}>
                {statusMeta.label}
              </Text>
              <Text style={styles.paymentInfoText}>{statusMeta.message}</Text>
            </View>
          </View>
          <View style={styles.paymentDivider} />
          <View style={styles.paymentDetailRow}>
            <Text style={styles.paymentDetailLabel}>Receipt</Text>
            <Text style={styles.paymentDetailValue}>
              {paymentAuthorization?.receiptStatus ||
                'Provided after authorization'}
            </Text>
          </View>
          <View style={styles.paymentDetailRow}>
            <Text style={styles.paymentDetailLabel}>Refund status</Text>
            <Text style={styles.paymentDetailValue}>
              {paymentAuthorization?.refundStatus || 'Not requested'}
            </Text>
          </View>
          {paymentAuthorization?.paymentIntentId ? (
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Payment reference</Text>
              <Text style={styles.paymentDetailValue} numberOfLines={1}>
                {paymentAuthorization.paymentIntentId}
              </Text>
            </View>
          ) : null}
        </View>
      </BookingFlowSection>
    </>
  );
}

function Confirmation({
  booking,
  navigation,
  onRetryPayment,
  paymentAuthorization,
  paymentRetrying,
  serviceName,
}) {
  const shouldTrackAssignment =
    booking.service_type === 'mobile_notary' &&
    booking.status === 'pending' &&
    !booking.agent;
  const {data, stopPolling} = useQuery(GET_BOOKING_BY_ID, {
    variables: {bookingId: booking._id},
    skip: !shouldTrackAssignment,
    fetchPolicy: 'network-only',
    pollInterval: 30000,
  });
  const currentBooking = data?.getBookingById?.booking || booking;
  const isWaitingForAgent =
    currentBooking.service_type === 'mobile_notary' &&
    currentBooking.status === 'pending' &&
    !currentBooking.agent;

  useEffect(() => {
    if (shouldTrackAssignment && !isWaitingForAgent) {
      stopPolling();
    }
  }, [isWaitingForAgent, shouldTrackAssignment, stopPolling]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.confirmationHeader}>
        <Text style={styles.confirmationHeaderText}>
          {isWaitingForAgent ? 'Finding your notary' : 'Request sent'}
        </Text>
      </View>
      <View style={styles.confirmationContent}>
        {isWaitingForAgent ? (
          <View style={styles.waitingAnimationShell}>
            <LottieView
              accessibilityLabel="Searching for an available notary"
              autoPlay
              loop
              resizeMode="contain"
              source={require('../../../assets/loadingAnimation.json')}
              style={styles.waitingAnimation}
            />
          </View>
        ) : (
          <View style={styles.successIcon}>
            <Feather name="check" size={36} color="#168A52" />
          </View>
        )}
        <Text style={styles.successTitle}>
          {isWaitingForAgent
            ? 'We’re finding the best match'
            : 'Your notary is assigned'}
        </Text>
        <Text style={styles.successMessage}>
          {isWaitingForAgent
            ? 'We’ll be assigning the best agent for you soon'
            : `Your ${serviceName.toLowerCase()} request has been sent to an available verified notary.`}
        </Text>
        <View style={styles.referenceRow}>
          <Text style={styles.referenceLabel}>Request reference</Text>
          <Text style={styles.referenceValue}>
            #{getBookingDisplayId(currentBooking)}
          </Text>
        </View>
        {paymentAuthorization?.status &&
        paymentAuthorization.status !== 'idle' ? (
          <View
            style={[
              styles.confirmationPaymentCard,
              paymentAuthorization.status === 'authorized' &&
                styles.confirmationPaymentCardSuccess,
              paymentAuthorization.status === 'failed' &&
                styles.confirmationPaymentCardError,
            ]}>
            <View style={styles.confirmationPaymentHeader}>
              <View
                style={[
                  styles.confirmationPaymentIcon,
                  paymentAuthorization.status === 'failed' &&
                    styles.confirmationPaymentIconError,
                  paymentAuthorization.status !== 'authorized' &&
                    paymentAuthorization.status !== 'failed' &&
                    styles.confirmationPaymentIconPending,
                ]}>
                <Feather
                  name={
                    paymentAuthorization.status === 'authorized'
                      ? 'check'
                      : paymentAuthorization.status === 'failed'
                      ? 'alert-circle'
                      : 'clock'
                  }
                  size={17}
                  color={
                    paymentAuthorization.status === 'authorized'
                      ? '#168A52'
                      : paymentAuthorization.status === 'failed'
                      ? '#B33B3B'
                      : '#A86900'
                  }
                />
              </View>
              <View style={styles.confirmationPaymentTitleCopy}>
                <Text style={styles.confirmationPaymentTitle}>
                  {paymentAuthorization.status === 'authorized'
                    ? 'Payment authorization saved'
                    : paymentAuthorization.status === 'failed'
                    ? 'Payment not authorized'
                    : 'Payment pending'}
                </Text>
                <Text style={styles.confirmationPaymentSubtitle}>
                  Your booking details are saved.
                </Text>
              </View>
            </View>
            <Text style={styles.confirmationPaymentText}>
              {paymentAuthorization.message}
            </Text>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Receipt</Text>
              <Text style={styles.paymentDetailValue}>
                {formatPaymentStatusText(paymentAuthorization.receiptStatus)}
              </Text>
            </View>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Refund status</Text>
              <Text style={styles.paymentDetailValue}>
                {formatPaymentStatusText(
                  paymentAuthorization.refundStatus || 'Not requested',
                )}
              </Text>
            </View>
            {isDisplayablePaymentReference(
              paymentAuthorization.paymentIntentId,
            ) ? (
              <View style={styles.paymentDetailRow}>
                <Text style={styles.paymentDetailLabel}>Payment reference</Text>
                <Text style={styles.paymentDetailValue} numberOfLines={1}>
                  {paymentAuthorization.paymentIntentId}
                </Text>
              </View>
            ) : null}
            {paymentAuthorization.status === 'failed' && onRetryPayment ? (
              <TouchableOpacity
                activeOpacity={0.74}
                disabled={paymentRetrying}
                onPress={onRetryPayment}
                style={styles.retryPaymentButton}>
                <Feather name="refresh-cw" size={15} color="#FFFFFF" />
                <Text style={styles.retryPaymentText}>
                  {paymentRetrying ? 'Retrying…' : 'Retry payment'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.confirmationActions}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate('HomeScreen', {screen: 'AllBookingScreen'})
          }
          style={styles.confirmationPrimary}>
          <Text style={styles.confirmationPrimaryText}>View bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('HomeScreen', {screen: 'Home'})}
          style={styles.confirmationSecondary}>
          <Text style={styles.confirmationSecondaryText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function BookingFlowScreen({navigation, route}) {
  const user = useSelector(state => state.user.user);
  const previewMode = Boolean(user?.isHomePreview);
  const dispatch = useDispatch();
  const serviceType = route.params?.serviceType || 'mobile_notary';
  const isMobile = serviceType === 'mobile_notary';
  const backendServiceType = isMobile ? 'mobile_notary' : 'ron';
  const serviceName = isMobile ? 'Mobile notary' : 'Remote online notary';
  const previewStep = __DEV__ ? route.params?.previewStep : '';
  const fullPreview = FULL_PREVIEW_STEPS.includes(previewStep);
  const previewDefaults = Boolean(previewStep);
  const previewHasPreparedDocuments =
    previewStep === 'documents' ||
    previewStep === 'review' ||
    previewStep === 'payment' ||
    fullPreview;
  const initialStep =
    previewStep === 'scheduling' || previewStep === 'appointment'
      ? isMobile
        ? 1
        : 2
      : previewStep === 'participants'
      ? isMobile
        ? 2
        : 3
      : previewStep === 'fullParticipants'
      ? isMobile
        ? 2
        : 3
      : previewStep === 'documents' ||
        previewStep === 'fullDocuments' ||
        previewStep === 'fullDocumentPreview'
      ? isMobile
        ? 3
        : 4
      : previewStep === 'identity'
      ? isMobile
        ? 4
        : 5
      : previewStep === 'review' || previewStep === 'fullReview'
      ? isMobile
        ? 5
        : 6
      : previewStep === 'payment' || previewStep === 'full'
      ? isMobile
        ? 6
        : 7
      : 1;
  const scrollRef = useRef(null);
  const appliedPreviewStepRef = useRef('');
  const {pickDocumentDetails, uploadAllDocuments} = useRegister();
  const [createBooking] = useMutation(CREATE_BOOKING);
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [step, setStep] = useState(initialStep);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateId(getMinimumBookingDate()),
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState('scheduled');
  const [selectedTime, setSelectedTime] = useState(getDefaultBookingTime);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [bookingFor, setBookingFor] = useState('self');
  const [otherName, setOtherName] = useState('');
  const [otherPhone, setOtherPhone] = useState('');
  const [addresses, setAddresses] = useState(
    user?.addresses?.filter(address => address.location) || [],
  );
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [uploadedDocuments, setUploadedDocuments] = useState(() =>
    previewHasPreparedDocuments
      ? [
          {
            id: 'preview-document',
            name: 'Power-of-attorney.pdf',
            size: 184000,
            type: 'application/octet-stream',
            uri: 'preview://power-of-attorney.pdf',
          },
        ]
      : [],
  );
  const [additionalSignatures, setAdditionalSignatures] = useState(0);
  const [additionalSeals, setAdditionalSeals] = useState(0);
  const [platformWitnesses, setPlatformWitnesses] = useState(0);
  const [priceQuote, setPriceQuote] = useState(null);
  const [priceQuoteLoading, setPriceQuoteLoading] = useState(false);
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {calculatePrice} = usePricingApi();
  const {fetchPaymentSheetParams} = useStripeApi();
  const [notes, setNotes] = useState('');
  const [wantsPrint, setWantsPrint] = useState(false);
  const [printCopies, setPrintCopies] = useState(1);
  const [signerCountry, setSignerCountry] = useState('US');
  const [signerState, setSignerState] = useState(
    user?.state || (previewDefaults ? 'CA' : ''),
  );
  const [documentJurisdiction, setDocumentJurisdiction] = useState(
    user?.state || (previewDefaults ? 'CA' : ''),
  );
  const [documentCategory, setDocumentCategory] = useState(
    previewDefaults ? 'power_of_attorney' : '',
  );
  const [languagePreference, setLanguagePreference] = useState('English');
  const [notarialAct, setNotarialAct] = useState(
    previewDefaults ? 'acknowledgment' : '',
  );
  const [deadlineDate, setDeadlineDate] = useState(selectedDate);
  const [deadlinePickerOpen, setDeadlinePickerOpen] = useState(false);
  const [completionChecks, setCompletionChecks] = useState({
    readable: previewHasPreparedDocuments,
    complete: previewHasPreparedDocuments,
    unsigned: previewHasPreparedDocuments,
  });
  const [participants, setParticipants] = useState(() =>
    createDefaultParticipants(user),
  );
  const [identityChecks, setIdentityChecks] = useState(() =>
    createDefaultParticipants(user).reduce(
      (checks, participant) => ({
        ...checks,
        [participant.id]:
          previewStep === 'identity' ||
          previewStep === 'review' ||
          previewStep === 'payment'
            ? {
                ...createIdentityCheck(participant),
                retriesRemaining: 2,
                status: 'verified',
              }
            : createIdentityCheck(participant),
      }),
      {},
    ),
  );
  const [paymentAuthorization, setPaymentAuthorization] = useState({
    status: 'idle',
    message:
      'Authorize payment after your request is saved. If authorization fails, the request stays intact.',
    receiptStatus: 'Provided after authorization',
    refundStatus: 'Not requested',
    paymentIntentId: '',
  });
  const [paymentRetrying, setPaymentRetrying] = useState(false);

  // Saved addresses use [latitude, longitude], while MongoDB geospatial queries
  // require GeoJSON ordering: [longitude, latitude].
  const matchingCoordinates = useMemo(() => {
    const [latitude, longitude] = selectedAddress?.location_coordinates || [];
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    return Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude)
      ? [parsedLongitude, parsedLatitude]
      : undefined;
  }, [selectedAddress?.location_coordinates]);
  const {refetch: refetchMatchedAgent} = useQuery(GET_MATCHED_AGENT, {
    variables: {
      serviceType: backendServiceType,
      coordinates: matchingCoordinates,
    },
    skip: !user || previewMode || isMobile,
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    AsyncStorage.getItem(SERVICE_SETTINGS_KEY)
      .then(value => {
        if (value) {
          setWantsPrint(Boolean(JSON.parse(value)?.printByDefault));
        }
      })
      .catch(error => console.warn('Print preference could not load:', error));
  }, [isMobile]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller?.scrollTo) {
      scroller.scrollTo({animated: false, y: 0});
      return;
    }
    if (scroller?.scrollToPosition) {
      scroller.scrollToPosition(0, 0, false);
    }
  }, [step]);

  useEffect(() => {
    const savedAddresses =
      user?.addresses?.filter(address => address.location) || [];
    if (!savedAddresses.length) {
      return;
    }
    setAddresses(savedAddresses);
    setSelectedAddress(current => current || savedAddresses[0]);
  }, [user?.addresses]);

  useEffect(() => {
    setParticipants(current =>
      current.map(participant =>
        participant.id === 'primary-signer'
          ? {
              ...participant,
              fullName:
                participant.fullName ||
                [user?.first_name, user?.last_name]
                  .filter(Boolean)
                  .join(' ')
                  .trim(),
              email: participant.email || user?.email || '',
              phone: participant.phone || user?.phone_number || '',
            }
          : participant,
      ),
    );
  }, [user?.email, user?.first_name, user?.last_name, user?.phone_number]);

  useEffect(() => {
    setIdentityChecks(current =>
      participants.reduce(
        (checks, participant) => ({
          ...checks,
          [participant.id]:
            current[participant.id] || createIdentityCheck(participant),
        }),
        {},
      ),
    );
  }, [participants]);

  useEffect(() => {
    setDeadlineDate(current => current || selectedDate);
  }, [selectedDate]);

  const slotOptions = useMemo(
    () => getAvailableSlotOptions(selectedDate),
    [selectedDate],
  );
  const dateLabel =
    scheduleMode === 'now' ? 'Notarize now' : formatDateLabel(selectedDate);
  const appointmentDisplay =
    scheduleMode === 'now'
      ? `Notarize now, estimated ${selectedTime}`
      : `${formatDateLabel(selectedDate)} at ${selectedTime}`;
  const location = isMobile
    ? selectedAddress?.location
    : signerState
    ? `${getOptionLabel(STATE_OPTIONS, signerState)} (physical location)`
    : 'Secure video appointment';
  const eligibilityResult = useMemo(
    () =>
      getEligibilityResult({
        documentCategory,
        documentJurisdiction,
        languagePreference,
        signerCountry,
        signerState,
      }),
    [
      documentCategory,
      documentJurisdiction,
      languagePreference,
      signerCountry,
      signerState,
    ],
  );
  const eligibilitySummary = useMemo(
    () => ({
      signerLocation:
        signerCountry === 'US'
          ? getOptionLabel(STATE_OPTIONS, signerState)
          : 'Outside United States',
      documentJurisdiction: getOptionLabel(STATE_OPTIONS, documentJurisdiction),
      documentCategory: getOptionLabel(
        DOCUMENT_CATEGORY_OPTIONS,
        documentCategory,
      ),
      language: languagePreference || 'Not selected',
      serviceType: 'Remote online notarization',
    }),
    [
      documentCategory,
      documentJurisdiction,
      languagePreference,
      signerCountry,
      signerState,
    ],
  );
  const documentPrepSummary = useMemo(
    () => ({
      notarialAct: getOptionLabel(NOTARIAL_ACT_OPTIONS, notarialAct),
      deadline: formatDateLabel(deadlineDate),
      confirmations: COMPLETENESS_ITEMS.filter(
        item => completionChecks[item.key],
      ).map(item => item.label),
    }),
    [completionChecks, deadlineDate, notarialAct],
  );
  const signerParticipants = useMemo(
    () => participants.filter(participant => participant.role === 'signer'),
    [participants],
  );
  const identitySummary = useMemo(() => {
    const verifiedCount = signerParticipants.filter(participant =>
      VERIFIED_IDENTITY_STATUSES.includes(
        identityChecks[participant.id]?.status,
      ),
    ).length;
    return `${verifiedCount}/${signerParticipants.length} signer ${
      signerParticipants.length === 1 ? 'check' : 'checks'
    } complete`;
  }, [identityChecks, signerParticipants]);
  const printingCharge =
    isMobile && wantsPrint ? printCopies * PRINT_COPY_PRICE : 0;
  // Printing is a separate Notarizr add-on, not part of the seal/signer/witness pricing model
  // (see priceQuote below), so it's added on top of whatever the engine quotes.
  const price = (priceQuote?.customerTotal || 0) + printingCharge;
  const totalSteps = isMobile ? 6 : 7;

  // Live server-computed quote (Open Call pricing — the platform sets this price, the agent
  // never does) for whatever seal/signer/witness counts the client has chosen so far.
  useEffect(() => {
    let cancelled = false;
    setPriceQuoteLoading(true);
    calculatePrice('open_call', {
      additionalSeals,
      additionalSigners: additionalSignatures,
      platformProvidedWitnesses: platformWitnesses,
    }).then(result => {
      if (cancelled) {
        return;
      }
      if (!result) {
        // calculatePrice already logged the underlying error — surface it in the UI too
        // instead of silently sitting at $0.00 forever.
        Toast.show({
          type: 'error',
          text1: 'Could not calculate the price',
          text2: 'Pull to retry, or check your connection.',
        });
      }
      setPriceQuote(result);
      setPriceQuoteLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [
    additionalSeals,
    additionalSignatures,
    calculatePrice,
    platformWitnesses,
  ]);
  const eligibilityValid = isMobile || eligibilityResult.eligible;
  const appointmentStep = isMobile ? 1 : 2;
  const participantStep = isMobile ? 2 : 3;
  const documentStep = isMobile ? 3 : 4;
  const identityStep = isMobile ? 4 : 5;
  const reviewStep = isMobile ? 5 : 6;
  const paymentStep = totalSteps;
  const stepOneValid =
    Boolean(
      scheduleMode === 'now' ||
        (selectedDate && selectedTime && (!isMobile || selectedAddress)),
    ) &&
    Boolean(!isMobile || selectedAddress) &&
    (bookingFor === 'self' || Boolean(otherName.trim() && otherPhone.trim()));
  const participantsValid =
    participants.length > 0 &&
    participants.some(participant => participant.role === 'signer') &&
    participants.every(
      participant =>
        participant.fullName.trim() && isValidEmail(participant.email),
    );
  const documentPrepValid =
    Boolean(notarialAct && deadlineDate) &&
    COMPLETENESS_ITEMS.every(item => completionChecks[item.key]);
  const identityValid =
    signerParticipants.length > 0 &&
    signerParticipants.every(participant =>
      VERIFIED_IDENTITY_STATUSES.includes(
        identityChecks[participant.id]?.status,
      ),
    );
  const stepTwoValid = isMobile
    ? !wantsPrint || uploadedDocuments.length > 0
    : uploadedDocuments.length > 0;
  const disabled =
    step === 1 && !isMobile
      ? !eligibilityValid
      : step === appointmentStep
      ? !stepOneValid
      : step === participantStep
      ? !participantsValid
      : step === documentStep
      ? !stepTwoValid || !documentPrepValid
      : step === identityStep
      ? !identityValid
      : step === paymentStep
      ? priceQuoteLoading || submitting
      : false;

  useEffect(() => {
    if (!previewStep) {
      return;
    }
    const previewKey = `${serviceType}:${previewStep}`;
    if (appliedPreviewStepRef.current === previewKey) {
      return;
    }
    appliedPreviewStepRef.current = previewKey;

    setSignerState(current => current || 'CA');
    setDocumentJurisdiction(current => current || 'CA');
    setDocumentCategory(current => current || 'power_of_attorney');

    if (fullPreview) {
      const nextParticipants = createFullPreviewParticipants(user);
      setNotarialAct(current => current || 'acknowledgment');
      setCompletionChecks({
        readable: true,
        complete: true,
        unsigned: true,
      });
      setAdditionalSignatures(1);
      setAdditionalSeals(1);
      setPlatformWitnesses(1);
      setParticipants(nextParticipants);
      setScheduleMode('scheduled');
      setNotes(
        current =>
          current ||
          'Please confirm every signer, witness, observer and recipient before the session.',
      );
      setIdentityChecks(current =>
        nextParticipants
          .filter(participant => participant.role === 'signer')
          .reduce(
            (checks, participant) => ({
              ...checks,
              [participant.id]: {
                ...(current[participant.id] ||
                  createIdentityCheck(participant)),
                retriesRemaining: 2,
                status: 'verified',
              },
            }),
            current,
          ),
      );
      setStep(
        previewStep === 'fullParticipants'
          ? participantStep
          : previewStep === 'fullDocuments' ||
            previewStep === 'fullDocumentPreview'
          ? documentStep
          : previewStep === 'fullReview'
          ? reviewStep
          : paymentStep,
      );
      return;
    }

    if (previewStep === 'scheduling' || previewStep === 'appointment') {
      setStep(appointmentStep);
      return;
    }

    if (previewStep === 'participants') {
      setStep(participantStep);
      return;
    }

    if (previewStep === 'documents') {
      setNotarialAct(current => current || 'acknowledgment');
      setCompletionChecks({
        readable: true,
        complete: true,
        unsigned: true,
      });
      setStep(documentStep);
      return;
    }

    if (
      previewStep === 'identity' ||
      previewStep === 'review' ||
      previewStep === 'payment'
    ) {
      setNotarialAct(current => current || 'acknowledgment');
      setCompletionChecks({
        readable: true,
        complete: true,
        unsigned: true,
      });
      setIdentityChecks(current =>
        signerParticipants
          .filter(participant => participant.role === 'signer')
          .reduce(
            (checks, participant) => ({
              ...checks,
              [participant.id]: {
                ...(current[participant.id] ||
                  createIdentityCheck(participant)),
                retriesRemaining: 2,
                status: 'verified',
              },
            }),
            current,
          ),
      );
      setStep(
        previewStep === 'payment'
          ? paymentStep
          : previewStep === 'review'
          ? reviewStep
          : identityStep,
      );
    }
  }, [
    documentStep,
    fullPreview,
    identityStep,
    appointmentStep,
    participantStep,
    paymentStep,
    previewStep,
    reviewStep,
    serviceType,
    signerParticipants,
    user,
  ]);

  const handleBack = () => {
    if (step > 1) {
      setStep(current => current - 1);
      return;
    }
    navigation.goBack();
  };

  const authorizeBookingPayment = async booking => {
    const amount = Number(
      price ||
        booking?.totalPrice ||
        booking?.price_breakdown?.customerTotal ||
        0,
    );
    const assignedAgent = booking?.agent?._id || booking?.agent;

    if (!booking?._id) {
      throw new Error('Booking request was not saved.');
    }

    if (!amount || amount <= 0) {
      setPaymentAuthorization({
        status: 'authorized',
        message: 'No payment is due for this request.',
        receiptStatus: 'No receipt needed',
        refundStatus: 'Not requested',
        paymentIntentId: '',
      });
      return {authorized: true, skipped: true};
    }

    if (!assignedAgent) {
      setPaymentAuthorization({
        status: 'deferred',
        message:
          'Your request was saved. Payment authorization will be requested when a notary is assigned.',
        receiptStatus: 'Pending notary assignment',
        refundStatus: 'Not requested',
        paymentIntentId: '',
      });
      return {authorized: false, deferred: true};
    }

    setPaymentAuthorization(current => ({
      ...current,
      status: 'authorizing',
      message: 'Opening secure payment authorization.',
      receiptStatus: 'Pending',
      refundStatus: 'Not requested',
      paymentIntentId: '',
    }));

    const response = await fetchPaymentSheetParams(
      Math.round(amount * 100),
      booking._id,
      false,
    );
    const payload = response?.data?.createPaymentIntentR;

    if (payload?.status !== '201' || !payload?.paymentIntent) {
      throw new Error(
        payload?.message || 'Payment authorization could not be initialized.',
      );
    }

    if (String(payload.paymentIntent).startsWith('local_payment_intent_')) {
      setPaymentAuthorization({
        status: 'authorized',
        message:
          'Payment authorization is saved. You will only be charged according to the final booking terms.',
        receiptStatus: 'Receipt pending',
        refundStatus: payload.refund_status || 'Not requested',
        paymentIntentId: payload.payment_intent_id || payload.paymentIntent,
      });
      return {
        authorized: true,
        paymentIntentId: payload.payment_intent_id || payload.paymentIntent,
      };
    }

    const customerName = [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(' ');
    const {error: initError} = await initPaymentSheet({
      merchantDisplayName: 'Notarizr',
      customerId: payload.customer_id,
      customerEphemeralKeySecret: payload.ephemeralKey,
      paymentIntentClientSecret: payload.paymentIntent,
      defaultBillingDetails: customerName ? {name: customerName} : undefined,
    });

    if (initError) {
      throw new Error(
        initError.message || 'Payment authorization could not be initialized.',
      );
    }

    const {error: sheetError} = await presentPaymentSheet();
    if (sheetError) {
      throw new Error(
        sheetError.message || 'Payment authorization was canceled.',
      );
    }

    setPaymentAuthorization({
      status: 'authorized',
      message:
        'Payment authorized. The receipt will be attached to your payment activity.',
      receiptStatus: payload.receipt_url
        ? 'Receipt available'
        : 'Receipt pending',
      refundStatus: payload.refund_status || 'Not requested',
      paymentIntentId: payload.payment_intent_id || '',
    });

    return {authorized: true, paymentIntentId: payload.payment_intent_id};
  };

  const retryConfirmedPayment = async () => {
    if (!confirmedBooking?._id) {
      return;
    }

    setPaymentRetrying(true);
    try {
      await authorizeBookingPayment(confirmedBooking);
      Toast.show({
        type: 'success',
        text1: 'Payment authorized',
        text2: 'Your request and payment authorization are saved.',
      });
    } catch (error) {
      setPaymentAuthorization({
        status: 'failed',
        message: `${
          error.message || 'Payment authorization failed.'
        } Your request is still saved and can be paid later.`,
        receiptStatus: 'Not issued yet',
        refundStatus: 'Not requested',
        paymentIntentId: '',
      });
      Toast.show({
        type: 'error',
        text1: 'Payment not authorized',
        text2: 'Your request is still saved.',
      });
    } finally {
      setPaymentRetrying(false);
    }
  };

  const handleContinue = async () => {
    if (!isMobile && step === 1 && !eligibilityResult.eligible) {
      Toast.show({
        type: 'error',
        text1: eligibilityResult.title,
        text2: eligibilityResult.message,
      });
      return;
    }

    if (step < totalSteps) {
      setStep(current => current + 1);
      return;
    }

    setSubmitting(true);
    try {
      const matchedAgentResponse = isMobile
        ? null
        : await refetchMatchedAgent({
            serviceType: backendServiceType,
            coordinates: matchingCoordinates,
          });
      const bookingAgent = matchedAgentResponse?.data?.matchAgent?.user;
      if (!isMobile && !bookingAgent?.service?._id) {
        throw new Error('No verified notary is available for this service.');
      }

      // Always upload to DigitalOcean Spaces (dev builds included) so the
      // notary and agent can actually retrieve the document later — a
      // dev-only skip here would leave real bookings pointing at a local
      // file:// URI that only exists on the submitting device.
      let documents = uploadedDocuments;
      if (uploadedDocuments.length > 0) {
        documents = await uploadAllDocuments(
          uploadedDocuments.map(document => document.uri),
        );
        if (!documents?.length) {
          throw new Error('The documents could not be uploaded.');
        }
      }

      const appointment =
        scheduleMode === 'now'
          ? new Date().toISOString()
          : buildAppointmentDate(selectedDate, selectedTime);
      const nameParts = otherName.trim().split(/\s+/);
      const printInstruction =
        isMobile && wantsPrint
          ? `Print request: ${printCopies} ${
              printCopies === 1 ? 'copy' : 'copies'
            }.`
          : '';
      const bookingNotes = [notes.trim(), printInstruction]
        .filter(Boolean)
        .join('\n');
      const documentPrepNote = [
        'Document preparation:',
        `Requested notarial act: ${documentPrepSummary.notarialAct}`,
        `Deadline: ${documentPrepSummary.deadline}`,
        `Completeness confirmed: ${documentPrepSummary.confirmations.join(
          ', ',
        )}`,
      ].join('\n');
      const schedulingNote = [
        'Scheduling:',
        `Mode: ${scheduleMode === 'now' ? 'Notarize now' : 'Scheduled slot'}`,
        `Appointment: ${appointmentDisplay}`,
      ].join('\n');
      const participantsNote = [
        'Participants:',
        ...participants.map(participant => {
          const status = getParticipantStatus(participant).label;
          return `- ${getOptionLabel(
            PARTICIPANT_ROLE_OPTIONS,
            participant.role,
          )}: ${participant.fullName} <${participant.email}>${
            participant.phone ? `, ${participant.phone}` : ''
          } (${status})`;
        }),
      ].join('\n');
      const identityNote = [
        'Identity verification:',
        ...signerParticipants.map(participant => {
          const check =
            identityChecks[participant.id] || createIdentityCheck(participant);
          return `- ${participant.fullName}: ${check.method}; ${
            getIdentityStatus(check).label
          }; ${check.retriesRemaining} retries remaining`;
        }),
      ].join('\n');
      const eligibilityNote = !isMobile
        ? [
            'RON eligibility:',
            `Signer physical location: ${eligibilitySummary.signerLocation}`,
            `Document jurisdiction: ${eligibilitySummary.documentJurisdiction}`,
            `Document category: ${eligibilitySummary.documentCategory}`,
            `Language: ${eligibilitySummary.language}`,
            `Service type: ${eligibilitySummary.serviceType}`,
          ].join('\n')
        : '';
      const fullBookingNotes = [
        bookingNotes,
        schedulingNote,
        documentPrepNote,
        participantsNote,
        identityNote,
        eligibilityNote,
      ]
        .filter(Boolean)
        .join('\n\n');
      const schedulingDetails = {
        mode: scheduleMode,
        appointment,
        appointmentDisplay,
        selectedDate,
        selectedTime,
        selectedSlotId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      const documentPreparation = {
        requestedNotarialAct: notarialAct,
        requestedNotarialActLabel: documentPrepSummary.notarialAct,
        deadlineDate,
        deadlineLabel: documentPrepSummary.deadline,
        completionChecks,
        confirmations: documentPrepSummary.confirmations,
        specialInstructions: notes.trim(),
        uploadedDocuments: documents.map(document => ({
          name: document.name || 'Document',
          size: document.size || null,
          type: document.type || null,
          uri: document.uri || document.url || null,
          url: document.url || document.uri || null,
        })),
      };
      const participantDetails = participants.map(participant => ({
        id: participant.id,
        role: participant.role,
        roleLabel: getOptionLabel(PARTICIPANT_ROLE_OPTIONS, participant.role),
        fullName: participant.fullName,
        email: participant.email,
        phone: participant.phone,
        preparationStatus: participant.preparationStatus,
        preparationStatusLabel: getParticipantStatus(participant).label,
        invitationStatus: participant.inviteStatus,
      }));
      const identityVerification = {
        signers: signerParticipants.map(participant => {
          const check =
            identityChecks[participant.id] || createIdentityCheck(participant);
          const status = getIdentityStatus(check);
          return {
            participantId: participant.id,
            fullName: participant.fullName,
            email: participant.email,
            method: check.method,
            status: check.status,
            statusLabel: status.label,
            retriesRemaining: check.retriesRemaining,
          };
        }),
      };
      const ronEligibility = isMobile
        ? null
        : {
            signerCountry,
            signerState,
            signerLocation: eligibilitySummary.signerLocation,
            documentJurisdiction,
            documentJurisdictionLabel: eligibilitySummary.documentJurisdiction,
            documentCategory,
            documentCategoryLabel: eligibilitySummary.documentCategory,
            languagePreference,
            serviceType: eligibilitySummary.serviceType,
            eligible: eligibilityResult.eligible,
            message: eligibilityResult.message,
          };
      const bookingResponse = await createBooking({
        variables: {
          serviceType: backendServiceType,
          service: bookingAgent?.service?._id,
          agent: bookingAgent?._id,
          assignmentCoordinates: isMobile ? matchingCoordinates : undefined,
          appointmentTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          // One priced entry per document being notarized, at the flat
          // $99.99-per-document rate.
          documentType: uploadedDocuments.map(document => ({
            name: document.name || 'Document',
            price: 0,
          })),
          address: isMobile
            ? selectedAddress?._id || selectedAddress?.location
            : null,
          dateOfBooking: appointment,
          timeOfBooking: appointment,
          notes: fullBookingNotes || null,
          bookingType: bookingFor,
          bookedFor: {
            first_name:
              bookingFor === 'self' ? user?.first_name : nameParts[0] || '',
            last_name:
              bookingFor === 'self'
                ? user?.last_name
                : nameParts.slice(1).join(' '),
            email: bookingFor === 'self' ? user?.email : '',
            phone_number:
              bookingFor === 'self' ? user?.phone_number : otherPhone.trim(),
            location: isMobile
              ? selectedAddress?.location || ''
              : eligibilitySummary.signerLocation,
          },
          preferenceAnalysis: 'distance',
          documents,
          // totalPrice is the itemized quote (priceQuote.customerTotal) plus printing — computed
          // client-side for the printing add-on, then submitted with the pricing counts so the
          // backend can save the official itemized quote plus that add-on.
          totalPrice: price,
          totalSignaturesRequired: additionalSignatures,
          useStandardPricing: true,
          additionalSeals,
          additionalSigners: additionalSignatures,
          platformProvidedWitnesses: platformWitnesses,
          customerProvidedWitnesses: 0,
          ronEligibility,
          schedulingDetails,
          documentPreparation,
          participants: participantDetails,
          identityVerification,
        },
      });

      const createdBooking = bookingResponse?.data?.createBookingR?.booking;
      if (
        bookingResponse?.data?.createBookingR?.status !== '201' ||
        !createdBooking?._id
      ) {
        throw new Error(
          bookingResponse?.data?.createBookingR?.message ||
            'The booking could not be created.',
        );
      }

      const statusResponse = isMobile
        ? null
        : await updateBookingStatus({
            variables: {bookingId: createdBooking._id, status: 'pending'},
          });
      const pendingBooking =
        statusResponse?.data?.updateBookingStatusR?.booking || createdBooking;
      dispatch(setBookingInfoState(pendingBooking));
      try {
        const paymentResult = await authorizeBookingPayment(pendingBooking);
        Toast.show({
          type: 'success',
          text1: 'Booking created',
          text2: paymentResult?.deferred
            ? 'Payment will be requested when a notary is assigned.'
            : 'Your request and payment authorization are saved.',
        });
      } catch (paymentError) {
        setPaymentAuthorization({
          status: 'failed',
          message: `${
            paymentError.message || 'Payment authorization failed.'
          } Your request was saved and can be paid later.`,
          receiptStatus: 'Not issued yet',
          refundStatus: 'Not requested',
          paymentIntentId: '',
        });
        Toast.show({
          type: 'error',
          text1: 'Payment not authorized',
          text2:
            'Your request was saved. You can retry payment from this screen.',
        });
      }
      setConfirmedBooking(pendingBooking);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Booking not created',
        text2: error.message || 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateParticipant = (participantId, patch) => {
    setParticipants(current =>
      current.map(participant =>
        participant.id === participantId
          ? {...participant, ...patch}
          : participant,
      ),
    );
    if (patch.role) {
      const currentParticipant = participants.find(
        participant => participant.id === participantId,
      );
      if (currentParticipant) {
        setIdentityChecks(current => ({
          ...current,
          [participantId]: createIdentityCheck({
            ...currentParticipant,
            role: patch.role,
          }),
        }));
      }
    }
  };

  const changeScheduleMode = mode => {
    setScheduleMode(mode);
    if (mode === 'now') {
      setSelectedDate(formatDateId(getMinimumBookingDate()));
      setSelectedTime(getNotarizeNowTimeLabel());
      setSelectedSlotId('');
      return;
    }
    if (!selectedSlotId && slotOptions[0]) {
      setSelectedTime(slotOptions[0].time);
      setSelectedSlotId(slotOptions[0].id);
    }
  };

  const selectSlot = slot => {
    setSelectedDate(slot.date);
    setSelectedTime(slot.time);
    setSelectedSlotId(slot.id);
  };

  const selectAppointmentDate = date => {
    const nextSlots = getAvailableSlotOptions(date);
    setSelectedDate(date);
    if (nextSlots[0]) {
      setSelectedTime(nextSlots[0].time);
      setSelectedSlotId(nextSlots[0].id);
    } else {
      setSelectedSlotId('');
    }
  };

  const selectCustomTime = time => {
    setSelectedTime(time);
    setSelectedSlotId('');
  };

  const addParticipant = () => {
    setParticipants(current => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        role: 'signer',
        fullName: '',
        email: '',
        phone: '',
        inviteStatus: 'ready',
      },
    ]);
  };

  const removeParticipant = participantId => {
    setParticipants(current =>
      current.filter(participant => participant.id !== participantId),
    );
  };

  const sendParticipantInvitations = () => {
    if (!participantsValid) {
      Toast.show({
        type: 'error',
        text1: 'Participant info incomplete',
        text2: 'Add a name and valid email for each person.',
      });
      return;
    }

    setParticipants(current =>
      current.map(participant => ({...participant, inviteStatus: 'queued'})),
    );
    Toast.show({
      type: 'success',
      text1: 'Invitations queued',
      text2: 'They will be sent after this booking is created.',
    });
  };

  const updateIdentityCheck = (participantId, patch) => {
    const participant = participants.find(item => item.id === participantId);
    setIdentityChecks(current => ({
      ...current,
      [participantId]: {
        ...(current[participantId] ||
          createIdentityCheck(participant || {role: 'signer'})),
        ...patch,
      },
    }));
  };

  const captureIdentity = participantId => {
    updateIdentityCheck(participantId, {status: 'verified'});
    Toast.show({
      type: 'success',
      text1: 'Identity verified',
      text2: 'The signer is ready for review.',
    });
  };

  const retryIdentity = participantId => {
    const currentCheck =
      identityChecks[participantId] ||
      createIdentityCheck(
        participants.find(participant => participant.id === participantId) || {
          role: 'signer',
        },
      );
    if (currentCheck.retriesRemaining <= 0) {
      return;
    }
    updateIdentityCheck(participantId, {
      retriesRemaining: currentCheck.retriesRemaining - 1,
      status: 'captured',
    });
  };

  const requestManualReview = participantId => {
    updateIdentityCheck(participantId, {status: 'manual_review'});
  };

  const chooseAlternateIdentityMethod = participantId => {
    updateIdentityCheck(participantId, {status: 'alternate'});
  };

  const chooseDocuments = async () => {
    const selectedDocuments = await pickDocumentDetails(true);
    if (!selectedDocuments.length) {
      return;
    }
    const validDocuments = selectedDocuments.filter(document => {
      const error = validateDocumentSelection(document);
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Document not added',
          text2: error,
        });
        return false;
      }
      return true;
    });
    if (validDocuments.length !== selectedDocuments.length) {
      Toast.show({
        type: 'info',
        text1: 'Some files were skipped',
        text2: 'Only readable PDFs up to 10 MB can be attached.',
      });
    }
    if (!validDocuments.length) {
      return;
    }
    const selectionTime = Date.now();
    setUploadedDocuments(current => [
      ...current,
      ...validDocuments
        .filter(document =>
          current.every(existing => existing.uri !== document.uri),
        )
        .map((document, index) => ({
          ...document,
          id: `${selectionTime}-${index}`,
        })),
    ]);
  };

  const replaceDocument = async documentId => {
    const [replacement] = await pickDocumentDetails(false);
    if (!replacement) {
      return;
    }
    const validationError = validateDocumentSelection(replacement);
    if (validationError) {
      Toast.show({
        type: 'error',
        text1: 'Document not added',
        text2: validationError,
      });
      return;
    }
    setUploadedDocuments(current =>
      current.map(document =>
        document.id === documentId
          ? {...replacement, id: documentId}
          : document,
      ),
    );
  };

  const removeDocument = documentId => {
    setUploadedDocuments(current =>
      current.filter(document => document.id !== documentId),
    );
  };

  if (confirmedBooking) {
    return (
      <Confirmation
        booking={confirmedBooking}
        navigation={navigation}
        onRetryPayment={retryConfirmedPayment}
        paymentAuthorization={paymentAuthorization}
        paymentRetrying={paymentRetrying}
        serviceName={serviceName}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <BookingFlowHeader
          onBack={handleBack}
          serviceName={`Book ${serviceName.toLowerCase()}`}
          step={step}
          totalSteps={totalSteps}
        />
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={16}
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {step === 1 && !isMobile ? (
            <RONEligibilityStep
              documentCategory={documentCategory}
              documentJurisdiction={documentJurisdiction}
              eligibilityResult={eligibilityResult}
              languagePreference={languagePreference}
              onChangeDocumentCategory={setDocumentCategory}
              onChangeDocumentJurisdiction={setDocumentJurisdiction}
              onChangeLanguagePreference={setLanguagePreference}
              onChangeSignerCountry={value => {
                setSignerCountry(value);
                if (value !== 'US') {
                  setSignerState('');
                }
              }}
              onChangeSignerState={setSignerState}
              signerCountry={signerCountry}
              signerState={signerState}
            />
          ) : step === appointmentStep ? (
            <AppointmentStep
              addresses={addresses}
              bookingFor={bookingFor}
              datePickerOpen={datePickerOpen}
              isMobile={isMobile}
              onManageAddresses={() => navigation.navigate('AddressDetails')}
              onChangeBookingFor={setBookingFor}
              onChangeOtherName={setOtherName}
              onChangeOtherPhone={setOtherPhone}
              onChangeScheduleMode={changeScheduleMode}
              onSelectAddress={setSelectedAddress}
              onSelectDate={selectAppointmentDate}
              onSelectSlot={selectSlot}
              onSelectTime={selectCustomTime}
              onToggleDatePicker={setDatePickerOpen}
              onToggleTimePicker={setTimePickerOpen}
              otherName={otherName}
              otherPhone={otherPhone}
              scheduleMode={scheduleMode}
              selectedAddress={selectedAddress}
              selectedDate={selectedDate}
              selectedSlotId={selectedSlotId}
              selectedTime={selectedTime}
              slotOptions={slotOptions}
              timePickerOpen={timePickerOpen}
            />
          ) : step === participantStep ? (
            <ParticipantStep
              onAddParticipant={addParticipant}
              onRemoveParticipant={removeParticipant}
              onSendInvitations={sendParticipantInvitations}
              onUpdateParticipant={updateParticipant}
              participants={participants}
            />
          ) : step === documentStep ? (
            <UploadAndPrintStep
              additionalSeals={additionalSeals}
              additionalSignatures={additionalSignatures}
              completionChecks={completionChecks}
              deadlineDate={deadlineDate}
              deadlinePickerOpen={deadlinePickerOpen}
              isMobile={isMobile}
              notarialAct={notarialAct}
              notes={notes}
              onChangeCompletionCheck={key =>
                setCompletionChecks(current => ({
                  ...current,
                  [key]: !current[key],
                }))
              }
              onChangeDeadlineDate={setDeadlineDate}
              onChangeDeadlinePickerOpen={setDeadlinePickerOpen}
              onChangeNotes={setNotes}
              onChangeNotarialAct={setNotarialAct}
              onChangePrintCopies={setPrintCopies}
              onChangeSeals={setAdditionalSeals}
              onChangeSigners={setAdditionalSignatures}
              onChangeWitnesses={setPlatformWitnesses}
              onChooseDocuments={chooseDocuments}
              onRemoveDocument={removeDocument}
              onReplaceDocument={replaceDocument}
              onTogglePrint={setWantsPrint}
              openInitialPreview={previewStep === 'fullDocumentPreview'}
              platformWitnesses={platformWitnesses}
              printCopies={printCopies}
              uploadedDocuments={uploadedDocuments}
              wantsPrint={wantsPrint}
            />
          ) : step === identityStep ? (
            <IdentityVerificationStep
              identityChecks={identityChecks}
              onCaptureId={captureIdentity}
              onChooseAlternate={chooseAlternateIdentityMethod}
              onManualReview={requestManualReview}
              onRetryIdentity={retryIdentity}
              participants={participants}
            />
          ) : step === reviewStep ? (
            <ReviewStep
              additionalSeals={additionalSeals}
              additionalSignatures={additionalSignatures}
              appointmentDisplay={appointmentDisplay}
              bookingFor={bookingFor}
              dateLabel={dateLabel}
              documentPrepSummary={documentPrepSummary}
              documentType={isMobile ? '' : eligibilitySummary.documentCategory}
              eligibilitySummary={eligibilitySummary}
              identitySummary={identitySummary}
              isMobile={isMobile}
              location={location}
              onEditAppointment={() => setStep(appointmentStep)}
              onEditDocuments={() => setStep(documentStep)}
              onEditEligibility={() => setStep(1)}
              onEditIdentity={() => setStep(identityStep)}
              onEditParticipants={() => setStep(participantStep)}
              otherName={otherName}
              participants={participants}
              platformWitnesses={platformWitnesses}
              printCopies={isMobile && wantsPrint ? printCopies : 0}
              printingCharge={printingCharge}
              priceQuote={priceQuote}
              priceQuoteLoading={priceQuoteLoading}
              uploadedDocumentsCount={uploadedDocuments.length}
              serviceName={serviceName}
              time={scheduleMode === 'now' ? selectedTime : selectedTime}
            />
          ) : (
            <PaymentAuthorizationStep
              paymentAuthorization={paymentAuthorization}
              price={price}
              priceQuote={priceQuote}
              priceQuoteLoading={priceQuoteLoading}
              printingCharge={printingCharge}
              printCopies={isMobile && wantsPrint ? printCopies : 0}
            />
          )}
        </KeyboardAwareScrollView>
        <BookingFlowFooter
          disabled={disabled}
          label={
            step === paymentStep
              ? paymentAuthorization.status === 'failed'
                ? 'Retry payment'
                : 'Authorize payment'
              : step === reviewStep
              ? 'Continue to payment'
              : 'Continue'
          }
          loading={submitting}
          onPress={handleContinue}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    backgroundColor: '#F7F8FA',
  },
  datePickerField: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  timePickerField: {
    marginTop: 12,
  },
  scheduleModeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  scheduleModeCard: {
    width: '48.5%',
    minHeight: 94,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedScheduleModeCard: {
    borderColor: '#FD6D1F',
    backgroundColor: '#FFF9F5',
  },
  scheduleModeLabel: {
    marginTop: 8,
    color: '#303642',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  selectedScheduleModeLabel: {
    color: '#D65322',
  },
  scheduleModeSubtitle: {
    marginTop: 4,
    color: '#8C929C',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
    lineHeight: 12,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginTop: 12,
  },
  slotPill: {
    minHeight: 34,
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedSlot: {
    borderColor: '#FD6D1F',
    backgroundColor: '#FFF0E7',
  },
  slotText: {
    color: '#69717D',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  selectedSlotText: {
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
  },
  nowSummary: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#BFE2CC',
    borderRadius: 8,
    backgroundColor: '#F2FAF5',
  },
  nowSummaryText: {
    flex: 1,
    marginLeft: 8,
    color: '#277450',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    lineHeight: 15,
  },
  datePickerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  datePickerCopy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
  },
  datePickerLabel: {
    color: '#9298A2',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  datePickerValue: {
    marginTop: 3,
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  datePickerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerActionText: {
    marginRight: 2,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  timeHint: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 20,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#CEE0F2',
    borderRadius: 8,
    backgroundColor: '#F2F7FC',
  },
  timeHintText: {
    flex: 1,
    marginLeft: 8,
    color: '#4E6680',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  segmentedControl: {
    height: 44,
    flexDirection: 'row',
    marginHorizontal: 20,
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
  selectedSegment: {
    borderWidth: 1,
    borderColor: '#E1E4E8',
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    color: '#7A818D',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  selectedSegmentText: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
  },
  formFields: {
    marginTop: 8,
  },
  selectField: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  selectLabel: {
    marginBottom: 7,
    color: '#303642',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  selectBox: {
    minHeight: 50,
    alignItems: 'center',
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#DDE1E5',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  selectInput: {
    color: '#202632',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  selectDropdown: {
    borderWidth: 1,
    borderColor: '#DDE1E5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectDropdownText: {
    color: '#202632',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  fieldGroupTitle: {
    marginTop: 2,
    marginHorizontal: 20,
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  countryToggle: {
    minHeight: 44,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 3,
    borderRadius: 8,
    backgroundColor: '#F0F2F4',
  },
  countryOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  countryActive: {
    borderWidth: 1,
    borderColor: '#E1E4E8',
    backgroundColor: '#FFFFFF',
  },
  countryOptionText: {
    color: '#7A818D',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  countryActiveText: {
    color: '#FD6D1F',
    fontFamily: 'Manrope-Bold',
  },
  readOnlyServiceType: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  readOnlyIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  readOnlyCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  readOnlyLabel: {
    color: '#9298A2',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  readOnlyValue: {
    marginTop: 3,
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  eligibilityStatus: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 13,
    borderRadius: 8,
  },
  eligibilityStatusCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },
  eligibilityStatusTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  eligibilityStatusMessage: {
    marginTop: 3,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  eligibilitySuccess: {
    backgroundColor: '#EAF7EF',
  },
  eligibilityWarning: {
    backgroundColor: '#FFF5DC',
  },
  eligibilityBlocked: {
    backgroundColor: '#FFF4F4',
  },
  eligibilitySuccessText: {
    color: '#168A52',
  },
  eligibilityWarningText: {
    color: '#A86900',
  },
  eligibilityBlockedText: {
    color: '#B33B3B',
  },
  inputShell: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#DDE1E5',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    height: 46,
    marginLeft: 10,
    paddingVertical: 0,
    color: '#202632',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
  addressEditor: {
    paddingTop: 2,
  },
  saveAddressButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  disabledSmallButton: {
    backgroundColor: '#C8CCD2',
  },
  saveAddressText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  addAddressButton: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F3B18D',
    borderRadius: 8,
    backgroundColor: '#FFF9F5',
  },
  addAddressText: {
    marginLeft: 7,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  skipDocumentOption: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedSkipDocumentOption: {
    borderColor: '#9FD5B4',
    backgroundColor: '#F2FAF5',
  },
  skipDocumentIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  skipDocumentCopy: {flex: 1, minWidth: 0, marginLeft: 10},
  skipDocumentTitle: {
    color: '#282E3A',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  skipDocumentSubtitle: {
    marginTop: 2,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
  },
  catalogError: {
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF4F4',
  },
  catalogErrorTitle: {
    color: '#B33B3B',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  catalogRetry: {
    marginTop: 7,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  catalogEmpty: {
    marginHorizontal: 20,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  catalogLoading: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogLoadingText: {
    marginTop: 8,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  documentOption: {
    width: '48%',
    minHeight: 94,
    marginBottom: 10,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedDocumentOption: {
    borderColor: '#FD6D1F',
    backgroundColor: '#FFF9F5',
  },
  documentIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: '#F0F2F4',
  },
  selectedDocumentIcon: {
    backgroundColor: '#FFF0E7',
  },
  documentLabel: {
    minHeight: 30,
    marginTop: 8,
    color: '#4D5561',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    lineHeight: 14,
  },
  selectedDocumentLabel: {
    color: '#242A36',
    fontFamily: 'Manrope-Bold',
  },
  uploadArea: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F0A77E',
    borderRadius: 8,
    backgroundColor: '#FFF9F5',
  },
  uploadedArea: {
    borderStyle: 'solid',
    borderColor: '#A7D9BB',
    backgroundColor: '#F4FBF7',
  },
  uploadIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  uploadedIcon: {
    backgroundColor: '#E3F5EA',
  },
  uploadCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  uploadTitle: {
    color: '#282E3A',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  uploadSubtitle: {
    marginTop: 3,
    color: '#8C929C',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
  },
  uploadAction: {
    marginLeft: 8,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  documentList: {
    paddingHorizontal: 20,
  },
  documentCostHint: {
    marginBottom: 10,
    color: '#D65322',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  deadlineField: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  completenessList: {
    marginTop: 12,
  },
  confirmationToggle: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 9,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  checkedToggle: {
    borderColor: '#9FD5B4',
    backgroundColor: '#F2FAF5',
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B8BEC7',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  checkedBox: {
    borderColor: '#168A52',
    backgroundColor: '#168A52',
  },
  confirmationToggleCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  confirmationToggleLabel: {
    color: '#2B313D',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  confirmationToggleSubtitle: {
    marginTop: 2,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
    lineHeight: 12,
  },
  participantList: {
    paddingHorizontal: 20,
  },
  participantCard: {
    marginBottom: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  participantHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  participantTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  participantStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  participantStatusText: {
    marginLeft: 5,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  participantRemove: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: '#FFF4F4',
  },
  rolePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  rolePill: {
    minHeight: 30,
    justifyContent: 'center',
    marginRight: 7,
    marginBottom: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedRolePill: {
    borderColor: '#FD6D1F',
    backgroundColor: '#FFF0E7',
  },
  rolePillText: {
    color: '#69717D',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  selectedRolePillText: {
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
  },
  participantActions: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 2,
  },
  addParticipantButton: {
    height: 42,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3B18D',
    borderRadius: 8,
    backgroundColor: '#FFF9F5',
  },
  addParticipantText: {
    marginLeft: 7,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  sendInviteButton: {
    height: 42,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  sendInviteText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  identityList: {
    paddingHorizontal: 20,
  },
  identityCard: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identityAvatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  identityHeadingCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  identityName: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  identityMethod: {
    marginTop: 3,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
    lineHeight: 13,
  },
  identityStatusBox: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 11,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  identityStatusCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  identityStatusTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  identityStatusText: {
    marginTop: 2,
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
    lineHeight: 12,
  },
  identityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  identityMetaLabel: {
    color: '#858C97',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  identityMetaValue: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  identityActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  identityPrimaryAction: {
    height: 40,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  identityPrimaryText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  identitySecondaryAction: {
    height: 40,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#F3B18D',
    borderRadius: 8,
    backgroundColor: '#FFF9F5',
  },
  disabledIdentityAction: {
    borderColor: '#E0E3E7',
    backgroundColor: '#F4F5F7',
  },
  identitySecondaryText: {
    marginLeft: 7,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  disabledIdentityText: {
    color: '#AEB4BC',
  },
  identityRouteActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  identityRouteButton: {
    minHeight: 34,
    flexGrow: 1,
    flexBasis: '31%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  identityManualText: {
    marginLeft: 6,
    color: '#A86900',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  identityAlternateText: {
    marginLeft: 6,
    color: '#2378C3',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  quoteLoadingText: {
    marginTop: 6,
    marginHorizontal: 20,
    color: '#737B87',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },
  uploadedDocumentCard: {
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  documentPreviewButton: {
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  documentThumbnail: {
    width: 58,
    height: 70,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 6,
    backgroundColor: '#F0F2F4',
  },
  documentPdfThumbnail: {
    width: 58,
    height: 70,
    backgroundColor: '#FFFFFF',
  },
  documentFileIcon: {
    width: 58,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#FFF0E7',
  },
  documentFileCopy: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 11,
  },
  documentFileName: {
    color: '#282E3A',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  documentFileMeta: {
    marginTop: 3,
    color: '#8C929C',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
  },
  documentActions: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ECEEF0',
    backgroundColor: '#FAFAFB',
  },
  documentActionButton: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentActionDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E3E7',
  },
  documentEditText: {
    marginLeft: 6,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  documentRemoveText: {
    marginLeft: 6,
    color: '#C93C3C',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  addDocumentButton: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3B18D',
    borderRadius: 8,
    backgroundColor: '#FFF9F5',
  },
  addDocumentText: {
    marginLeft: 7,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  previewBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 23, 34, 0.48)',
  },
  previewSheet: {
    height: '78%',
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  previewHeader: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#E8EAED',
  },
  previewHeadingCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  previewTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  previewSubtitle: {
    marginTop: 2,
    color: '#8C929C',
    fontFamily: 'Manrope-Regular',
    fontSize: 9,
  },
  previewCloseButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: '#F3F4F6',
  },
  previewBody: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F4F5F7',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  pdfPreview: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  genericPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  genericPreviewIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF0E7',
  },
  genericPreviewTitle: {
    marginTop: 16,
    color: '#282E3A',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  genericPreviewText: {
    marginTop: 5,
    color: '#8C929C',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  stepperRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  stepperLabel: {
    color: '#2B313D',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  stepperHint: {
    marginTop: 2,
    color: '#969CA6',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
  },
  stepper: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  stepperButton: {
    width: 38,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    width: 32,
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    textAlign: 'center',
  },
  notesShell: {
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  notesInput: {
    minHeight: 82,
    padding: 12,
    color: '#202632',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 16,
  },
  printOption: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E3E7',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    padding: 11,
    width: '48.5%',
  },
  printOptionCopy: {flex: 1, marginLeft: 9},
  printOptionLabel: {
    color: '#3D4450',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  printOptionSubtitle: {
    color: '#9298A2',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
    lineHeight: 12,
    marginTop: 2,
  },
  printOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  printQuantityRow: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderColor: '#E0E3E7',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    minHeight: 62,
    paddingHorizontal: 12,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#B8BEC7',
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  radioDot: {
    backgroundColor: '#FD6D1F',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  selectedPrintOption: {
    backgroundColor: '#FFF9F5',
    borderColor: '#FD6D1F',
  },
  selectedPrintOptionLabel: {color: '#D65322'},
  selectedRadio: {borderColor: '#FD6D1F'},
  summaryList: {
    paddingHorizontal: 20,
  },
  summaryRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F2',
  },
  lastSummaryRow: {
    borderBottomWidth: 0,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  summaryEditButton: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#FFF0E7',
  },
  summaryEditText: {
    marginLeft: 4,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  summaryLabel: {
    color: '#9298A2',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
  },
  summaryValue: {
    marginTop: 2,
    color: '#272D39',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
    lineHeight: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  priceLabel: {
    color: '#2B313D',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
  priceHint: {
    marginTop: 3,
    color: '#9298A2',
    fontFamily: 'Manrope-Regular',
    fontSize: 8,
  },
  price: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  paymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 11,
    borderRadius: 8,
    backgroundColor: '#EAF7EF',
  },
  paymentNoticeText: {
    flex: 1,
    marginLeft: 8,
    color: '#277450',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  priceEditButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F3B18D',
    borderRadius: 8,
    backgroundColor: '#FFF9F5',
  },
  priceEditText: {
    marginLeft: 7,
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  paymentSummaryCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E1E5EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  paymentSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  paymentSummaryLabel: {
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  paymentSummaryAmount: {
    marginTop: 3,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EAF7EF',
  },
  paymentMethodText: {
    marginLeft: 4,
    color: '#168A52',
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  paymentInfoCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },
  paymentInfoTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  paymentInfoText: {
    marginTop: 3,
    color: '#646B76',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  paymentDivider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: '#EEF0F3',
  },
  paymentDetailRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  paymentDetailLabel: {
    flex: 1,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  paymentDetailValue: {
    flex: 1.35,
    color: '#202632',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'right',
  },
  confirmationHeader: {
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  confirmationHeaderText: {
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  confirmationContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  successIcon: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    backgroundColor: '#EAF7EF',
  },
  waitingAnimation: {
    height: 150,
    width: 150,
  },
  waitingAnimationShell: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  successTitle: {
    marginTop: 22,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    textAlign: 'center',
  },
  successMessage: {
    marginTop: 8,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  referenceRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E5E9',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  referenceLabel: {
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  referenceValue: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  confirmationPaymentCard: {
    width: '100%',
    marginTop: 12,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#DDE8E3',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  confirmationPaymentCardSuccess: {
    borderColor: '#BFE4CE',
    backgroundColor: '#F8FCFA',
  },
  confirmationPaymentCardError: {
    borderColor: '#F1C9C9',
    backgroundColor: '#FFF8F8',
  },
  confirmationPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  confirmationPaymentIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#EAF7EF',
  },
  confirmationPaymentIconError: {
    backgroundColor: '#FCEEEE',
  },
  confirmationPaymentIconPending: {
    backgroundColor: '#FFF5DC',
  },
  confirmationPaymentTitleCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  confirmationPaymentTitle: {
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  confirmationPaymentSubtitle: {
    marginTop: 2,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  confirmationPaymentText: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6EFEA',
    color: '#4D5A54',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10.5,
    lineHeight: 16,
  },
  retryPaymentButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  retryPaymentText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  confirmationActions: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  confirmationPrimary: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  confirmationPrimaryText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  confirmationSecondary: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmationSecondaryText: {
    color: '#5F6672',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 11,
  },
});
