import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import 'swagger-ui-react/swagger-ui.css';
import axios from 'axios';
import SwaggerUI from 'swagger-ui-react';

const Docs = ({
  spec,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <SwaggerUI
      deepLinking
      persistAuthorization
      spec={spec}
      defaultModelRendering="model"
    />
  );
};

export const getServerSideProps = (async () => {
  const spec = (await axios.get<object>('http://0.0.0.0:80/api/openapi.json'))
    .data;

  return {
    props: { spec },
  };
}) satisfies GetServerSideProps;

export default Docs;
