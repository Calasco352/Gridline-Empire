/* =========================================================
   GRIDLINE EMPIRE 1.1
   BUILD 25 - VISUAL / MOTION UPGRADE V1
   ========================================================= */

(function(){

 if(window.GE25_VISUAL_MOTION_ACTIVE)return;
 window.GE25_VISUAL_MOTION_ACTIVE=true;

 const pulseTimers=new WeakMap();

 function pulse(el,className,duration){

  if(!el)return;

  const old=pulseTimers.get(el);

  if(old){
   clearTimeout(old);
  }

  el.classList.remove(className);

  /*
   Force restart of animation when player
   taps Generate repeatedly.
  */
  void el.offsetWidth;

  el.classList.add(className);

  const timer=setTimeout(()=>{
   try{
    el.classList.remove(className);
   }catch(e){}
  },duration);

  pulseTimers.set(el,timer);
 }

 function plant(){
  return document.querySelector(".plant-art");
 }

 function mode(){

  try{
   if(typeof window.GE25GetOperatingMode==="function"){
    return window.GE25GetOperatingMode();
   }
  }catch(e){}

  return "balanced";
 }

 function storedPower(){

  try{
   if(typeof g!=="undefined"){
    return Number(g.stored)||0;
   }
  }catch(e){}

  return 0;
 }

 function visible(el){

  if(!el)return false;

  try{
   const css=getComputedStyle(el);

   return (
    css.display!=="none" &&
    css.visibility!=="hidden" &&
    Number(css.opacity)!==0
   );
  }catch(e){
   return false;
  }
 }

 function breakdownActive(){

  const box=
   document.getElementById("eventBox");

  const title=
   document.getElementById("eventTitle");

  if(!box || !title || !visible(box)){
   return false;
  }

  return /breakdown|trip|failure|offline/i.test(
   title.textContent || ""
  );
 }

 function syncPlantState(){

  const body=document.body;

  if(!body)return;

  const m=mode();

  body.classList.remove(
   "ge25-visual-reserve",
   "ge25-visual-balanced",
   "ge25-visual-peak"
  );

  body.classList.add(
   m==="reserve"
    ? "ge25-visual-reserve"
    : m==="peak"
     ? "ge25-visual-peak"
     : "ge25-visual-balanced"
  );

  const p=plant();

  if(p){
   p.classList.toggle(
    "ge25-plant-breakdown",
    breakdownActive()
   );
  }
 }

 function generateEffect(){

  const p=plant();

  pulse(
   p,
   "ge25-plant-generate",
   600
  );

  pulse(
   document.getElementById("generate"),
   "ge25-generate-fired",
   420
  );

  const deck=
   document.getElementById(
    "b10CommandDeck"
   );

  pulse(
   deck,
   "ge25-grid-power-pulse",
   650
  );
 }

 function sellEffect(){

  const p=plant();

  pulse(
   p,
   "ge25-plant-discharge",
   700
  );

  pulse(
   document.getElementById("sellBtn"),
   "ge25-sell-fired",
   520
  );

  pulse(
   document.getElementById("cash"),
   "ge25-cash-impact",
   700
  );

  const deck=
   document.getElementById(
    "b10CommandDeck"
   );

  pulse(
   deck,
   "ge25-grid-sale-pulse",
   700
  );
 }

 /*
  Capture taps without replacing the game's
  existing onclick handlers.
 */
 document.addEventListener(
  "click",
  function(e){

   const target=e.target;

   if(
    !target ||
    typeof target.closest!=="function"
   ){
    return;
   }

   if(target.closest("#generate")){
    generateEffect();
    return;
   }

   if(
    target.closest("#sellBtn") &&
    storedPower()>0
   ){
    sellEffect();
   }

  },
  true
 );

 function boot(){

  syncPlantState();

  setInterval(
   syncPlantState,
   700
  );

  console.log(
   "Gridline Empire Build 25 Visual Motion V1 loaded."
  );
 }

 if(document.readyState==="loading"){

  document.addEventListener(
   "DOMContentLoaded",
   boot,
   {once:true}
  );

 }else{
  boot();
 }

})();
