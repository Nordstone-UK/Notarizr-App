import React, { useRef } from 'react';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FIXED_IMAGE_SIZE = 120;

export default function DraggableSignature({ signatureData, onSignatureChange }) {
  const dispatch = useDispatch();
  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useRef(0);
  const prevTranslationY = useRef(0);

  const onPinchGestureEvent = ({ nativeEvent }) => {
    scale.value = nativeEvent.scale;
  };

  const onPanGestureEvent = ({ nativeEvent }) => {
    translationX.value = clamp(prevTranslationX.current + nativeEvent.translationX, 0, screenWidth - FIXED_IMAGE_SIZE);
    translationY.value = clamp(prevTranslationY.current + nativeEvent.translationY, 0, screenHeight - FIXED_IMAGE_SIZE);
  };

  const onPanGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      prevTranslationX.current = translationX.value;
      prevTranslationY.current = translationY.value;

      translationX.value = withSpring(translationX.value, {
        damping: 10,
        stiffness: 100,
      });
      translationY.value = withSpring(translationY.value, {
        damping: 10,
        stiffness: 100,
      });

      // Call the onSignatureChange callback with the final signature information
      onSignatureChange({
        width: FIXED_IMAGE_SIZE * scale.value,
        height: FIXED_IMAGE_SIZE * scale.value,
        x: translationX.value,
        y: translationY.value,
        signatureData: signatureData
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
    dispatch(deleteSignature(signatureData));
    onSignatureChange({
      delete: true
    })
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanGestureStateChange}
      >
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
        >
          <Animated.View style={[styles.box, animatedStyle]}>
            <Image
              source={{ uri: signatureData }} // Assuming signatureData is a URI
              style={styles.image}
            />
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
  },
  box: {
    height: FIXED_IMAGE_SIZE,
    width: FIXED_IMAGE_SIZE,
    position: 'absolute',
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
