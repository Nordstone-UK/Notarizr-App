import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import AppColors from '../../themes/AppColors';

export default function ProfileDateField({label, value, editable, onChange}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={editable ? 0.72 : 1}
        onPress={() => editable && setOpen(true)}
        style={styles.field}>
        <Feather name="calendar" size={19} color={AppColors.textSecondary} />
        <Text style={styles.value}>{moment(value).format('MMMM D, YYYY')}</Text>
      </TouchableOpacity>
      <DatePicker
        date={value}
        maximumDate={new Date()}
        modal
        mode="date"
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={date => {
          onChange(date);
          setOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  field: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.backgroundSubtle,
  },
  value: {
    marginLeft: 12,
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
  },
});
