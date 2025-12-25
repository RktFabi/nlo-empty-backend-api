import { Module, Global, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({

  imports: [FirebaseModule, 
     forwardRef(() => AuthModule),
  ],

  providers: [UserService],
  controllers: [UserController],
    exports: [UserService],
})
export class UserModule { }
