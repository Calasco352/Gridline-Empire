/* =========================================================
   GRIDLINE EMPIRE 1.1
   BUILD 25 - CINEMATIC PLANT VISUALS V2
   ========================================================= */

(function(){

 if(window.GE25_CINEMATIC_PLANT_ACTIVE)return;
 window.GE25_CINEMATIC_PLANT_ACTIVE=true;

 function getMode(){
  try{
   if(typeof window.GE25GetOperatingMode==="function"){
    return window.GE25GetOperatingMode();
   }
  }catch(e){}

  return "balanced";
 }

 function getPlant(){
  return document.querySelector(".plant-art");
 }

 function breakdownActive(){

  const box=document.getElementById("eventBox");
  const title=document.getElementById("eventTitle");

  if(!box || !title)return false;

  try{
   const style=getComputedStyle(box);

   if(
    style.display==="none" ||
    style.visibility==="hidden"
   ){
    return false;
   }
  }catch(e){}

  return /breakdown|failure|trip|offline/i.test(
   title.textContent||""
  );
 }

 function ensureStage(){

  const plant=getPlant();

  if(!plant)return null;

  let stage=document.getElementById(
   "ge25CinematicStage"
  );

  if(stage)return stage;

  const parent=plant.parentElement;

  if(!parent)return null;

  parent.classList.add(
   "ge25-cinematic-host"
  );

  stage=document.createElement("div");
  stage.id="ge25CinematicStage";
  stage.className="ge25-cinematic-stage";

  stage.innerHTML=`
   <div class="ge25-power-sweep"></div>

   <div class="ge25-grid-lines">
    <i></i><i></i><i></i>
   </div>

   <div class="ge25-light-pass"></div>

   <div class="ge25-energy-core"></div>

   <div class="ge25-steam-field">
    <i></i><i></i><i></i><i></i>
   </div>

   <div class="ge25-spark-field">
    <i></i><i></i><i></i>
   </div>

   <div class="ge25-alarm-vignette"></div>

   <div
    id="ge25VisualMessage"
    class="ge25-visual-message"
   ></div>
  `;

  parent.appendChild(stage);

  return stage;
 }

 function restartClass(el,name,time){

  if(!el)return;

  el.classList.remove(name);

  void el.offsetWidth;

  el.classList.add(name);

  setTimeout(()=>{
   try{
    el.classList.remove(name);
   }catch(e){}
  },time);
 }

 function updateMode(){

  const stage=ensureStage();

  if(!stage)return;

  const mode=getMode();

  stage.classList.remove(
   "mode-reserve",
   "mode-balanced",
   "mode-peak",
   "plant-breakdown"
  );

  if(mode==="reserve"){
   stage.classList.add("mode-reserve");
  }
  else if(mode==="peak"){
   stage.classList.add("mode-peak");
  }
  else{
   stage.classList.add("mode-balanced");
  }

  if(breakdownActive()){
   stage.classList.add(
    "plant-breakdown"
   );
  }
 }

 function visualMessage(text){

  const el=document.getElementById(
   "ge25VisualMessage"
  );

  if(!el)return;

  el.textContent=text;

  restartClass(
   el,
   "show",
   900
  );
 }

 function generateFX(){

  const stage=ensureStage();

  if(!stage)return;

  restartClass(
   stage,
   "generate-burst",
   720
  );

  visualMessage(
   getMode()==="peak"
    ? "MAXIMUM DISPATCH"
    : "GENERATION SURGE"
  );
 }

 function sellFX(){

  const stage=ensureStage();

  if(!stage)return;

  restartClass(
   stage,
   "sell-burst",
   850
  );

  visualMessage(
   "POWER RELEASED TO GRID"
  );
 }

 document.addEventListener(
  "click",
  function(e){

   if(
    !e.target ||
    typeof e.target.closest!=="function"
   ){
    return;
   }

   if(e.target.closest("#generate")){
    generateFX();
    return;
   }

   if(e.target.closest("#sellBtn")){

    try{
     if(
      typeof g!=="undefined" &&
      Number(g.stored)<=0
     ){
      return;
     }
    }catch(err){}

    sellFX();
   }

  },
  true
 );

 function boot(){

  ensureStage();
  updateMode();

  setInterval(()=>{
   ensureStage();
   updateMode();
  },600);

  console.log(
   "Gridline Empire Cinematic Plant Visuals V2 loaded."
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
