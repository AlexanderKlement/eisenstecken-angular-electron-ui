import { TestBed } from '@angular/core/testing';

import { AccessGuard } from './access-guard.service';

describe('AccessGuard', () => {
  let guard: AccessGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AccessGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
