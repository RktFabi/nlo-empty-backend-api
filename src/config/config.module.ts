// src/config/config.module.ts
import { Global, Module } from '@nestjs/common';
import { CustomConfigService } from './config.service';

@Global()
@Module({
  providers: [CustomConfigService],
  exports: [CustomConfigService],
})
export class ConfigModule {}
