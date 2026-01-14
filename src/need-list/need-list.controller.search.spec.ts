import { Test, TestingModule } from '@nestjs/testing';
import { NeedListController } from './need-list.controller';
import { NeedListService } from './need-list.service';

describe('NeedListController (search)', () => {
  let controller: NeedListController;

  const mockNeedListService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NeedListController],
      providers: [{ provide: NeedListService, useValue: mockNeedListService }],
    }).compile();

    controller = module.get<NeedListController>(NeedListController);
    mockNeedListService.findAll.mockReset();
  });

  it('passes name query param to service', async () => {
    mockNeedListService.findAll.mockResolvedValue([]);

    await controller.findAll('created_at:desc', undefined, 10, 'Food');

    expect(mockNeedListService.findAll).toHaveBeenCalledWith('created_at:desc', undefined, 10, 'Food');
  });
});

