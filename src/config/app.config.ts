import { registerAs } from '@nestjs/config'
import * as process from 'process';
export default registerAs('Configuration', () => {
  return {
    database: {
      pass: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      synchronize: process.env.DB_SYNCHRONIZE === 'TRUE',
    },
    app: {
      host: process.env.HOST_API,
      port: process.env.HOST_PORT,
    }
  };
});
