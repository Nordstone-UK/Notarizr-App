import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SelectList} from 'react-native-dropdown-select-list';
import {widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

export default function SingleSelectDropDown(props) {
  return (
    <View>
      <SelectList
        setSelected={props?.setSelected}
        data={props?.data}
        save={props?.save}
        label={props?.label}
        placeholder={props?.placeholder}
        boxStyles={{
          borderColor: Colors.Orange,
          borderWidth: 2,
          borderRadius: widthToDp(5),
        }}
        dropdownStyles={{
          borderColor: Colors.Orange,
          borderWidth: 2,
          borderRadius: widthToDp(5),
          maxHeight: widthToDp(75),
        }}
        inputStyles={{color: Colors.TextColor}}
        badgeStyles={{backgroundColor: Colors.Orange}}
        dropdownTextStyles={{color: Colors.TextColor}}
        checkBoxStyles={{tintColor: Colors.TextColor}}
        labelStyles={{color: Colors.TextColor, fontSize: widthToDp(4)}}
        badgeTextStyles={{
          fontSize: widthToDp(3.2),
          color: Colors.white,
          fontFamily: 'Manrope-SemiBold',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
