import { Module, Global } from "@nestjs/common";
import { firebaseProviders } from "./firebase.providers";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [...firebaseProviders, ConfigService],
  exports: [...firebaseProviders],
})
export class FirebaseModule {}
