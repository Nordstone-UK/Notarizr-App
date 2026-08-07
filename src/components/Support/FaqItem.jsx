import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

export default function FaqItem({item, index}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.container, open && styles.containerOpen]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{expanded: open}}
        activeOpacity={0.76}
        onPress={() => setOpen(current => !current)}
        style={styles.questionRow}>
        <View style={[styles.number, open && styles.numberOpen]}>
          <Text style={[styles.numberText, open && styles.numberTextOpen]}>
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <Text style={styles.question}>{item.question}</Text>
        <View style={[styles.toggle, open && styles.toggleOpen]}>
          <Feather
            name={open ? 'minus' : 'plus'}
            size={16}
            color={open ? AppColors.white : AppColors.textSecondary}
          />
        </View>
      </TouchableOpacity>
      {open && (
        <View style={styles.answerWrap}>
          <View style={styles.answerLine} />
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  answer: {
    color: AppColors.textSecondary,
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 19,
  },
  answerLine: {
    backgroundColor: AppColors.primary,
    borderRadius: 2,
    marginRight: 13,
    width: 2,
  },
  answerWrap: {
    flexDirection: 'row',
    paddingBottom: 17,
    paddingLeft: 17,
    paddingRight: 18,
  },
  container: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  containerOpen: {borderColor: AppColors.primary},
  number: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  numberOpen: {backgroundColor: AppColors.primarySoft},
  numberText: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Bold',
    fontSize: 10,
  },
  numberTextOpen: {color: AppColors.primary},
  question: {
    color: AppColors.textPrimary,
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 13,
    lineHeight: 19,
    marginHorizontal: 12,
  },
  questionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 68,
    padding: 12,
  },
  toggle: {
    alignItems: 'center',
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  toggleOpen: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
});
