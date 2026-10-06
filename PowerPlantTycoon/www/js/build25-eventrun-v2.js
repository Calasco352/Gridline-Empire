/* GRIDLINE EMPIRE 1.1
   BUILD 25 - WEEKLY EVENT RUN V2
*/

(function(){
"use strict";

window.GE25_EVENTRUN_V2_ACTIVE=true;

const KEY="GRIDLINE_11_EVENT_RUN_V2";
const OLD_KEY="GRIDLINE_11_EVENT_RUN";
const WEEK=7*24*60*60*1000;


/* ------------------------------------------------
   EVENT PLANTS
------------------------------------------------ */

const PLANTS=[
 {
  id:"rapid",
  name:"RapidStart Generator",
  type:"Emergency Generation",
  base:3,
  unlock:0,
  upgrade:60
 },
 {
  id:"metro",
  name:"Metro Peaker Station",
  type:"Demand Response",
  base:9,
  unlock:500,
  upgrade:250
 },
 {
  id:"irongate",
  name:"IronGate Gas Works",
  type:"Gas Generation",
  base:27,
  unlock:3500,
  upgrade:1200
 },
 {
  id:"summit",
  name:"Summit Combined Cycle",
  type:"High Efficiency",
  base:78,
  unlock:20000,
  upgrade:6500
 },
 {
  id:"titan",
  name:"Titan Reserve Plant",
  type:"Grid Reserve",
  base:210,
  unlock:100000,
  upgrade:30000
 },
 {
  id:"crown",
  name:"CrownGrid Energy Complex",
  type:"Mega Facility",
  base:575,
  unlock:500000,
  upgrade:145000
 }
];


/* ------------------------------------------------
   EVENT RESEARCH
------------------------------------------------ */

const RESEARCH=[
 {
  id:"turbines",
  name:"High Efficiency Turbines",
  text:"+10% Event output",
  cost:1
 },
 {
  id:"market",
  name:"Market Intelligence",
  text:"+10% Event sale value",
  cost:1
 },
 {
  id:"faststart",
  name:"Fast Start Controls",
  text:"+25% manual generation burst",
  cost:2
 },
 {
  id:"dispatch",
  name:"Dispatch Automation",
  text:"+15% Event Contract cash",
  cost:2
 },
 {
  id:"advanced",
  name:"Advanced Combined Cycle",
  text:"+15% Event output",
  cost:3
 },
 {
  id:"trading",
  name:"Peak Trading Desk",
  text:"+15% Event sale value",
  cost:3
 }
];


/* ------------------------------------------------
   CONTRACTS
------------------------------------------------ */

const CONTRACTS=[
 {
  id:"city",
  name:"City Peak Supply Order",
  text:"Sell 750 event power",
  target:750,
  score:400,
  cash:1800,
  research:1,
  value:s=>s.soldPower
 },
 {
  id:"modernize",
  name:"Fleet Modernization Order",
  text:"Complete 6 upgrades",
  target:6,
  score:650,
  cash:4500,
  research:1,
  value:s=>s.upgrades
 },
 {
  id:"metrogrid",
  name:"Metro Expansion Contract",
  text:"Operate 4 Event plants",
  target:4,
  score:900,
  cash:9000,
  credits:1,
  value:s=>unlockedCount(s)
 },
 {
  id:"revenue",
  name:"High-Value Energy Sale",
  text:"Earn $75,000 during the run",
  target:75000,
  score:1200,
  cash:15000,
  research:2,
  value:s=>s.totalEarned
 },
 {
  id:"response",
  name:"Emergency Response Agreement",
  text:"Resolve 3 grid emergencies",
  target:3,
  score:1500,
  cash:25000,
  credits:2,
  value:s=>s.surgesHandled
 }
];


/* ------------------------------------------------
   MAJOR PROJECTS
------------------------------------------------ */

const PROJECTS=[
 {
  id:"intertie",
  name:"Metro Grid Intertie",
  text:"Connect the event utility to the metropolitan transmission network.",
  cost:25000,
  plants:3,
  score:1500,
  research:1,
  credits:1
 },
 {
  id:"reservehub",
  name:"Regional Reserve Hub",
  text:"Construct a high-capacity reserve and balancing facility.",
  cost:125000,
  plants:5,
  score:3500,
  research:2,
  credits:2
 },
 {
  id:"controlcenter",
  name:"CrownGrid Control Center",
  text:"Complete the Event Run's ultimate grid command facility.",
  cost:600000,
  plants:6,
  score:8000,
  research:3,
  credits:4
 }
];


/* ------------------------------------------------
   MAIN COMPANY REWARDS
------------------------------------------------ */

const REWARDS=[
 {score:5000,credits:20,cashMult:1,label:"Grid Starter Cache"},
 {score:15000,credits:35,cashMult:2,label:"Operations Cache"},
 {score:40000,credits:60,cashMult:3,label:"Regional Grid Cache"},
 {score:90000,credits:100,cashMult:5,label:"Executive Event Cache"},
 {score:175000,credits:175,cashMult:8,label:"Peak Demand Grand Cache"},
 {score:300000,credits:275,cashMult:12,label:"CrownGrid Victory Cache"},
 {score:500000,credits:350,cashMult:13,label:"National Grid Champion Cache"},
 {score:750000,credits:500,cashMult:14,label:"Gridline Empire Victory Cache"}
];


/* ------------------------------------------------
   TASKS
------------------------------------------------ */

const TASKS=[
 {
  id:"generate",
  name:"Power the Grid",
  text:"Generate 500 Event power",
  target:500,
  reward:175,
  research:1,
  value:s=>s.generated
 },
 {
  id:"sales",
  name:"Active Energy Trader",
  text:"Complete 10 Event sales",
  target:10,
  reward:250,
  value:s=>s.sales
 },
 {
  id:"upgrades",
  name:"Modernize Operations",
  text:"Complete 8 plant upgrades",
  target:8,
  reward:400,
  research:1,
  value:s=>s.upgrades
 },
 {
  id:"plants",
  name:"Build the Fleet",
  text:"Operate 4 Event plants",
  target:4,
  reward:600,
  value:s=>unlockedCount(s)
 },
 {
  id:"contracts",
  name:"Contract Operator",
  text:"Complete 3 Event Contracts",
  target:3,
  reward:800,
  credits:1,
  value:s=>s.contractsCompleted.length
 },
 {
  id:"research",
  name:"Event R&D Program",
  text:"Unlock 3 Event Research upgrades",
  target:3,
  reward:900,
  value:s=>s.research.length
 },
 {
  id:"surges",
  name:"Grid Emergency Response",
  text:"Resolve 3 Event emergencies",
  target:3,
  reward:1000,
  credits:1,
  value:s=>s.surgesHandled
 },
 {
  id:"project",
  name:"Major Infrastructure",
  text:"Complete 1 Major Project",
  target:1,
  reward:1250,
  research:1,
  value:s=>s.projectsCompleted.length
 },
 {
  id:"revenue",
  name:"Event Revenue",
  text:"Earn $100,000 during the run",
  target:100000,
  reward:1500,
  value:s=>s.totalEarned
 },
 {
  id:"score",
  name:"Peak Demand Elite",
  text:"Reach 15,000 Event Score",
  target:15000,
  reward:2000,
  credits:2,
  value:s=>s.score
 }
];


/* ------------------------------------------------
   WEEK
------------------------------------------------ */

function weekIndex(){
 return Math.floor(Date.now()/WEEK);
}

function remaining(){
 const ms=((weekIndex()+1)*WEEK)-Date.now();

 const d=Math.floor(ms/86400000);
 const h=Math.floor((ms%86400000)/3600000);
 const m=Math.floor((ms%3600000)/60000);

 if(d>0)return d+"d "+h+"h";
 if(h>0)return h+"h "+m+"m";

 return Math.max(0,m)+"m";
}


/* ------------------------------------------------
   STATE
------------------------------------------------ */

function freshState(){
 const plants={};

 PLANTS.forEach((p,i)=>{
  plants[p.id]={
   unlocked:i===0,
   level:i===0?1:0
  };
 });

 return {
  version:3,
  week:weekIndex(),

  cash:0,
  power:0,

  generated:0,
  soldPower:0,
  totalEarned:0,

  sales:0,
  upgrades:0,
  surgesHandled:0,

  score:0,

  researchPoints:0,
  eventCredits:0,

  research:[],
  contractsCompleted:[],
  projectsCompleted:[],
  completedTasks:[],
  claimedRewards:[],

  plants,

  crisis:null,
  nextCrisisAt:Date.now()+20000,

  priceBoostUntil:0,
  outputBoostUntil:0,

  startedAt:Date.now(),
  lastTick:Date.now(),

  view:"hq"
 };
}

function normalize(s){
 const base=freshState();

 s={...base,...s};

 if(!Array.isArray(s.research))s.research=[];
 if(!Array.isArray(s.contractsCompleted))s.contractsCompleted=[];
 if(!Array.isArray(s.projectsCompleted))s.projectsCompleted=[];
 if(!Array.isArray(s.completedTasks))s.completedTasks=[];
 if(!Array.isArray(s.claimedRewards))s.claimedRewards=[];

 if(!s.plants)s.plants={};

 PLANTS.forEach((p,i)=>{
  if(!s.plants[p.id]){
   s.plants[p.id]={
    unlocked:i===0,
    level:i===0?1:0
   };
  }
 });

 return s;
}

function load(){
 try{
  const current=
   JSON.parse(localStorage.getItem(KEY)||"null");

  if(current && current.week===weekIndex()){
   return normalize(current);
  }

  /* Migrate the first Event Run if it exists. */
  const old=
   JSON.parse(localStorage.getItem(OLD_KEY)||"null");

  if(old && old.week===weekIndex()){
   const s=freshState();

   [
    "cash",
    "power",
    "generated",
    "soldPower",
    "totalEarned",
    "sales",
    "upgrades",
    "score"
   ].forEach(k=>{
    if(Number.isFinite(Number(old[k]))){
     s[k]=Number(old[k]);
    }
   });

   if(old.plants){
    PLANTS.forEach(p=>{
     if(old.plants[p.id]){
      s.plants[p.id]={
       ...s.plants[p.id],
       ...old.plants[p.id]
      };
     }
    });
   }

   return s;
  }

 }catch(e){}

 return freshState();
}

let state=load();

function save(){
 localStorage.setItem(
  KEY,
  JSON.stringify(state)
 );
}

function ensureWeek(){
 if(state.week!==weekIndex()){
  state=freshState();
  save();
 }
}


/* ------------------------------------------------
   FORMATTING
------------------------------------------------ */

function money(v){
 const n=Math.max(0,Number(v)||0);

 if(n>=1e12)return "$"+(n/1e12).toFixed(2)+"T";
 if(n>=1e9)return "$"+(n/1e9).toFixed(2)+"B";
 if(n>=1e6)return "$"+(n/1e6).toFixed(2)+"M";
 if(n>=1e3)return "$"+(n/1e3).toFixed(2)+"K";

 return "$"+n.toFixed(n<100?1:0);
}

function power(v){
 const n=Math.max(0,Number(v)||0);

 if(n>=1e6)return (n/1e6).toFixed(2)+" GWh";
 if(n>=1e3)return (n/1e3).toFixed(2)+" MWh";

 return n.toFixed(n<100?1:0)+" kWh";
}


/* ------------------------------------------------
   PLANTS / OUTPUT
------------------------------------------------ */

function plantLevel(p){
 return Math.max(
  0,
  Math.floor(
   Number(state.plants[p.id]?.level)||0
  )
 );
}

function unlockedCount(s=state){
 return PLANTS.filter(
  p=>s.plants[p.id]?.unlocked
 ).length;
}

function researchOwned(id){
 return state.research.includes(id);
}

function outputMultiplier(){
 let m=1;

 if(researchOwned("turbines"))m*=1.10;
 if(researchOwned("advanced"))m*=1.15;

 if(Date.now()<state.outputBoostUntil){
  m*=1.25;
 }

 return m;
}

function marketResearchMultiplier(){
 let m=1;

 if(researchOwned("market"))m*=1.10;
 if(researchOwned("trading"))m*=1.15;

 if(Date.now()<state.priceBoostUntil){
  m*=1.30;
 }

 return m;
}

function burstMultiplier(){
 return researchOwned("faststart")
  ?1.25
  :1;
}

function contractCashMultiplier(){
 return researchOwned("dispatch")
  ?1.15
  :1;
}

function plantOutput(p){
 const level=plantLevel(p);

 if(level<=0)return 0;

 return (
  p.base*
  Math.pow(1.34,level-1)
 );
}

function totalOutput(){
 const base=PLANTS.reduce((sum,p)=>{
  if(!state.plants[p.id]?.unlocked)return sum;

  return sum+plantOutput(p);
 },0);

 return base*outputMultiplier();
}

function upgradeCost(p){
 const level=Math.max(1,plantLevel(p));

 return Math.round(
  p.upgrade*
  Math.pow(1.62,level-1)
 );
}


/* ------------------------------------------------
   MARKET
------------------------------------------------ */

function marketMult(){
 const minute=Date.now()/60000;

 const wave=
  1+
  Math.sin(minute*.53)*.18+
  Math.sin(minute*.17)*.12;

 return Math.max(
  .75,
  Math.min(1.45,wave)
 );
}

function marketPrice(){
 return (
  1.55*
  marketMult()*
  marketResearchMultiplier()
 );
}

function demandLabel(){
 const m=marketMult();

 if(m>=1.28)return "EXTREME DEMAND";
 if(m>=1.12)return "DEMAND SURGE";
 if(m<=.88)return "LOW DEMAND";

 return "GRID NORMAL";
}


/* ------------------------------------------------
   SCORE / TASKS
------------------------------------------------ */

function addScore(amount){
 state.score=Math.max(
  0,
  Math.floor(
   state.score+
   Math.max(0,Number(amount)||0)
  )
 );
}

/* GRIDLINE EMPIRE 1.1.1 EVENT BALANCE

   Plant output and income become extremely large later
   in the game.

   Converting those numbers directly into Event Score
   allowed the full Weekly Grid Run to finish in only a
   few minutes.

   These curves keep upgrades useful without allowing
   exponential plant values to explode Event Score.
*/

function generationScore(amount){
 const a=Math.max(0,Number(amount)||0);
 return Math.max(
  1,
  Math.min(
   35,
   Math.floor(2+Math.sqrt(a)*0.45)
  )
 );
}


function saleScore(revenue){
 const r=Math.max(0,Number(revenue)||0);
 return Math.max(
  5,
  Math.min(
   100,
   Math.floor(8+Math.sqrt(r)*0.65)
  )
 );
}


function passiveScore(gain){
 const g=Math.max(0,Number(gain)||0);
 return Math.max(
  0,
  Math.min(
   1.5,
   g/1200
  )
 );
}


function checkTasks(){
 let changed=false;

 TASKS.forEach(t=>{
  if(state.completedTasks.includes(t.id))return;

  if(t.value(state)>=t.target){
   state.completedTasks.push(t.id);

   addScore(t.reward);

   if(t.research){
    state.researchPoints+=t.research;
   }

   if(t.credits){
    state.eventCredits+=t.credits;
   }

   changed=true;

   if(typeof toast==="function"){
    toast(
     "🏆 "+
     t.name+
     " complete • +"+
     t.reward+
     " Event Score"
    );
   }
  }
 });

 if(changed)save();
}


/* ------------------------------------------------
   BASIC GAMEPLAY
------------------------------------------------ */

function generateBurst(){
 ensureWeek();

 const amount=
  Math.max(
   1,
   totalOutput()*
   5*
   burstMultiplier()
  );

 state.power+=amount;
 state.generated+=amount;

 addScore(
  generationScore(amount)
 );

 checkTasks();
 save();
 render();

 if(typeof feedback==="function"){
  feedback("tap");
 }
}

function sellPower(){
 ensureWeek();

 if(state.power<=0){
  if(typeof toast==="function"){
   toast("Generate Event power first.");
  }
  return;
 }

 const amount=state.power;
 const revenue=amount*marketPrice();

 state.power=0;
 state.soldPower+=amount;

 state.cash+=revenue;
 state.totalEarned+=revenue;
 state.sales+=1;

 addScore(
  saleScore(revenue)
 );

 checkTasks();
 save();
 render();

 if(typeof toast==="function"){
  toast(
   "⚡ Event sale: "+
   money(revenue)
  );
 }
}


/* ------------------------------------------------
   PLANT ACTIONS
------------------------------------------------ */

function unlockPlant(id){
 const p=PLANTS.find(x=>x.id===id);
 if(!p)return;

 const ps=state.plants[id];

 if(ps.unlocked)return;

 if(state.cash<p.unlock){
  toast?.(
   "Need "+
   money(p.unlock)+
   " Event cash."
  );
  return;
 }

 state.cash-=p.unlock;

 ps.unlocked=true;
 ps.level=1;

 addScore(150);

 checkTasks();
 save();
 render();

 toast?.("🏭 "+p.name+" ONLINE");
}

function upgradePlant(id){
 const p=PLANTS.find(x=>x.id===id);
 if(!p)return;

 const ps=state.plants[id];

 if(!ps?.unlocked)return;

 const cost=upgradeCost(p);

 if(state.cash<cost){
  toast?.(
   "Need "+
   money(cost)+
   " Event cash."
  );
  return;
 }

 state.cash-=cost;

 ps.level=
  Math.min(
   25,
   plantLevel(p)+1
  );

 state.upgrades+=1;

 addScore(
  40+
  plantLevel(p)*4
 );

 checkTasks();
 save();
 render();

 toast?.(
  "🔧 "+
  p.name+
  " upgraded to Level "+
  plantLevel(p)
 );
}


/* ------------------------------------------------
   CONTRACTS
------------------------------------------------ */

function completeContract(id){
 const c=CONTRACTS.find(x=>x.id===id);
 if(!c)return;

 if(state.contractsCompleted.includes(id)){
  return;
 }

 if(c.value(state)<c.target){
  toast?.("Contract requirements not complete.");
  return;
 }

 state.contractsCompleted.push(id);

 const cash=
  Math.round(
   c.cash*
   contractCashMultiplier()
  );

 state.cash+=cash;

 state.researchPoints+=c.research||0;
 state.eventCredits+=c.credits||0;

 addScore(Math.max(100,Math.round(c.score*.40)));

 checkTasks();
 save();
 render();

 toast?.(
  "📋 Contract Complete • "+
  money(cash)+
  " Event cash"
 );
}


/* ------------------------------------------------
   RESEARCH
------------------------------------------------ */

function buyResearch(id){
 const r=RESEARCH.find(x=>x.id===id);
 if(!r)return;

 if(researchOwned(id))return;

 if(state.researchPoints<r.cost){
  toast?.(
   "Need "+
   r.cost+
   " Event Research Point"+
   (r.cost===1?"":"s")+
   "."
  );
  return;
 }

 state.researchPoints-=r.cost;
 state.research.push(id);

 addScore(100*r.cost);

 checkTasks();
 save();
 render();

 toast?.("🔬 "+r.name+" unlocked");
}


/* ------------------------------------------------
   MAJOR PROJECTS
------------------------------------------------ */

function completeProject(id){
 const p=PROJECTS.find(x=>x.id===id);
 if(!p)return;

 if(state.projectsCompleted.includes(id)){
  return;
 }

 if(unlockedCount()<p.plants){
  toast?.(
   "Operate "+
   p.plants+
   " Event plants first."
  );
  return;
 }

 if(state.cash<p.cost){
  toast?.(
   "Need "+
   money(p.cost)+
   " Event cash."
  );
  return;
 }

 state.cash-=p.cost;

 state.projectsCompleted.push(id);

 state.researchPoints+=p.research||0;
 state.eventCredits+=p.credits||0;

 addScore(Math.max(150,Math.round(p.score*.40)));

 checkTasks();
 save();
 render();

 toast?.("🏗️ Major Project Complete: "+p.name);
}


/* ------------------------------------------------
   GRID EMERGENCIES
------------------------------------------------ */

const CRISES=[
 {
  id:"demand",
  icon:"⚡",
  name:"Extreme Demand Surge",
  text:"Regional demand has jumped beyond forecast."
 },
 {
  id:"frequency",
  icon:"📈",
  name:"Grid Frequency Alert",
  text:"Rapid load changes are stressing the Event grid."
 },
 {
  id:"trip",
  icon:"⚠️",
  name:"Peaker Unit Trip",
  text:"A generating unit has unexpectedly dropped offline."
 }
];

function crisisCountdown(){
 if(state.crisis)return "ACTIVE";

 const sec=Math.max(
  0,
  Math.ceil(
   (state.nextCrisisAt-Date.now())/1000
  )
 );

 if(sec>=60){
  return Math.ceil(sec/60)+"m";
 }

 return sec+"s";
}

function createCrisis(){
 if(state.crisis)return;

 const index=
  (
   Math.floor(Date.now()/60000)+
   weekIndex()+
   state.surgesHandled
  )%
  CRISES.length;

 state.crisis={
  ...CRISES[index],
  createdAt:Date.now()
 };

 save();

 toast?.("⚠️ Event Grid Emergency");
 render();
}

function respondCrisis(choice){
 const crisis=state.crisis;

 if(!crisis)return;

 if(crisis.id==="demand"){
  if(choice==="a"){
   state.power+=totalOutput()*20;
   state.priceBoostUntil=Date.now()+60000;
   addScore(225);
  }

  if(choice==="b"){
   state.priceBoostUntil=Date.now()+120000;
   addScore(160);
  }

  if(choice==="c"){
   state.researchPoints+=1;
   addScore(110);
  }
 }

 if(crisis.id==="frequency"){
  if(choice==="a"){
   const cost=Math.min(
    state.cash,
    Math.max(500,state.cash*.08)
   );

   state.cash-=cost;
   state.researchPoints+=1;

   addScore(225);
  }

  if(choice==="b"){
   state.outputBoostUntil=Date.now()+90000;
   addScore(160);
  }

  if(choice==="c"){
   state.eventCredits+=1;
   addScore(110);
  }
 }

 if(crisis.id==="trip"){
  if(choice==="a"){
   const cost=Math.min(
    state.cash,
    Math.max(1000,state.cash*.06)
   );

   state.cash-=cost;
   addScore(250);
  }

  if(choice==="b"){
   state.power*=.85;
   state.researchPoints+=1;
   addScore(180);
  }

  if(choice==="c"){
   state.eventCredits+=1;
   addScore(125);
  }
 }

 state.surgesHandled+=1;
 state.crisis=null;

 state.nextCrisisAt=
  Date.now()+
  120000;

 checkTasks();
 save();
 render();

 toast?.("✅ Grid emergency resolved");
}


/* ------------------------------------------------
   MAIN COMPANY REWARD TRANSFER
------------------------------------------------ */

function mainRewardCash(mult){
 let base=5000;

 try{
  const mainCash=
   Math.max(
    0,
    Number(g?.cash)||0
   );

  const mainOutput=
   typeof output==="function"
    ?Math.max(0,Number(output())||0)
    :0;

  base=Math.max(
   5000,
   mainCash*.08,
   mainOutput*400
  );

 }catch(e){}

 return Math.round(
  Math.min(
   1e12,
   base*Math.max(1,mult)
  )
 );
}

function claimReward(index){
 const r=REWARDS[index];
 if(!r)return;

 if(state.score<r.score){
  toast?.(
   "Reach "+
   r.score.toLocaleString()+
   " Event Score first."
  );
  return;
 }

 if(state.claimedRewards.includes(index)){
  return;
 }

 const cash=
  mainRewardCash(r.cashMult);

 try{
  g.cash=
   Math.min(
    1e300,
    (Number(g.cash)||0)+cash
   );

  g.gridCredits=
   Math.min(
    1e15,
    (Number(g.gridCredits)||0)+r.credits
   );

  saveGame?.();
  render?.();

 }catch(e){
  console.warn(
   "Main reward transfer failed.",
   e
  );
  return;
 }

 state.claimedRewards.push(index);

 save();
 render();

 toast?.(
  "🎁 Main Company Reward • "+
  money(cash)+
  " + "+
  r.credits+
  " Grid Credits"
 );
}


/* ------------------------------------------------
   VIEW
------------------------------------------------ */

function setView(view){
 state.view=view;
 save();
 render();
}

window.GE25V2Generate=generateBurst;
window.GE25V2Sell=sellPower;
window.GE25V2Unlock=unlockPlant;
window.GE25V2Upgrade=upgradePlant;
window.GE25V2Contract=completeContract;
window.GE25V2Research=buyResearch;
window.GE25V2Project=completeProject;
window.GE25V2Crisis=respondCrisis;
window.GE25V2Reward=claimReward;
window.GE25V2View=setView;


/* ------------------------------------------------
   HTML HELPERS
------------------------------------------------ */

function tabsHTML(){
 const tabs=[
  ["hq","HQ"],
  ["fleet","FLEET"],
  ["contracts","CONTRACTS"],
  ["research","R&D"],
  ["projects","PROJECTS"],
  ["rewards","REWARDS"]
 ];

 return `
  <div class="ge25v2-tabs">
   ${tabs.map(([id,label])=>`
    <button
     type="button"
     class="${state.view===id?"active":""}"
     onclick="GE25V2View('${id}')"
    >
     ${label}
    </button>
   `).join("")}
  </div>
 `;
}


function resourceBarHTML(){
 return `
  <div class="ge25v2-resourcebar">

   <div>
    <small>EVENT CASH</small>
    <b>${money(state.cash)}</b>
   </div>

   <div>
    <small>RESEARCH POINTS</small>
    <b>${state.researchPoints} RP</b>
   </div>

   <div>
    <small>EVENT CREDITS</small>
    <b>${state.eventCredits}</b>
   </div>

  </div>
 `;
}

function crisisHTML(){
 if(!state.crisis){
  return `
   <div class="ge25v2-crisis waiting">
    <div>
     <small>GRID WATCH</small>
     <strong>Next operating challenge</strong>
     <span>${crisisCountdown()}</span>
    </div>
   </div>
  `;
 }

 const c=state.crisis;

 let options=[];

 if(c.id==="demand"){
  options=[
   ["a","COMMIT CAPACITY","Immediate power + short market boost"],
   ["b","HOLD FOR PEAK","Longer market-price boost"],
   ["c","PROTECT RESERVE","+1 Event Research Point"]
  ];
 }

 if(c.id==="frequency"){
  options=[
   ["a","STABILIZE GRID","Spend Event cash • stronger score"],
   ["b","PUSH OUTPUT","+25% temporary Event output"],
   ["c","CONSERVE","+1 Event Credit"]
  ];
 }

 if(c.id==="trip"){
  options=[
   ["a","DISPATCH CREW","Spend Event cash • strongest score"],
   ["b","REROUTE POWER","Lose some storage • +1 Research"],
   ["c","HOLD RESERVE","+1 Event Credit"]
  ];
 }

 return `
  <div class="ge25v2-crisis active">
   <div class="ge25v2-crisis-title">
    <span>${c.icon}</span>

    <div>
     <small>LIVE GRID EMERGENCY</small>
     <h3>${c.name}</h3>
     <p>${c.text}</p>
    </div>
   </div>

   <div class="ge25v2-crisis-options">
    ${options.map(o=>`
     <button
      type="button"
      onclick="GE25V2Crisis('${o[0]}')"
     >
      <strong>${o[1]}</strong>
      <small>${o[2]}</small>
     </button>
    `).join("")}
   </div>
  </div>
 `;
}

function plantHTML(p){
 const ps=state.plants[p.id];

 if(!ps?.unlocked){
  return `
   <div class="ge25v2-card locked">
    <small>${p.type}</small>
    <h3>${p.name}</h3>
    <p>Unlock ${money(p.unlock)}</p>

    <button
     onclick="GE25V2Unlock('${p.id}')"
    >
     UNLOCK PLANT
    </button>
   </div>
  `;
 }

 const level=plantLevel(p);

 return `
  <div class="ge25v2-card">
   <div class="ge25v2-cardhead">
    <div>
     <small>${p.type}</small>
     <h3>${p.name}</h3>
    </div>

    <b>LV ${level}</b>
   </div>

   <p>
    ${power(plantOutput(p)*outputMultiplier())}/cycle
   </p>

   <div class="ge25v2-meter">
    <i style="width:${Math.min(100,level/25*100)}%"></i>
   </div>

   <button
    onclick="GE25V2Upgrade('${p.id}')"
   >
    UPGRADE • ${money(upgradeCost(p))}
   </button>
  </div>
 `;
}

function taskHTML(t){
 const v=
  Math.min(
   t.target,
   Math.max(0,t.value(state))
  );

 const done=
  state.completedTasks.includes(t.id);

 const pct=
  Math.max(
   0,
   Math.min(100,v/t.target*100)
  );

 return `
  <div class="ge25v2-task ${done?"done":""}">
   <div>
    <strong>${done?"✓ ":""}${t.name}</strong>
    <small>${t.text}</small>
   </div>

   <b>+${t.reward}</b>

   <div class="ge25v2-meter">
    <i style="width:${pct}%"></i>
   </div>
  </div>
 `;
}

function contractHTML(c){
 const done=
  state.contractsCompleted.includes(c.id);

 const v=
  Math.min(
   c.target,
   c.value(state)
  );

 const ready=
  v>=c.target && !done;

 const pct=
  Math.min(
   100,
   v/c.target*100
  );

 return `
  <div class="ge25v2-card ${done?"done":""}">
   <small>EVENT CONTRACT</small>
   <h3>${c.name}</h3>
   <p>${c.text}</p>

   <div class="ge25v2-meter">
    <i style="width:${pct}%"></i>
   </div>

   <div class="ge25v2-rewardline">
    ${money(c.cash)} •
    +${c.score} Score
   </div>

   <button
    ${ready?"":"disabled"}
    onclick="GE25V2Contract('${c.id}')"
   >
    ${done?"COMPLETED":ready?"COMPLETE CONTRACT":"IN PROGRESS"}
   </button>
  </div>
 `;
}

function researchHTML(r){
 const owned=
  researchOwned(r.id);

 return `
  <div class="ge25v2-card ${owned?"done":""}">
   <small>EVENT RESEARCH</small>
   <h3>${r.name}</h3>
   <p>${r.text}</p>

   <button
    ${owned?"disabled":""}
    onclick="GE25V2Research('${r.id}')"
   >
    ${owned
      ?"RESEARCHED"
      :"UNLOCK • "+r.cost+" RP"}
   </button>
  </div>
 `;
}

function projectHTML(p){
 const done=
  state.projectsCompleted.includes(p.id);

 const plantsReady=
  unlockedCount()>=p.plants;

 const cashReady=
  state.cash>=p.cost;

 const ready=
  plantsReady &&
  cashReady &&
  !done;

 return `
  <div class="ge25v2-project ${done?"done":""}">
   <small>MAJOR INFRASTRUCTURE</small>

   <h3>${p.name}</h3>

   <p>${p.text}</p>

   <div class="ge25v2-projectreq">
    <span>
     ${plantsReady?"✓":"○"}
     ${p.plants} Plants
    </span>

    <span>
     ${cashReady?"✓":"○"}
     ${money(p.cost)}
    </span>
   </div>

   <div class="ge25v2-rewardline">
    +${p.score.toLocaleString()} Score •
    +${p.research} RP •
    +${p.credits} Event Credits
   </div>

   <button
    ${ready?"":"disabled"}
    onclick="GE25V2Project('${p.id}')"
   >
    ${done?"PROJECT COMPLETE":"BUILD PROJECT"}
   </button>
  </div>
 `;
}

function rewardHTML(r,i){
 const claimed=
  state.claimedRewards.includes(i);

 const ready=
  state.score>=r.score && !claimed;

 const cash=
  mainRewardCash(r.cashMult);

 return `
  <div class="ge25v2-reward ${ready?"ready":""} ${claimed?"claimed":""}">

   <div class="ge25v2-node">
    ${claimed?"✓":ready?"!":"⚡"}
   </div>

   <div>
    <strong>
     ${r.score.toLocaleString()} SCORE
    </strong>

    <span>${r.label}</span>

    <small>
     ${money(cash)} Main Cash •
     ${r.credits} Grid Credits
    </small>
   </div>

   <button
    ${ready?"":"disabled"}
    onclick="GE25V2Reward(${i})"
   >
    ${claimed?"CLAIMED":ready?"CLAIM":"LOCKED"}
   </button>
  </div>
 `;
}


/* ------------------------------------------------
   VIEW CONTENT
------------------------------------------------ */

function viewHTML(){
 if(state.view==="fleet"){
  return `
   <section class="ge25v2-section">
    <small>EVENT GENERATION DIVISION</small>
    <h2>Build the Event Fleet</h2>

    <div class="ge25v2-grid">
     ${PLANTS.map(plantHTML).join("")}
    </div>
   </section>
  `;
 }

 if(state.view==="contracts"){
  return `
   <section class="ge25v2-section">
    <small>WEEKLY OPERATIONS</small>
    <h2>Event Contracts</h2>

    <p>
     Build the temporary utility to satisfy
     increasingly demanding customers.
    </p>

    <div class="ge25v2-grid">
     ${CONTRACTS.map(contractHTML).join("")}
    </div>
   </section>
  `;
 }

 if(state.view==="research"){
  return `
   <section class="ge25v2-section">
    <div class="ge25v2-titleline">
     <div>
      <small>EVENT R&D</small>
      <h2>Research Program</h2>
     </div>

     <b>${state.research.length}/${RESEARCH.length}</b>
    </div>

    <div class="ge25v2-grid">
     ${RESEARCH.map(researchHTML).join("")}
    </div>
   </section>
  `;
 }

 if(state.view==="projects"){
  return `
   <section class="ge25v2-section">
    <small>EVENT ENDGAME</small>
    <h2>Major Projects</h2>

    <div class="ge25v2-grid">
     ${PROJECTS.map(projectHTML).join("")}
    </div>
   </section>
  `;
 }

 if(state.view==="rewards"){
  return `
   <section class="ge25v2-section">
    <small>PERMANENT COMPANY VALUE</small>
    <h2>Main Company Rewards</h2>

    <p>
     Build your temporary Event utility,
     then transfer earned rewards back to
     your permanent company.
    </p>

    <div class="ge25v2-rewards">
     ${REWARDS.map(rewardHTML).join("")}
    </div>
   </section>
  `;
 }

 return `
  ${crisisHTML()}

  <section class="ge25v2-operations">

   <div class="ge25v2-market">
    <div>
     <small>GRID DEMAND</small>
     <strong>${demandLabel()}</strong>
    </div>

    <div>
     <small>SPOT MARKET</small>
     <strong>$${marketPrice().toFixed(2)}/kWh</strong>
    </div>
   </div>

   <div class="ge25v2-resources">
    <div>
     <small>EVENT CASH</small>
     <b>${money(state.cash)}</b>
    </div>

    <div>
     <small>STORED POWER</small>
     <b>${power(state.power)}</b>
    </div>

    <div>
     <small>OUTPUT</small>
     <b>${power(totalOutput())}</b>
    </div>
   </div>

   <button
    class="ge25v2-generate"
    onclick="GE25V2Generate()"
   >
    ⚡ RUN GENERATION
   </button>

   <button
    class="ge25v2-sell"
    onclick="GE25V2Sell()"
   >
    💵 SELL EVENT POWER •
    ${money(state.power*marketPrice())}
   </button>

  </section>

  <section class="ge25v2-section">
   <div class="ge25v2-titleline">
    <div>
     <small>RUN OBJECTIVES</small>
     <h2>Weekly Operations</h2>
    </div>

    <b>
     ${state.completedTasks.length}/${TASKS.length}
    </b>
   </div>

   <div class="ge25v2-tasks">
    ${TASKS.map(taskHTML).join("")}
   </div>
  </section>
 `;
}


/* ------------------------------------------------
   RENDER
------------------------------------------------ */

function render(){
 ensureWeek();

 checkTasks();

 const c=
  document.getElementById("ge11EventContent");

 if(!c)return;

 c.innerHTML=`
  <div id="ge25EventRunRoot">

   <section class="ge25v2-hero">

    <div class="ge25v2-kicker">
     GRIDLINE EMPIRE • WEEKLY GRID RUN
    </div>

    <h1>⚡ Peak Demand Run</h1>

    <p>
     Start from nothing. Build a temporary utility,
     survive grid emergencies, complete contracts,
     research technology and push for the highest
     weekly Event Score.
    </p>

    <div class="ge25v2-heroStats">

     <div>
      <small>EVENT SCORE</small>
      <b>${state.score.toLocaleString()}</b>
     </div>

     <div>
      <small>TIME LEFT</small>
      <b>${remaining()}</b>
     </div>

    </div>

   </section>

   ${tabsHTML()}

   ${state.view==="hq" ? "" : resourceBarHTML()}

   ${viewHTML()}

  </div>
 `;
}


/* ------------------------------------------------
   PASSIVE EVENT GENERATION
------------------------------------------------ */

setInterval(()=>{
 ensureWeek();

 const now=Date.now();

 const elapsed=
  Math.max(
   0,
   Math.min(
    5,
    (now-(state.lastTick||now))/1000
   )
  );

 state.lastTick=now;

 const gain=
  totalOutput()*
  .18*
  elapsed;

 if(gain>0){
  state.power+=gain;
  state.generated+=gain;

  addScore(passiveScore(gain));

  checkTasks();
  save();
 }

 if(
  !state.crisis &&
  Date.now()>=state.nextCrisisAt
 ){
  createCrisis();
 }

},1000);


/* ------------------------------------------------
   TAKE CONTROL OF EVENTS TAB
------------------------------------------------ */

const previousOpen=
 window.GE11OpenEvents;

function ensureEventOverlay(){
 let overlay=document.getElementById("ge11EventOverlay");

 if(!overlay){
  overlay=document.createElement("div");
  overlay.id="ge11EventOverlay";
  overlay.innerHTML=`
   <div class="ge11-window">
    <button class="ge11-close" onclick="GE11CloseEvents()">×</button>
    <div id="ge11EventContent"></div>
   </div>`;
  document.body.appendChild(overlay);
 }

 return overlay;
}

window.GE11OpenEvents=function(){
 /* 1.1.1 Build 27:
    bypass the legacy event-opening flow entirely.
    Reuse the overlay shell, but only Weekly Grid
    Run V2 is allowed to populate the content. */
 const overlay=ensureEventOverlay();
 overlay.classList.add("open");
 setTimeout(render,0);
};

window.GE11CloseEvents=function(){
 const overlay=document.getElementById("ge11EventOverlay");
 if(overlay)overlay.classList.remove("open");
};


/* ------------------------------------------------
   BOOT
------------------------------------------------ */

function boot(){
 ensureWeek();

 setInterval(()=>{
 const overlay=
  document.getElementById("ge11EventOverlay");

 if(
  !overlay?.classList.contains("open")
 ){
  return;
 }

 /*
  Only Event HQ needs a periodic full render.

  Other Event tabs can be long/scrollable.
  Rebuilding them every 5 seconds resets the
  user's scroll position, so leave them alone.
 */
 if(state.view!=="hq"){
  return;
 }

 render();

},5000);
}

if(document.readyState==="loading"){
 document.addEventListener(
  "DOMContentLoaded",
  boot
 );
}else{
 boot();
}

console.log(
 "Gridline Empire Build 25 Event Run V2 loaded."
);



/* BUILD 25 EVENT RANKINGS FORCE V1 */

const GE25_EVENT_LB =
  "com.calascointeractive.powerplanttycoon.lb.weeklyeventscore";

let ge25LastRankSubmitScore=-1;
let ge25LastRankSubmitTime=0;

function ge25NativeHandler(){
  try{
    const native =
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.powerPlantStoreKit;

    if(
      !native ||
      typeof native.postMessage!=="function"
    ){
      console.warn(
        "Gridline: powerPlantStoreKit native bridge unavailable."
      );
      return null;
    }

    return native;

  }catch(e){
    console.warn(
      "Gridline: exact native bridge lookup failed.",
      e
    );
    return null;
  }
}

function ge25PostGameCenter(action,extra){
  const h=ge25NativeHandler();

  if(!h){
    console.warn("Gridline: native Game Center bridge unavailable.");
    return false;
  }

  try{
    h.postMessage(
      Object.assign(
        {action:action},
        extra||{}
      )
    );

    return true;
  }catch(e){
    console.warn("Gridline: Game Center message failed.",e);
    return false;
  }
}

function ge25CurrentEventScore(){
  return Math.max(
    0,
    Math.min(
      100000000,
      Math.floor(Number(state.score)||0)
    )
  );
}

function ge25SubmitWeeklyEventScore(force){
  const score=ge25CurrentEventScore();

  if(score<=0)return false;

  const now=Date.now();

  if(!force){
    if(now-ge25LastRankSubmitTime<60000){
      return false;
    }

    if(
      score===ge25LastRankSubmitScore &&
      now-ge25LastRankSubmitTime<300000
    ){
      return false;
    }
  }

  const sent=ge25PostGameCenter(
    "gameCenterSubmit",
    {
      leaderboardID:GE25_EVENT_LB,
      score:score
    }
  );

  if(sent){
    ge25LastRankSubmitScore=score;
    ge25LastRankSubmitTime=now;
  }

  return sent;
}

window.GE25OpenWeeklyEventRankings=function(){

  ge25SubmitWeeklyEventScore(true);

  const opened=ge25PostGameCenter(
    "gameCenterShow",
    {
      leaderboardID:GE25_EVENT_LB
    }
  );

  if(!opened){
    if(typeof toast==="function"){
      toast("Game Center is unavailable. Make sure you are signed in.");
    }else{
      alert("Game Center is unavailable. Make sure you are signed in.");
    }
  }
};

function ge25RankingsCardHTML(){

  return `
    <section
      id="ge25WeeklyRankingCard"
      class="ge25v2-section ge25-ranking-card"
    >

      <div class="ge25-ranking-head">

        <div>
          <small>WEEKLY COMPETITION</small>
          <h2>Event Rankings</h2>
        </div>

        <div class="ge25-ranking-score">
          <small>YOUR SCORE</small>
          <b>
            ${ge25CurrentEventScore().toLocaleString()}
          </b>
        </div>

      </div>

      <p>
        Compete for the highest Event Score before
        the weekly Event Run resets.
      </p>

      <button
        type="button"
        class="ge25-ranking-button"
        onclick="window.GE25OpenWeeklyEventRankings()"
      >
        VIEW WEEKLY RANKINGS
      </button>

    </section>
  `;
}

function ge25EnsureRankingCard(){

  const old=document.getElementById(
    "ge25WeeklyRankingCard"
  );

  if(state.view!=="rewards"){
    if(old)old.remove();
    return;
  }

  const host=document.getElementById(
    "ge11EventContent"
  );

  if(!host)return;

  if(old){
    const scoreNode=
      old.querySelector(
        ".ge25-ranking-score b"
      );

    if(scoreNode){
      scoreNode.textContent=
        ge25CurrentEventScore().toLocaleString();
    }

    return;
  }

  host.insertAdjacentHTML(
    "beforeend",
    ge25RankingsCardHTML()
  );
}

/*
 Keep the Rankings card attached even when
 the Event renderer rebuilds its innerHTML.
*/
setInterval(function(){
  ge25EnsureRankingCard();
},250);

/*
 Game Center score syncing.
*/
setInterval(function(){
  ge25SubmitWeeklyEventScore(false);
},60000);

document.addEventListener(
  "visibilitychange",
  function(){
    if(document.hidden){
      ge25SubmitWeeklyEventScore(true);
    }
  }
);

console.log(
  "Gridline Empire Weekly Event Rankings V1 loaded."
);


})();
