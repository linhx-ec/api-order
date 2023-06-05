import { InjectableOptions, Injectable } from '@nestjs/common';
import { SERVICE_WATERMARK } from './constants';
import { overrideTransactionalMethods } from './transactional';

export function Service(options?: InjectableOptions) {
  const injectableFn = Injectable(options);
  return function (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Function,
  ) {
    Reflect.defineMetadata(SERVICE_WATERMARK, true, target);
    overrideTransactionalMethods(target);
    injectableFn(target);
  };
}
