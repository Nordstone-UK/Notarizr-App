import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, DeviceEventEmitter, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import PdfView from 'react-native-pdf';

import RNFS from 'react-native-fs';
const NotaryDocumentDownloadScreen = ({ route }) => {
  const { document } = route.params;
  console.log("docdodd", document)
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(document);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [filePath, setFilePath] = useState(
    `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
  );
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [lastRNBFTask, setLastRNBFTask] = useState({ cancel: () => { } });


  useEffect(() => {
    downloadFile();

    if (newPdfSaved) {
      console.log("newfilepath", newPdfPath)
      setFilePath(document);
      setNewPdfSaved(false);
      // setPdfArrayBuffer(_base64ToArrayBuffer(pdfBase64));
    }
  }, [filePath, newPdfSaved, selectedDocument, newPdfPath]);


  const downloadFile = () => {
    if (!fileDownloaded && selectedDocument) { // Check if sourceUrl is not empty
      RNFS.downloadFile({
        fromUrl: selectedDocument,
        toFile: newPdfPath ? newPdfPath : selectedDocument,
      }).promise.then(res => {
        setFileDownloaded(true);
        console.log("respnsere", res)
        readFile();
      }).catch(error => {
        console.error('Error downloading file:', error);
        // Handle the error (e.g., show an error message to the user)
      });
    } else {
      console.warn('Source URL is empty. File download skipped.');
      // Handle the case where sourceUrl is empty (e.g., show a message to the user)
    }
  };
  const readFile = () => {
    RNFS.readFile(
      `${RNFS.DocumentDirectoryPath}/react-native.pdf`,
      'base64',
    ).then(contents => {
      // setPdfBase64(contents);
      // setPdfArrayBuffer(_base64ToArrayBuffer(contents));
    });
  };
  const openLocalFile = () => {
    if (filePath) {
      RNFS.readFile(filePath, 'base64')
        .then(contents => {
          // Handle file contents, e.g., display PDF using a library
          console.log('File contents:', contents);
        })
        .catch(error => {
          console.error('Error reading file:', error);
        });
    } else {
      console.warn('File path is empty.');
    }
  };
  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };
  // console.log("cliendetails", clientDetail)
  console.log("statusd", selectedDocument)
  return (
    <View style={styles.container}>
      {/* <Text style={styles.documentInfo}>Document Name: {document.name}</Text>
      <Text style={styles.documentInfo}>Document Type: {document.type}</Text>
      <Text style={styles.documentInfo}>Document Date: {document.date}</Text> */}
      {filePath ? (
        <PdfView
          style={styles.pdfView}
          source={{ uri: filePath }} // Set the source URI for the PDF
          trustAllCerts={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          enablePaging={true}
          minScale={1.0}
          maxScale={20.0}
          scale={1.0}
          spacing={0}
          fitPolicy={0}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log('PDF loaded:', numberOfPages, filePath);
          }}
          onError={(error) => console.error('PDF error:', error)}
        />
      ) : (
        <View
          style={{
            width: widthToDp(100),
            flex: 1,
            height: height,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator
            size="large"
            color={Colors.Orange}
            style={{ marginTop: -200 }}
          />
          <RNText
            style={{
              color: Colors.Orange,
              fontSize: 20,
              fontWeight: 'bold',
              marginTop: 20,
            }}>
            Saving the Pdf file
          </RNText>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Download" onPress={openLocalFile} />
        <Button title="Go Back" onPress={handleGoBack} />
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '80%',
  },
})

export default NotaryDocumentDownloadScreen;
