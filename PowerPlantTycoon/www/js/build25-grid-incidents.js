/* =========================================================
   GRIDLINE EMPIRE 1.1
   BUILD 25 - MAIN GRID INCIDENTS V1
   ========================================================= */

(function(){

 if(window.GE25_GRID_INCIDENTS_ACTIVE)return;
 window.GE25_GRID_INCIDENTS_ACTIVE=true;

 const KEY="GRIDLINE_11_MAIN_GRID_INCIDENTS_V1";

 function gameState(){
  try{
   return typeof g!=="undefined" ? g : null;
  }catch(e){
   return null;
  }
 }

 function load(){
  try{
   const raw=localStorage.getItem(KEY);

   if(raw){
    return Object.assign({
     active:null,
     nextAt:0,
     resolved:0,
     lastMessage:"",
     lastMessageUntil:0
    },JSON.parse(raw));
   }
  }catch(e){}

  return {
   active:null,
   nextAt:0,
   resolved:0,
   lastMessage:"",
   lastMessageUntil:0
  };
 }

 let state=load();

 function save(){
  try{
   localStorage.setItem(
    KEY,
    JSON.stringify(state)
   );
  }catch(e){}
 }

 function currentMode(){
  try{
   if(typeof window.GE25GetOperatingMode==="function"){
    return window.GE25GetOperatingMode();
   }
  }catch(e){}

  return "balanced";
 }

 function modeLabel(){
  const mode=currentMode();

  if(mode==="reserve")return "RESERVE";
  if(mode==="peak")return "PEAK PUSH";

  return "BALANCED";
 }

 function rewardMult(){
  const mode=currentMode();

  if(mode==="reserve")return .90;
  if(mode==="peak")return 1.15;

  return 1;
 }

 function penaltyMult(){
  const mode=currentMode();

  if(mode==="reserve")return .85;
  if(mode==="peak")return 1.20;

  return 1;
 }

 function moneyText(v){
  try{
   if(typeof money==="function"){
    return money(v);
   }
  }catch(e){}

  return "$"+Math.round(v).toLocaleString();
 }

 function outputValue(){
  try{
   if(typeof output==="function"){
    return Math.max(1,Number(output())||1);
   }
  }catch(e){}

  return 1;
 }

 function saleValue(amount,bonus){

  let mult=1;

  try{
   if(typeof safeSaleMultiplier==="function"){
    mult*=Number(safeSaleMultiplier())||1;
   }
  }catch(e){}

  try{
   if(typeof marketSaleMult==="function"){
    mult*=Number(marketSaleMult())||1;
   }
  }catch(e){}

  const x=gameState();

  try{
   mult*=
    1+
    (
     Number(
      x?.research?.gridAI
     )||0
    )*.2;
  }catch(e){}

  return Math.max(
   0,
   amount*
   mult*
   bonus*
   rewardMult()
  );
 }

 function eligible(){

  const x=gameState();

  if(!x)return false;

  return (
   Number(x.lifetimeCash)||0
  )>=5000;
 }

 function randomMinutes(min,max){
  return (
   min+
   Math.random()*(max-min)
  )*60000;
 }

 function scheduleNormal(){

  state.nextAt=
   Date.now()+
   randomMinutes(4,7);

  save();
 }

 function scheduleSoon(){

  state.nextAt=
   Date.now()+
   randomMinutes(2,3);

  save();
 }

 const INCIDENTS=[

  {
   id:"demand",
   title:"⚡ EXTREME DEMAND SURGE",
   text:"Regional demand is climbing faster than forecast. Dispatch must decide how aggressively to support the grid.",
   choices:[
    ["dispatch","DISPATCH STORED POWER"],
    ["stabilize","STABILIZE OPERATIONS"],
    ["protect","PROTECT RESERVE"]
   ]
  },

  {
   id:"trip",
   title:"⚙ PEAKER UNIT TRIP",
   text:"A fast-start generating unit has unexpectedly dropped offline during active operations.",
   choices:[
    ["crew","SEND EMERGENCY CREW"],
    ["reroute","REROUTE POWER"],
    ["reserve","HOLD GRID RESERVE"]
   ]
  },

  {
   id:"transmission",
   title:"🔌 TRANSMISSION FAULT",
   text:"A regional transmission path is unstable and dispatch needs an immediate operating response.",
   choices:[
    ["import","BUY EMERGENCY CAPACITY"],
    ["isolate","ISOLATE THE LINE"],
    ["push","PUSH THROUGH"]
   ]
  },

  {
   id:"reserve",
   title:"⚠ RESERVE SHORTFALL",
   text:"Available reserve has tightened below the preferred operating margin.",
   choices:[
    ["capacity","SECURE CAPACITY"],
    ["curtail","CURTAIL OUTPUT"],
    ["ride","RIDE THROUGH"]
   ]
  }

 ];

 function createIncident(){

  if(state.active)return;

  const incident=
   INCIDENTS[
    Math.floor(
     Math.random()*INCIDENTS.length
    )
   ];

  state.active={
   id:incident.id,
   startedAt:Date.now()
  };

  state.nextAt=0;
  save();

  try{
   if(typeof toast==="function"){
    toast("⚠ Grid incident detected");
   }
  }catch(e){}

  ensureUI();
 }

 function incidentDefinition(){

  if(!state.active)return null;

  return INCIDENTS.find(
   x=>x.id===state.active.id
  )||null;
 }

 function spendCash(amount){

  const x=gameState();

  if(!x)return false;

  amount=Math.max(0,Math.round(amount));

  if(
   (Number(x.cash)||0)<
   amount
  ){
   try{
    if(typeof toast==="function"){
     toast(
      "Not enough cash for this response."
     );
    }
   }catch(e){}

   return false;
  }

  x.cash=
   Math.max(
    0,
    (Number(x.cash)||0)-amount
   );

  return true;
 }

 function addCash(amount){

  const x=gameState();

  if(!x)return;

  amount=Math.max(0,amount);

  x.cash=
   Math.min(
    1e300,
    (Number(x.cash)||0)+amount
   );

  x.lifetimeCash=
   Math.min(
    1e300,
    (Number(x.lifetimeCash)||0)+amount
   );

  try{
   if(typeof recordEarnedCash==="function"){
    recordEarnedCash(amount);
   }
  }catch(e){}
 }

 function complete(message,soon){

  state.active=null;
  state.resolved=
   (Number(state.resolved)||0)+1;

  state.lastMessage=message;
  state.lastMessageUntil=
   Date.now()+6500;

  if(soon){
   scheduleSoon();
  }else{
   scheduleNormal();
  }

  save();

  try{
   if(typeof saveGame==="function"){
    saveGame();
   }
  }catch(e){}

  try{
   if(typeof render==="function"){
    render();
   }
  }catch(e){}

  try{
   if(typeof feedback==="function"){
    feedback("big");
   }
  }catch(e){}

  try{
   if(typeof toast==="function"){
    toast(message);
   }
  }catch(e){}

  setTimeout(ensureUI,0);
 }

 window.GE25ResolveGridIncident=
 function(choice){

  const x=gameState();
  const incident=incidentDefinition();

  if(!x || !incident)return;

  const cash=
   Math.max(
    0,
    Number(x.cash)||0
   );

  const stored=
   Math.max(
    0,
    Number(x.stored)||0
   );

  const baseCost=
   Math.max(
    250,
    Math.min(
     25000000,
     cash*.035+
     outputValue()*40
    )
   )*
   penaltyMult();

  /* -------------------------------
     EXTREME DEMAND SURGE
     ------------------------------- */

  if(incident.id==="demand"){

   if(choice==="dispatch"){

    if(stored<=0){
     if(typeof toast==="function"){
      toast("No stored power is available.");
     }
     return;
    }

    const amount=
     Math.max(
      .01,
      stored*.25
     );

    x.stored=
     Math.max(
      0,
      stored-amount
     );

    const earned=
     saleValue(
      amount,
      1.30
     );

    addCash(earned);

    complete(
     "Demand surge supplied: "+
     moneyText(earned),
     false
    );

    return;
   }

   if(choice==="stabilize"){

    if(!spendCash(baseCost)){
     return;
    }

    complete(
     "Operations stabilized for "+
     moneyText(baseCost),
     false
    );

    return;
   }

   if(choice==="protect"){

    if(
     typeof window.GE25SetOperatingMode==="function"
    ){
     window.GE25SetOperatingMode(
      "reserve"
     );
    }

    complete(
     "Reserve protected. Grid shifted to RESERVE mode.",
     false
    );

    return;
   }
  }

  /* -------------------------------
     PEAKER UNIT TRIP
     ------------------------------- */

  if(incident.id==="trip"){

   if(choice==="crew"){

    const cost=baseCost*.85;

    if(!spendCash(cost)){
     return;
    }

    complete(
     "Emergency crew dispatched: "+
     moneyText(cost),
     false
    );

    return;
   }

   if(choice==="reroute"){

    const loss=
     stored*.12;

    x.stored=
     Math.max(
      0,
      stored-loss
     );

    complete(
     "Power rerouted. "+
     (
      loss>0
       ? "Stored reserve absorbed the disruption."
       : "Grid rerouted with no stored reserve available."
     ),
     false
    );

    return;
   }

   if(choice==="reserve"){

    if(
     typeof window.GE25SetOperatingMode==="function"
    ){
     window.GE25SetOperatingMode(
      "reserve"
     );
    }

    complete(
     "Grid reserve held while the unit recovers.",
     false
    );

    return;
   }
  }

  /* -------------------------------
     TRANSMISSION FAULT
     ------------------------------- */

  if(incident.id==="transmission"){

   if(choice==="import"){

    const cost=baseCost*.70;

    if(!spendCash(cost)){
     return;
    }

    x.stored=
     Math.min(
      1e300,
      stored+
      outputValue()*8
     );

    complete(
     "Emergency capacity secured for "+
     moneyText(cost),
     false
    );

    return;
   }

   if(choice==="isolate"){

    if(
     typeof window.GE25SetOperatingMode==="function"
    ){
     window.GE25SetOperatingMode(
      "reserve"
     );
    }

    complete(
     "Faulted line isolated. Reserve protection active.",
     false
    );

    return;
   }

   if(choice==="push"){

    if(
     typeof window.GE25SetOperatingMode==="function"
    ){
     window.GE25SetOperatingMode(
      "peak"
     );
    }

    const bonus=
     Math.max(
      100,
      outputValue()*75*
      rewardMult()
     );

    addCash(bonus);

    complete(
     "Grid pushed through the fault: "+
     moneyText(bonus)+
     " emergency revenue.",
     true
    );

    return;
   }
  }

  /* -------------------------------
     RESERVE SHORTFALL
     ------------------------------- */

  if(incident.id==="reserve"){

   if(choice==="capacity"){

    const cost=baseCost;

    if(!spendCash(cost)){
     return;
    }

    x.stored=
     Math.min(
      1e300,
      stored+
      outputValue()*12
     );

    complete(
     "Additional reserve capacity secured.",
     false
    );

    return;
   }

   if(choice==="curtail"){

    if(
     typeof window.GE25SetOperatingMode==="function"
    ){
     window.GE25SetOperatingMode(
      "reserve"
     );
    }

    complete(
     "Output curtailed. Reserve margin protected.",
     false
    );

    return;
   }

   if(choice==="ride"){

    if(
     typeof window.GE25SetOperatingMode==="function"
    ){
     window.GE25SetOperatingMode(
      "peak"
     );
    }

    const bonus=
     Math.max(
      100,
      outputValue()*60*
      rewardMult()
     );

    addCash(bonus);

    complete(
     "Shortfall ridden through: "+
     moneyText(bonus)+
     " captured.",
     true
    );

    return;
   }
  }
 };

 function cardHTML(){

  const incident=incidentDefinition();

  if(incident){

   const buttons=
    incident.choices
    .map(c=>`
     <button
      type="button"
      onclick="window.GE25ResolveGridIncident('${c[0]}')"
     >
      ${c[1]}
     </button>
    `)
    .join("");

   return `
    <div class="ge25-incident-live">

     <div class="ge25-incident-head">
      <div>
       <small>LIVE GRID INCIDENT</small>
       <strong>${incident.title}</strong>
      </div>

      <span>
       ${modeLabel()}
      </span>
     </div>

     <p>${incident.text}</p>

     <div class="ge25-incident-actions">
      ${buttons}
     </div>

    </div>
   `;
  }

  if(
   state.lastMessage &&
   Date.now()<
   Number(state.lastMessageUntil||0)
  ){
   return `
    <div class="ge25-incident-result">
     ✓ ${state.lastMessage}
    </div>
   `;
  }

  return "";
 }

 function ensureUI(){

  const deck=
   document.getElementById(
    "b10CommandDeck"
   );

  if(!deck)return;

  let host=
   document.getElementById(
    "ge25GridIncidentHost"
   );

  if(!host){

   host=document.createElement("div");
   host.id="ge25GridIncidentHost";

   const reaction=
    document.getElementById(
     "ge25GridReactionBar"
    );

   if(reaction){
    reaction.insertAdjacentElement(
     "afterend",
     host
    );
   }else{
    deck.appendChild(host);
   }
  }

  const html=cardHTML();

  if(host.innerHTML!==html){
   host.innerHTML=html;
  }

  host.style.display=
   html ? "block" : "none";
 }

 function tick(){

  if(!eligible()){
   ensureUI();
   return;
  }

  if(
   !state.active &&
   !state.nextAt
  ){
   /*
    First incident arrives quickly in Build 25
    so the feature can be tested immediately.
    Later incidents are several minutes apart.
   */
   state.nextAt=
    Date.now()+20000;

   save();
  }

  if(
   !state.active &&
   state.nextAt &&
   Date.now()>=state.nextAt
  ){
   createIncident();
  }

  ensureUI();
 }

 function boot(){

  tick();

  setInterval(
   tick,
   1000
  );

  console.log(
   "Gridline Empire Build 25 Main Grid Incidents V1 loaded."
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
