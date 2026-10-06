/* =========================================================
   GRIDLINE EMPIRE 1.1
   BUILD 25 - LIVE GRID OPERATING MODES V1
   ========================================================= */

(function(){

 if(window.GE25_OPERATING_MODES_ACTIVE)return;
 window.GE25_OPERATING_MODES_ACTIVE=true;

 const MODE_KEY="GRIDLINE_11_OPERATING_MODE";

 const MODES={
  reserve:{
   id:"reserve",
   label:"RESERVE",
   outputMult:0.90,
   saleMult:1.00,
   reserveDelta:15,
   fleetDelta:5,
   description:"Grid protection • -10% output • stronger reserve"
  },

  balanced:{
   id:"balanced",
   label:"BALANCED",
   outputMult:1.00,
   saleMult:1.00,
   reserveDelta:0,
   fleetDelta:0,
   description:"Normal operations • balanced output and reserve"
  },

  peak:{
   id:"peak",
   label:"PEAK PUSH",
   outputMult:1.15,
   saleMult:1.05,
   reserveDelta:-15,
   fleetDelta:-8,
   description:"Maximum dispatch • +15% output • +5% sale value • higher strain"
  }
 };

 function normalizeMode(v){
  return MODES[v] ? v : "balanced";
 }

 function loadMode(){
  try{
   return normalizeMode(
    localStorage.getItem(MODE_KEY)
   );
  }catch(e){
   return "balanced";
  }
 }

 let currentMode=loadMode();

 function config(){
  return MODES[currentMode] || MODES.balanced;
 }

 function clamp(v,min,max){
  return Math.max(min,Math.min(max,v));
 }

 function saveMode(){
  try{
   localStorage.setItem(
    MODE_KEY,
    currentMode
   );
  }catch(e){}
 }

 /* ---------------------------------------------------------
    ECONOMY / LIVE GRID WRAPPERS
    --------------------------------------------------------- */

 function wrapOutput(){

  if(
   typeof window.output!=="function" ||
   window.output.__ge25OperatingModeWrapped
  ){
   return;
  }

  const base=window.output;

  const wrapped=function(){
   const original=
    Number(base.apply(this,arguments))||0;

   return original*config().outputMult;
  };

  wrapped.__ge25OperatingModeWrapped=true;
  wrapped.__ge25OperatingModeBase=base;

  window.output=wrapped;
 }

 function wrapSaleMultiplier(){

  if(
   typeof window.safeSaleMultiplier!=="function" ||
   window.safeSaleMultiplier.__ge25OperatingModeWrapped
  ){
   return;
  }

  const base=window.safeSaleMultiplier;

  const wrapped=function(){
   const original=
    Number(base.apply(this,arguments))||1;

   return original*config().saleMult;
  };

  wrapped.__ge25OperatingModeWrapped=true;
  wrapped.__ge25OperatingModeBase=base;

  window.safeSaleMultiplier=wrapped;
 }

 function wrapReserveMargin(){

  if(
   typeof window.b10ReserveMargin!=="function" ||
   window.b10ReserveMargin.__ge25OperatingModeWrapped
  ){
   return;
  }

  const base=window.b10ReserveMargin;

  const wrapped=function(){
   const original=
    Number(base.apply(this,arguments))||0;

   return clamp(
    original+config().reserveDelta,
    0,
    100
   );
  };

  wrapped.__ge25OperatingModeWrapped=true;
  wrapped.__ge25OperatingModeBase=base;

  window.b10ReserveMargin=wrapped;
 }

 function wrapFleetHealth(){

  if(
   typeof window.b10FleetHealth!=="function" ||
   window.b10FleetHealth.__ge25OperatingModeWrapped
  ){
   return;
  }

  const base=window.b10FleetHealth;

  const wrapped=function(){
   const original=
    Number(base.apply(this,arguments))||0;

   return clamp(
    original+config().fleetDelta,
    0,
    100
   );
  };

  wrapped.__ge25OperatingModeWrapped=true;
  wrapped.__ge25OperatingModeBase=base;

  window.b10FleetHealth=wrapped;
 }

 function installWrappers(){
  wrapOutput();
  wrapSaleMultiplier();
  wrapReserveMargin();
  wrapFleetHealth();
 }

 /* ---------------------------------------------------------
    USER INTERFACE
    --------------------------------------------------------- */

 function modeButton(mode){
  return `
   <button
    type="button"
    class="ge25-mode-btn"
    data-mode="${mode.id}"
    onclick="window.GE25SetOperatingMode('${mode.id}')"
   >
    ${mode.label}
   </button>
  `;
 }

 function ensureUI(){

  const deck=
   document.getElementById("b10CommandDeck");

  if(!deck)return;

  if(
   document.getElementById("ge25OperatingModes")
  ){
   updateUI();
   return;
  }

  const panel=
   document.createElement("div");

  panel.id="ge25OperatingModes";
  panel.className="ge25-operating-modes";

  panel.innerHTML=`
   <div class="ge25-mode-head">

    <div>
     <small>GRID CONTROL</small>
     <strong>OPERATING MODE</strong>
    </div>

    <span id="ge25ModeStatus">
     BALANCED
    </span>

   </div>

   <div class="ge25-mode-buttons">

    ${modeButton(MODES.reserve)}
    ${modeButton(MODES.balanced)}
    ${modeButton(MODES.peak)}

   </div>

   <div
    id="ge25ModeDescription"
    class="ge25-mode-description"
   ></div>
  `;

  const liveGrid=
   deck.querySelector(".b10-live-grid");

  if(liveGrid){
   liveGrid.insertAdjacentElement(
    "afterend",
    panel
   );
  }else{
   deck.appendChild(panel);
  }

  updateUI();
 }

 function updateUI(){

  const c=config();

  document
   .querySelectorAll(".ge25-mode-btn")
   .forEach(btn=>{

    btn.classList.toggle(
     "active",
     btn.dataset.mode===currentMode
    );

   });

  const status=
   document.getElementById(
    "ge25ModeStatus"
   );

  if(status){
   status.textContent=c.label;
  }

  const desc=
   document.getElementById(
    "ge25ModeDescription"
   );

  if(desc){
   desc.textContent=c.description;
  }
 }

 function refreshGame(){

  try{
   if(
    typeof window.renderB10CommandDeck==="function"
   ){
    window.renderB10CommandDeck();
   }
  }catch(e){}

  try{
   if(typeof window.render==="function"){
    window.render();
   }
  }catch(e){}

  setTimeout(()=>{
   ensureUI();
   updateUI();
  },0);
 }

 window.GE25SetOperatingMode=function(mode){

  mode=normalizeMode(mode);

  if(mode===currentMode){
   return;
  }

  currentMode=mode;
  saveMode();

  const c=config();

  if(typeof window.feedback==="function"){
   try{
    window.feedback("big");
   }catch(e){}
  }

  if(typeof window.toast==="function"){
   try{
    window.toast(
     "Operating Mode: "+c.label
    );
   }catch(e){}
  }

  refreshGame();
 };

 window.GE25GetOperatingMode=function(){
  return currentMode;
 };

 window.GE25GetOperatingModeConfig=function(){
  return Object.assign({},config());
 };

 /* ---------------------------------------------------------
    BOOT
    --------------------------------------------------------- */

 function boot(){
  installWrappers();
  ensureUI();
  updateUI();

  /*
   Re-check because other Build 25 modules may redraw
   the control room during play.
  */
  setInterval(()=>{
   installWrappers();
   ensureUI();
  },1500);

  console.log(
   "Gridline Empire Build 25 Operating Modes V1 loaded.",
   currentMode
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
