export const REVENUECAT_PUBLIC_API_KEY = 'test_DLIbOOqDQcObKkMHrGEEbhoncmJ';
export const REVENUECAT_PRO_ENTITLEMENT = 'test_pro';

let configured = false;
let identifiedUserId = null;
let purchasesModule = null;

const PACKAGE_TYPES = {
  MONTHLY: 'MONTHLY',
  ANNUAL: 'ANNUAL',
  LIFETIME: 'LIFETIME',
};

const getPurchases = () => {
  if (purchasesModule) {
    return purchasesModule;
  }

  try {
    const revenueCat = require('react-native-purchases');
    purchasesModule = revenueCat.default || revenueCat;
    PACKAGE_TYPES.MONTHLY =
      revenueCat.PACKAGE_TYPE?.MONTHLY || PACKAGE_TYPES.MONTHLY;
    PACKAGE_TYPES.ANNUAL =
      revenueCat.PACKAGE_TYPE?.ANNUAL || PACKAGE_TYPES.ANNUAL;
    PACKAGE_TYPES.LIFETIME =
      revenueCat.PACKAGE_TYPE?.LIFETIME || PACKAGE_TYPES.LIFETIME;
    return purchasesModule;
  } catch (error) {
    return null;
  }
};

export const configureRevenueCat = async appUserID => {
  const Purchases = getPurchases();
  if (!Purchases) {
    return false;
  }

  if (!configured) {
    const LogLevel = Purchases.LOG_LEVEL || {
      DEBUG: 'DEBUG',
      WARN: 'WARN',
    };
    await Purchases.setLogLevel(__DEV__ ? LogLevel.DEBUG : LogLevel.WARN);
    Purchases.configure({
      apiKey: REVENUECAT_PUBLIC_API_KEY,
      appUserID: appUserID ? String(appUserID) : undefined,
    });
    configured = true;
    identifiedUserId = appUserID ? String(appUserID) : null;
    return true;
  }

  if (appUserID && String(appUserID) !== identifiedUserId) {
    await Purchases.logIn(String(appUserID));
    identifiedUserId = String(appUserID);
  }

  return true;
};

export const getRevenueCatOfferings = async appUserID => {
  const isConfigured = await configureRevenueCat(appUserID);
  if (!isConfigured) {
    return null;
  }
  const Purchases = getPurchases();
  return Purchases.getOfferings();
};

export const getRevenueCatCustomerInfo = async appUserID => {
  const isConfigured = await configureRevenueCat(appUserID);
  if (!isConfigured) {
    return null;
  }
  const Purchases = getPurchases();
  return Purchases.getCustomerInfo();
};

export const purchaseRevenueCatPackage = async (
  purchasesPackage,
  appUserID,
) => {
  const isConfigured = await configureRevenueCat(appUserID);
  if (!isConfigured) {
    throw new Error('RevenueCat is not available in this app build.');
  }
  const Purchases = getPurchases();
  return Purchases.purchasePackage(purchasesPackage);
};

export const restoreRevenueCatPurchases = async appUserID => {
  const isConfigured = await configureRevenueCat(appUserID);
  if (!isConfigured) {
    return null;
  }
  const Purchases = getPurchases();
  return Purchases.restorePurchases();
};

export const getActiveRevenueCatEntitlement = customerInfo => {
  const activeEntitlements = customerInfo?.entitlements?.active || {};
  return (
    activeEntitlements[REVENUECAT_PRO_ENTITLEMENT] ||
    Object.values(activeEntitlements)[0] ||
    null
  );
};

export const findRevenueCatPackageForPlan = (offering, planId) => {
  const availablePackages = offering?.availablePackages || [];

  if (planId === 'pro_monthly') {
    return (
      offering?.monthly ||
      availablePackages.find(
        pkg => pkg.packageType === PACKAGE_TYPES.MONTHLY,
      ) ||
      availablePackages.find(pkg =>
        String(pkg.identifier || pkg.product?.identifier || '')
          .toLowerCase()
          .includes('month'),
      )
    );
  }

  if (planId === 'pro_annual') {
    return (
      offering?.annual ||
      availablePackages.find(pkg => pkg.packageType === PACKAGE_TYPES.ANNUAL) ||
      availablePackages.find(pkg =>
        String(pkg.identifier || pkg.product?.identifier || '')
          .toLowerCase()
          .includes('year'),
      )
    );
  }

  if (planId === 'lifetime') {
    return (
      offering?.lifetime ||
      availablePackages.find(pkg => pkg.packageType === PACKAGE_TYPES.LIFETIME)
    );
  }

  return null;
};
