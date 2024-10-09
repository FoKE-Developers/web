import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next';
import styled from '@emotion/styled';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import getAgent from '@egjs/agent';
import Head from 'next/head';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  alignItems: 'center',
  backgroundColor: '#201c1c',
  gap: 16,
});

const HelpMessage = styled.span({
  fontSize: 14,
  lineHeight: 1.5,
  color: 'white',
  marginTop: 16,
});

const ButtonContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: 400,
  height: 80,
});

const Button = styled.button({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#139696',
  color: 'white',
  width: 150,
  height: 50,
});

const ImageDownloadButton = <T extends ElementType = 'button'>({
  imageUrl,
  fileName,
  as,
  ...props
}: {
  imageUrl: string;
  fileName: string;
  as?: T;
} & ComponentPropsWithoutRef<T>) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Button as={as} onClick={handleDownload} {...props}>
      Download Image
    </Button>
  );
};

const urlPrefix = 'https://kr.object.ncloudstorage.com/4cuts';

export default function DownloadPage({
  path,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const imageUrl = `${urlPrefix}/${path}`;
  const agent = getAgent();
  const [isIOS, setIsIOS] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsIOS(agent.os.name === 'ios');
    setIsMounted(true);
  }, [agent.os.name]);

  return (
    <>
      <Head>
        <title>같이네컷</title>
        <meta name="description" content="우리 같이 네컷 사진 찍을래요?" />
        <meta property="og:title" content="같이네컷 다운로드" />
        <meta
          property="og:description"
          content="기간이 만료되기 전에 빨리 다운로드 받으세요"
        />
        <meta property="og:url" content="https://4cuts.store" />
        <meta property="og:locale" content="ko-KR" />
        <meta property="og:image" content={imageUrl} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Image
          style={{
            marginTop: 100,
          }}
          src={imageUrl}
          alt="img"
          width={200}
          height={300}
        />
        <HelpMessage>
          {isIOS && isMounted && '이미지를 길게 눌러서 저장하세요'}
        </HelpMessage>
        <ButtonContainer>
          {!isIOS && isMounted && (
            <ImageDownloadButton
              imageUrl={imageUrl}
              fileName={`${path?.split('/').pop()}`}
            >
              다운로드
            </ImageDownloadButton>
          )}
        </ButtonContainer>
      </Container>
    </>
  );
}

export const getStaticProps = (async ({ params }) => {
  const { path } = params ?? {};

  if (typeof path === 'string' || typeof path === 'undefined') {
    return {
      props: {},
    };
  }

  return {
    props: {
      path: `${path.join('/')}`,
    },
    revalidate: 60 * 60 * 24, // 1 day
  };
}) satisfies GetStaticProps;

export const getStaticPaths = (async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
}) satisfies GetStaticPaths;
