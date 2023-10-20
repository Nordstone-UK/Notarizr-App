import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import SearchableDropdown from 'react-native-searchable-dropdown';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

const DocumentDropdown = props => {
  const documentData = [
    {
      name: 'Affidavit',
    },
    {
      name: 'Last Will and Testament',
    },
    {
      name: 'Power of Attorney',
    },
    {
      name: 'Sworn Statements',
    },
    {
      name: 'Court Documents',
    },
  ];

  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <SearchableDropdown
      onTextChange={text => console.log(text)}
      onItemSelect={item => setSelectedItem(item)}
      containerStyle={{padding: widthToDp(1), width: widthToDp(90)}}
      itemStyle={{
        padding: widthToDp(3),
        marginVertical: widthToDp(0.5),
        borderColor: Colors.Orange,
        borderWidth: 1,
        borderRadius: 5,
      }}
      itemTextStyle={{color: '#222'}}
      itemsContainerStyle={{
        maxHeight: heightToDp(40),
        marginTop: heightToDp(2),
      }}
      items={documentData}
      resetValue={false}
      underlineColorAndroid="transparent"
      textInputProps={{
        placeholder: props?.placeholder,
        underlineColorAndroid: 'transparent',
        style: {
          padding: widthToDp(4),
          borderWidth: 2,
          borderColor: Colors.Orange,
          borderRadius: 10,
        },
        onTextChange: text => alert(text),
      }}
      listProps={{
        nestedScrollEnabled: true,
      }}
    />
  );
};

export default DocumentDropdown;
