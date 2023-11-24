import React, {useState} from 'react';
import {View, ActivityIndicator, Alert, ScrollView} from 'react-native';
import SearchableDropdown from 'react-native-searchable-dropdown';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import Colors from '../../themes/Colors';

const DocumentDropdown = ({
  setSelectedItem,
  selectedItem,
  multiple,
  placeholder,
  onItemSelect,
  onRemoveItem,
  documentData,
  SearchUser,
}) => {
  // const documentData = [
  //   {
  //     name: 'Affidavit',
  //   },
  //   {
  //     name: 'Last Will and Testament',
  //   },
  //   {
  //     name: 'Power of Attorney',
  //   },
  //   {
  //     name: 'Sworn Statements',
  //   },
  //   {
  //     name: 'Court Documents',
  //   },
  // ];
  return (
    <>
      <ScrollView
        contentContainerStyle={{marginVertical: widthToDp(2)}}
        horizontal={true}>
        <SearchableDropdown
          multi={multiple}
          onTextChange={text => SearchUser(text)}
          onItemSelect={onItemSelect}
          containerStyle={{
            width: widthToDp(94),
          }}
          itemStyle={{
            padding: widthToDp(2),
            paddingHorizontal: widthToDp(4),
            marginVertical: widthToDp(1),
            borderColor: Colors.Orange,
            borderWidth: 1,
            borderRadius: widthToDp(7),
          }}
          placeholderTextColor={{color: Colors.TextColor}}
          itemTextStyle={{color: Colors.TextColor}}
          itemsContainerStyle={{
            maxHeight: heightToDp(40),
            marginTop: heightToDp(2),
          }}
          items={documentData}
          resetValue={false}
          setSort={false}
          underlineColorAndroid="transparent"
          textInputProps={{
            placeholder: placeholder,
            underlineColorAndroid: 'transparent',
            style: {
              paddingHorizontal: widthToDp(4),
              borderWidth: 2,
              borderColor: Colors.Orange,
              color: Colors.TextColor,
              borderRadius: widthToDp(5),
            },
            // onTextChange: text => SearchUser(text),
          }}
          listProps={{
            nestedScrollEnabled: true,
          }}
        />
      </ScrollView>
      {/* ) : (
        <View>
          <ActivityIndicator
            style={{
              padding: '5%',
              color: '#fff',
              fontSize: widthToDp(6),
              textAlign: 'center',
              fontFamily: 'Manrope-Bold',
            }}
            size="large"
            color="#ffff"
          />
        </View>
      )} */}
    </>
  );
};

export default DocumentDropdown;
