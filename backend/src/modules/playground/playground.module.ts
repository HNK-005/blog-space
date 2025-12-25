import { Module } from '@nestjs/common';
import { PlaygroundService } from './playground.service';
import { PlaygroundController } from './playground.controller';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    // import modules, etc.
    MailerModule,
  ],
  controllers: [PlaygroundController],
  providers: [PlaygroundService],
})
export class PlaygroundModule {}
