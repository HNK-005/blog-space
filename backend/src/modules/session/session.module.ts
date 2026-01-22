import {
  // common
  Module,
} from '@nestjs/common';

import { SessionService } from './session.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema, SessionSchemaClass } from './entities/session.schema';
import { SessionRepository } from './session.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SessionSchemaClass.name, schema: SessionSchema },
    ]),
  ],
  providers: [SessionService, SessionRepository],
  exports: [SessionService, SessionRepository],
})
export class SessionModule {}
