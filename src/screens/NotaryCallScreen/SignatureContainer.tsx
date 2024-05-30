import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addSignature, deleteSignature } from '../../features/signatures/signatureSlice';
import DraggableSignature from './DragabbleSignature';
import { useLiveblocks } from '../../store/liveblocks';
import PdfObject from '../../components/LiveBlocksComponents/pdf-object';


export default function SignatureContainer({ onSignatureChange }) {
  const objects = useLiveblocks(state => state.objects);
  const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
  const dispatch = useDispatch();
  const signatures = useSelector(state => state.signature.signatures);
  const pdfFilePath = useLiveblocks(state => state.pdfFilePath);
  // console.log("pdflivepathfile", pdfFilePath)
  // console.log('Signatures:', signatures.length);
  const handleSignatureChange = (signatureInfo) => {
    onSignatureChange(signatureInfo);
  };
  return (

    <View style={styles.container}>
      {Object.entries(objects).map(([objectId, object]) => {

        return (

          <DraggableSignature
            id={objectId}
            key={objectId}
            object={object}
            selected={selectedObjectId === objectId}
            onSignatureChange={handleSignatureChange}

          // onDelete={handleDeleteSignature}
          />
        );
      })}
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
