import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface DrawingControlsProps {
  setDrawingMode: (mode: 'pen' | 'line' | 'arrow' | 'rectangle') => void;
  clearCanvas: () => void;
}

const DrawingControls: React.FC<DrawingControlsProps> = ({ setDrawingMode, clearCanvas }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentMode, setCurrentMode] = useState<null | 'pen' | 'line' | 'arrow' | 'rectangle'>(null);

  const handlePenPress = () => {
    if (showDropdown) {
      setShowDropdown(false);
      setDrawingMode(null);

    } else {
      setDrawingMode('pen');
      setShowDropdown(!showDropdown);
      setCurrentMode('pen');
    }
  };
  const handleModeChange = (mode: 'pen' | 'line' | 'arrow' | 'rectangle') => {
    setDrawingMode(mode);
    setCurrentMode(mode);
    setShowDropdown(false);
  };

  return (
    <View style={styles.controls}>
      <TouchableOpacity onPress={handlePenPress}>
        <Icon name="pencil" size={30} color="black" />
      </TouchableOpacity>
      {showDropdown && (
        <>
          <TouchableOpacity onPress={() => handleModeChange('line')} style={styles.iconButton}>
            <Icon name="minus" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleModeChange('arrow')} style={styles.iconButton}>
            <Icon name="long-arrow-right" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleModeChange('rectangle')} style={styles.iconButton}>
            <Icon name="square-o" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearCanvas} style={styles.iconButton}>
            <Icon name="trash" size={30} color="black" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: 10,
    top: 50,
  },
  iconButton: {
    marginTop: 10,
  },
});

export default DrawingControls;
