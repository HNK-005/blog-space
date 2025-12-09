import { Transform, TransformFnParams } from 'class-transformer';

export default class EntityDocumentHelper {
  @Transform(
    (params: TransformFnParams) => {
      if ('value' in params) {
        return params.obj[params.key].toString();
      }
      return 'unknown value';
    },
    { toPlainOnly: true },
  )
  public _id: string;
}
