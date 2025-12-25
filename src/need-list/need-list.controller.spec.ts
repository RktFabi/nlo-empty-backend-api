import { Test, TestingModule } from '@nestjs/testing';
import { NeedListController } from './need-list.controller';
import { NeedListService } from './need-list.service';
import { create_testing_module } from '../create_testing_module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../common/guards/auth.guard';

describe('NeedListController', () => {
  let controller: NeedListController;

  const mockNeedListService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };
  const mockAuthGuard = { canActivate: jest.fn(() => true) };
  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   controllers: [NeedListController],
    //   providers: [
    //     { provide: NeedListService, useValue: mockNeedListService },
    //   ],
    // }).compile();
    
    const module: TestingModule = await create_testing_module({controllers: [NeedListController]});

    controller = module.get<NeedListController>(NeedListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
