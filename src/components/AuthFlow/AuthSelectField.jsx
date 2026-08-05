import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';

export default function AuthSelectField({
  label,
  placeholder,
  data,
  value,
  onSelect,
  error,
}) {
  const options = useMemo(
    () => data.map(item => ({key: item.value, value: item.label})),
    [data],
  );
  const selectedOption = useMemo(
    () => options.find(option => option.key === value),
    [options, value],
  );

  const handleSelect = key => {
    const selectedItem = data.find(item => item.value === key);
    if (selectedItem) {
      onSelect(selectedItem);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <SelectList
        data={options}
        setSelected={handleSelect}
        save="key"
        placeholder={placeholder}
        defaultOption={selectedOption}
        searchPlaceholder="Search states"
        boxStyles={[styles.box, error && styles.errorBox]}
        inputStyles={styles.input}
        dropdownStyles={styles.dropdown}
        dropdownTextStyles={styles.dropdownText}
        searchInputStyles={styles.searchInput}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#252B36',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  box: {
    minHeight: 56,
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
  },
  errorBox: {
    borderColor: '#E5484D',
  },
  input: {
    color: '#121826',
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
  },
  dropdown: {
    maxHeight: 240,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    color: '#252B36',
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
  },
  searchInput: {
    color: '#121826',
    fontFamily: 'Manrope-Regular',
  },
  errorText: {
    marginTop: 6,
    color: '#D92D20',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
});
