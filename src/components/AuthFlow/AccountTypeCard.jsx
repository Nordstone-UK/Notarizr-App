import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ORANGE = '#FD6D1F';

export default function AccountTypeCard({
  title,
  description,
  icon,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{selected}}
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard]}>
      <View style={[styles.iconBox, selected && styles.selectedIconBox]}>
        <Feather
          name={icon}
          size={22}
          color={selected ? '#FFFFFF' : '#596170'}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={[styles.selector, selected && styles.selectedSelector]}>
        {selected && <Feather name="check" size={15} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E7E9ED',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  selectedCard: {
    borderColor: ORANGE,
    backgroundColor: '#FFF8F4',
  },
  iconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F2F3F5',
  },
  selectedIconBox: {
    backgroundColor: ORANGE,
  },
  copy: {
    flex: 1,
    marginHorizontal: 14,
  },
  title: {
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
  },
  description: {
    marginTop: 4,
    color: '#6C727F',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  selector: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C9CDD4',
    borderRadius: 12,
  },
  selectedSelector: {
    borderColor: ORANGE,
    backgroundColor: ORANGE,
  },
});
