/* 
    bug fix for not-working scrollTo in infinite list in 2.3.1
    http://www.sencha.com/forum/showthread.php?274100-Infinite-scrolling-list-does-not-scroll-to-top-on-refresh

    TODO: check if next ST update has this fixed....
*/


Ext.define('Comic.ScrollToTopOnRefreshFix', {
  override: 'Ext.dataview.List',
  scrollToTopOnRefresh: false,

  doRefresh: function ()
  {
    this.getScrollable().getScroller().scrollTo(0, 0.01, false);
    this.callParent(arguments);
  }
});

