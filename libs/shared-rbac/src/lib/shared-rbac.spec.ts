import { sharedRbac } from './shared-rbac';

describe('sharedRbac', () => {
  it('should work', () => {
    expect(sharedRbac()).toEqual('shared-rbac');
  });
});
