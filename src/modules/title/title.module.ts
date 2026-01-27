import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TitleService } from './title.service';
import { TitleResolver } from './title.resolver';
import { Title } from '../../typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Title])],
  providers: [TitleResolver, TitleService],
  exports: [TitleService],
})
export class TitleModule {}
