import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { create_testing_module } from '../create_testing_module';

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await create_testing_module({ providers: [FirebaseService]});

    service = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
