import React, {useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ViewShot, {captureRef} from 'react-native-view-shot';
import Feather from 'react-native-vector-icons/Feather';
import AppColors from '../../themes/AppColors';

const MIN_SCALE = 1;
const MAX_SCALE = 2.8;

export default function ProfileImageCropModal({
  imageUri,
  onCancel,
  onComplete,
  visible,
}) {
  const cropRef = useRef(null);
  const lastOffsetRef = useRef({x: 0, y: 0});
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [scale, setScale] = useState(1);
  const [saving, setSaving] = useState(false);

  const cropSize = useMemo(
    () => Math.min(Dimensions.get('window').width - 56, 320),
    [],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          lastOffsetRef.current = offset;
        },
        onPanResponderMove: (_, gestureState) => {
          setOffset({
            x: lastOffsetRef.current.x + gestureState.dx,
            y: lastOffsetRef.current.y + gestureState.dy,
          });
        },
        onPanResponderRelease: (_, gestureState) => {
          lastOffsetRef.current = {
            x: lastOffsetRef.current.x + gestureState.dx,
            y: lastOffsetRef.current.y + gestureState.dy,
          };
        },
      }),
    [offset],
  );

  const adjustZoom = amount => {
    setScale(current => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, current + amount));
      return Number(next.toFixed(2));
    });
  };

  const resetCrop = () => {
    lastOffsetRef.current = {x: 0, y: 0};
    setOffset({x: 0, y: 0});
    setScale(1);
  };

  const saveCrop = async () => {
    if (!cropRef.current || saving) {
      return;
    }

    setSaving(true);
    try {
      const croppedUri = await captureRef(cropRef.current, {
        format: 'jpg',
        quality: 0.92,
        result: 'tmpfile',
      });
      onComplete(croppedUri);
      resetCrop();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onCancel}
      transparent
      visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={onCancel}
              style={styles.iconButton}>
              <Feather name="x" size={22} color={AppColors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Crop photo</Text>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={resetCrop}
              style={styles.iconButton}>
              <Feather
                name="rotate-ccw"
                size={19}
                color={AppColors.textPrimary}
              />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Drag and zoom until your face is centered.
          </Text>

          <View style={styles.cropOuter}>
            <ViewShot
              ref={cropRef}
              collapsable={false}
              {...panResponder.panHandlers}
              style={[styles.cropFrame, {height: cropSize, width: cropSize}]}>
              {imageUri ? (
                <Image
                  resizeMode="cover"
                  source={{uri: imageUri}}
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      transform: [
                        {translateX: offset.x},
                        {translateY: offset.y},
                        {scale},
                      ],
                    },
                  ]}
                />
              ) : null}
              <View pointerEvents="none" style={styles.cropBorder} />
            </ViewShot>
          </View>

          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              disabled={saving || scale <= MIN_SCALE}
              onPress={() => adjustZoom(-0.18)}
              style={styles.zoomButton}>
              <Feather name="minus" size={18} color={AppColors.textPrimary} />
            </Pressable>
            <View style={styles.zoomTrack}>
              <View
                style={[
                  styles.zoomFill,
                  {
                    width: `${
                      ((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={saving || scale >= MAX_SCALE}
              onPress={() => adjustZoom(0.18)}
              style={styles.zoomButton}>
              <Feather name="plus" size={18} color={AppColors.textPrimary} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={saveCrop}
            style={({pressed}) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              saving && styles.saveButtonDisabled,
            ]}>
            {saving ? (
              <ActivityIndicator size="small" color={AppColors.white} />
            ) : (
              <>
                <Text style={styles.saveText}>Use cropped photo</Text>
                <Feather name="check" size={20} color={AppColors.white} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18,24,38,0.55)',
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 18,
  },
  cropBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: AppColors.white,
    borderRadius: 8,
  },
  cropFrame: {
    backgroundColor: AppColors.backgroundSubtle,
    overflow: 'hidden',
  },
  cropOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    marginTop: 22,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonPressed: {
    backgroundColor: AppColors.primaryPressed,
  },
  saveText: {
    color: AppColors.white,
    fontFamily: 'Manrope-Bold',
    fontSize: 16,
    marginRight: 10,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 26,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: AppColors.white,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontFamily: 'Manrope-Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
  title: {
    color: AppColors.textPrimary,
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
  },
  zoomButton: {
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSubtle,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  zoomFill: {
    backgroundColor: AppColors.primary,
    borderRadius: 999,
    height: '100%',
  },
  zoomTrack: {
    flex: 1,
    height: 5,
    marginHorizontal: 14,
    borderRadius: 999,
    backgroundColor: AppColors.border,
  },
});
