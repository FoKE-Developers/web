import {
  GetServerSideProps,
  GetStaticPaths,
  GetStaticProps,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
} from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { api } from '~/utils/api';
import { formatDistanceToNow } from 'date-fns';
import styled from '@emotion/styled';
import Link from 'next/link';

const Container = styled('div')({
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '1rem',
});

const Title = styled('h1')({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
});

const Grid = styled('div')({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gridTemplate: 'masonry',
});

const FileCard = styled('div')({
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '400px',
  width: '150px',
});

const BrowsePage = ({
  userId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: filesData } = api.s3.listUserFiles.useQuery(
    { userId },
    { enabled: userId !== undefined }
  );

  return (
    <Container>
      <Title>My Files</Title>
      <Grid>
        {filesData?.files.map((file) => (
          <Link href={file.downloadUrl} key={file.url}>
            <FileCard>
              <img
                loading="lazy"
                src={file.url}
                alt="file"
                style={{ width: '100%' }}
              />
              <p className="text-sm text-gray-500">
                {file.lastModified &&
                  formatDistanceToNow(new Date(file.lastModified))}{' '}
                ago
              </p>
            </FileCard>
          </Link>
        ))}
        {filesData?.files.length === 0 && (
          <div className="text-center text-gray-500">No files found</div>
        )}
      </Grid>
    </Container>
  );
};

export const getStaticProps = (async ({ params }) => {
  const userId = params!.userId as string;

  return {
    props: {
      userId,
    },
  };
}) satisfies GetStaticProps;

export const getStaticPaths = (async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
}) satisfies GetStaticPaths;

export default BrowsePage;
