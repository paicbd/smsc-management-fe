import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SipGatewaysComponent } from './sip-gateways.component';

describe('SipGatewaysComponent', () => {
  let component: SipGatewaysComponent;
  let fixture: ComponentFixture<SipGatewaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SipGatewaysComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SipGatewaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
