import { TestBed } from '@angular/core/testing';

import { NagivationService } from './nagivation.service';

describe('NagivationService', () => {
  let service: NagivationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NagivationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
