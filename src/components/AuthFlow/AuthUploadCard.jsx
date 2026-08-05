import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ORANGE = '#FD6D1F';

export default function AuthUploadCard({
  title,
  description,
  icon = 'file-text',
  uploaded,
  onPress,
  onRemove,
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.card, uploaded && styles.uploadedCard]}>
      <View style={[styles.iconBox, uploaded && styles.uploadedIconBox]}>
        <Feather
          name={uploaded ? 'check' : icon}
          size={21}
          color={uploaded ? '#FFFFFF' : ORANGE}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {uploaded ? 'Uploaded successfully' : description}
        </Text>
      </View>
      {uploaded && onRemove ? (
        <TouchableOpacity
          accessibilityLabel={`Remove ${title}`}
          onPress={event => {
            event.stopPropagation();
            onRemove();
          }}
          style={styles.removeButton}>
          <Feather name="trash-2" size={18} color="#D92D20" />
        </TouchableOpacity>
      ) : (
        <Feather name="upload-cloud" size={20} color={ORANGE} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  uploadedCard: {
    borderColor: '#F4B38E',
    backgroundColor: '#FFF9F5',
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF0E7',
  },
  uploadedIconBox: {
    backgroundColor: ORANGE,
  },
  copy: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: '#121826',
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
  },
  description: {
    marginTop: 3,
    color: '#737A86',
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
