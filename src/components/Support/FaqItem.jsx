import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function FaqItem({item, last}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.container, last && styles.last]}>
      <TouchableOpacity
        activeOpacity={0.72}
        onPress={() => setOpen(current => !current)}
        style={styles.questionRow}>
        <Text style={styles.question}>{item.question}</Text>
        <Feather
          name={open ? 'minus' : 'plus'}
          size={19}
          color={open ? '#FD6D1F' : '#79818D'}
        />
      </TouchableOpacity>
      {open && <Text style={styles.answer}>{item.answer}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  answer: {
    color: '#69717E',
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 17,
    paddingRight: 28,
  },
  container: {
    borderBottomColor: '#E9EBEF',
    borderBottomWidth: 1,
    marginHorizontal: 20,
  },
  last: {
    borderBottomWidth: 0,
  },
  question: {
    color: '#202632',
    flex: 1,
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    lineHeight: 20,
    marginRight: 16,
  },
  questionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 67,
    paddingVertical: 15,
  },
});
