import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function HomeServiceCard({
  accentColor,
  backgroundColor,
  description,
  icon,
  image,
  onPress,
  tag,
  title,
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.container, {backgroundColor}]}>
      <View style={styles.copy}>
        <View style={[styles.tag, {backgroundColor: `${accentColor}16`}]}>
          <Feather name={icon} size={12} color={accentColor} />
          <Text style={[styles.tagText, {color: accentColor}]}>{tag}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {description}
        </Text>
        <View style={styles.actionRow}>
          <Text style={[styles.actionText, {color: accentColor}]}>
            Book now
          </Text>
          <Feather name="arrow-right" size={15} color={accentColor} />
        </View>
      </View>
      <View style={styles.imageShell}>
        <Image resizeMode="contain" source={image} style={styles.image} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 156,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    zIndex: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    marginLeft: 5,
    fontFamily: 'Manrope-Bold',
    fontSize: 9,
  },
  title: {
    marginTop: 11,
    color: '#171D29',
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  description: {
    maxWidth: 200,
    marginTop: 4,
    color: '#737B87',
    fontFamily: 'Manrope-Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },
  actionText: {
    marginRight: 6,
    fontFamily: 'Manrope-Bold',
    fontSize: 11,
  },
  imageShell: {
    width: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  image: {
    width: 112,
    height: 110,
  },
});
