export interface GetJwtConfigInterface {
  secret: string;
  signOptions: {
    expiresIn: string;
  };
}
