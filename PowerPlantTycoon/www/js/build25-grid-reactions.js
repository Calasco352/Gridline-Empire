/* =========================================================
   GRIDLINE EMPIRE 1.1
   BUILD 25 - LIVE GRID CONTROL ROOM REACTIONS
   ========================================================= */

(function(){

 if(window.GE25_GRID_REACTIONS_ACTIVE)return;
 window.GE25_GRID_REACTIONS_ACTIVE=true;

 function operatingMode(){
  try{
   if(typeof window.GE25GetOperatingMode==="function"){
    return window.GE25GetOperatingMode();
   }
  }catch(e){}

  return "balanced";
 }

 function alertState(){
  const el=document.getElementById("b10AlertState");

  return (
   el?.textContent ||
   "NORMAL"
  )
  .trim()
  .toUpperCase();
 }

 function ensureReactionBar(){

  const deck=document.getElementById("b10CommandDeck");

  if(!deck)return null;

  let bar=document.getElementById(
   "ge25GridReactionBar"
  );

  if(bar)return bar;

  bar=document.createElement("div");
  bar.id="ge25GridReactionBar";
  bar.className="ge25-grid-reaction";

  const modes=
   document.getElementById("ge25OperatingModes");

  if(modes){
   modes.insertAdjacentElement(
    "afterend",
    bar
   );
  }else{
   deck.appendChild(bar);
  }

  return bar;
 }

 function reactionText(mode,alert){

  if(alert.includes("CRITICAL")){
   return "⚠ CRITICAL GRID CONDITION — stabilize reserve and fleet immediately";
  }

  if(alert.includes("PEAK")){
   return "⚡ PEAK LOAD — grid operating near maximum dispatch";
  }

  if(alert.includes("ELEVATED")){
   return "▲ ELEVATED LOAD — reserve margin tightening";
  }

  if(mode==="peak"){
   return "⚡ PEAK PUSH ACTIVE — higher output and revenue with increased grid strain";
  }

  if(mode==="reserve"){
   return "🛡 RESERVE PROTECTION — capacity held back to strengthen grid stability";
  }

  return "● BALANCED DISPATCH — grid operating within normal parameters";
 }

 function update(){

  const deck=document.getElementById("b10CommandDeck");

  if(!deck)return;

  const mode=operatingMode();
  const alert=alertState();

  deck.classList.remove(
   "ge25-grid-reserve",
   "ge25-grid-balanced",
   "ge25-grid-peak",
   "ge25-grid-elevated",
   "ge25-grid-critical"
  );

  deck.classList.add(
   mode==="reserve"
    ? "ge25-grid-reserve"
    : mode==="peak"
     ? "ge25-grid-peak"
     : "ge25-grid-balanced"
  );

  if(alert.includes("CRITICAL")){
   deck.classList.add("ge25-grid-critical");
  }
  else if(
   alert.includes("PEAK") ||
   alert.includes("ELEVATED")
  ){
   deck.classList.add("ge25-grid-elevated");
  }

  const bar=ensureReactionBar();

  if(!bar)return;

  const next=reactionText(mode,alert);

  if(bar.textContent!==next){
   bar.textContent=next;
  }
 }

 function boot(){
  update();

  setInterval(update,750);

  console.log(
   "Gridline Empire Build 25 Grid Reactions loaded."
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
