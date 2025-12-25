import { Module } from '@nestjs/common';
import { NeedListController } from './need-list.controller';
import { NeedListService } from './need-list.service';
// import { AuthModule } from '../auth/auth.module';
// import { UserModule } from '../user/user.module';

@Module({
  imports: [/* AuthModule, UserModule */],
  controllers: [NeedListController],
  providers: [NeedListService]
})
export class NeedListModule { }
