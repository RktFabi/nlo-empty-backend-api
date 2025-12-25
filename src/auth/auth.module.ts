import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from '../common/guards/auth.guard';
import { FirebaseModule } from '../firebase/firebase.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [FirebaseModule,
    forwardRef(() => UserModule),
//  UserModule
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard]
})


export class AuthModule { }
