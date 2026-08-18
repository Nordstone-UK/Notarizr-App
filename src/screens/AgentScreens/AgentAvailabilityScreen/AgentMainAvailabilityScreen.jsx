import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import ProfileScreenHeader from '../../../components/Profile/ProfileScreenHeader';
import TimePicker from '../../../components/TimePicker/TimePicker';
import useAgentService from '../../../hooks/useAgentService';
import {SERVICE_BY_AGENT_AND_TYPE} from '../../../../request/queries/getserviceByAgent.query';
import BookingColors from '../../../themes/BookingColors';

// ── Constants ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'];
const DAY_LABELS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thur: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};
const DAY_SHORT = {
  mon: 'Mo',
  tue: 'Tu',
  wed: 'We',
  thur: 'Th',
  fri: 'Fr',
  sat: 'Sa',
  sun: 'Su',
};

const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 17;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDefaultStart() {
  return moment().startOf('day').add(DEFAULT_START_HOUR, 'hours').toDate();
}

function makeDefaultEnd() {
  return moment().startOf('day').add(DEFAULT_END_HOUR, 'hours').toDate();
}

function generateSessions(startDate, endDate) {
  const start = moment(startDate);
  const end = moment(endDate);
  const sessions = [];
  let cursor = start.clone();
  while (cursor.clone().add(60, 'minutes').isSameOrBefore(end)) {
    const next = cursor.clone().add(60, 'minutes');
    sessions.push(`${cursor.format('h:mm A')} – ${next.format('h:mm A')}`);
    cursor = next;
  }
  return sessions;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DayChip({day, selected, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={() => onPress(day)}
      style={[styles.dayChip, selected && styles.dayChipActive]}>
      <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>
        {DAY_SHORT[day]}
      </Text>
    </TouchableOpacity>
  );
}

function TimeBlock({
  block,
  index,
  daySlotCount,
  onUpdateStart,
  onUpdateEnd,
  onRemove,
}) {
  const sessions = generateSessions(block.startTime, block.endTime);
  const isValid = moment(block.endTime).isAfter(
    moment(block.startTime).add(59, 'minutes'),
  );

  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <View style={styles.blockBadge}>
          <Text style={styles.blockBadgeText}>Block {index + 1}</Text>
        </View>
        {daySlotCount > 1 && (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            onPress={onRemove}
            style={styles.removeBtn}>
            <Feather name="trash-2" size={13} color={BookingColors.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.timersRow}>
        <TimePicker
          date={block.startTime}
          onConfirm={onUpdateStart}
          Text="Start"
        />
        <View style={styles.arrowWrap}>
          <Feather
            name="arrow-right"
            size={14}
            color={BookingColors.textMuted}
          />
        </View>
        <TimePicker date={block.endTime} onConfirm={onUpdateEnd} Text="End" />
      </View>

      {!isValid && (
        <View style={styles.blockError}>
          <Feather name="alert-circle" size={11} color={BookingColors.error} />
          <Text style={styles.blockErrorText}>
            End time must be at least 60 min after start time.
          </Text>
        </View>
      )}

      {isValid && sessions.length > 0 && (
        <View style={styles.sessionsWrap}>
          <Text style={styles.sessionsLabel}>
            {sessions.length} bookable session{sessions.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.sessionPills}>
            {sessions.map((s, i) => (
              <View key={i} style={styles.sessionPill}>
                <View style={styles.sessionDot} />
                <Text style={styles.sessionPillText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function DayCard({
  day,
  blocks,
  onAddBlock,
  onRemoveBlock,
  onUpdateStart,
  onUpdateEnd,
}) {
  return (
    <View style={styles.dayCard}>
      <View style={styles.dayCardHeader}>
        <View style={styles.dayCardIcon}>
          <Feather name="calendar" size={13} color={BookingColors.primary} />
        </View>
        <Text style={styles.dayCardTitle}>{DAY_LABELS[day]}</Text>
        <Text style={styles.dayCardCount}>
          {blocks.length} block{blocks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {blocks.map((block, i) => (
        <TimeBlock
          key={block.id}
          block={block}
          index={i}
          daySlotCount={blocks.length}
          onUpdateStart={date => onUpdateStart(day, i, date)}
          onUpdateEnd={date => onUpdateEnd(day, i, date)}
          onRemove={() => onRemoveBlock(day, i)}
        />
      ))}

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onAddBlock(day)}
        style={styles.addBlockBtn}>
        <Feather name="plus" size={14} color={BookingColors.primary} />
        <Text style={styles.addBlockText}>Add time block</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AgentMainAvailabilityScreen({navigation}) {
  const serviceType = useSelector(state => state.agentService.serviceType);
  const {data, loading} = useQuery(SERVICE_BY_AGENT_AND_TYPE, {
    variables: {serviceType: serviceType || ''},
  });

  // schedule: { [day]: Array<{ id, startTime: Date, endTime: Date }> }
  const [schedule, setSchedule] = useState({});
  const [canPrint, setCanPrint] = useState(false);
  const {dispatchAvailability} = useAgentService();
  const mobile = serviceType === 'mobile_notary';
  const serviceData = data?.serviceByAgentAndType;

  // ── Load saved schedule from API ──────────────────────────────────────────
  useEffect(() => {
    const service = data?.serviceByAgentAndType?.service;
    if (!service?.availability?.schedule) return;

    const saved = {};
    service.availability.schedule.forEach(({day, slots}, _di) => {
      saved[day] = slots.map((s, i) => ({
        id: `${day}-${i}-${Date.now()}`,
        startTime: moment(s.startTime, 'h:mm A').toDate(),
        endTime: moment(s.endTime, 'h:mm A').toDate(),
      }));
    });
    setSchedule(saved);
    setCanPrint(Boolean(service.can_print));
  }, [data]);

  // ── Day toggle ────────────────────────────────────────────────────────────
  const toggleDay = useCallback(day => {
    setSchedule(prev => {
      if (prev[day]) {
        const next = {...prev};
        delete next[day];
        return next;
      }
      return {
        ...prev,
        [day]: [
          {
            id: `${day}-0-${Date.now()}`,
            startTime: makeDefaultStart(),
            endTime: makeDefaultEnd(),
          },
        ],
      };
    });
  }, []);

  // ── Block management ──────────────────────────────────────────────────────
  const addBlock = useCallback(day => {
    setSchedule(prev => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        {
          id: `${day}-${Date.now()}`,
          startTime: makeDefaultStart(),
          endTime: makeDefaultEnd(),
        },
      ],
    }));
  }, []);

  const removeBlock = useCallback((day, index) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  }, []);

  const updateBlockStart = useCallback((day, index, date) => {
    setSchedule(prev => {
      const blocks = [...prev[day]];
      blocks[index] = {...blocks[index], startTime: date};
      return {...prev, [day]: blocks};
    });
  }, []);

  const updateBlockEnd = useCallback((day, index, date) => {
    setSchedule(prev => {
      const blocks = [...prev[day]];
      blocks[index] = {...blocks[index], endTime: date};
      return {...prev, [day]: blocks};
    });
  }, []);

  // ── Validation & submit ───────────────────────────────────────────────────
  const continueSetup = () => {
    const selectedDays = Object.keys(schedule);

    if (selectedDays.length === 0) {
      Toast.show({
        type: 'warning',
        text1: 'Choose your working days',
        text2: 'Select at least one day to continue.',
      });
      return;
    }

    for (const day of selectedDays) {
      for (const block of schedule[day]) {
        if (
          !moment(block.endTime).isAfter(
            moment(block.startTime).add(59, 'minutes'),
          )
        ) {
          Toast.show({
            type: 'warning',
            text1: `Check your ${DAY_LABELS[day]} hours`,
            text2: 'Each block must be at least 60 minutes long.',
          });
          return;
        }
      }
    }

    // Build the schedule payload in WEEKDAYS order
    const schedulePayload = WEEKDAYS.filter(d => schedule[d]).map(day => ({
      day,
      slots: schedule[day].map(b => ({
        startTime: moment(b.startTime).format('h:mm A'),
        endTime: moment(b.endTime).format('h:mm A'),
      })),
    }));

    dispatchAvailability(schedulePayload, canPrint, serviceData);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedDays = WEEKDAYS.filter(d => schedule[d]);
  const totalSessions = selectedDays.reduce((sum, day) => {
    return (
      sum +
      schedule[day].reduce(
        (daySum, b) => daySum + generateSessions(b.startTime, b.endTime).length,
        0,
      )
    );
  }, 0);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={BookingColors.primary} />
          <Text style={styles.loadingText}>Loading availability…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BookingColors.surface}
      />
      <ProfileScreenHeader
        onBack={() => navigation.goBack()}
        title="Mobile Notary"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* ── Intro banner ───────────────────────────────────────────── */}
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Feather
              name={mobile ? 'map-pin' : 'video'}
              size={20}
              color={BookingColors.primary}
            />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>
              {mobile ? 'Mobile notary hours' : 'Remote notary hours'}
            </Text>
            <Text style={styles.introSubtitle}>
              Clients can request 60-minute appointments during your open slots.
            </Text>
          </View>
        </View>

        {/* ── Summary strip ──────────────────────────────────────────── */}
        {selectedDays.length > 0 && (
          <View style={styles.summaryStrip}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{selectedDays.length}</Text>
              <Text style={styles.summaryLabel}>
                {selectedDays.length === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalSessions}</Text>
              <Text style={styles.summaryLabel}>
                {totalSessions === 1 ? 'session' : 'sessions'} / week
              </Text>
            </View>
          </View>
        )}

        {/* ── Day selector ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working days</Text>
          <Text style={styles.sectionText}>
            Tap a day to add it to your schedule.
          </Text>
          <View style={styles.dayChipsRow}>
            {WEEKDAYS.map(day => (
              <DayChip
                key={day}
                day={day}
                selected={Boolean(schedule[day])}
                onPress={toggleDay}
              />
            ))}
          </View>
        </View>

        {/* ── Per-day schedule cards ──────────────────────────────────── */}
        {selectedDays.length === 0 ? (
          <View style={styles.emptyDays}>
            <View style={styles.emptyIcon}>
              <Feather
                name="calendar"
                size={22}
                color={BookingColors.textMuted}
              />
            </View>
            <Text style={styles.emptyTitle}>No days selected</Text>
            <Text style={styles.emptyText}>
              Select at least one day above to define your time blocks.
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time blocks per day</Text>
            <Text style={styles.sectionText}>
              Each block is split into 60-minute sessions clients can book.
            </Text>
            {selectedDays.map(day => (
              <DayCard
                key={day}
                day={day}
                blocks={schedule[day]}
                onAddBlock={addBlock}
                onRemoveBlock={removeBlock}
                onUpdateStart={updateBlockStart}
                onUpdateEnd={updateBlockEnd}
              />
            ))}
          </View>
        )}

        {/* ── Can print toggle (mobile only) ─────────────────────────── */}
        {mobile && (
          <View style={styles.printRow}>
            <View style={styles.printIcon}>
              <Feather name="printer" size={18} color={BookingColors.info} />
            </View>
            <View style={styles.printCopy}>
              <Text style={styles.printTitle}>Document printing</Text>
              <Text style={styles.printText}>
                I can print documents before an appointment.
              </Text>
            </View>
            <Switch
              ios_backgroundColor={BookingColors.border}
              onValueChange={setCanPrint}
              trackColor={{
                false: BookingColors.border,
                true: BookingColors.successSoft,
              }}
              thumbColor={
                canPrint ? BookingColors.success : BookingColors.textMuted
              }
              value={canPrint}
            />
          </View>
        )}
      </ScrollView>

      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={continueSetup}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Feather name="arrow-right" size={17} color={BookingColors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BookingColors.surface},
  content: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: BookingColors.background,
  },
  loadingState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {
    marginTop: 9,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
  },

  // ── Intro ──
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 12,
    backgroundColor: BookingColors.surface,
  },
  introIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: BookingColors.primarySoft,
  },
  introCopy: {flex: 1, marginLeft: 12},
  introTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  introSubtitle: {
    marginTop: 3,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },

  // ── Summary strip ──
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 12,
    backgroundColor: BookingColors.surface,
  },
  summaryItem: {alignItems: 'center', flex: 1},
  summaryValue: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 20,
  },
  summaryLabel: {
    marginTop: 2,
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },
  summaryDivider: {width: 1, height: 32, backgroundColor: BookingColors.border},

  // ── Section ──
  section: {marginTop: 24},
  sectionTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  sectionText: {
    marginTop: 3,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },

  // ── Day chips ──
  dayChipsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  dayChip: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BookingColors.border,
    borderRadius: 10,
    backgroundColor: BookingColors.surface,
  },
  dayChipActive: {
    borderColor: BookingColors.primary,
    backgroundColor: BookingColors.primarySoft,
  },
  dayChipText: {
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  dayChipTextActive: {
    color: BookingColors.primary,
  },

  // ── Empty state ──
  emptyDays: {
    alignItems: 'center',
    marginTop: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: BookingColors.surface,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: BookingColors.background,
  },
  emptyTitle: {
    marginTop: 14,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  emptyText: {
    marginTop: 6,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },

  // ── Day card ──
  dayCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 12,
    backgroundColor: BookingColors.surface,
    overflow: 'hidden',
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
    backgroundColor: BookingColors.background,
  },
  dayCardIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: BookingColors.primarySoft,
    marginRight: 10,
  },
  dayCardTitle: {
    flex: 1,
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
  dayCardCount: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },

  // ── Time block ──
  block: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: BookingColors.border,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  blockBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockBadgeText: {
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookingColors.errorSoft,
    borderRadius: 8,
    backgroundColor: BookingColors.errorSoft,
  },
  timersRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  arrowWrap: {
    width: 32,
    alignItems: 'center',
    paddingBottom: 14,
  },

  // ── Block validation error ──
  blockError: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: BookingColors.errorSoft,
    gap: 6,
  },
  blockErrorText: {
    flex: 1,
    color: BookingColors.error,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },

  // ── Session pills ──
  sessionsWrap: {marginTop: 10},
  sessionsLabel: {
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sessionPills: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: BookingColors.successSoft,
    borderWidth: 1,
    borderColor: BookingColors.success + '33',
    gap: 5,
  },
  sessionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BookingColors.success,
  },
  sessionPillText: {
    color: BookingColors.success,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 10,
  },

  // ── Add block button ──
  addBlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: BookingColors.primary + '55',
    borderStyle: 'dashed',
    borderRadius: 10,
    gap: 6,
  },
  addBlockText: {
    color: BookingColors.primary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },

  // ── Print row ──
  printRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 12,
    backgroundColor: BookingColors.surface,
  },
  printIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: BookingColors.infoSoft,
  },
  printCopy: {flex: 1, minWidth: 0, marginHorizontal: 12},
  printTitle: {
    color: BookingColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  printText: {
    marginTop: 2,
    color: BookingColors.textMuted,
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
  },

  // ── Action bar ──
  actionBar: {
    minHeight: 76,
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: BookingColors.border,
    backgroundColor: BookingColors.surface,
  },
  backButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: BookingColors.border,
    borderRadius: 10,
  },
  backButtonText: {
    color: BookingColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
  },
  primaryButton: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: BookingColors.primary,
    gap: 8,
  },
  primaryButtonText: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
  },
});
