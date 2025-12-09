import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';

function generateErrors(
  errors: ValidationError[],
  parentPath = '',
): Record<string, string> {
  return errors.reduce((acc, error) => {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.children && error.children.length > 0) {
      return {
        ...acc,
        ...generateErrors(error.children, propertyPath),
      };
    }

    return {
      ...acc,
      [propertyPath]: Object.values(error.constraints || {})[0],
    };
  }, {});
}

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) => {
    return new UnprocessableEntityException({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: generateErrors(errors),
      message: 'Validation failed',
    });
  },
};

export default validationOptions;
