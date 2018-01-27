import { TheLazyCookPage } from './app.po';

describe('the-lazy-cook App', () => {
  let page: TheLazyCookPage;

  beforeEach(() => {
    page = new TheLazyCookPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
