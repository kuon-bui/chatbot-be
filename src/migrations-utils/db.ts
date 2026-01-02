import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config();

const MONGO_URL = process.env.MONGODB_URI || '';

export const getDb = async () => {
  console.log(process.env);
  const client: any = await MongoClient.connect(MONGO_URL, {});
  return client.db();
};
