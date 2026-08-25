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
import Feather from 'react-native-vector-icons/Feather';
import BookingColors from '../../themes/BookingColors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FIXED_IMAGE_SIZE = 120;
type PdfObjectProps = {
  id: string;
  object: PdfObject;
  selected: boolean;
  onSignatureChange: (signatureInfo: any) => void;
};
export default function DraggableSignature({ id, object, selected, onSignatureChange }: PdfObjectProps) {
  const updateObject = useLiveblocks(state => state.updateObject);
  const setSelectedObjectId = useLiveblocks(state => state.setSelectedObjectId);
  const deleteObject = useLiveblocks(state => state.deleteObject);
  const setSigningActivity = useLiveblocks(state => state.setSigningActivity);
  const dispatch = useDispatch();
  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const gestureStartX = useRef(object.position.x);
  const gestureStartY = useRef(object.position.y);
  const start = useSharedValue({ x: 0, y: 0 });
  const offset = useSharedValue({ x: object.position.x, y: object.position.y });

  const onPinchGestureEvent = ({ nativeEvent }) => {
    scale.value = nativeEvent.scale;
  };

  const onPanGestureEvent = ({ nativeEvent }) => {
    const x = clamp(
      gestureStartX.current + nativeEvent.translationX,
      0,
      screenWidth - FIXED_IMAGE_SIZE,
    );
    const y = clamp(
      gestureStartY.current + nativeEvent.translationY,
      44,
      screenHeight - FIXED_IMAGE_SIZE,
    );
    translationX.value = x;
    translationY.value = y;
    setSelectedObjectId(id);
    updateObject(id, {
      ...object,
      position: {x, y},
    });
    setSigningActivity({
      status: 'signing',
      label: 'Dragging a signature',
      page: object.page || 1,
      x,
      y,
    });
  };
  useEffect(() => {
    // Update offset value when object position changes
    translationX.value = object.position.x;
    translationY.value = object.position.y;
  }, [object.position]);

  const onPanGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.BEGAN) {
      gestureStartX.current = translationX.value;
      gestureStartY.current = translationY.value;
      setSelectedObjectId(id);
      setSigningActivity({
        status: 'signing',
        label: 'Dragging a signature',
        page: object.page || 1,
        x: translationX.value,
        y: translationY.value,
      });
    }

    if (nativeEvent.state === State.END) {
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
      updateObject(id, {
        ...object,
        position: newOffset,
      });
      setSigningActivity({
        status: 'idle',
        label: '',
        page: object.page || 1,
      });
    }

    if (
      nativeEvent.state === State.CANCELLED ||
      nativeEvent.state === State.FAILED
    ) {
      setSigningActivity({
        status: 'idle',
        label: '',
        page: object.page || 1,
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
    deleteObject(id);
    setSigningActivity({
      status: 'idle',
      label: '',
      page: object.page || 1,
    });
    onSignatureChange({ delete: true });
  };

  const signaturePlacement = () => ({
    width: FIXED_IMAGE_SIZE * scale.value,
    height: FIXED_IMAGE_SIZE * scale.value,
    x: translationX.value,
    y: translationY.value,
    type: object.type,
    signatureData:
      object.type === 'image' ? object.sourceUrl : object.text,
    fontFamily: object.type === 'text' ? object.fontfamily : undefined,
  });

  const handleConfirm = () => {
    onSignatureChange({...signaturePlacement(), confirmed: true});
    setSelectedObjectId(null);
    setSigningActivity({
      status: 'idle',
      label: '',
      page: object.page || 1,
    });
  };

  const handleRedo = () => {
    deleteObject(id);
    onSignatureChange({delete: true, redo: true});
  };

  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }],
  //   };
  // });
  // console.log("object.typere", object)
  const renderContent = useCallback(() => {
    if (object.type === 'date') {
      const dateValue = (object.text as any)?.date || object.text;
      return (
        <View style={styles.dateContainer}>
          <Text
            style={styles.date}>
            {moment(dateValue).format('DD-MM-YYYY ')}
          </Text>
        </View>
      )
    }
    if (object.type === 'text') {

      return (
        <View style={styles.textContainer}>
          <Text style={[styles.text, { fontFamily: object.fontfamily }]} >{object.text}</Text>
        </View>
      )
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
            {selected && (
              <View style={styles.placementActions}>
                <TouchableOpacity
                  accessibilityLabel="Confirm signature placement"
                  style={[styles.placementAction, styles.confirmAction]}
                  onPress={handleConfirm}>
                  <Feather name="check" size={16} color={BookingColors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Redo signature"
                  style={[styles.placementAction, styles.redoAction]}
                  onPress={handleRedo}>
                  <Feather name="rotate-ccw" size={15} color={BookingColors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Delete signature"
                  style={[styles.placementAction, styles.deleteAction]}
                  onPress={handleDelete}>
                  <Feather name="trash-2" size={15} color={BookingColors.white} />
                </TouchableOpacity>
              </View>
            )}
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
  },
  textContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.Orange,
  },
  date: {
    color: 'black',
    fontFamily: 'Manrope-Bold',
    fontSize: widthToDp(3),

    paddingHorizontal: widthToDp(2),
    borderRadius: widthToDp(2),

  },
  placementActions: {
    position: 'absolute',
    top: -42,
    right: -2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    gap: 5,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
  },
  placementAction: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  confirmAction: {
    backgroundColor: BookingColors.success,
  },
  redoAction: {
    backgroundColor: BookingColors.primary,
  },
  deleteAction: {
    backgroundColor: BookingColors.error,
  },
});
