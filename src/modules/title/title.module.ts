import { Module } from '@nestjs/common';
import { TitleService } from './title.service';
import { TitleResolver } from './title.resolver';

@Module({
  providers: [TitleResolver, TitleService],
  exports: [TitleService],
})
export class TitleModule {}
