import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';

import { StatusCodeResponse } from '../interfaces/status.code.response.interface';

export const StatusCode = (statusCode: HttpStatus, message?: string): MethodDecorator =>
  applyDecorators(
    (<T, R>(
      _target: T,
      _propertyKey: keyof T,
      descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<R>>,
    ) => {
      const originalMethod = descriptor.value;

      if (originalMethod) {
        descriptor.value = new Proxy<(...args: unknown[]) => Promise<R>>(originalMethod, {
          apply: async (target, thisArg: unknown, argArray: unknown[]): Promise<StatusCodeResponse<R>> => {
            const response = await target.apply(thisArg, argArray);

            return {
              statusCode,
              message: [message] || null,
              response,
            };
          },
        });
      }
    }) as MethodDecorator,
    HttpCode(statusCode),
  );
