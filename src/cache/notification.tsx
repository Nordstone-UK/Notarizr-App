import {makeVar} from '@apollo/client';

type notification = {
  reload: boolean;
};

export const notificationCache = makeVar<notification>({
  reload: false,
});

const notificationCacheMethods = {
  reload: () => {
    notificationCache({
      reload: true,
    });
  },
  turnItOff: () => {
    notificationCache({
      reload: false,
    });
  },
};

export default notificationCacheMethods;
