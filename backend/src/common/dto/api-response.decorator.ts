import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';
import { ResponseDto } from './response.dto';

export const ApiCustomResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: { isArray?: boolean },
) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: options?.isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  }
                : {
                    type: 'object',
                    $ref: getSchemaPath(model),
                  },
            },
          },
        ],
      },
    }),
  );
};
