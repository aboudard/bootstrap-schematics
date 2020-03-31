import { TestBed } from '@angular/core/testing';
import { UtilsService } from './utils.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import Spy = jasmine.Spy;

describe('UtilsService', () => {

  let service: UtilsService;
  let faIconLibrary: FaIconLibrary;
  let utilsSpy: Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FaIconLibrary,
        UtilsService
      ]
    });
    service = TestBed.get(UtilsService);
    faIconLibrary = TestBed.get(FaIconLibrary);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call #initFaIcons', () => {
    utilsSpy = spyOn(faIconLibrary , 'addIcons').and.callThrough();
    service.initFaIcons();
    expect(utilsSpy).toHaveBeenCalled();
  });

});
