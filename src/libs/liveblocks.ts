import {decode} from 'base-64';
import {createClient} from '@liveblocks/client';

export const client = createClient({
  publicApiKey:
    'pk_dev_xbVFGKftQL68G_EljsHYdXUZMzvkt3ryyogulia_OC9sxW6VaSI55lFoQjWmEoMa',
  throttle: 32,
  polyfills: {
    atob: decode,
  },
});
