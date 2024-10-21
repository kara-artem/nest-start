export enum UploadTypeEnum {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export type UploadTypeKey = keyof typeof UploadTypeEnum;
