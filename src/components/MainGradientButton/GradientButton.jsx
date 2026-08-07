import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BookingColors from '../../themes/BookingColors';

const getBackground = colors =>
  colors?.[0] && colors[0] === colors?.[1] ? colors[0] : BookingColors.primary;

export default function GradientButton({fontSize = 13, ...props}) {
  const requestedSize = Number(props.buttonFontSize || fontSize || 13);
  return (
    <Pressable
      disabled={props.isDisabled}
      onPress={props.onPress}
      style={[styles.touchable, props.viewStyle]}>
      {({pressed}) => (
        <View
          style={[
            styles.button,
            {
              backgroundColor: pressed
                ? BookingColors.primaryPressed
                : getBackground(props.colors),
            },
            props.GradiStyles,
            props.isDisabled && styles.disabled,
          ]}>
          {props.loading ? (
            <ActivityIndicator color={BookingColors.white} size="small" />
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
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: BookingColors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    margin: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  disabled: {opacity: 0.65},
  text: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    textAlign: 'center',
  },
  touchable: {alignSelf: 'stretch'},
});
