import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data, cxc: ExecutionContext) => {
    const req = cxc.switchToHttp().getRequest();
    return req.rawHeaders;
  },
);
