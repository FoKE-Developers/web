import { GeistSans } from 'geist/font/sans';
import { type AppType } from 'next/app';

import { api } from '~/utils/api';

import '~/styles/globals.css';
import type { Session } from '~/utils/auth';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <div className={GeistSans.className}>
      <Component {...pageProps} />
    </div>
  );
};

export default api.withTRPC(MyApp);
