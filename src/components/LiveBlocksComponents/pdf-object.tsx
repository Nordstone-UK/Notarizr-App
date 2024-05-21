import React, { useCallback } from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import type { PdfObject } from '../../types/liveblocks';
import { ArrowDownRightCircleSolid } from 'iconoir-react-native';
import { useLiveblocks } from '../../store/liveblocks';

type PdfObjectProps = {
  id: string;
  object: PdfObject;
  selected: boolean;
};

export default function PdfObject({ id, object, selected }: PdfObjectProps) {
  const updateObject = useLiveblocks(state => state.updateObject);
  const setSelectedObjectId = useLiveblocks(state => state.setSelectedObjectId);

  const start = useSharedValue({ x: 0, y: 0 });
  const offset = useSharedValue({ x: object.position.x, y: object.position.y });

  React.useEffect(() => {
    offset.value = { x: object.position.x, y: object.position.y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object.position]);

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      // console.log("itdfdfdfd", id)
      setSelectedObjectId(id);
    })
    .runOnJS(true);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    })
    .onUpdate(e => {
      const newOffset = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
      console.log("ndfdfdfd", newOffset)
      offset.value = newOffset;
      updateObject(id, {
        ...object,
        position: newOffset,
      });
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    })
    .onFinalize(() => { })
    .runOnJS(true);

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }],
    };
  });

  const renderContent = useCallback(() => {
    if (object.type === 'label') {
      return <Text>{object.text}</Text>;
    }

    if (object.type === 'image') {
      return <Image style={styles.image} source={{ uri: object.sourceUrl }} />;
    }

    return null;
  }, [object.sourceUrl, object.text, object.type]);

  const renderResize = useCallback(() => {
    if (!selected) {
      return null;
    }

    return (
      <Animated.View style={styles.resize}>
        <ArrowDownRightCircleSolid width={24} height={24} color={'blue'} />
      </Animated.View>
    );
  }, [selected]);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          styles.container,
          selected && styles.containerSelected,
          animatedStyle,
        ]}>
        {renderContent()}
        {/* {renderResize()} */}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerSelected: {
    borderColor: 'blue',
  },
  image: {
    width: 200,
    aspectRatio: 1.45,
    resizeMode: 'cover',
    // zIndex: 9999,
  },
  resize: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    //   zIndex: 9999,
    backgroundColor: 'white',
    borderRadius: 9999,
  },
});
