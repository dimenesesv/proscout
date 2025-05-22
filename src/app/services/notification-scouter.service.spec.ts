import { TestBed } from '@angular/core/testing';

import { NotificationScouterService } from './notification-scouter.service';

describe('NotificationScouterService', () => {
  let service: NotificationScouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationScouterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
