import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList, Image, Text, ActivityIndicator } from 'react-native';
import { SketchCanvas as RNSketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/FontAwesome5';
import MainButton from '../../../components/MainGradientButton/MainButton';
import Colors from '../../../themes/Colors';
import { widthToDp } from '../../../utils/Responsive';
import useFetchUser from '../../../hooks/useFetchUser';

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
  stamps: { notarySeal?: string; notarysigns?: { signUrl: string }[] };
  onStampChanges: (stampImage: string) => void;
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
  let { handleDeleteSign, fetchUserInfo } = useFetchUser()

  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'line' | 'arrow' | 'rectangle' | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>(`rgb(${0}, ${0}, ${0})`);
  const [colorPickerVisible, setColorPickerVisible] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [stampModalVisible, setStampModalVisible] = useState<boolean>(false);
  const [signModalVisible, setSignModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageLoading, setImageLoading] = useState(false);
  console.log("lllllllogisdfd", loading)
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
  const handlesaveToPdf = async () => {
    await saveToPdf();
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
    setSignModalVisible(true);
  };

  const handleImageLoadStart = () => {
    setLoading(true)

  };

  const handleImageLoadEnd = () => {
    setLoading(false)
  };
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
            {loading ? (
              <ActivityIndicator size="large" color={Colors.OrangeGradientStart} style={styles.centeredActivityIndicator} />
            ) : null}
            {stamps?.notarySeal ? (
              <TouchableOpacity onPress={() => handleStampSelect(stamps?.notarySeal)}>
                <Image
                  source={{ uri: stamps?.notarySeal }}
                  style={{ width: 100, height: 100 }}
                  onLoad={() => console.log('Image loaded')}
                  onLoadStart={handleImageLoadStart}
                  onLoadEnd={handleImageLoadEnd}
                />
              </TouchableOpacity>
            ) : (
              <Text style={styles.noDataText}>Please add a stamp</Text>
            )}
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
    console.log("sterdf", stampImage)
    setSignModalVisible(false);
    onStampChanges(stampImage);
  };
  const handleSignDelete = async (signId: string) => {
    try {
      const signupdated = await handleDeleteSign(signId);
      // if (response.data.deleteNotarySignR.status === 'success') {

      if (signupdated) {
        console.log("sgnd", signupdated)
        await fetchUserInfo();
      }
      // setSignToDelete(null);
      // setStampModalVisible(false);
      // setSignModalVisible(false);
      // Optionally, update the stamps list after deletion
      // }
    } catch (error) {
      console.error('Error deleting sign:', error);
    }
  };
  const renderSignModal = () => {
    const renderItem = useCallback(({ item }: { item: { signUrl: string, id: string } }) => (
      <View style={styles.signItemContainer}>
        <TouchableOpacity onPress={() => handleSignSelect(item.signUrl)}>
          <Image
            source={{ uri: item.signUrl }}
            style={{ width: 100, height: 100 }}
            onLoadStart={handleImageLoadStart}
            onLoadEnd={handleImageLoadEnd}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleSignDelete(item._id)}>
          <Icon name="times" size={20} color="red" />
        </TouchableOpacity>
      </View>
    ), []);
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={signModalVisible}
        onRequestClose={() => setSignModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.OrangeGradientStart} style={styles.centeredActivityIndicator} />
            ) : null}
            {stamps?.notarysigns && stamps?.notarysigns.length > 0 ? (
              <FlatList
                data={stamps.notarysigns}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
              />
            ) : (
              <Text style={styles.noDataText}>Please add a signature</Text>
            )}

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
          <Icon name="pencil" size={30} color={drawingMode === 'pen' ? Colors.Orange : 'black'} />
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
              <Icon1 name="stamp" size={30} color="black" />
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
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
  centeredActivityIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  signItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default SketchCanvasComponent;