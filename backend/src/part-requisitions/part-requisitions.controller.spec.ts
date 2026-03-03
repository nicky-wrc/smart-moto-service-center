import { Test, TestingModule } from '@nestjs/testing';
import { PartRequisitionsController } from './part-requisitions.controller';

describe('PartRequisitionsController', () => {
  let controller: PartRequisitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartRequisitionsController],
    }).compile();

    controller = module.get<PartRequisitionsController>(PartRequisitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
