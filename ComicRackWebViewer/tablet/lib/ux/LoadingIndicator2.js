indicator using png file:

@-webkit-keyframes rotate {
  from {
    -webkit-transform: rotate(0deg);
  }
  to { 
    -webkit-transform: rotate(360deg);
  }
}
#loadingIndicator
{
  -webkit-animation-name:             rotate; 
  -webkit-animation-duration: 1.5s;
  -webkit-animation-timing-function: linear;
  -webkit-animation-delay: 0;
  -webkit-animation-iteration-count: infinite;
}


{
        xtype: 'image',
        itemId: 'loadingIndicator',
   --> css id     id: 'loadingIndicator',
        left: '10px',
        top: '60px',
        
        src: 'resources/images/loading.png',
        
        width: 64,
        height: 64,
        hidden: true,   
      }