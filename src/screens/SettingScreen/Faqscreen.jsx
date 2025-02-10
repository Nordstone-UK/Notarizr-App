import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import useFetchFaq from '../../hooks/useFetchFaq';
import NavigationHeader from '../../components/Navigation Header/NavigationHeader';
import BottomSheetStyle from '../../components/BotttonSheetStyle/BottomSheetStyle';
import {heightToDp, widthToDp} from '../../utils/Responsive';
import LabelTextInput from '../../components/LabelTextInput/LabelTextInput';
import MultiLineTextInput from '../../components/MultiLineTextInput/MultiLineTextInput';
import GradientButton from '../../components/MainGradientButton/GradientButton';
import Colors from '../../themes/Colors';
import {SelectList} from 'react-native-dropdown-select-list';
import {
  CREATE_FAQ,
  DELETE_FAQ,
  UPDATE_FAQ,
} from '../../../request/queries/faq.query';
import {useMutation} from '@apollo/client';

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
  const {faq, refetchFaq, loading} = useFetchFaq();
  const [createFaqR] = useMutation(CREATE_FAQ);
  const [updateFaqR] = useMutation(UPDATE_FAQ);
  const [deleteFaqR] = useMutation(DELETE_FAQ);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [allFaqs, setAllFaqs] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  console.log('eisdfd', isEditing);

  useEffect(() => {
    if (faq) {
      setAllFaqs(faq);
    }
  }, [faq]);
  const handlePriorityCheck = value => {
    setSelectedPriority(value);
    console.log('Selected Priority:', value);
  };
  const priorities = Array.from({length: 25}, (_, i) => ({
    key: String(i + 1),
    value: String(i + 1),
  }));

  const formik = useFormik({
    initialValues: {question: '', answer: '', priority: ''},
    validationSchema: faqSchema,
    onSubmit: async values => {
      setLoading(true);
      if (!isEditing) {
        const {question, answer, priority} = values;
        const request = {
          variables: {
            question,
            answer,
            priority: parseInt(priority),
          },
        };
        try {
          const response = await createFaqR(request);
          setMessage('FAQ created successfully');
          setAllFaqs(pv => {
            return [...pv, response.data.createFaqR.data];
          });
          formik.resetForm();
          setSelectedPriority('');
          setSelectedFaq(null);
          setShowModal(false);
        } catch (error) {
          setError(true);
          setMessage(error.message);
        }
      } else {
        try {
          const {answer, id, priority, question} = values;

          const request = {
            variables: {
              answer,
              id,
              priority: parseInt(priority),
              question,
            },
          };

          console.log('reaiesl', request);
          const response = await updateFaqR(request);

          setMessage('FAQ updated successfully');
          setAllFaqs(pv => {
            const faqs = pv.map(item => {
              if (item._id === id) {
                return response.data.updateFaqR.data;
              }
              return item;
            });
            return faqs;
          });
          formik.resetForm();
          setSelectedPriority('');
          setSelectedFaq(null);
          setShowModal(false);
        } catch (error) {
          setError(true);
          setMessage(error.message);
        } finally {
          setLoading(false);
        }
      }
    },
  });
  const handleEdit = async faq => {
    setShowModal(true);
    setSelectedFaq(faq);
    setIsEditing(true);
    formik.setValues({
      question: faq.question,
      answer: faq.answer,
      priority: faq.priority,
      id: faq._id,
    });
  };
  const handleDelete = id => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
        },
        {
          text: 'Delete',
          onPress: async () => {
            const request = {
              variables: {
                id: id,
              },
            };
            const response = await deleteFaqR(request);

            setAllFaqs(pv => {
              return pv.filter(item => item._id !== id);
            });
          },
        },
      ],
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader Title="FAQ" />
      <BottomSheetStyle>
        {/* <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowModal(true)}>
          <Text style={styles.createButtonText}>Create FAQ</Text>
        </TouchableOpacity> */}
        <GradientButton
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          Title="Create FAQ"
          style={styles.createButton}
          onPress={() => {
            setShowModal(true);
            setIsEditing(false);
          }}
        />
        <FlatList
          data={allFaqs}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <View style={styles.faqItem}>
              <View>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
                <Text style={styles.faqPriority}>
                  Priority: {item.priority}
                </Text>
              </View>
              {/* <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity> */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleEdit(item)}>
                  <Image
                    source={require('../../../assets/editIcon.png')}
                    style={[styles.icon, {tintColor: Colors.Orange}]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleDelete(item._id)}>
                  <Image
                    source={require('../../../assets/deleteIcon.png')}
                    style={[styles.icon, {tintColor: Colors.Orange}]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </BottomSheetStyle>

      {/* Modal for the FAQ Form */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {
          setShowModal(false);
          setIsEditing(false);
        }}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Update FAQ' : 'Create FAQ'}
              </Text>

              <LabelTextInput
                placeholder="Question"
                Label={true}
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
                onChangeText={formik.handleChange('answer')}
                value={formik.values.answer}
              />
              {formik.touched.answer && formik.errors.answer && (
                <Text style={styles.errorText}>{formik.errors.answer}</Text>
              )}

              <View style={styles.selectionContainer}>
                <SelectList
                  setSelected={value => formik.setFieldValue('priority', value)}
                  data={priorities}
                  placeholder="Select Priority"
                  boxStyles={styles.picker}
                  value={formik.values.priority}
                  defaultOption={priorities.find(
                    item => item.value === formik.values.priority,
                  )}
                />
              </View>
              {formik.touched.priority && formik.errors.priority && (
                <Text style={styles.errorText}>{formik.errors.priority}</Text>
              )}

              <GradientButton
                colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
                Title={
                  isLoading
                    ? isEditing
                      ? 'Updating...'
                      : 'Submitting...'
                    : isEditing
                    ? 'Update'
                    : 'Submit'
                }
                onPress={formik.handleSubmit}
                disabled={isLoading}
              />
              {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
  },
  message: {
    marginTop: 10,
  },
  selectionContainer: {
    margin: 10,
  },
  picker: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownText: {
    color: '#000',
  },

  faqItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#555',
  },
  faqPriority: {
    fontSize: 12,
    color: '#777',
  },
  editButton: {
    backgroundColor: Colors.OrangeGradientEnd,
    padding: 8,
    borderRadius: 5,
  },
  editButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  icon: {
    marginHorizontal: widthToDp(2),
    width: widthToDp(5),
    height: heightToDp(5),
  },
  buttonContainer: {
    position: 'absolute',
    top: 7,
    right: 5,
    flexDirection: 'row',
    // padding:20,
  },
  button: {
    marginLeft: 5,
  },
});

export default Faqscreen;
