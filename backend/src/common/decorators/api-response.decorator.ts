import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  getSchemaPath,
  ApiExtraModels,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

const createSchema = (model: Type<any>, isArray: boolean) => ({
  allOf: [
    { $ref: getSchemaPath(ResponseDto) },
    {
      properties: {
        data: isArray
          ? { type: 'array', items: { $ref: getSchemaPath(model) } }
          : { $ref: getSchemaPath(model) },
      },
    },
  ],
});

// 2. Decorator for 200 OK
export const ApiOkCustomResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray: boolean = false,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiOkResponse({ schema: createSchema(model, isArray) }),
  );
};

// 3. Decorator for 201 Created
export const ApiCreatedCustomResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray: boolean = false,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiCreatedResponse({ schema: createSchema(model, isArray) }),
  );
};
