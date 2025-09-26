import type {
  GetServerSideProps,
  InferGetServerSidePropsType
} from 'next';
import { useState, useEffect, useCallback } from 'react';
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
  login,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [token, setToken] = useState<string | null>(null);
  const utils = api.useContext();

  const { data: currentUser } = api.account.getCurrentUser.useQuery(undefined, {
    enabled: !!token,
  });

  const signInMutation = api.account.signIn.useMutation({
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      void utils.s3.listUserFiles.invalidate();
    },
  });

  const { data: filesData } = api.s3.listUserFiles.useQuery(
    undefined,
    { enabled: !!token }
  );

  const handleLogin = useCallback(async () => {
    const email = window.prompt('Email:');
    if (!email) return;

    const password = window.prompt('Password:');
    if (!password) return;

    void signInMutation.mutate({ email, password });
  }, [signInMutation]);

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && !login) {
      setToken(storedToken);
    } else if (!signInMutation.isSuccess && !signInMutation.isPending && !signInMutation.error) {
      void handleLogin();
    }
  }, [currentUser, login, handleLogin, signInMutation]);

  if (signInMutation.error) {
    return (
      <Container>
        <Title>Access Denied</Title>
        <div className="text-center text-red-500">
          Login failed. Please refresh to try again.
        </div>
      </Container>
    );
  }

  if (!token || !currentUser) {
    return (
      <Container>
        <Title>Waiting for authentication...</Title>
        <div className="text-center text-red-500">
          Please refresh this page if nothing happens.
        </div>
      </Container>
    );
  }

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

export const getServerSideProps = (async ({ query }) => {
  const login = query?.login ?? null;

  return {
    props: {
      login,
    },
  };
}) satisfies GetServerSideProps;

export default BrowsePage;
