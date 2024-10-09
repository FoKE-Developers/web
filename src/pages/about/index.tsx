import styled from '@emotion/styled';
import Head from 'next/head';

const StyledIframe = styled.iframe({
  width: '100%',
  height: '100vh',
  border: 0,
  padding: 0,
});

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>같이네컷</title>
        <meta name="description" content="같이네컷" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StyledIframe src="https://www.notioniframe.com/notion/7did5nhyric"></StyledIframe>
    </>
  );
}
