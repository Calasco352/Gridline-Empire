/* GRIDLINE EMPIRE 1.1 - BUILD 25 */
(()=>{
"use strict";

const WEEK = 7*24*60*60*1000;
const KEY = "GRIDLINE_11_WEEKLY_EVENT";

const EVENTS = [
 {id:"peak",icon:"⚡",name:"Peak Demand",
  text:"Supply the grid during a massive demand surge."},
 {id:"storm",icon:"🌩️",name:"Storm Response",
  text:"Keep generation online through severe grid conditions."},
 {id:"fuel",icon:"⛽",name:"Fuel Shortage",
  text:"Operate efficiently while fuel pressure rises."},
 {id:"green",icon:"🌱",name:"Green Energy Rush",
  text:"Modernize the fleet and accelerate clean generation."},
 {id:"maintenance",icon:"🛠️",name:"Maintenance Crisis",
  text:"Protect reliability and keep the fleet healthy."},
 {id:"contracts",icon:"📑",name:"Mega Contract Week",
  text:"Complete major commercial energy agreements."},
 {id:"stability",icon:"🔋",name:"Grid Stability Challenge",
  text:"Balance generation, reserves and reliability."}
];

const MILESTONES = [100,250,500,1000,2000];

function week(){
 return Math.floor(Date.now()/WEEK);
}

function event(){
 return EVENTS[week()%EVENTS.length];
}

function newState(){
 return {
   week:week(),
   points:0,
   claimed:[]
 };
}

function load(){
 let x;
 try{x=JSON.parse(localStorage.getItem(KEY)||"null")}catch(_){}
 if(!x || x.week!==week()) x=newState();
 if(!Array.isArray(x.claimed))x.claimed=[];
 return x;
}

let state=load();

function save(){
 localStorage.setItem(KEY,JSON.stringify(state));
}

function syncWeek(){
 const current=week();

 if(!state || state.week!==current){
   state=newState();
   save();
   console.log("GE11: New weekly event started.",event().name);
 }
}

function remaining(){
 syncWeek();

 const ms=Math.max(0,((week()+1)*WEEK)-Date.now());

 const d=Math.floor(ms/86400000);
 const h=Math.floor((ms%86400000)/3600000);
 const m=Math.floor((ms%3600000)/60000);

 if(d>0) return `${d}d ${h}h`;
 if(h>0) return `${h}h ${m}m`;
 if(m>0) return `${m}m`;

 return "<1m";
}

function addPoints(amount,reason="Grid activity"){
 syncWeek();
 amount=Math.max(0,Math.floor(Number(amount)||0));
 if(!amount)return;

 if(state.week!==week())state=newState();

 state.points+=amount;
 save();
 render();

 if(typeof toast==="function")
   toast(`⚡ +${amount} Event Points • ${reason}`);
}

window.GE11AddEventPoints=addPoints;

window.GE11ClaimEventReward=function(i){
 const need=MILESTONES[i];
 if(state.points<need || state.claimed.includes(i))return;

 const reward=Math.max(
   5000,
   Math.floor((Number(window.g?.cash)||0)*(.025+(i*.01)))
 );

 if(window.g && typeof window.g.cash==="number")
   window.g.cash+=reward;

 state.claimed.push(i);
 save();

 if(typeof saveGame==="function")saveGame();
 if(typeof render==="function")render();
 if(typeof toast==="function")
   toast(`🏆 Event reward claimed`);

 render();
};

function next(){
 return MILESTONES.find(x=>x>state.points)||MILESTONES[MILESTONES.length-1];
}

function pct(){
 const n=next();
 return Math.min(100,(state.points/n)*100);
}

function ensure(){
 if(!document.getElementById("ge11EventButton")){
   const b=document.createElement("button");
   b.id="ge11EventButton";
   b.onclick=()=>window.GE11OpenEvents();
   document.body.appendChild(b);
 }

 if(!document.getElementById("ge11EventOverlay")){
   const o=document.createElement("div");
   o.id="ge11EventOverlay";
   o.innerHTML=`
    <div class="ge11-window">
      <button class="ge11-close" onclick="GE11CloseEvents()">×</button>
      <div id="ge11EventContent"></div>
    </div>`;
   document.body.appendChild(o);
 }
}

window.GE11OpenEvents=function(){
 ensure();
 document.getElementById("ge11EventOverlay").classList.add("open");
 render();
};

window.GE11CloseEvents=function(){
 document.getElementById("ge11EventOverlay").classList.remove("open");
};

function render(){
 /* 1.1.1:
    Do not let the old Weekly Event renderer overwrite
    the newer Weekly Grid Run interface.
 */
 if(window.GE25_EVENTRUN_V2_ACTIVE)return;

 ensure();

 const e=event();
 const b=document.getElementById("ge11EventButton");

 if(b){
   b.innerHTML=`
    <small>WEEKLY EVENT</small>
    <strong>${e.icon} ${e.name}</strong>
    <span>${state.points} PTS • ${remaining()}</span>
    <i><em style="width:${pct()}%"></em></i>`;
 }

 const c=document.getElementById("ge11EventContent");
 if(!c)return;

 const rewards=MILESTONES.map((m,i)=>{
   const claimed=state.claimed.includes(i);
   const ready=state.points>=m&&!claimed;

   return `
    <div class="ge11-reward ${ready?"ready":""}">
      <div>
        <b>${m.toLocaleString()} POINTS</b>
        <span>Grid Operations Cache</span>
      </div>
      <button
       ${ready?"":"disabled"}
       onclick="GE11ClaimEventReward(${i})">
       ${claimed?"CLAIMED":ready?"CLAIM":"LOCKED"}
      </button>
    </div>`;
 }).join("");

 c.innerHTML=`
  <div class="ge11-hero">
   <div class="ge11-kicker">GRIDLINE EMPIRE • WEEKLY EVENT</div>
   <h1>${e.icon} ${e.name}</h1>
   <p>${e.text}</p>

   <div class="ge11-eventStats">
    <div><small>EVENT POINTS</small><b>${state.points}</b></div>
    <div><small>TIME LEFT</small><b>${remaining()}</b></div>
    <div><small>NEXT REWARD</small><b>${next()} PTS</b></div>
   </div>

   <div class="ge11-progress">
    <i style="width:${pct()}%"></i>
   </div>
  </div>


<section class="ge11-section">
  <h2>EVENT REWARD TRACK</h2>
  ${rewards}
</section>

  `;
}

function boot(){
 document.body.classList.add("gridline-build25");
 ensure();
 render();

 setInterval(()=>{
   if(!window.GE25_EVENTRUN_V2_ACTIVE){
     render();
   }
 },30000);

 console.log(
   "Gridline Empire 1.1 Build 25 Weekly Events loaded:",
   event().name
 );
}

if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",boot);
else
 boot();


/* GE11_GAMEPLAY_HOOKS */

function ge11PointsFor(action){
 const e=event().id;

 const TABLE={
  peak:{
   sell:18, contract:35, upgrade:8,
   maintenance:5, mastery:10, region:12, supply:10
  },

  storm:{
   sell:8, contract:18, upgrade:5,
   maintenance:30, mastery:8, region:8, supply:12
  },

  fuel:{
   sell:10, contract:18, upgrade:14,
   maintenance:12, mastery:16, region:8, supply:10
  },

  green:{
   sell:8, contract:14, upgrade:18,
   maintenance:8, mastery:25, region:30, supply:12
  },

  maintenance:{
   sell:6, contract:12, upgrade:8,
   maintenance:35, mastery:15, region:7, supply:10
  },

  contracts:{
   sell:12, contract:50, upgrade:5,
   maintenance:8, mastery:10, region:12, supply:10
  },

  stability:{
   sell:12, contract:25, upgrade:10,
   maintenance:18, mastery:14, region:15, supply:15
  }
 };

 return TABLE[e]?.[action] || 5;
}

function ge11Wrap(name,after){
 const original=window[name];

 if(typeof original!=="function")
   return false;

 if(original.__ge11Wrapped)
   return true;

 const wrapped=function(...args){

  const cashBefore=Number(window.g?.cash||0);
  const storedBefore=Number(window.g?.stored||0);
  const contractsBefore=Number(window.g?.contractsCompleted||0);

  let result;

  try{
   result=original.apply(this,args);
  }finally{

   const cashAfter=Number(window.g?.cash||0);
   const storedAfter=Number(window.g?.stored||0);
   const contractsAfter=Number(window.g?.contractsCompleted||0);

   after({
    args,
    cashBefore,
    cashAfter,
    storedBefore,
    storedAfter,
    contractsBefore,
    contractsAfter
   });
  }

  return result;
 };

 wrapped.__ge11Wrapped=true;
 wrapped.__ge11Original=original;

 window[name]=wrapped;

 console.log("GE11 event hook installed:",name);

 return true;
}


/* POWER SALES */
ge11Wrap("sellPower",x=>{
 if(
  x.cashAfter>x.cashBefore ||
  x.storedAfter<x.storedBefore
 ){
  addPoints(
   ge11PointsFor("sell"),
   "Power sold to the grid"
  );
 }
});


/* PLANT UPGRADES */
ge11Wrap("upgradePlant",x=>{
 if(x.cashAfter<x.cashBefore){
  addPoints(
   ge11PointsFor("upgrade"),
   "Plant upgraded"
  );
 }
});


/* PLANT MASTERY */
ge11Wrap("masterPlant",x=>{
 if(x.cashAfter<x.cashBefore){
  addPoints(
   ge11PointsFor("mastery"),
   "Plant mastery advanced"
  );
 }
});


/* REGIONAL EXPANSION */
ge11Wrap("buyRegion",x=>{
 if(x.cashAfter<x.cashBefore){
  addPoints(
   ge11PointsFor("region"),
   "Regional expansion completed"
  );
 }
});


/* MAINTENANCE */
ge11Wrap("performMaintenance",x=>{
 if(x.cashAfter<x.cashBefore){
  addPoints(
   ge11PointsFor("maintenance"),
   "Fleet maintenance completed"
  );
 }
});


/* CONTRACT COMPLETION */
ge11Wrap("updateContract",x=>{
 if(x.contractsAfter>x.contractsBefore){
  addPoints(
   ge11PointsFor("contract"),
   "Energy contract completed"
  );
 }
});


/* DAILY/SUPPLY REWARDS — hooks whichever function exists */
[
 "claimSupplyDrop",
 "claimDailySupply",
 "claimDaily",
 "claimDailyReward"
].forEach(name=>{
 ge11Wrap(name,x=>{
  if(x.cashAfter>x.cashBefore){
   addPoints(
    ge11PointsFor("supply"),
    "Daily grid supply claimed"
   );
  }
 });
});


/* Retry after the rest of the game scripts finish installing globals. */
setTimeout(()=>{
 [
  "sellPower",
  "upgradePlant",
  "masterPlant",
  "buyRegion",
  "performMaintenance",
  "updateContract"
 ].forEach(name=>{
  if(typeof window[name]==="function" && !window[name].__ge11Wrapped){
   console.warn("GE11 late hook available:",name);
  }
 });
},2500);

console.log(
 "Gridline Empire 1.1 gameplay → Weekly Event hooks installed."
);


/* GE11_RUNTIME_HOTFIX_V2
   Uses the real global game state `g`.
   Also moves Events into the MORE menu.
*/

function ge11Snapshot(){
 try{
   if(typeof g==="undefined"){
     return {cash:0,stored:0,contracts:0};
   }

   return {
     cash:Number(g.cash||0),
     stored:Number(g.stored||0),
     contracts:Number(g.contractsCompleted||0)
   };
 }catch(_){
   return {cash:0,stored:0,contracts:0};
 }
}

function ge11WrapV2(name,after){
 const current=window[name];

 if(typeof current!=="function")
   return false;

 if(current.__ge11V2Wrapped)
   return true;

 const wrapped=function(...args){
   const before=ge11Snapshot();

   const result=current.apply(this,args);

   const afterState=ge11Snapshot();

   try{
     after({
       args,
       before,
       after:afterState
     });
   }catch(err){
     console.warn("GE11 event hook error:",name,err);
   }

   return result;
 };

 wrapped.__ge11V2Wrapped=true;
 wrapped.__ge11Original=current;

 window[name]=wrapped;

 console.log("GE11 V2 hook installed:",name);

 return true;
}

function ge11InstallRuntimeHooks(){

 ge11WrapV2("sellPower",x=>{
   if(
     x.after.cash>x.before.cash ||
     x.after.stored<x.before.stored
   ){
     addPoints(
       ge11PointsFor("sell"),
       "Power sold to the grid"
     );
   }
 });

 ge11WrapV2("upgradePlant",x=>{
   if(x.after.cash<x.before.cash){
     addPoints(
       ge11PointsFor("upgrade"),
       "Plant upgraded"
     );
   }
 });

 ge11WrapV2("masterPlant",x=>{
   if(x.after.cash<x.before.cash){
     addPoints(
       ge11PointsFor("mastery"),
       "Plant mastery advanced"
     );
   }
 });

 ge11WrapV2("buyRegion",x=>{
   if(x.after.cash<x.before.cash){
     addPoints(
       ge11PointsFor("region"),
       "Regional expansion completed"
     );
   }
 });

 ge11WrapV2("performMaintenance",x=>{
   if(x.after.cash<x.before.cash){
     addPoints(
       ge11PointsFor("maintenance"),
       "Fleet maintenance completed"
     );
   }
 });

 ge11WrapV2("updateContract",x=>{
   if(x.after.contracts>x.before.contracts){
     addPoints(
       ge11PointsFor("contract"),
       "Energy contract completed"
     );
   }
 });
}


/* ---------- EVENTS INSIDE MORE ---------- */

function ge11InstallMoreEntry(){

 /* Floating development widget is no longer part of gameplay. */
 const floating=document.getElementById("ge11EventButton");
 if(floating) floating.style.display="none";

 const grid=document.getElementById("ppt7MoreGrid");

 if(!grid)
   return false;

 if(document.getElementById("ge11EventsMoreEntry"))
   return true;

 const e=event();

 const button=document.createElement("button");

 button.id="ge11EventsMoreEntry";
 button.type="button";
 button.className="ppt7-more-item";

 button.innerHTML=
   '<span class="ge11-more-icon">🏆</span>'+
   '<span class="ge11-more-copy">'+
     '<b>EVENTS</b>'+
     '<small>'+
       e.name+
       ' • '+state.points+
       ' PTS • '+remaining()+
     '</small>'+
   '</span>'+
   '<span class="ge11-more-arrow">›</span>';

 button.onclick=function(){
   if(typeof window.closePPT7More==="function")
     window.closePPT7More();

   setTimeout(()=>{
     window.GE11OpenEvents();
   },120);
 };

 grid.prepend(button);

 return true;
}


/* Install after all legacy scripts have finished defining globals. */
[100,300,750,1500,3000,6000].forEach(ms=>{
 setTimeout(()=>{
   ge11InstallRuntimeHooks();
   ge11InstallMoreEntry();
 },ms);
});

/* MORE redraws its grid, so keep our Events entry attached. */
setInterval(()=>{
 ge11InstallRuntimeHooks();
 ge11InstallMoreEntry();
},2000);

console.log(
 "Gridline Empire Build 25 V2 event integration loaded."
);


/* GE11_PERMANENT_EVENTS_NAV */

function ge11RemoveMoreEventEntry(){
    const old = document.getElementById("ge11EventsMoreEntry");
    if(old) old.remove();
}

/* Stop the old MORE injection */
ge11InstallMoreEntry = function(){
    ge11RemoveMoreEventEntry();
    return true;
};

function ge11InstallEventsNav(){

    ge11RemoveMoreEventEntry();

    const more = document.getElementById("ppt7MoreNav");

    if(!more || !more.parentElement)
        return false;

    more.parentElement.classList.add("ge11-six-nav");

    let btn = document.getElementById("ge11EventsNav");

    if(!btn){

        btn = document.createElement("button");

        btn.id = "ge11EventsNav";
        btn.type = "button";
        btn.className = more.className;

        btn.innerHTML =
            '<span class="ge11-bottom-icon">🏆</span>' +
            '<span class="ge11-bottom-label">EVENTS</span>';

        more.parentElement.insertBefore(btn, more);
    }

    btn.onclick = function(){

        if(typeof window.closePPT7More === "function")
            window.closePPT7More();

        window.GE11OpenEvents();
    };

    return true;
}

[0,100,300,700,1500,3000].forEach(ms=>{
    setTimeout(ge11InstallEventsNav, ms);
});

setInterval(()=>{
    ge11InstallEventsNav();
},2000);

console.log("Gridline Empire permanent EVENTS tab installed.");

})();
