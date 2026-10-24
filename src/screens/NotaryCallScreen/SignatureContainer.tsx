import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import DraggableSignature from './DragabbleSignature';
import {useLiveblocks} from '../../store/liveblocks';

type SignatureContainerProps = {
  onSignatureChange: (signatureInfo: any) => void;
  locked?: boolean;
  page?: number;
  signatureData?: any;
};

export default function SignatureContainer({
  onSignatureChange,
  locked = false,
  page = 1,
}: SignatureContainerProps) {
  const objects = useLiveblocks(state => state.objects);
  const deleteObject = useLiveblocks(state => state.deleteObject);
  const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
  const handleSignatureChange = (signatureInfo: any) => {
    onSignatureChange(signatureInfo);
  };

  // Remove the legacy placeholder that was persisted in existing Liveblocks
  // rooms by an earlier test build. Exclude it from rendering immediately so
  // users never see it while the shared storage update is being applied.
  const visibleObjects = Object.entries(objects).filter(([, object]) => {
    const isLegacyTestBadge =
      object.type === 'text' &&
      typeof object.text === 'string' &&
      object.text.trim().toLowerCase() === 'test';

    return !isLegacyTestBadge && (object.page || 1) === page;
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
