import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import {useMutation, useQuery} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import DatePicker from 'react-native-date-picker';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BookingChoice from '../../components/BookingFlow/BookingChoice';
import BookingFlowFooter from '../../components/BookingFlow/BookingFlowFooter';
import BookingFlowHeader from '../../components/BookingFlow/BookingFlowHeader';
import BookingFlowSection from '../../components/BookingFlow/BookingFlowSection';
import PricingBreakdown from '../../components/BookingFlow/PricingBreakdown';
import {setBookingInfoState} from '../../features/booking/bookingSlice';
import useRegister from '../../hooks/useRegister';
import {CREATE_BOOKING} from '../../../request/mutations/createBooking.mutation';
import {UPDATE_BOOKING_STATUS} from '../../../request/mutations/updateBookingStatus.mutation';
import {GET_DOCUMENT_TYPES} from '../../../request/queries/getPaginatedDocumentTypes.query';
import {GET_MATCHED_AGENT} from '../../../request/queries/matchAgent.query';

const ADDITIONAL_SIGNATURE_PRICE = 10;
const PRINT_COPY_PRICE = 5;
const SERVICE_SETTINGS_KEY = 'notarizr_client_service_settings';
const getMinimumBookingDate = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
};

const formatDateId = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

const parseDateId = date => new Date(`${date}T12:00:00`);

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat'];

const parseTimeToMinutes = value => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) {
    return null;
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
  return hours * 60 + minutes;
};

const formatMinutes = value => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
};

const getAvailableTimes = (schedule, selectedDate) => {
  const day = DAY_KEYS[parseDateId(selectedDate).getDay()];
  const daySchedule = (schedule || []).find(entry => entry?.day === day);
  const times = [];

  (daySchedule?.slots || []).forEach(slot => {
    const start = parseTimeToMinutes(slot.startTime);
    const end = parseTimeToMinutes(slot.endTime);
    if (start === null || end === null) {
      return;
    }
    for (let cursor = start; cursor + 60 <= end; cursor += 60) {
      times.push(cursor);
    }
  });

  return [...new Set(times)].sort((a, b) => a - b).map(formatMinutes);
};

const formatDateLabel = date =>
  parseDateId(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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

const formatFileSize = size => {
  if (!size) {
    return 'File ready';
  }
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageDocument = document =>
  document?.type?.startsWith('image/') ||
  /\.(jpe?g|png|heic|webp)$/i.test(document?.name || '');

const isPdfDocument = document =>
  document?.type === 'application/pdf' || /\.pdf$/i.test(document?.name || '');

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
  availableTimes,
  availabilityLoading,
  bookingFor,
  datePickerOpen,
  isMobile,
  onManageAddresses,
  onChangeBookingFor,
  onChangeOtherName,
  onChangeOtherPhone,
  onSelectAddress,
  onSelectDate,
  onSelectTime,
  onToggleDatePicker,
  otherName,
  otherPhone,
  selectedAddress,
  selectedDate,
  selectedTime,
}) {
  return (
    <>
      <BookingFlowSection
        subtitle="Choose a preferred appointment slot."
        title="Date and time">
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
        <Text style={styles.timeSectionLabel}>Available times</Text>
        {availabilityLoading ? (
          <View style={styles.availabilityState}>
            <ActivityIndicator color="#FD6D1F" size="small" />
            <Text style={styles.availabilityStateText}>
              Loading notary availability…
            </Text>
          </View>
        ) : availableTimes.length ? (
          <View style={styles.timeList}>
            {availableTimes.map(time => {
              const selected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  activeOpacity={0.7}
                  onPress={() => onSelectTime(time)}
                  style={[
                    styles.timeChip,
                    selected && styles.selectedTimeChip,
                  ]}>
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
        ) : (
          <View style={styles.availabilityState}>
            <Feather name="calendar" size={17} color="#969CA6" />
            <Text style={styles.availabilityStateText}>
              This notary is not available on the selected day.
            </Text>
          </View>
        )}
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

function DocumentDetailsStep({
  documentOptions,
  documentsError,
  documentsLoading,
  documentType,
  isMobile,
  notes,
  onChangeNotes,
  onChangeSigners,
  onSelectDocumentType,
  onRetryDocuments,
  additionalSignatures,
}) {
  return (
    <>
      <BookingFlowSection
        subtitle="Choose the document that best matches your request."
        title="Document type">
        {isMobile ? (
          <TouchableOpacity
            activeOpacity={0.72}
            onPress={() => onSelectDocumentType(null)}
            style={[
              styles.skipDocumentOption,
              !documentType && styles.selectedSkipDocumentOption,
            ]}>
            <View style={styles.skipDocumentIcon}>
              <Feather name="clock" size={18} color="#FD6D1F" />
            </View>
            <View style={styles.skipDocumentCopy}>
              <Text style={styles.skipDocumentTitle}>
                Decide at the appointment
              </Text>
              <Text style={styles.skipDocumentSubtitle}>
                Document selection is optional for mobile notary.
              </Text>
            </View>
            {!documentType ? (
              <Feather name="check-circle" size={18} color="#168A52" />
            ) : null}
          </TouchableOpacity>
        ) : null}
        {documentsLoading ? (
          <View style={styles.catalogLoading}>
            <ActivityIndicator color="#FD6D1F" size="small" />
            <Text style={styles.catalogLoadingText}>
              Loading document types
            </Text>
          </View>
        ) : documentsError ? (
          <View style={styles.catalogError}>
            <Text style={styles.catalogErrorTitle}>
              Document types could not load
            </Text>
            <TouchableOpacity onPress={onRetryDocuments}>
              <Text style={styles.catalogRetry}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : documentOptions.length ? (
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
        ) : (
          <Text style={styles.catalogEmpty}>No document types available.</Text>
        )}
      </BookingFlowSection>
      <BookingFlowSection
        subtitle={`Each additional signature adds $${ADDITIONAL_SIGNATURE_PRICE.toFixed(
          2,
        )} to the estimate.`}
        title="Signing details">
        <View style={styles.stepperRow}>
          <View>
            <Text style={styles.stepperLabel}>
              Additional signatures required
            </Text>
            <Text style={styles.stepperHint}>Beyond the primary signature</Text>
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

function UploadAndPrintStep({
  isMobile,
  onChangePrintCopies,
  onChooseDocuments,
  onRemoveDocument,
  onReplaceDocument,
  onTogglePrint,
  printCopies,
  uploadedDocuments,
  wantsPrint,
}) {
  const uploaded = uploadedDocuments.length > 0;
  const [previewDocument, setPreviewDocument] = useState(null);

  return (
    <>
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
                  ) : isPdfDocument(document) ? (
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
                PDF, JPG, PNG, or document files up to 10 MB
              </Text>
            </View>
            <Text style={styles.uploadAction}>Browse</Text>
          </TouchableOpacity>
        )}
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
              ) : isPdfDocument(previewDocument) ? (
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
                    Preview unavailable
                  </Text>
                  <Text style={styles.genericPreviewText}>
                    This file is selected and ready to attach.
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
  additionalSignatures,
  additionalSignatureCharge,
  bookingFor,
  dateLabel,
  documentCharge,
  documentType,
  isMobile,
  location,
  otherName,
  printCopies,
  printingCharge,
  price,
  serviceName,
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
          <SummaryRow
            icon="file-text"
            label="Document"
            value={documentType || 'Bring to appointment'}
          />
          {isMobile ? (
            <SummaryRow
              icon="printer"
              label="Printed copies"
              value={
                printCopies > 0
                  ? `${printCopies} ${printCopies === 1 ? 'copy' : 'copies'}`
                  : 'Not requested'
              }
            />
          ) : null}
          <SummaryRow
            icon="edit-3"
            label="Additional signatures"
            last
            value={`${additionalSignatures} required ($${additionalSignatureCharge.toFixed(
              2,
            )}) for ${bookingFor === 'self' ? 'my booking' : otherName}`}
          />
        </View>
      </BookingFlowSection>

      <BookingFlowSection
        subtitle="You will only be charged after a notary accepts."
        title="Estimated total">
        <PricingBreakdown
          additionalSignatureCount={additionalSignatures}
          additionalSignatures={additionalSignatureCharge}
          documentCharge={documentCharge}
          documentLabel={documentType}
          printingCharge={printingCharge}
          printingCopies={printCopies}
          serviceLabel={serviceName}
          total={price}
        />
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
  const scrollRef = useRef(null);
  const {pickDocumentDetails, uploadAllDocuments} = useRegister();
  const {
    data: documentCatalog,
    error: documentsError,
    loading: documentsLoading,
    refetch: refetchDocuments,
  } = useQuery(GET_DOCUMENT_TYPES, {
    variables: {
      page: 1,
      limit: 50,
      state: user?.state || 'CA',
    },
    skip: !user || previewMode,
  });
  const {
    data: matchedAgentData,
    loading: availabilityLoading,
    refetch: refetchMatchedAgent,
  } = useQuery(GET_MATCHED_AGENT, {
    variables: {serviceType: backendServiceType},
    skip: !user || previewMode,
    fetchPolicy: 'no-cache',
  });
  const [createBooking] = useMutation(CREATE_BOOKING);
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS);
  const [step, setStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateId(getMinimumBookingDate()),
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingFor, setBookingFor] = useState('self');
  const [otherName, setOtherName] = useState('');
  const [otherPhone, setOtherPhone] = useState('');
  const [addresses, setAddresses] = useState(
    user?.addresses?.filter(address => address.location) || [],
  );
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [documentType, setDocumentType] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [additionalSignatures, setAdditionalSignatures] = useState(0);
  const [notes, setNotes] = useState('');
  const [wantsPrint, setWantsPrint] = useState(false);
  const [printCopies, setPrintCopies] = useState(1);

  const documentOptions = useMemo(() => {
    const catalogOptions = (
      documentCatalog?.getPaginatedDocumentTypes?.documentTypes || []
    ).map(option => ({
      ...option,
      price: Number(option.statePrices?.[0]?.price || 0),
    }));

    return catalogOptions;
  }, [documentCatalog]);

  const matchedAgent = matchedAgentData?.matchAgent?.user;
  const availableTimes = useMemo(
    () =>
      getAvailableTimes(
        matchedAgent?.service?.availability?.schedule,
        selectedDate,
      ),
    [matchedAgent?.service?.availability?.schedule, selectedDate],
  );

  useEffect(() => {
    setSelectedTime(current =>
      availableTimes.includes(current) ? current : availableTimes[0] || null,
    );
  }, [availableTimes]);

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
    scrollRef.current?.scrollTo({animated: false, y: 0});
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

  const dateLabel = formatDateLabel(selectedDate);
  const location = isMobile
    ? selectedAddress?.location
    : 'Secure video appointment';
  const documentCharge = Number(documentType?.price || 0);
  const additionalSignatureCharge =
    additionalSignatures * ADDITIONAL_SIGNATURE_PRICE;
  const printingCharge =
    isMobile && wantsPrint ? printCopies * PRINT_COPY_PRICE : 0;
  const price = documentCharge + additionalSignatureCharge + printingCharge;
  const stepOneValid =
    Boolean(selectedDate && selectedTime && (!isMobile || selectedAddress)) &&
    (bookingFor === 'self' || Boolean(otherName.trim() && otherPhone.trim()));
  const stepTwoValid = isMobile || Boolean(documentType);
  const stepThreeValid = isMobile
    ? !wantsPrint || uploadedDocuments.length > 0
    : uploadedDocuments.length > 0;
  const disabled =
    step === 1
      ? !stepOneValid
      : step === 2
      ? !stepTwoValid
      : step === 3
      ? !stepThreeValid
      : false;

  const handleBack = () => {
    if (step > 1) {
      setStep(current => current - 1);
      return;
    }
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (step < 4) {
      setStep(current => current + 1);
      return;
    }

    setSubmitting(true);
    try {
      const accessToken = await AsyncStorage.getItem('token');
      if (!accessToken || accessToken.startsWith('local-preview:')) {
        throw new Error(
          'Please sign in with a real account before creating a booking.',
        );
      }

      const matchedAgentResponse = await refetchMatchedAgent({
        serviceType: backendServiceType,
      });
      const bookingAgent = matchedAgentResponse?.data?.matchAgent?.user;
      if (!bookingAgent?.service?._id) {
        throw new Error('No verified notary is available for this service.');
      }

      const validTimes = getAvailableTimes(
        bookingAgent.service.availability?.schedule,
        selectedDate,
      );
      if (!validTimes.includes(selectedTime)) {
        throw new Error(
          'This time is no longer available. Choose another appointment slot.',
        );
      }

      let documents = uploadedDocuments;
      if (!__DEV__ && uploadedDocuments.length > 0) {
        documents = await uploadAllDocuments(
          uploadedDocuments.map(document => document.uri),
        );
        if (!documents?.length) {
          throw new Error('The documents could not be uploaded.');
        }
      }

      const appointment = buildAppointmentDate(selectedDate, selectedTime);
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
      const bookingResponse = await createBooking({
        variables: {
          serviceType: backendServiceType,
          service: bookingAgent.service._id,
          agent: bookingAgent._id,
          documentType: documentType
            ? [
                {
                  name: documentType.name,
                  price: Math.round(documentType.price),
                },
              ]
            : [],
          address: isMobile
            ? selectedAddress?._id || selectedAddress?.location
            : null,
          dateOfBooking: appointment,
          timeOfBooking: appointment,
          notes: bookingNotes || null,
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
          totalSignaturesRequired: additionalSignatures,
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
    const selectedDocuments = await pickDocumentDetails(true);
    if (!selectedDocuments.length) {
      return;
    }
    const selectionTime = Date.now();
    setUploadedDocuments(current => [
      ...current,
      ...selectedDocuments
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
          totalSteps={4}
        />
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            <AppointmentStep
              addresses={addresses}
              availableTimes={availableTimes}
              availabilityLoading={availabilityLoading}
              bookingFor={bookingFor}
              datePickerOpen={datePickerOpen}
              isMobile={isMobile}
              onManageAddresses={() => navigation.navigate('AddressDetails')}
              onChangeBookingFor={setBookingFor}
              onChangeOtherName={setOtherName}
              onChangeOtherPhone={setOtherPhone}
              onSelectAddress={setSelectedAddress}
              onSelectDate={setSelectedDate}
              onSelectTime={setSelectedTime}
              onToggleDatePicker={setDatePickerOpen}
              otherName={otherName}
              otherPhone={otherPhone}
              selectedAddress={selectedAddress}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          ) : step === 2 ? (
            <DocumentDetailsStep
              documentOptions={documentOptions}
              documentsError={documentsError}
              documentsLoading={
                documentsLoading && documentOptions.length === 0
              }
              documentType={documentType}
              isMobile={isMobile}
              notes={notes}
              onChangeNotes={setNotes}
              onChangeSigners={setAdditionalSignatures}
              onSelectDocumentType={setDocumentType}
              onRetryDocuments={refetchDocuments}
              additionalSignatures={additionalSignatures}
            />
          ) : step === 3 ? (
            <UploadAndPrintStep
              isMobile={isMobile}
              onChangePrintCopies={setPrintCopies}
              onChooseDocuments={chooseDocuments}
              onRemoveDocument={removeDocument}
              onReplaceDocument={replaceDocument}
              onTogglePrint={setWantsPrint}
              printCopies={printCopies}
              uploadedDocuments={uploadedDocuments}
              wantsPrint={wantsPrint}
            />
          ) : (
            <ReviewStep
              additionalSignatures={additionalSignatures}
              additionalSignatureCharge={additionalSignatureCharge}
              bookingFor={bookingFor}
              dateLabel={dateLabel}
              documentCharge={documentCharge}
              documentType={documentType?.name || ''}
              isMobile={isMobile}
              location={location}
              otherName={otherName}
              printCopies={isMobile && wantsPrint ? printCopies : 0}
              printingCharge={printingCharge}
              price={price}
              serviceName={serviceName}
              time={selectedTime}
            />
          )}
        </ScrollView>
        <BookingFlowFooter
          disabled={disabled}
          label={step === 4 ? 'Confirm request' : 'Continue'}
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
  timeSectionLabel: {
    marginTop: 16,
    marginHorizontal: 20,
    color: '#303642',
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  timeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    paddingHorizontal: 20,
  },
  availabilityState: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 20,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E0E3E7',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  availabilityStateText: {
    flex: 1,
    marginLeft: 8,
    color: '#7A818D',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
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
