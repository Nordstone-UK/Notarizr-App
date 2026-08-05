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

export default function GradientButton({fontSize = 13, ...props}) {
  const requestedSize = Number(props.buttonFontSize || fontSize || 13);
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      disabled={props.isDisabled}
      onPress={props.onPress}
      style={[styles.touchable, props.viewStyle]}>
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
  touchable: {alignSelf: 'stretch'},
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#FD6D1F',
  },
  disabled: {opacity: 0.65},
  text: {
    color: '#FFFFFF',
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    textAlign: 'center',
  },
});
