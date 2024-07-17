import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { SketchCanvas as RNSketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import Icon from 'react-native-vector-icons/FontAwesome';
import MainButton from '../../../components/MainGradientButton/MainButton';
import Colors from '../../../themes/Colors';
import { widthToDp } from '../../../utils/Responsive';

interface Point {
  x: number;
  y: number;
}

interface Path {
  id?: number;
  type: 'pen' | 'line' | 'arrow' | 'rectangle';
  points?: Point[];
  start?: Point;
  end?: Point;
  color?: string;
}

interface SketchCanvasComponentProps {
  onPathsChange: (paths: Path[]) => void;
  onStampChanges: (stampImage: string) => void;
  stamps: string[]; // Array of stamp images provided via props
  saveToPdf: () => Promise<void>;
}

const availableColors = [
  { name: 'red', rgb: { r: 255, g: 0, b: 0 } },
  { name: 'blue', rgb: { r: 0, g: 0, b: 255 } },
  { name: 'green', rgb: { r: 0, g: 128, b: 0 } },
  { name: 'orange', rgb: { r: 255, g: 165, b: 0 } },
  { name: 'purple', rgb: { r: 128, g: 0, b: 128 } },
  { name: 'yellow', rgb: { r: 255, g: 255, b: 0 } },
  { name: 'black', rgb: { r: 0, g: 0, b: 0 } },
  { name: 'white', rgb: { r: 255, g: 255, b: 255 } },
];

const SketchCanvasComponent: React.FC<SketchCanvasComponentProps> = ({ onPathsChange, stamps, onStampChanges, saveToPdf }) => {
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'line' | 'arrow' | 'rectangle' | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>(`rgb(${0}, ${0}, ${0})`);
  const [colorPickerVisible, setColorPickerVisible] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [stampModalVisible, setStampModalVisible] = useState<boolean>(false);
  const [signModalVisible, setSignModalVisible] = useState<boolean>(false);

  const sketchRef = useRef<RNSketchCanvas>(null);

  const handleStrokeStart = useCallback((x: number, y: number) => {
    if (drawingMode === 'pen') {
      setCurrentPath({ type: 'pen', points: [{ x, y }], color: strokeColor });
    } else if (drawingMode === 'line' || drawingMode === 'arrow' || drawingMode === 'rectangle') {
      setCurrentPath({ type: drawingMode, start: { x, y }, end: { x, y } });
    }
  }, [drawingMode, strokeColor]);

  const handleStrokeChanged = useCallback((x: number, y: number) => {
    if (drawingMode === 'pen') {
      setCurrentPath(prevPath => prevPath ? ({
        ...prevPath,
        points: [...prevPath.points!, { x, y }],
      }) : null);
    } else if (drawingMode === 'line' || drawingMode === 'arrow' || drawingMode === 'rectangle') {
      setCurrentPath(prevPath => prevPath ? ({
        ...prevPath,
        end: { x, y },
      }) : null);
    }
  }, [drawingMode]);

  const handleStrokeEnd = useCallback(() => {
    if (currentPath) {
      setPaths(prevPaths => [...prevPaths, currentPath]);
      onPathsChange([currentPath]);
      setCurrentPath(null);
    }
  }, [currentPath, onPathsChange]);

  const clearPaths = () => {
    if (sketchRef.current) {
      sketchRef.current.clear();
    }
    setPaths([]);
    setCurrentPath(null);
  };
  const handlesaveToPdf = () => {
    saveToPdf();
    clearPaths();
  }
  const selectColor = (colorObj: { name: string, rgb: { r: number, g: number, b: number } }) => {
    const { rgb } = colorObj;
    setStrokeColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    setColorPickerVisible(false);
  };

  const handlePenPress = () => {
    if (drawingMode === 'pen') {
      setDrawingMode(null);
    } else {
      setDrawingMode('pen');
      setShowDropdown(!showDropdown);
    }
  };



  const handleStampPress = () => {
    setStampModalVisible(true);
  };

  const handleSignaturePress = () => {
    // Handle signature press logic here
    setSignModalVisible(true);
    console.log('Signature button pressed');
  };
  console.log("stampsfdfd", stamps)
  const renderStampModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={stampModalVisible}
        onRequestClose={() => setStampModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <TouchableOpacity onPress={() => handleStampSelect(stamps.notarySeal)}>
              <Image source={{ uri: stamps.notarySeal }} style={{ width: 100, height: 100 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleStampSelect = (stampImage: string) => {
    setStampModalVisible(false);

    onStampChanges(stampImage);
  };
  const handleSignSelect = (stampImage: string) => {
    setSignModalVisible(false);

    onStampChanges(stampImage.signUrl);
  };
  const renderSignModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={signModalVisible}
        onRequestClose={() => setSignModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <FlatList
              data={stamps.notarysigns}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSignSelect(item)}>
                  <Image source={{ uri: item.signUrl }} style={{ width: 100, height: 100 }} />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
            />
          </View>
        </View>
      </Modal>
    );
  };
  return (
    <View style={styles.container}>
      {renderStampModal()}
      {renderSignModal()}
      <Modal
        animationType="slide"
        transparent={true}
        visible={colorPickerVisible}
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <FlatList
              data={availableColors}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: `rgb(${item.rgb.r}, ${item.rgb.g}, ${item.rgb.b})` }]}
                  onPress={() => selectColor(item)}
                />
              )}
              keyExtractor={(item) => item.name}
              numColumns={4}
            />
          </View>
        </View>
      </Modal>
      <RNSketchCanvas
        ref={sketchRef}
        style={styles.canvas}
        strokeColor={strokeColor}
        strokeWidth={3}
        onStrokeStart={handleStrokeStart}
        onStrokeChanged={handleStrokeChanged}
        onStrokeEnd={handleStrokeEnd}
        touchEnabled={drawingMode !== null}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.iconButton} onPress={handlePenPress}>
          <Icon name="pencil" size={30} color={drawingMode === 'pen' ? 'blue' : 'black'} />
        </TouchableOpacity>
        {showDropdown && (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={() => setColorPickerVisible(true)}>
              <Icon name="tint" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={clearPaths}>
              <Icon name="trash" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleStampPress}>
              <Icon name="image" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleSignaturePress}>
              <Icon name="edit" size={30} color="black" />
            </TouchableOpacity>
          </>
        )}
      </View>
      {paths.length > 0 && (

        <MainButton
          Title="Save to PDF"
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          styles={{
            paddingHorizontal: widthToDp(4),
            paddingVertical: widthToDp(2),
          }}
          onPress={handlesaveToPdf}
        />

      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  canvas: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  controls: {
    position: 'absolute',
    top: 20,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  iconButton: {
    marginVertical: 5,
    padding: 5,
  },
});

export default SketchCanvasComponent;
