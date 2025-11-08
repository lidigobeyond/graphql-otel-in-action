import { Resolver } from '@nestjs/graphql';
import { TitleService } from './title.service';

@Resolver()
export class TitleResolver {
  constructor(private readonly titleService: TitleService) {}
}
