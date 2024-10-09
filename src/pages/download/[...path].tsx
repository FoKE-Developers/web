import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next';
import styled from '@emotion/styled';
import Image from 'next/image';
import { ComponentPropsWithoutRef, ElementType } from 'react';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#201c1c',
  gap: 16,
});

const StyledImage = styled(Image)({
  height: 'auto',
});

const HelpMessage = styled.span({
  fontSize: 14,
  color: 'white',
  marginTop: 16,
});

const ButtonContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: 400,
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

  return (
    <Container>
      <HelpMessage>이미지를 길게 눌러서 저장하세요</HelpMessage>
      <StyledImage src={imageUrl} alt="img" width={200} height={300} />
      <ButtonContainer>
        <ImageDownloadButton
          imageUrl={imageUrl}
          fileName={`${path?.split('/').pop()}`}
        >
          다운로드
        </ImageDownloadButton>
      </ButtonContainer>
    </Container>
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
  };
}) satisfies GetStaticProps;

export const getStaticPaths = (async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
}) satisfies GetStaticPaths;
