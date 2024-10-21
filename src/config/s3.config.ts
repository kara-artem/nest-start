import { S3 } from 'aws-sdk';

import { environment } from '../shared/environment';

export const s3Config = (): S3 => {
  const {
    s3: { accessKeyId, secretAccessKey, region, endpoint },
  } = environment;
  return new S3({
    accessKeyId,
    secretAccessKey,
    region,
    endpoint,
  });
};
