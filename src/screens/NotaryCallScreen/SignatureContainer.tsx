import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import DraggableSignature from './DragabbleSignature';
import { useLiveblocks } from '../../store/liveblocks';


export default function SignatureContainer({ onSignatureChange }) {
  const objects = useLiveblocks(state => state.objects);
  const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
  const currentPage = useLiveblocks(state => state.currentPage);
  const setSigningActivity = useLiveblocks(state => state.setSigningActivity);
  // console.log("pdflivepathfile", pdfFilePath)
  // console.log('Signatures:', signatures.length);
  const handleSignatureChange = (signatureInfo) => {
    onSignatureChange(signatureInfo);
  };

  useEffect(() => {
    if (Object.keys(objects).length === 0) {
      setSigningActivity({
        status: 'idle',
        label: '',
        page: currentPage,
      });
    }
  }, [currentPage, objects, setSigningActivity]);
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
