import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NavigationHeader from '../../components/NavigationHeader/NavigationHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import { heightToDp } from '../../utils/Responsive';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import MultiLineTextInput from '../../components/MultiLineTextInput/MultiLineTextInput';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import Colors from '../../themes/Colors';
import { SelectList } from 'react-native-dropdown-select-list';
const isDarkMode = useColorScheme() === 'dark';
const faqSchema = Yup.object().shape({
  question: Yup.string()
    .required('Question is required')
    .matches(/\S/, 'Question cannot be empty or whitespace'),
  answer: Yup.string()
    .required('Answer is required')
    .matches(/\S/, 'Answer cannot be empty or whitespace'),
  priority: Yup.string().required('Priority is required'),
});

const Faqscreen = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const priorities = Array.from({ length: 25 }, (_, i) => ({
    key: String(i + 1),
    value: String(i + 1),
  }));

  const formik = useFormik({
    initialValues: { question: '', answer: '', priority: '' },
    validationSchema: faqSchema,
    onSubmit: async values => {
      setLoading(true);
      try {
        setMessage('FAQ created successfully');
      } catch (error) {
        setError(true);
        setMessage(error.message);
      } finally {
        setLoading(false);
        formik.resetForm();
      }
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="FAQ" />
      <BottomSheetStyle>
        <ScrollView style={{ marginTop: heightToDp(5), padding: 10 }}>
          <LabelTextInput
            placeholder="Question"
            Label={true}
            style={styles.input}
            LabelTextInput={'Question'}
            onChangeText={formik.handleChange('question')}
            value={formik.values.question}
          />
          {formik.touched.question && formik.errors.question && (
            <Text style={styles.errorText}>{formik.errors.question}</Text>
          )}

          <MultiLineTextInput
            Label={true}
            LabelTextInput={'Answer'}
            placeholder="Enter your answer"
            style={styles.input}
            onChangeText={formik.handleChange('answer')}
            value={formik.values.answer}
          />
          {formik.touched.answer && formik.errors.answer && (
            <Text style={styles.errorText}>{formik.errors.answer}</Text>
          )}

          <SelectList
            setSelected={value => formik.setFieldValue('priority', value)}
            data={priorities}
            placeholder="Select Priority"
            boxStyles={{
              backgroundColor: isDarkMode ? '#333' : '#fff',
              borderColor: isDarkMode ? '#888' : '#000',
            }}
            dropdownStyles={{
              backgroundColor: isDarkMode ? '#333' : '#fff',
            }}
            inputStyles={{
              color: isDarkMode ? '#fff' : '#000', // Ensures text is visible
            }}
            dropdownTextStyles={{
              color: isDarkMode ? '#fff' : '#000', // Ensures dropdown text is visible
            }}
            labelStyles={{
              color: isDarkMode ? '#fff' : '#000',
              fontSize: widthToDp(4),
            }}
          />

          {formik.touched.priority && formik.errors.priority && (
            <Text style={styles.errorText}>{formik.errors.priority}</Text>
          )}

          <GradientButton
            colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
            Title={isLoading ? 'Submitting...' : 'Submit'}
            onPress={formik.handleSubmit}
            disabled={isLoading}
          />

          {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
          {message && (
            <Text style={[styles.message, { color: error ? 'red' : 'green' }]}>
              {message}
            </Text>
          )}
        </ScrollView>
      </BottomSheetStyle>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 20,
    borderRadius: 5,
    color: Colors.Black
  },
  errorText: {
    color: 'red',
  },
  message: {
    marginTop: 10,
  },
});

export default Faqscreen;
