export interface RequestInterface extends Request {
  fingerprint: {
    hash: string;
  };
}
