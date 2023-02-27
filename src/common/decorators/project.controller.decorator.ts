import { applyDecorators, Controller, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';

export function ProjectController(code: string): ClassDecorator {
  return applyDecorators(ApiTags(`${code}`), SetMetadata('code', code), UseGuards(JwtAuthGuard), Controller(`${code}`));
}
