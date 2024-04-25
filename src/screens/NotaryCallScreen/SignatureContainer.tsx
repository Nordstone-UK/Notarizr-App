import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addSignature } from '../../features/signatures/signatureSlice';
import DraggableSignature from './DragabbleSignature';

export default function SignatureContainer({ signatureData }) {
  const dispatch = useDispatch();
  const signatures = useSelector(state => state.signature.signatures);

  useEffect(() => {
    if (signatureData !== null) {
      dispatch(addSignature(signatureData));
    }
  }, [dispatch, signatureData]);

  console.log('Signatures:', signatures);

  return (
    <View style={styles.container}>
      {signatures.map((signature, index) => (
        <DraggableSignature
          key={index}
          signatureData={signature.data}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'black',
    zIndex: 999,
    backgroundColor: '#fff',
  },
})