import { CompModule } from './comp.module';

describe('CompModule', () => {
  let compModule: CompModule;

  beforeEach(() => {
    compModule = new CompModule();
  });

  it('should create an instance', () => {
    expect(compModule).toBeTruthy();
  });
});
