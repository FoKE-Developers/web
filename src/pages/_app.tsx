import { GeistSans } from 'geist/font/sans';
import emotionReset from 'emotion-reset';
import type { AppProps } from 'next/app';

import { api } from '~/utils/api';

import '~/styles/globals.css';
import { Global } from '@emotion/react';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <div className={GeistSans.className}>
      <Global styles={emotionReset} />
      <Component {...pageProps} />
    </div>
  );
};

export default api.withTRPC(MyApp);
