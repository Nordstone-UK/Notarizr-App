export const goBackOrNavigate = (navigation, fallbackRoute, params) => {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  if (typeof navigation.replace === 'function') {
    navigation.replace(fallbackRoute, params);
    return;
  }

  navigation.navigate(fallbackRoute, params);
};
