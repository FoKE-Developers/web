import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import 'swagger-ui-react/swagger-ui.css';
import axios from 'axios';
import SwaggerUI from 'swagger-ui-react';

const Docs = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <SwaggerUI
      deepLinking
      persistAuthorization
      spec={spec}
      defaultModelRendering="model"
    />
  );
};

export const getStaticProps = (async () => {
  const spec = (await axios.get<object>('http://0.0.0.0:80/api/openapi.json'))
    .data;

  return {
    props: { spec },
    revalidate: 60, // seconds
  };
}) satisfies GetStaticProps;

export default Docs;
