import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next';
import styled from '@emotion/styled';
import Image from 'next/image';

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

const List = styled.ul({
  display: 'grid',
  width: '90%',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: 'auto auto',
  gap: 16,
});

const StyledImage = styled(Image)({
  width: '100%',
  height: 'auto',
});

const HelpMessage = styled.span({
  fontSize: 14,
  color: 'white',
  marginTop: 16,
});

const urlPrefix = 'https://kr.object.ncloudstorage.com/4cuts';

export default function DownloadPage({
  paths,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      <HelpMessage>이미지를 길게 눌러서 저장하세요</HelpMessage>
      <List>
        {paths?.map((path, index) => (
          <StyledImage
            key={index}
            src={`${urlPrefix}${path}`}
            alt="img"
            width={100}
            height={100}
          />
        ))}
      </List>
    </Container>
  );
}

export const getStaticProps = (async ({ params }) => {
  const { paths } = params ?? {};

  if (typeof paths !== 'string') {
    return {
      props: {},
    };
  }
  const parsedPaths = atob(paths).split(',');

  return {
    props: {
      paths: parsedPaths,
    },
  };
}) satisfies GetStaticProps;

export const getStaticPaths = (async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
}) satisfies GetStaticPaths;
