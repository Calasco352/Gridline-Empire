/* =========================================================
   GRIDLINE EMPIRE 1.1
   BUILD 25 - MAJOR PROGRESSION AD TRIGGERS
   ========================================================= */

(function(){

 if(window.GE25_AD_TRIGGERS_ACTIVE)return;
 window.GE25_AD_TRIGGERS_ACTIVE=true;

 function adsSuppressed(){

  try{
   if(
    typeof g!=="undefined" &&
    g.adsRemoved
   ){
    return true;
   }
  }catch(e){}

  try{
   if(
    typeof window.vipActive==="function" &&
    window.vipActive()
   ){
    return true;
   }
  }catch(e){}

  return false;
 }

 function markOpportunity(){

  if(adsSuppressed())return;

  try{
   if(
    typeof g==="undefined" ||
    !g.adState
   ){
    return;
   }

   g.adState.pending=true;

   if(
    typeof window.tryShowPendingInterstitial==="function"
   ){
    window.tryShowPendingInterstitial();
   }

  }catch(e){
   console.warn(
    "Gridline progression ad trigger failed.",
    e
   );
  }
 }

 function wrapBuildPlant(){

  if(
   typeof window.buildPlant!=="function" ||
   window.buildPlant.__ge25AdWrapped
  ){
   return;
  }

  const base=window.buildPlant;

  const wrapped=function(id){

   let beforeUnlocked=false;
   let beforeLevel=0;

   try{
    const state=g?.plants?.[id];

    beforeUnlocked=!!state?.unlocked;
    beforeLevel=Number(state?.level)||0;
   }catch(e){}

   const result=base.apply(this,arguments);

   let afterUnlocked=false;
   let afterLevel=0;

   try{
    const state=g?.plants?.[id];

    afterUnlocked=!!state?.unlocked;
    afterLevel=Number(state?.level)||0;
   }catch(e){}

   const commissioned=
    !beforeUnlocked &&
    afterUnlocked;

   const majorUpgrade=
    afterLevel>beforeLevel &&
    afterLevel>1 &&
    afterLevel%5===0;

   if(
    commissioned ||
    majorUpgrade
   ){
    markOpportunity();
   }

   return result;
  };

  wrapped.__ge25AdWrapped=true;
  wrapped.__ge25AdBase=base;

  window.buildPlant=wrapped;
 }

 function wrapBuyRegion(){

  if(
   typeof window.buyRegion!=="function" ||
   window.buyRegion.__ge25AdWrapped
  ){
   return;
  }

  const base=window.buyRegion;

  const wrapped=function(id){

   let before=false;

   try{
    before=!!g?.regions?.[id];
   }catch(e){}

   const result=base.apply(this,arguments);

   let after=false;

   try{
    after=!!g?.regions?.[id];
   }catch(e){}

   if(!before && after){
    markOpportunity();
   }

   return result;
  };

  wrapped.__ge25AdWrapped=true;
  wrapped.__ge25AdBase=base;

  window.buyRegion=wrapped;
 }

 function wrapBuyCorporate(){

  if(
   typeof window.buyCorporate!=="function" ||
   window.buyCorporate.__ge25AdWrapped
  ){
   return;
  }

  const base=window.buyCorporate;

  const wrapped=function(id){

   let before=0;

   try{
    before=
     Number(g?.corporate?.[id])||0;
   }catch(e){}

   const result=base.apply(this,arguments);

   let after=0;

   try{
    after=
     Number(g?.corporate?.[id])||0;
   }catch(e){}

   if(after>before){
    markOpportunity();
   }

   return result;
  };

  wrapped.__ge25AdWrapped=true;
  wrapped.__ge25AdBase=base;

  window.buyCorporate=wrapped;
 }

 function install(){

  wrapBuildPlant();
  wrapBuyRegion();
  wrapBuyCorporate();
 }

 function boot(){

  install();

  /*
   Retry briefly because the core game scripts may finish
   defining functions after this module is parsed.
  */
  const timer=setInterval(
   install,
   1500
  );

  setTimeout(
   ()=>clearInterval(timer),
   15000
  );

  console.log(
   "Gridline Empire Build 25 progression ad triggers loaded."
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
