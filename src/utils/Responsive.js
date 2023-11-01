import {Dimensions, PixelRatio} from 'react-native';
import React from 'react';
import moment from 'moment';
export const {width, height} = Dimensions.get('window');

export const widthToDp = number => {
  const actualWidth = typeof number === 'number' ? number : parseFloat(number);
  return PixelRatio.roundToNearestPixel((width * actualWidth) / 100);
};

export const heightToDp = number => {
  const actualHeight = typeof number === 'number' ? number : parseFloat(number);
  return PixelRatio.roundToNearestPixel((width * actualHeight) / 100);
};

export const capitalizeFirstLetter = str => {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
};
export function formatDateTime(dateTimeString) {
  const formattedDateTime = moment(dateTimeString).format(
    'MM/DD/YYYY, hh:mm A',
  );
  return formattedDateTime;
}
export const ITEM_WIDTH = width * 0.71;
export const ITEM_HEIGHT = height * 0.2;
export const SPACING = 16;
export const ICON_SIZE = 65;
export const FULL_SIZE = width + SPACING * 0.1;

export const BANNER_H = heightToDp('90%');
export const TOPNAVI_H = heightToDp(20);
