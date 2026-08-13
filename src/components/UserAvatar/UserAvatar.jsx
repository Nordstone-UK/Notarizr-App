import React, {useEffect, useMemo, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

const getImageSource = source => {
  if (!source) {
    return null;
  }
  return typeof source === 'string' ? {uri: source} : source;
};

export default function UserAvatar({name = '', source, size = 44, online}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = getImageSource(source);
  const imageIdentity = imageSource?.uri || imageSource;
  const initials = useMemo(
    () =>
      name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'N',
    [name],
  );

  useEffect(() => setImageFailed(false), [imageIdentity]);

  return (
    <View style={{width: size, height: size}}>
      <View
        style={[
          styles.avatar,
          {width: size, height: size, borderRadius: size / 2},
        ]}>
        <Text style={[styles.initials, {fontSize: Math.max(12, size * 0.28)}]}>
          {initials}
        </Text>
        {imageSource && !imageFailed ? (
          <Image
            onError={() => setImageFailed(true)}
            source={imageSource}
            style={{width: size, height: size, borderRadius: size / 2}}
          />
        ) : null}
      </View>
      {online ? <View style={styles.onlineDot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#EEF0F3',
  },
  initials: {
    position: 'absolute',
    color: '#D65322',
    fontFamily: 'Manrope-Bold',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 6,
    backgroundColor: '#23A566',
  },
});
