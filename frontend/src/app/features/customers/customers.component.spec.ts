import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomersComponent } from './customers.component';
import { CustomersService } from './customers.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;
  let customersServiceSpy: jasmine.SpyObj<CustomersService>;

  beforeEach(async () => {
    customersServiceSpy = jasmine.createSpyObj('CustomersService', [
      'getAll',
      'create',
      'update',
      'delete',
    ]);
    customersServiceSpy.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CustomersComponent, RouterTestingModule],
      providers: [
        { provide: CustomersService, useValue: customersServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers on init', () => {
    component.ngOnInit();
    expect(customersServiceSpy.getAll).toHaveBeenCalled();
  });
});
