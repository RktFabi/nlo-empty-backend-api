import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! ==> NLO API Service is running ! ✊✊✊';
  }
}
