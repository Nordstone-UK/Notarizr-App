import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  clamp,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DraggableSignature({ signatureData }) {
  // console.log("signatredate", signatureData)
  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const baseScale = useSharedValue(1);
  const prevTranslationX = useRef(0);
  const prevTranslationY = useRef(0);

  const onPinchGestureEvent = ({ nativeEvent }) => {
    baseScale.value = nativeEvent.scale;
  };

  const onPinchHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      scale.value *= baseScale.value;
      baseScale.value = 1;
    }
  };

  const onPanGestureEvent = ({ nativeEvent }) => {
    translationX.value = clamp(prevTranslationX.current + nativeEvent.translationX, 0, screenWidth - 120);
    translationY.value = clamp(prevTranslationY.current + nativeEvent.translationY, 0, screenHeight - 120);
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
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanGestureStateChange}
      >
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchHandlerStateChange}
        >
          <Animated.View style={[styles.box, animatedStyle]}>
            <Image
              source={{ uri: signatureData }} // Assuming signatureData is a URI
              style={styles.image}
            />
          </Animated.View>
        </PinchGestureHandler>
      </PanGestureHandler>
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
  box: {
    height: 120,
    width: 120,
    borderWidth: 1,
    borderColor: 'black',
    // backgroundColor: '#b58df1',
    borderRadius: 20,
    position: 'absolute',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
