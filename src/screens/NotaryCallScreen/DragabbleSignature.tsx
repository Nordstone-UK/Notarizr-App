import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import { deleteSignature } from '../../features/signatures/signatureSlice';
import { useDispatch } from 'react-redux';
import { useLiveblocks } from '../../store/liveblocks';
import { Text } from 'react-native-svg';
import type { PdfObject } from '../../types/liveblocks';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FIXED_IMAGE_SIZE = 120;
type PdfObjectProps = {
  id: string;
  object: PdfObject;
  selected: boolean;
};
export default function DraggableSignature({ id, object, selected, onSignatureChange }: PdfObjectProps) {
  const updateObject = useLiveblocks(state => state.updateObject);
  const setSelectedObjectId = useLiveblocks(state => state.setSelectedObjectId);
  const deleteObject = useLiveblocks(state => state.deleteObject);
  // console.log("bonedfdd", object)
  const dispatch = useDispatch();
  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useRef(0);
  const prevTranslationY = useRef(0);
  const start = useSharedValue({ x: 0, y: 0 });
  const offset = useSharedValue({ x: object.position.x, y: object.position.y });

  const onPinchGestureEvent = ({ nativeEvent }) => {
    scale.value = nativeEvent.scale;
  };

  const onPanGestureEvent = ({ nativeEvent }) => {
    translationX.value = clamp(prevTranslationX.current + nativeEvent.translationX, 0, screenWidth - FIXED_IMAGE_SIZE);
    translationY.value = clamp(prevTranslationY.current + nativeEvent.translationY, 0, screenHeight - FIXED_IMAGE_SIZE);
  };
  useEffect(() => {
    // Update offset value when object position changes
    translationX.value = object.position.x;
    translationY.value = object.position.y;
  }, [object.position]);

  const onPanGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      prevTranslationX.current = translationX.value;
      prevTranslationY.current = translationY.value;
      setSelectedObjectId(id);
      translationX.value = withSpring(translationX.value, {
        damping: 10,
        stiffness: 100,
      });
      translationY.value = withSpring(translationY.value, {
        damping: 10,
        stiffness: 100,
      });
      let newOffset = {
        x: translationX.value,
        y: translationY.value,
      };
      console.log("newoffser", newOffset)
      updateObject(id, {
        ...object,
        position: newOffset,
      });
      onSignatureChange({
        width: FIXED_IMAGE_SIZE * scale.value,
        height: FIXED_IMAGE_SIZE * scale.value,
        x: translationX.value,
        y: translationY.value,
        signatureData: object.sourceUrl
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
  }));

  const handleDelete = () => {
    deleteObject(id); // Use the deleteObject action
    onSignatureChange({ delete: true });
  };

  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }],
  //   };
  // });

  const renderContent = useCallback(() => {
    if (object.type === 'label') {
      return <Text>{object.text}</Text>;
    }

    if (object.type === 'image') {
      return <Image style={styles.image} source={{ uri: object.sourceUrl }} />;
    }

    return null;
  }, [object.sourceUrl, object.text, object.type]);

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanGestureStateChange}
      >
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
        >
          <Animated.View style={[styles.box, animatedStyle, selected && styles.containerSelected,]}>
            {renderContent()}
            {/* <Image
              source={{ uri: object.sourceUrl }} // Assuming signatureData is a URI
              style={styles.image}
            /> */}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <View style={styles.deleteIcon} />
            </TouchableOpacity>
          </Animated.View>
        </PinchGestureHandler>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  box: {
    height: FIXED_IMAGE_SIZE,
    width: FIXED_IMAGE_SIZE,
    position: 'absolute',
  },
  containerSelected: {
    borderColor: 'blue',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    backgroundColor: 'red',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    width: 15,
    height: 15,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
  },
});
