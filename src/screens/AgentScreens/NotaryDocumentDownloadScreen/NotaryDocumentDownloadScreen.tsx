import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';

const NotaryDocumentDownloadScreen = ({ route, navigation }) => {
  const { document } = route.params;
  const [filePath, setFilePath] = useState(null); // State to hold PDF file path
  const [downloadedFilePath, setDownloadedFilePath] = useState(null); // State to hold downloaded file path

  useEffect(() => {
    // Check if a document is provided and download it
    if (document) {
      downloadFile(document);
    }
  }, [document]);

  const downloadFile = (downloadUrl) => {
    const fileName = 'react-native.pdf';
    const fileUri = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    RNFS.downloadFile({
      fromUrl: downloadUrl,
      toFile: fileUri,
    }).promise.then(res => {
      setDownloadedFilePath(fileUri);
      setFilePath(fileUri);
    }).catch(error => {
      console.error('Error downloading file:', error);
      // Handle file download error (e.g., show error message)
    });
  };

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      {filePath ? (
        // Display PDF if file path is available
        <Pdf
          style={styles.pdfView}
          source={{ uri: filePath }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log('PDF loaded:', numberOfPages, filePath);
          }}
          onError={(error) => console.error('PDF error:', error)}
        />
      ) : (
        // Show loading indicator if file path is not yet available
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Downloading PDF...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <View style={styles.Textcontainer}>
          {downloadedFilePath && (
            <Text style={styles.filePathText}>Downloaded File Path: {downloadedFilePath}</Text>
          )}
        </View>
        <View style={styles.buttonStyle}>
          <Button title="Go Back" onPress={handleGoBack} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfView: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#FFA500',
  },
  buttonContainer: {

    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 25,
  },
  Textcontainer: {
    width: '80%',
  },
  buttonStyle: {
    padding: 15,    // Add padding
    // marginLeft: 20,  // Add left margin
  },
  filePathText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default NotaryDocumentDownloadScreen;

