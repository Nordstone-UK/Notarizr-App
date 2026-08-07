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

export default function MainButton(props) {
  const requestedSize = Number(props.styles?.fontSize || 12);
  return (
    <Pressable
      disabled={props.isDisabled}
      onPress={props.onPress}
      style={props.viewStyle}>
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
    alignSelf: 'center',
    backgroundColor: BookingColors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disabled: {opacity: 0.65},
  text: {
    color: BookingColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    textAlign: 'center',
  },
});
