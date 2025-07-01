import { ReactNode } from 'react';
import { LiveblocksProvider as LiveblocksReactProvider } from '@liveblocks/react';
import { createClient } from '@liveblocks/client';

const client = createClient({
  publicApiKey: 'pk_dev_xbVFGKftQL68G_EljsHYdXUZMzvkt3ryyogulia_OC9sxW6VaSI55lFoQjWmEoMa',
  throttle: 32,
});

interface LiveblocksProviderProps {
  children: ReactNode;
}

export function LiveblocksProvider({ children }: LiveblocksProviderProps) {
  return (
    <LiveblocksReactProvider publicApiKey='pk_dev_xbVFGKftQL68G_EljsHYdXUZMzvkt3ryyogulia_OC9sxW6VaSI55lFoQjWmEoMa'>
      {children}
    </LiveblocksReactProvider>
  );
} 