import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

export default function NavigationHeader(props) {
  const navigation = useNavigation();
  const goBack = () => {
    if (props.reset) {
      navigation.dispatch(
        CommonActions.navigate('HomeScreen', {screen: 'AllBookingScreen'}),
      );
      return;
    }
    props.payment ? navigation.navigate('HomeScreen') : navigation.goBack();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          activeOpacity={0.7}
          onPress={goBack}
          style={styles.iconButton}>
          <Feather name="arrow-left" size={21} color="#171D29" />
        </TouchableOpacity>
        {props.ProfilePic ? (
          <TouchableOpacity activeOpacity={0.7} onPress={props.profileImgPress}>
            <Image source={props.ProfilePic} style={styles.profilePic} />
          </TouchableOpacity>
        ) : null}
        <Text numberOfLines={1} style={styles.title}>
          {props.Title}
        </Text>
        <View style={styles.actions}>
          {props.midImg ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={props.midImgPress}
              style={styles.iconButton}>
              <Image source={props.midImg} style={styles.actionIcon} />
            </TouchableOpacity>
          ) : null}
          {props.lastImg ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={props.lastImgPress}
              style={styles.iconButton}>
              <Image source={props.lastImg} style={styles.actionIcon} />
            </TouchableOpacity>
          ) : null}
          {!props.midImg && !props.lastImg ? (
            <View style={styles.iconButton} />
          ) : null}
        </View>
      </View>
      {props.isVisible ? (
        <View style={styles.searchShell}>
          <Feather name="search" size={17} color="#7D8490" />
          <TextInput
            onChangeText={props.onChangeText}
            placeholder="Search"
            placeholderTextColor="#A0A5AE"
            style={styles.searchInput}
            value={props.searchQuery}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
  },
  container: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePic: {
    width: 38,
    height: 38,
    marginLeft: 4,
    borderRadius: 19,
    backgroundColor: '#EEF0F3',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
  },
  actions: {flexDirection: 'row', alignItems: 'center'},
  actionIcon: {width: 20, height: 20, resizeMode: 'contain'},
  searchShell: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    paddingVertical: 0,
    color: '#303642',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
  },
});
