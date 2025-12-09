import { ConfigService } from '@nestjs/config';
import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AllConfigType } from '@/common/configs/config.type';

export default function setupSwagger(
  app: NestApplication,
  configService: ConfigService<AllConfigType>,
): { docPrefix: string } {
  const docName: string = `${configService.getOrThrow('app.name', { infer: true })} APIs Specification`;
  const docDesc: string = 'Section for describe whole APIs';
  const docVersion: string = configService
    .getOrThrow('app.version', { infer: true })
    .toString();
  const docPrefix: string = '/docs';

  const documentBuild = new DocumentBuilder()
    .setTitle(docName)
    .setDescription(docDesc)
    .setVersion(docVersion)
    .addServer('/')
    .addCookieAuth('accessToken')
    .addCookieAuth('refreshToken')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'xApiKey')
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });

  writeFileSync('swagger.json', JSON.stringify(document));
  SwaggerModule.setup(docPrefix, app, document, {
    jsonDocumentUrl: `${docPrefix}/json`,
    yamlDocumentUrl: `${docPrefix}/yaml`,
    explorer: true,
    customSiteTitle: docName,
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
      deepLinking: true,
    },
  });

  return { docPrefix };
}
