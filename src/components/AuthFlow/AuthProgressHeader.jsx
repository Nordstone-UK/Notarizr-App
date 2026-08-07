import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

const ORANGE = AppColors.primary;

export default function AuthProgressHeader({
  title = 'Create account',
  progress,
  onBack,
}) {
  const hasProgress = typeof progress === 'number';
  const normalizedProgress = hasProgress
    ? Math.max(0, Math.min(1, progress))
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        {hasProgress && (
          <Text style={styles.percentage}>
            {Math.round(normalizedProgress * 100)}%
          </Text>
        )}
      </View>
      {hasProgress && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {width: `${normalizedProgress * 100}%`},
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: AppColors.white,
  },
  headerRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.white,
  },
  title: {
    flex: 1,
    marginLeft: 12,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  percentage: {
    color: ORANGE,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  progressTrack: {
    height: 5,
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: AppColors.backgroundSubtle,
  },
  progressFill: {
    height: '100%',
    minWidth: 5,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },
});
