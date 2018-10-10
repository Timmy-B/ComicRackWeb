/* 
    bug fix for not-working scrollTo in infinite list in 2.3.1
    http://www.sencha.com/forum/showthread.php?274100-Infinite-scrolling-list-does-not-scroll-to-top-on-refresh

    TODO: check if next ST update has this fixed....
*/


Ext.define('Comic.ScrollToTopOnRefreshFix', {
  override: 'Ext.dataview.List',
  config: { scrollToTopOnRefresh: false },
  
  doRefresh: function ()
  {
    var me = this,
        scrollToTopOnRefresh = me.getScrollToTopOnRefresh();

    // call base doRefresh first in order to update the itemMap in case the list is infinite and grouped....
    me.callParent(arguments);
    
    if (scrollToTopOnRefresh)
    {
      me.getScrollable().getScroller().scrollTo(0, 0.01, false);
      me.callParent(arguments);
    }
  }
});

