put this in a panel class:

<style>
#circularG{
position:relative;
width:64px;
height:64px}

.circularG{
position:absolute;
background-color:#3fb8ee;
width:15px;
height:15px;
-webkit-border-radius:10px;
-webkit-animation-name:bounce_circularG;
-webkit-animation-duration:1.04s;
-webkit-animation-iteration-count:infinite;
-webkit-animation-direction:linear;
}

#circularG_1{
left:0;
top:25px;
-webkit-animation-delay:0.39s;
}

#circularG_2{
left:7px;
top:7px;
-webkit-animation-delay:0.52s;
}

#circularG_3{
top:0;
left:25px;
-webkit-animation-delay:0.65s;
}

#circularG_4{
right:7px;
top:7px;
-webkit-animation-delay:0.78s;
}

#circularG_5{
right:0;
top:25px;
-webkit-animation-delay:0.9099999999999999s;
}

#circularG_6{
right:7px;
bottom:7px;
-webkit-animation-delay:1.04s;
}

#circularG_7{
left:25px;
bottom:0;
-webkit-animation-delay:1.1700000000000002s;
}

#circularG_8{
left:7px;
bottom:7px;
-webkit-animation-delay:1.3s;
}

@-webkit-keyframes bounce_circularG{
0%{
-webkit-transform:scale(1)}

100%{
-webkit-transform:scale(.3)}

}


</style>
<div id="circularG">
<div id="circularG_1" class="circularG">
</div>
<div id="circularG_2" class="circularG">
</div>
<div id="circularG_3" class="circularG">
</div>
<div id="circularG_4" class="circularG">
</div>
<div id="circularG_5" class="circularG">
</div>
<div id="circularG_6" class="circularG">
</div>
<div id="circularG_7" class="circularG">
</div>
<div id="circularG_8" class="circularG">
</div>
</div>
</div>
