import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteRewardComponent } from './invite-reward.component';

describe('InviteRewardComponent', () => {
  let component: InviteRewardComponent;
  let fixture: ComponentFixture<InviteRewardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteRewardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteRewardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
