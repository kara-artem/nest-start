export const S3_SYMBOLS_REGEX = /^[0-9A-Za-z.\-_*'()!%]+$/;

export const PATHS_AND_PREFIXES = [
  { path: '/confirm-email/', redisPrefix: 'email_confirm:' },
  { path: '/reset-password/', redisPrefix: 'reset_password:' },
];
