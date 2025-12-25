import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [UserModule],
    providers: [MembershipService],
    exports: [MembershipService],
})
export class MembershipModule {}
