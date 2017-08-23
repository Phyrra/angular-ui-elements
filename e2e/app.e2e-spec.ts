import { MasaDropdownPage } from './app.po';

describe('masa-dropdown App', () => {
  let page: MasaDropdownPage;

  beforeEach(() => {
    page = new MasaDropdownPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
