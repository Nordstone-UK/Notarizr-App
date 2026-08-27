import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import DraggableSignature from './DragabbleSignature';
import {useLiveblocks} from '../../store/liveblocks';

export default function SignatureContainer({onSignatureChange, locked = false}) {
  const objects = useLiveblocks(state => state.objects);
  const deleteObject = useLiveblocks(state => state.deleteObject);
  const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
  const currentPage = useLiveblocks(state => state.currentPage);
  const setSigningActivity = useLiveblocks(state => state.setSigningActivity);
  // console.log("pdflivepathfile", pdfFilePath)
  // console.log('Signatures:', signatures.length);
  const handleSignatureChange = signatureInfo => {
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

  // Remove the legacy placeholder that was persisted in existing Liveblocks
  // rooms by an earlier test build. Exclude it from rendering immediately so
  // users never see it while the shared storage update is being applied.
  const visibleObjects = Object.entries(objects).filter(([, object]) => {
    const isLegacyTestBadge =
      object.type === 'text' &&
      typeof object.text === 'string' &&
      object.text.trim().toLowerCase() === 'test';

    return !isLegacyTestBadge;
  });

  useEffect(() => {
    Object.entries(objects).forEach(([objectId, object]) => {
      if (
        object.type === 'text' &&
        typeof object.text === 'string' &&
        object.text.trim().toLowerCase() === 'test'
      ) {
        deleteObject(objectId);
      }
    });
  }, [deleteObject, objects]);

  return (
    <View style={styles.container}>
      {visibleObjects.map(([objectId, object]) => {
        return (
          <DraggableSignature
            id={objectId}
            key={objectId}
            object={object}
            selected={!locked && selectedObjectId === objectId}
            locked={locked}
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
});
