// api/index.ts
import { Handler } from 'express';
import { bootstrap } from '../src/main';

const handler: Handler = async (req, res) => {
  const server = await bootstrap();
  server(req, res);
};

export default handler;
