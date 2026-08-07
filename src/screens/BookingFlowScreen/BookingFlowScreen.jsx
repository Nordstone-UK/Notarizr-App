import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useLazyQuery, useMutation, useQuery} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import BookingChoice from '../../components/BookingFlow/BookingChoice';
import BookingFlowFooter from '../../components/BookingFlow/BookingFlowFooter';
import BookingFlowHeader from '../../components/BookingFlow/BookingFlowHeader';
import BookingFlowSection from '../../components/BookingFlow/BookingFlowSection';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import useRegister from '../../hooks/useRegister';
import {CREATE_BOOKING} from '../../../request/mutations/createBooking.mutation';
import {UPDATE_BOOKING_STATUS} from '../../../request/mutations/updateBookingStatus.mutation';
import {GET_DOCUMENT_TYPES} from '../../../request/queries/getPaginatedDocumentTypes.query';
import {GET_MATCHED_AGENT} from '../../../request/queries/matchAgent.query';

const TIME_OPTIONS = ['9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM', '5:00 PM'];
const FALLBACK_DOCUMENT_TYPES = [
  {_id: 'local-power-of-attorney', name: 'Power of attorney', price: 45},
  {_id: 'local-affidavit', name: 'Affidavit', price: 35},
  {_id: 'local-real-estate', name: 'Real estate documents', price: 65},
  {_id: 'local-business', name: 'Business agreement', price: 50},
  {_id: 'local-estate', name: 'Estate documents', price: 55},
  {_id: 'local-other', name: 'Other document', price: 40},
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const createDateOptions = () =>
  [1, 2, 3, 4].map(offset => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return {
      id: date.toISOString().slice(0, 10),
      day: WEEKDAYS[date.getDay()],
      date: date.getDate(),
      month: MONTHS[date.getMonth()],
      full: `${WEEKDAYS[date.getDay()]}, ${
        MONTHS[date.getMonth()]
      } ${date.getDate()}`,
    };
  });

const getDocumentIcon = name => {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes('real estate')) {
    return 'home';
  }
  if (normalizedName.includes('affidavit')) {
    return 'edit-3';
  }
  if (normalizedName.includes('other')) {
    return 'more-horizontal';
  }
  return 'file-text';
};

const buildAppointmentDate = (date, time) => {
  const [, clock, meridiem] = time.match(/^(\d{1,2}:\d{2})\s(AM|PM)$/) || [];
  if (!clock) {
    return new Date(`${date}T12:00:00.000Z`).toISOString();
  }
  const [hourText, minute] = clock.split(':');
  let hour = Number(hourText);
  if (meridiem === 'PM' && hour !== 12) {
    hour += 12;
  }
  if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }
  return new Date(
    `${date}T${String(hour).padStart(2, '0')}:${minute}:00.000Z`,
  ).toISOString();
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

function AppointmentStep({
  addresses,
  bookingFor,
  customAddress,
  dateOptions,
  isMobile,
  onAddAddress,
  onChangeBookingFor,
  onChangeCustomAddress,
  onChangeOtherName,
  onChangeOtherPhone,
  onSaveAddress,
  onSelectAddress,
  onSelectDate,
  onSelectTime,
  otherName,
  otherPhone,
  selectedAddress,
  selectedDate,
  selectedTime,
  showAddressInput,
}) {
  return (
    <>
      <BookingFlowSection
        subtitle="Choose a preferred appointment slot."
        title="Date and time">
        <ScrollView
          contentContainerStyle={styles.dateList}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {dateOptions.map(option => {
            const selected = selectedDate === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.7}
                onPress={() => onSelectDate(option.id)}
                style={[styles.dateTile, selected && styles.selectedDateTile]}>
                <Text
                  style={[styles.dateDay, selected && styles.selectedDateText]}>
                  {option.day}
                </Text>
                <Text
                  style={[
                    styles.dateNumber,
                    selected && styles.selectedDateText,
                  ]}>
                  {option.date}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    selected && styles.selectedDateText,
                  ]}>
                  {option.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.timeList}>
          {TIME_OPTIONS.map(time => {
            const selected = selectedTime === time;
            return (
              <TouchableOpacity
                key={time}
                activeOpacity={0.7}
                onPress={() => onSelectTime(time)}
                style={[styles.timeChip, selected && styles.selectedTimeChip]}>
                <Text
                  style={[
                    styles.timeText,
                    selected && styles.selectedTimeText,
                  ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          {showAddressInput ? (
            <View style={styles.addressEditor}>
              <View style={styles.inputShell}>
                <Feather name="map-pin" size={17} color="#7D8490" />
                <TextInput
                  onChangeText={onChangeCustomAddress}
                  placeholder="Enter full address"
                  placeholderTextColor="#A2A7B0"
                  style={styles.textInput}
                  value={customAddress}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.72}
                disabled={!customAddress.trim()}
                onPress={onSaveAddress}
                style={[
                  styles.saveAddressButton,
                  !customAddress.trim() && styles.disabledSmallButton,
                ]}>
                <Text style={styles.saveAddressText}>Use address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onAddAddress}
              style={styles.addAddressButton}>
              <Feather name="plus" size={16} color="#FD6D1F" />
              <Text style={styles.addAddressText}>Add another address</Text>
            </TouchableOpacity>
          )}
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

function DocumentsStep({
  documentOptions,
  documentsLoading,
  documentType,
  notes,
  onChangeNotes,
  onChangeSigners,
  onSelectDocumentType,
  onChooseDocuments,
  signers,
  uploadedDocuments,
}) {
  const uploaded = uploadedDocuments.length > 0;
  return (
    <>
      <BookingFlowSection
        subtitle="Choose the document that best matches your request."
        title="Document type">
        {documentsLoading ? (
          <View style={styles.catalogLoading}>
            <ActivityIndicator color="#FD6D1F" size="small" />
            <Text style={styles.catalogLoadingText}>
              Loading document types
            </Text>
          </View>
        ) : (
          <View style={styles.documentGrid}>
            {documentOptions.map(option => {
              const selected = documentType?._id === option._id;
              return (
                <TouchableOpacity
                  key={option._id}
                  activeOpacity={0.72}
                  onPress={() => onSelectDocumentType(option)}
                  style={[
                    styles.documentOption,
                    selected && styles.selectedDocumentOption,
                  ]}>
                  <View
                    style={[
                      styles.documentIcon,
                      selected && styles.selectedDocumentIcon,
                    ]}>
                    <Feather
                      name={getDocumentIcon(option.name)}
                      size={18}
                      color={selected ? '#FD6D1F' : '#737B87'}
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.documentLabel,
                      selected && styles.selectedDocumentLabel,
                    ]}>
                    {option.name}
                  </Text>
                  {selected ? (
                    <Feather name="check-circle" size={16} color="#FD6D1F" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </BookingFlowSection>

      <BookingFlowSection
        subtitle="Upload a readable copy. You can replace it later."
        title="Document upload">
        <TouchableOpacity
          activeOpacity={0.74}
          onPress={onChooseDocuments}
          style={[styles.uploadArea, uploaded && styles.uploadedArea]}>
          <View style={[styles.uploadIcon, uploaded && styles.uploadedIcon]}>
            <Feather
              name={uploaded ? 'check' : 'upload-cloud'}
              size={23}
              color={uploaded ? '#168A52' : '#FD6D1F'}
            />
          </View>
          <View style={styles.uploadCopy}>
            <Text style={styles.uploadTitle}>
              {uploaded
                ? `${uploadedDocuments.length} document${
                    uploadedDocuments.length === 1 ? '' : 's'
                  } selected`
                : 'Choose a document'}
            </Text>
            <Text style={styles.uploadSubtitle}>
              {uploaded
                ? 'Ready to attach to this booking'
                : 'PDF, JPG, or PNG up to 10 MB'}
            </Text>
          </View>
          <Text style={styles.uploadAction}>
            {uploaded ? 'Replace' : 'Browse'}
          </Text>
        </TouchableOpacity>
      </BookingFlowSection>

      <BookingFlowSection
        subtitle="Include everyone who needs to sign."
        title="Signing details">
        <View style={styles.stepperRow}>
          <View>
            <Text style={styles.stepperLabel}>Number of signers</Text>
            <Text style={styles.stepperHint}>Includes you</Text>
          </View>
          <View style={styles.stepper}>
            <TouchableOpacity
              accessibilityLabel="Remove signer"
              activeOpacity={0.7}
              disabled={signers === 1}
              onPress={() => onChangeSigners(Math.max(1, signers - 1))}
              style={styles.stepperButton}>
              <Feather
                name="minus"
                size={17}
                color={signers === 1 ? '#C4C8CE' : '#303642'}
              />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{signers}</Text>
            <TouchableOpacity
              accessibilityLabel="Add signer"
              activeOpacity={0.7}
              disabled={signers === 6}
              onPress={() => onChangeSigners(Math.min(6, signers + 1))}
              style={styles.stepperButton}>
              <Feather name="plus" size={17} color="#303642" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.notesShell}>
          <TextInput
            multiline
            onChangeText={onChangeNotes}
            placeholder="Optional instructions for your notary"
            placeholderTextColor="#A2A7B0"
            style={styles.notesInput}
            textAlignVertical="top"
            value={notes}
          />
        </View>
      </BookingFlowSection>
    </>
  );
}

function SummaryRow({icon, label, last, value}) {
  return (
    <View style={[styles.summaryRow, last && styles.lastSummaryRow]}>
      <View style={styles.summaryIcon}>
        <Feather name={icon} size={16} color="#FD6D1F" />
      </View>
      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

function ReviewStep({
  bookingFor,
  dateLabel,
  documentType,
  isMobile,
  location,
  otherName,
  price,
  serviceName,
  signers,
  time,
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
            value={`${dateLabel} at ${time}`}
          />
          <SummaryRow
            icon={isMobile ? 'map-pin' : 'video'}
            label={isMobile ? 'Meeting address' : 'Session format'}
            value={location}
          />
          <SummaryRow icon="file-text" label="Document" value={documentType} />
          <SummaryRow
            icon="users"
            label="Signing for"
            last
            value={
              bookingFor === 'self'
                ? `Myself, ${signers} ${signers === 1 ? 'signer' : 'signers'}`
                : `${otherName}, ${signers} ${
                    signers === 1 ? 'signer' : 'signers'
                  }`
            }
          />
        </View>
      </BookingFlowSection>

      <BookingFlowSection
        subtitle="You will only be charged after a notary accepts."
        title="Estimated total">
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Service estimate</Text>
            <Text style={styles.priceHint}>
              Secure payment through Notarizr
            </Text>
          </View>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
        </View>
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

function Confirmation({booking, navigation, serviceName}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.confirmationHeader}>
        <Text style={styles.confirmationHeaderText}>Request sent</Text>
      </View>
      <View style={styles.confirmationContent}>
        <View style={styles.successIcon}>
          <Feather name="check" size={36} color="#168A52" />
        </View>
        <Text style={styles.successTitle}>Your request is on its way</Text>
        <Text style={styles.successMessage}>
          We are matching your {serviceName.toLowerCase()} request with an
          available verified notary.
        </Text>
        <View style={styles.referenceRow}>
          <Text style={styles.referenceLabel}>Request reference</Text>
          <Text style={styles.referenceValue}>
            #NTR-{booking?._id?.slice(-8).toUpperCase()}
          </Text>
        </View>
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
  const dateOptions = useMemo(createDateOptions, []);
  const scrollRef = useRef(null);
  const {uploadAllDocuments, uploadMultipleFiles} = useRegister();
  const {data: documentCatalog, loading: documentsLoading} = useQuery(
    GET_DOCUMENT_TYPES,
    {
      variables: {
        page: 1,
        limit: 50,
        state: user?.state || 'CA',
      },
      skip: !user || previewMode,
    },
  );
  const [matchAgent] = useLazyQuery(GET_MATCHED_AGENT, {
    fetchPolicy: 'no-cache',
  });
  const [createBooking] = useMutation(CREATE_BOOKING);
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [step, setStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].id);
  const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[1]);
  const [bookingFor, setBookingFor] = useState('self');
  const [otherName, setOtherName] = useState('');
  const [otherPhone, setOtherPhone] = useState('');
  const [addresses, setAddresses] = useState(
    user?.addresses?.filter(address => address.location) || [],
  );
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [documentType, setDocumentType] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [signers, setSigners] = useState(1);
  const [notes, setNotes] = useState('');

  const documentOptions = useMemo(() => {
    const catalogOptions = (
      documentCatalog?.getPaginatedDocumentTypes?.documentTypes || []
    ).map(option => ({
      ...option,
      price: Number(option.statePrices?.[0]?.price || 0),
    }));

    return catalogOptions.length > 0 ? catalogOptions : FALLBACK_DOCUMENT_TYPES;
  }, [documentCatalog]);

  useEffect(() => {
    if (!documentType && documentOptions.length > 0) {
      setDocumentType(documentOptions[0]);
    }
  }, [documentOptions, documentType]);

  useEffect(() => {
    scrollRef.current?.scrollTo({animated: false, y: 0});
  }, [step]);

  const dateLabel =
    dateOptions.find(option => option.id === selectedDate)?.full ||
    selectedDate;
  const location = isMobile
    ? selectedAddress?.location
    : 'Secure video appointment';
  const price =
    Number(documentType?.price || 0) + Math.max(0, signers - 1) * 10;
  const stepOneValid =
    Boolean(selectedDate && selectedTime && (!isMobile || selectedAddress)) &&
    (bookingFor === 'self' || Boolean(otherName.trim() && otherPhone.trim()));
  const stepTwoValid = Boolean(documentType && uploadedDocuments.length > 0);
  const disabled =
    step === 1 ? !stepOneValid : step === 2 ? !stepTwoValid : false;

  const handleBack = () => {
    if (step > 1) {
      setStep(current => current - 1);
      return;
    }
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (step < 3) {
      setStep(current => current + 1);
      return;
    }

    setSubmitting(true);
    try {
      const matchedAgentResponse = await matchAgent({
        variables: {serviceType: backendServiceType},
      });
      const matchedAgent = matchedAgentResponse?.data?.matchAgent?.user;
      if (!matchedAgent?.service?._id) {
        throw new Error('No verified notary is available for this service.');
      }

      let documents = uploadedDocuments;
      if (!__DEV__) {
        documents = await uploadAllDocuments(
          uploadedDocuments.map(document => document.uri),
        );
        if (!documents?.length) {
          throw new Error('The documents could not be uploaded.');
        }
      }

      const appointment = buildAppointmentDate(selectedDate, selectedTime);
      const nameParts = otherName.trim().split(/\s+/);
      const bookingResponse = await createBooking({
        variables: {
          serviceType: backendServiceType,
          service: matchedAgent.service._id,
          agent: matchedAgent._id,
          documentType: [
            {name: documentType.name, price: Math.round(documentType.price)},
          ],
          address: isMobile
            ? selectedAddress?._id || selectedAddress?.location
            : null,
          dateOfBooking: appointment,
          timeOfBooking: appointment,
          notes: notes.trim() || null,
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
            location: isMobile ? selectedAddress?.location || '' : '',
          },
          preferenceAnalysis: 'distance',
          documents,
          totalPrice: price,
          totalSignaturesRequired: signers,
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

      const statusResponse = await updateBookingStatus({
        variables: {bookingId: createdBooking._id, status: 'pending'},
      });
      const pendingBooking =
        statusResponse?.data?.updateBookingStatusR?.booking || createdBooking;
      dispatch(setBookingInfoState(pendingBooking));
      setConfirmedBooking(pendingBooking);
      Toast.show({
        type: 'success',
        text1: 'Booking created',
        text2: 'Your request was sent to an available notary.',
      });
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

  const chooseDocuments = async () => {
    const documentUris = await uploadMultipleFiles();
    if (!documentUris?.length) {
      return;
    }
    setUploadedDocuments(
      documentUris.map((uri, index) => ({
        id: index + 1,
        name: `Document ${index + 1}`,
        uri,
        url: uri,
      })),
    );
  };

  const saveAddress = () => {
    const nextAddress = customAddress.trim();
    if (!nextAddress) {
      return;
    }
    const address = {location: nextAddress, tag: 'custom'};
    setAddresses(current => [...current, address]);
    setSelectedAddress(address);
    setCustomAddress('');
    setShowAddressInput(false);
  };

  if (confirmedBooking) {
    return (
      <Confirmation
        booking={confirmedBooking}
        navigation={navigation}
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
        />
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            <AppointmentStep
              addresses={addresses}
              bookingFor={bookingFor}
              customAddress={customAddress}
              dateOptions={dateOptions}
              isMobile={isMobile}
              onAddAddress={() => setShowAddressInput(true)}
              onChangeBookingFor={setBookingFor}
              onChangeCustomAddress={setCustomAddress}
              onChangeOtherName={setOtherName}
              onChangeOtherPhone={setOtherPhone}
              onSaveAddress={saveAddress}
              onSelectAddress={setSelectedAddress}
              onSelectDate={setSelectedDate}
              onSelectTime={setSelectedTime}
              otherName={otherName}
              otherPhone={otherPhone}
              selectedAddress={selectedAddress}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              showAddressInput={showAddressInput}
            />
          ) : step === 2 ? (
            <DocumentsStep
              documentOptions={documentOptions}
              documentsLoading={
                documentsLoading && documentOptions.length === 0
              }
              documentType={documentType}
              notes={notes}
              onChangeNotes={setNotes}
              onChangeSigners={setSigners}
              onSelectDocumentType={setDocumentType}
              onChooseDocuments={chooseDocuments}
              signers={signers}
              uploadedDocuments={uploadedDocuments}
            />
          ) : (
            <ReviewStep
              bookingFor={bookingFor}
              dateLabel={dateLabel}
              documentType={documentType?.name || ''}
              isMobile={isMobile}
              location={location}
              otherName={otherName}
              price={price}
              serviceName={serviceName}
              signers={signers}
              time={selectedTime}
            />
          )}
        </ScrollView>
        <BookingFlowFooter
          disabled={disabled}
          label={step === 3 ? 'Confirm request' : 'Continue'}
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
  dateList: {
    paddingHorizontal: 16,
  },
  dateTile: {
    width: 72,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  selectedDateTile: {
    borderColor: '#FD6D1F',
    backgroundColor: '#FD6D1F',
  },
  dateDay: {
    color: '#858C97',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  dateNumber: {
    marginVertical: 2,
    color: '#202632',
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
  },
  dateMonth: {
    color: '#858C97',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  timeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  timeChip: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 8,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  selectedTimeChip: {
    borderColor: '#FD6D1F',
    backgroundColor: '#FFF0E7',
  },
  timeText: {
    color: '#5F6672',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },
  selectedTimeText: {
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
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
