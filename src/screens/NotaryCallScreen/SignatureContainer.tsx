import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addSignature, deleteSignature } from '../../features/signatures/signatureSlice';
import DraggableSignature from './DragabbleSignature';
import { useLiveblocks } from '../../store/liveblocks';


type SignatureContainerProps = {
  onSignatureChange?: (signatureInfo: any) => void;
};

export default function SignatureContainer({ onSignatureChange }: SignatureContainerProps) {
  const objects = useLiveblocks(state => state.objects);
  const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
  const currentPage = useLiveblocks(state => state.currentPage);
  const dispatch = useDispatch();
  const signatures = useSelector(state => state.signature.signatures);
  const pdfFilePath = useLiveblocks(state => state.pdfFilePath);
  // console.log("pdflivepathfile", pdfFilePath)
  // console.log('Signatures:', signatures.length);
  const handleSignatureChange = (signatureInfo) => {
    onSignatureChange(signatureInfo);
  };
  // Only render signatures for the current page
  const filteredSignatures = Object.entries(objects).filter(([, obj]) => (obj.type === 'signature') && obj.page === currentPage);
  return (
    <View style={styles.container}>
      {filteredSignatures.map(([objectId, object]) => (
        <DraggableSignature
          id={objectId}
          key={objectId}
          object={object}
          selected={selectedObjectId === objectId}
          onSignatureChange={handleSignatureChange}
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
