import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {SelectList} from 'react-native-dropdown-select-list';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';
import {Text} from 'react-native';
import {color} from '@rneui/base';

export default function SingleSelectDropDown(props) {
  const [isFocused, setIsFocused] = useState(false);
  // console.log('propsdfd', props.data);
  const handleSetSelected = selectedValue => {
    const selectedItem = props.data.find(item => item.value === selectedValue);

    if (selectedItem) {
      // Log the label of the selected item

      // Call the setSelected function passed via props with the label
      props.setSelected(selectedItem.label);
    }
    setIsFocused(false);
  };
  return (
    <View style={styles.container}>
      {/* {label && <Text style={styles.label}>{label}</Text>} */}
      <SelectList
        // onFocus={handleFocus}
        // onBlur={handleBlur}
        setSelected={handleSetSelected}
        data={props.data.map(state => ({
          key: state.value, // Set 'key' as the 'value' for each state
          value: state.label, // Display the 'label' in the dropdown
        }))}
        placeholder={props.placeholder}
        boxStyles={[styles.box, isFocused && styles.boxFocused]}
        dropdownStyles={styles.dropdown}
        inputStyles={styles.input}
        badgeStyles={styles.badge}
        dropdownTextStyles={styles.dropdownText}
        labelStyles={styles.label}
        badgeTextStyles={styles.badgeText}
        dropdownShown={isFocused}
        onSelect={() => setIsFocused(false)}
        // onFocus={() => setIsFocused(true)}
        // onBlur={() => setIsFocused(false)}
      />
      {(isFocused && props.LabelTextInput) || props.Label || false ? (
        <Text
          style={[
            (isFocused && styles.labelFocused) ||
              (props.Label && styles.labelUnFocused) ||
              false,
            props.labelStyle,
          ]}>
          {props.LabelTextInput}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%', // Set width to 90%
    alignSelf: 'center', // Center the component
    marginBottom: widthToDp(2), // Bottom margin
    marginTop: widthToDp(3), // Top margin
  },
  box: {
    borderColor: '#D3D5DA',
    borderWidth: 2,
    borderRadius: widthToDp(2),
  },
  boxFocused: {
    borderWidth: 2,
    borderColor: Colors.Orange,
    borderRadius: widthToDp(2),
  },
  dropdown: {
    borderColor: Colors.Orange,
    borderWidth: 2,
    borderRadius: widthToDp(5),
    maxHeight: widthToDp(75),
  },
  input: {
    color: Colors.TextColor,
  },
  badge: {
    backgroundColor: Colors.Orange,
  },
  dropdownText: {
    color: Colors.TextColor,
  },
  label: {
    color: Colors.TextColor,
    fontSize: widthToDp(4),
  },
  badgeText: {
    fontSize: widthToDp(3.2),
    color: Colors.white,
    fontFamily: 'Manrope-SemiBold',
  },
  labelFocused: {
    position: 'absolute',
    left: widthToDp(10),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: '#FF7A28',
    zIndex: 3,
    backgroundColor: '#fff',
  },
  labelUnFocused: {
    position: 'absolute',
    left: widthToDp(10),
    top: widthToDp(-3),
    padding: 2,
    fontSize: 15,
    color: Colors.InputTextColor,
    zIndex: 3,
    backgroundColor: '#fff',
  },
});
