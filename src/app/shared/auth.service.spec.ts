import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {DefaultService} from 'eisenstecken-openapi-angular-library';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject<DefaultService>(DefaultService);
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
