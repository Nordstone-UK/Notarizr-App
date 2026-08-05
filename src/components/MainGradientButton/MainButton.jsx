import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const getBackground = colors =>
  colors?.[0] && colors[0] === colors?.[1] ? colors[0] : '#FD6D1F';

export default function MainButton(props) {
  const requestedSize = Number(props.styles?.fontSize || 12);
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      disabled={props.isDisabled}
      onPress={props.onPress}
      style={props.viewStyle}>
      <View
        style={[
          styles.button,
          {backgroundColor: getBackground(props.colors)},
          props.GradiStyles,
          props.isDisabled && styles.disabled,
        ]}>
        {props.loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text
            numberOfLines={2}
            style={[
              styles.text,
              props.styles,
              {fontSize: Math.min(requestedSize, 14)},
            ]}>
            {props.Title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabled: {opacity: 0.65},
  text: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    textAlign: 'center',
  },
});
