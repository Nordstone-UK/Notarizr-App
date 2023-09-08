import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import CompanyHeader from '../../components/CompanyHeader/CompanyHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp} from '../../utils/Responsive';
import MainButton from '../../components/MainGradientButton/MainButton';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <CompanyHeader
        Header="Welcome Back to Notarizr"
        subHeading="Hello there, sign in to continue!"
        HeaderStyle={{alignSelf: 'center'}}
        subHeadingStyle={{
          alignSelf: 'center',
          fontSize: 17,
          marginVertical: heightToDp(1.5),
          color: '#121826',
        }}
      />
      <BottomSheetStyle>
        <MainButton colors={['#D3D5DA', '#D3D5DA']} Title="Login" />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: heightToDp(70),
          }}>
          <Text>Don’t have an account? </Text>
          <TouchableOpacity>
            <Text style={{color: '#FF7A28'}}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetStyle>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#FFF2DC',
  },
});
