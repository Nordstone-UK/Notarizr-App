import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, Text } from 'react-native';
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
import type { PdfObject } from '../../types/liveblocks';
import Colors from '../../themes/Colors';
import { widthToDp } from '../../utils/Responsive';
import moment from 'moment';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FIXED_IMAGE_SIZE = 120;
type PdfObjectProps = {
  id: string;
  object: PdfObject;
  selected: boolean;
  onSignatureChange?: (signatureInfo: any) => void;
  pageWidth: number;
  pageHeight: number;
};
export default function DraggableSignature({ id, object, selected, onSignatureChange, pageWidth, pageHeight }: PdfObjectProps) {
  const updateObject = useLiveblocks(state => state.updateObject);
  const setSelectedObjectId = useLiveblocks(state => state.setSelectedObjectId);
  const deleteObject = useLiveblocks(state => state.deleteObject);
  const dispatch = useDispatch();

  // Use percentage-based positioning and sizing
  const xPct = (object.position && 'xPct' in object.position && typeof object.position.xPct === 'number') ? object.position.xPct : 0.1;
  const yPct = (object.position && 'yPct' in object.position && typeof object.position.yPct === 'number') ? object.position.yPct : 0.1;
  const widthPct = (object.position && 'widthPct' in object.position && typeof object.position.widthPct === 'number') ? object.position.widthPct : 0.15;
  const heightPct = (object.position && 'heightPct' in object.position && typeof object.position.heightPct === 'number') ? object.position.heightPct : 0.08;

  // Convert to pixel values for rendering
  const initialX = xPct * pageWidth;
  const initialY = yPct * pageHeight;
  const initialWidth = widthPct * pageWidth;
  const initialHeight = heightPct * pageHeight;

  const scale = useSharedValue(1);
  const translationX = useSharedValue(initialX);
  const translationY = useSharedValue(initialY);
  const prevTranslationX = useRef(initialX);
  const prevTranslationY = useRef(initialY);

  useEffect(() => {
    translationX.value = initialX;
    translationY.value = initialY;
    prevTranslationX.current = initialX;
    prevTranslationY.current = initialY;
  }, [initialX, initialY]);

  const onPinchGestureEvent = ({ nativeEvent }) => {
    scale.value = nativeEvent.scale;
  };

  const onPanGestureEvent = ({ nativeEvent }) => {
    translationX.value = clamp(prevTranslationX.current + nativeEvent.translationX, 0, pageWidth - initialWidth);
    translationY.value = clamp(prevTranslationY.current + nativeEvent.translationY, 0, pageHeight - initialHeight);
  };

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
      // Update position as percentage of page size
      const newXPct = translationX.value / pageWidth;
      const newYPct = translationY.value / pageHeight;
      const newPosition = { ...object.position } as any;
      newPosition.xPct = newXPct;
      newPosition.yPct = newYPct;
      updateObject(id, {
        ...object,
        position: newPosition,
      });
      const signatureData = object.type === 'image' ? object.sourceUrl : object.text;
      const fontFamily = object.type === 'text' ? object.fontfamily : undefined;

      if (onSignatureChange) {
        onSignatureChange({
          width: initialWidth * scale.value,
          height: initialHeight * scale.value,
          x: translationX.value,
          y: translationY.value,
          type: object.type,
          signatureData: signatureData,
          fontFamily: fontFamily,
        });
      }
    }
  };

  // Clamp and default transform values to prevent NaN/undefined errors
  const safeTranslateX = typeof translationX.value === 'number' && !isNaN(translationX.value) ? translationX.value : 0;
  const safeTranslateY = typeof translationY.value === 'number' && !isNaN(translationY.value) ? translationY.value : 0;
  const safeScale = typeof scale.value === 'number' && !isNaN(scale.value) ? scale.value : 1;

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: safeTranslateX,
    top: safeTranslateY,
    width: initialWidth * safeScale,
    height: initialHeight * safeScale,
    zIndex: 999,
    borderWidth: 0,
    borderColor: 'transparent',
    transform: [],
  }));

  const handleDelete = () => {
    deleteObject(id); // Use the deleteObject action
    if (onSignatureChange) {
      onSignatureChange({ delete: true });
    }
  };

  const renderContent = useCallback(() => {
    if (object.type === 'date') {
      return (
        <View style={styles.dateContainer}>
          <Text
            style={styles.date}>
            {moment(object.text.date).format('DD-MM-YYYY ')}
          </Text>
        </View>
      )
    }
    if (object.type === 'text') {

      return (
        <View style={styles.dateContainer}>
          <Text style={[styles.text, { fontFamily: object.fontfamily }]} >{object.text}</Text>
        </View>
      )
    }
    if (object.type === 'image' || object.type === 'signature') {
      if (object.content) {
        return <Image style={styles.image} source={{ uri: object.content }} />;
      } else {
        return <Text>No image</Text>;
      }
    }

    return null;
  }, [object.content, object.text, object.type]);

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
    resizeMode: 'contain'
  },
  text: {
    // backgroundColor: "yellow",
    fontSize: 16,
    color: 'black',
    padding: 8,
    textAlign: 'center',
  },
  dateContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.Orange,
  },
  date: {
    color: Colors.Orange,
    fontFamily: 'Manrope-Bold',
    fontSize: widthToDp(4),

    paddingHorizontal: widthToDp(2),
    borderRadius: widthToDp(2),

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
