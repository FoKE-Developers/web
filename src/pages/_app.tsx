import { GeistSans } from 'geist/font/sans';
import emotionReset from 'emotion-reset';
import { type AppType } from 'next/app';

import { api } from '~/utils/api';

import '~/styles/globals.css';
import type { Session } from '~/utils/auth';
import { Global } from '@emotion/react';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <div className={GeistSans.className}>
      <Global styles={emotionReset} />
      <Component {...pageProps} />
    </div>
  );
};

export default api.withTRPC(MyApp);
