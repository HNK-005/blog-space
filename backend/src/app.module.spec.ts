import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

describe('AppModule', () => {
  it('should be defined', async () => {
    dotenv.config({ path: '.env.test.local', override: true });

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const appModule = module.get<AppModule>(AppModule);

    expect(appModule).toBeDefined();
  });
});
