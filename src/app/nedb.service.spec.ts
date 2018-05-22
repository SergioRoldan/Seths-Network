import { TestBed, inject } from '@angular/core/testing';

import { NedbService } from './nedb.service';

describe('NedbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NedbService]
    });
  });

  it('should be created', inject([NedbService], (service: NedbService) => {
    expect(service).toBeTruthy();
  }));
});
