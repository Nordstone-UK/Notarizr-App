import { useCallback, useEffect, useMemo, useRef } from 'react';
import { heightToDp, widthToDp } from '../../utils/Responsive';
import MainButton from '../MainGradientButton/MainButton';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native';
import Colors from '../../themes/Colors';
import { useNavigation } from '@react-navigation/native';

const LoginBottomSheet = ({ isVisible, onCloseModal, Title }: any) => {
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['5%', '25%'], []);
  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close();
    onCloseModal();
    navigation.navigate('LoginScreen');
  }, [onCloseModal]);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onCloseModal}>
      <View>
        <Text
          style={[
            styles.textheading,
            { marginTop: heightToDp(5), fontSize: widthToDp(5) },
          ]}>
          {Title}
        </Text>
        <MainButton
          colors={[Colors.OrangeGradientStart, Colors.OrangeGradientEnd]}
          Title="Log In"
          textStyle={{ color: '#fff' }}
          styles={{
            padding: widthToDp(2),
            fontSize: widthToDp(6),
            minWidth: widthToDp(50),
          }}
          gradiStyles={{ borderRadius: 5 }}
          onPress={handleCloseModalPress}
        />
      </View>
    </BottomSheetModal>
  );
};

export default LoginBottomSheet;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2DC',
  },
  picture: {
    alignSelf: 'center',
    marginTop: heightToDp(5),
    width: widthToDp(30),
    height: heightToDp(30),
    borderRadius: 100,
  },
  iconContainer: {
    flexDirection: 'row',
    margin: widthToDp(4),
  },
  icon: {
    marginHorizontal: widthToDp(2),
  },
  textheading: {
    fontSize: widthToDp(6),
    alignSelf: 'center',
    color: Colors.TextColor,
    fontFamily: 'Manrope-Bold',
    marginVertical: heightToDp(3),
  },
});
