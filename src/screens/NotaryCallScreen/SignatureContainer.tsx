import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addSignature, deleteSignature } from '../../features/signatures/signatureSlice';
import DraggableSignature from './DragabbleSignature';
import { useLiveblocks } from '../../store/liveblocks';
import PdfObject from '../../components/LiveBlocksComponents/pdf-object';


export default function SignatureContainer({ signatureData, onSignatureChange }) {
  const objects = useLiveblocks(state => state.objects);
  const selectedObjectId = useLiveblocks(state => state.selectedObjectId);
  const dispatch = useDispatch();
  const signatures = useSelector(state => state.signature.signatures);

  useEffect(() => {
    if (signatureData !== null) {
      dispatch(addSignature(signatureData));
    }
  }, [signatureData]);

  console.log('Signatures:', signatures.length);
  const handleSignatureChange = (signatureInfo) => {
    onSignatureChange(signatureInfo);
  };
  return (
    <View style={styles.container}>
      {Object.entries(objects).map(([objectId, object]) => {
        // console.log("objerectddddddddddddd", object)
        // if (object.page !== currentPage) {
        // return null;
        // }
        // console.log("ddddddddddddddddddddddddddddddddd", object)
        return (
          // <></>
          // <View style={styles.objectsWrapper}>
          //   {Object.entries(objects).map(([objectId, object]) => {
          //     // console.log("objerect", object)
          //     // if (object.page !== currentPage) {
          //     //   return null;
          //     // }

          //     return (
          //       <PdfObject
          //         id={objectId}
          //         key={objectId}
          //         object={object}
          //         selected={selectedObjectId === objectId}
          //       />
          //     );
          //   })}
          // </View>
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
