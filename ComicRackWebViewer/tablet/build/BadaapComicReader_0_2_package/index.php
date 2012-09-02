<?php
/*
  This file is part of Badaap Comic Reader.
  
  Copyright (c) 2012 Jeroen Walter
  
  Badaap Comic Reader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Badaap Comic Reader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Badaap Comic Reader.  If not, see <http://www.gnu.org/licenses/>.
*/
  

session_start();
require_once(dirname(__FILE__)."/users.php");

$SimpleUsers = new SimpleUsers();

if( !$SimpleUsers->logged_in )
{
  header("Location: login.php");
  exit;
}

require_once("comics.php"); 
?>
<!DOCTYPE HTML>
<html manifest="" lang="en-US">
<html>
<head>
<!--
<script type="text/javascript" src="https://getfirebug.com/firebug-lite.js">
{
    overrideConsole: true,
    startInNewWindow: false,
    startOpened: true,
    enableTrace: true
}
</script>
-->
    <title>Badaap Comic Reader</title>
    
    <meta charset="utf-8">
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="-1">    
    
    
    <!-- The line below must be kept intact for Sencha Command to build your application -->
    <script type="text/javascript">(function(h){function f(c,d){document.write('<meta name="'+c+'" content="'+d+'">')}if("undefined"===typeof g)var g=h.Ext={};g.blink=function(c){var d=c.js||[],c=c.css||[],b,e,a;f("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no");f("apple-mobile-web-app-capable","yes");f("apple-touch-fullscreen","yes");for(b=0,e=c.length;b<e;b++)a=c[b],"string"!=typeof a&&(a=a.path),document.write('<link rel="stylesheet" href="'+a+'">');for(b=0,e=d.length;b<
e;b++)a=d[b],"string"!=typeof a&&(a=a.path),document.write('<script src="'+a+'"><\/script>')}})(this);
;Ext.blink({"id":"a448a190-b304-11e1-a112-1564ffe4994a","js":[{"path":"sdk/sencha-touch.js","type":"js"},{"path":"bootstrap.js","update":"delta","type":"js"},{"path":"lib/add2home/add2home.js","update":"full","type":"js"},{"path":"lib/sprintf-0.7-beta1.js","update":"full","type":"js"},{"path":"lib/strnatcasecmp.js","update":"full","type":"js"},{"path":"lib/strncmp.js","update":"full","type":"js"},{"path":"lib/jmq.js","update":"full","type":"js"},{"path":"app.js","bundle":true,"update":"full","type":"js"}],"css":[{"path":"resources/css/app.css","update":"delta","type":"css"},{"path":"resources/css/comic.css","update":"delta","type":"css"},{"path":"lib/ux/IconSpinner.css","update":"delta","type":"css"},{"path":"lib/ux/IOS5Toggle.css","update":"delta","type":"css"},{"path":"lib/add2home/add2home.css","update":"delta","type":"css"}]})</script>        

    
</head>
<body>
  <div id="appLoadingIndicator">
    <div></div>
    <div></div>
    <div></div>
  </div>
</body>
</html>