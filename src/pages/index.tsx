import Head from 'next/head';
import Link from 'next/link';

import styles from './index.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="인생네컷" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Link href="/docs">docs로 이동</Link>
      </main>
    </>
  );
}
