import { Test, TestingModule } from '@nestjs/testing';
import { PartRequisitionsService } from './part-requisitions.service';

describe('PartRequisitionsService', () => {
  let service: PartRequisitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartRequisitionsService],
    }).compile();

    service = module.get<PartRequisitionsService>(PartRequisitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
