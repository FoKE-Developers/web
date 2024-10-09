import Head from 'next/head';
import styled from '@emotion/styled';

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
        <meta name="description" content="우리 같이 네컷 사진 찍을래요?" />
        <meta property="og:title" content="같이네컷" />
        <meta
          property="og:description"
          content="우리 같이 네컷 사진 찍을래요?"
        />
        <meta property="og:url" content="https://4cuts.store" />
        <meta property="og:locale" content="ko-KR" />
        <meta property="og:image" content="/og-image.jpeg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StyledIframe src="https://www.notioniframe.com/notion/7did5nhyric"></StyledIframe>
    </>
  );
}
