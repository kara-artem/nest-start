import { SetMetadata } from '@nestjs/common';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';

export const AllowUnauthorizedRequest = (): CustomDecorator => SetMetadata('allowUnauthorizedRequest', true);
