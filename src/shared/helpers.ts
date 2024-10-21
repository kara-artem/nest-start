import * as crypto from 'crypto';

import { environment } from './environment';

export const getFrontendUrl = (options: { pathname: string; params?: Record<string, any> }): string => {
  const params = options.params && new URLSearchParams(options.params).toString();
  return environment.app.frontendUrl + options.pathname + (params ? `?${params}` : '');
};

export const generateHash = (length = 40): string => crypto.randomBytes(length).toString('hex');

export const getRandomNumInRange = (min = 100_000, max = 1_000_000): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
