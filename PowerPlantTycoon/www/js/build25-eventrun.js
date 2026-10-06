/* GRIDLINE EMPIRE 1.1
   BUILD 25 - WEEKLY EVENT RUN
   Separate temporary company. Main company remains untouched
   except when a player claims an earned main-company reward.
*/

(function(){
"use strict";

const KEY="GRIDLINE_11_EVENT_RUN";
const WEEK=7*24*60*60*1000;

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

const TASKS=[
  {
    id:"generate",
    name:"Power the Event Grid",
    text:"Generate 250 event power",
    target:250,
    reward:150,
    value:s=>s.generated
  },
  {
    id:"sales",
    name:"Work the Market",
    text:"Complete 10 event power sales",
    target:10,
    reward:250,
    value:s=>s.sales
  },
  {
    id:"upgrades",
    name:"Modernize the Fleet",
    text:"Complete 5 plant upgrades",
    target:5,
    reward:350,
    value:s=>s.upgrades
  },
  {
    id:"plants",
    name:"Expand Operations",
    text:"Operate 3 event plants",
    target:3,
    reward:500,
    value:s=>unlockedCount(s)
  },
  {
    id:"earn",
    name:"Build Event Revenue",
    text:"Earn $25,000 during this run",
    target:25000,
    reward:750,
    value:s=>s.totalEarned
  },
  {
    id:"score",
    name:"Peak Demand Operator",
    text:"Reach 5,000 Event Score",
    target:5000,
    reward:1000,
    value:s=>s.score
  }
];

const REWARDS=[
  {score:500,credits:20,cashMult:1,label:"Grid Starter Cache"},
  {score:1500,credits:35,cashMult:2,label:"Operations Cache"},
  {score:4000,credits:60,cashMult:3,label:"Regional Grid Cache"},
  {score:8000,credits:100,cashMult:5,label:"Executive Event Cache"},
  {score:15000,credits:175,cashMult:8,label:"Peak Demand Grand Cache"}
];

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

function freshState(){
  const plants={};

  PLANTS.forEach((p,i)=>{
    plants[p.id]={
      unlocked:i===0,
      level:i===0?1:0
    };
  });

  return {
    version:1,
    week:weekIndex(),

    cash:0,
    power:0,

    generated:0,
    soldPower:0,
    totalEarned:0,
    sales:0,
    upgrades:0,

    score:0,

    plants,

    completedTasks:[],
    claimedRewards:[],

    startedAt:Date.now(),
    lastTick:Date.now()
  };
}

function load(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||"null");

    if(
      !raw ||
      raw.week!==weekIndex() ||
      !raw.plants
    ){
      return freshState();
    }

    raw.cash=Math.max(0,Number(raw.cash)||0);
    raw.power=Math.max(0,Number(raw.power)||0);
    raw.generated=Math.max(0,Number(raw.generated)||0);
    raw.soldPower=Math.max(0,Number(raw.soldPower)||0);
    raw.totalEarned=Math.max(0,Number(raw.totalEarned)||0);
    raw.sales=Math.max(0,Number(raw.sales)||0);
    raw.upgrades=Math.max(0,Number(raw.upgrades)||0);
    raw.score=Math.max(0,Number(raw.score)||0);

    if(!Array.isArray(raw.completedTasks)){
      raw.completedTasks=[];
    }

    if(!Array.isArray(raw.claimedRewards)){
      raw.claimedRewards=[];
    }

    PLANTS.forEach((p,i)=>{
      if(!raw.plants[p.id]){
        raw.plants[p.id]={
          unlocked:i===0,
          level:i===0?1:0
        };
      }
    });

    return raw;
  }catch(e){
    return freshState();
  }
}

let state=load();

function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
}

function ensureWeek(){
  if(state.week!==weekIndex()){
    state=freshState();
    save();
  }
}

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

function plantOutput(p){
  const level=plantLevel(p);

  if(level<=0)return 0;

  return p.base*Math.pow(1.34,level-1);
}

function totalOutput(){
  return PLANTS.reduce((sum,p)=>{
    if(!state.plants[p.id]?.unlocked)return sum;
    return sum+plantOutput(p);
  },0);
}

function upgradeCost(p){
  const level=Math.max(1,plantLevel(p));

  return Math.round(
    p.upgrade*Math.pow(1.62,level-1)
  );
}

function marketMult(){
  const minute=Date.now()/60000;

  const wave=
    1+
    Math.sin(minute*.53)*.18+
    Math.sin(minute*.17)*.12;

  return Math.max(.75,Math.min(1.45,wave));
}

function marketPrice(){
  return 1.55*marketMult();
}

function demandLabel(){
  const m=marketMult();

  if(m>=1.28)return "EXTREME DEMAND";
  if(m>=1.12)return "DEMAND SURGE";
  if(m<=.88)return "LOW DEMAND";

  return "GRID NORMAL";
}

function money(v){
  const n=Math.max(0,Number(v)||0);

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

function addScore(amount){
  state.score=Math.max(
    0,
    Math.floor(
      state.score+Math.max(0,Number(amount)||0)
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
      changed=true;

      if(typeof toast==="function"){
        toast(
          "🏆 Event Task Complete: "+
          t.name+
          " +"+
          t.reward+
          " Score"
        );
      }
    }
  });

  if(changed)save();
}

function generateBurst(){
  ensureWeek();

  const amount=Math.max(1,totalOutput()*5);

  state.power+=amount;
  state.generated+=amount;

  addScore(Math.max(1,Math.floor(amount/3)));

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
      toast("Generate event power first.");
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
    Math.max(
      5,
      Math.floor(revenue/12)
    )
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

function unlockPlant(id){
  ensureWeek();

  const p=PLANTS.find(x=>x.id===id);
  if(!p)return;

  const ps=state.plants[id];

  if(ps.unlocked)return;

  if(state.cash<p.unlock){
    if(typeof toast==="function"){
      toast(
        "Need "+
        money(p.unlock)+
        " event cash."
      );
    }
    return;
  }

  state.cash-=p.unlock;
  ps.unlocked=true;
  ps.level=1;

  addScore(400);

  checkTasks();
  save();
  render();

  if(typeof toast==="function"){
    toast("🏭 "+p.name+" ONLINE");
  }
}

function upgradePlant(id){
  ensureWeek();

  const p=PLANTS.find(x=>x.id===id);
  if(!p)return;

  const ps=state.plants[id];

  if(!ps?.unlocked)return;

  const cost=upgradeCost(p);

  if(state.cash<cost){
    if(typeof toast==="function"){
      toast(
        "Need "+
        money(cost)+
        " event cash."
      );
    }
    return;
  }

  state.cash-=cost;
  ps.level=Math.min(25,plantLevel(p)+1);
  state.upgrades+=1;

  addScore(150+plantLevel(p)*15);

  checkTasks();
  save();
  render();

  if(typeof toast==="function"){
    toast(
      "🔧 "+
      p.name+
      " upgraded to Level "+
      plantLevel(p)
    );
  }
}

function mainRewardCash(mult){
  let base=5000;

  try{
    const mainCash=Math.max(
      0,
      Number(g?.cash)||0
    );

    const mainOutput=
      typeof output==="function"
        ? Math.max(0,Number(output())||0)
        : 0;

    base=Math.max(
      5000,
      mainCash*.08,
      mainOutput*400
    );
  }catch(e){}

  return Math.round(
    Math.min(1e12,base*Math.max(1,mult))
  );
}

function claimReward(index){
  ensureWeek();

  const r=REWARDS[index];
  if(!r)return;

  if(state.score<r.score){
    if(typeof toast==="function"){
      toast("Reach "+r.score.toLocaleString()+" Event Score first.");
    }
    return;
  }

  if(state.claimedRewards.includes(index)){
    return;
  }

  const cash=mainRewardCash(r.cashMult);

  try{
    if(typeof g!=="undefined"){
      g.cash=Math.min(
        1e300,
        (Number(g.cash)||0)+cash
      );

      g.gridCredits=Math.min(
        1e15,
        (Number(g.gridCredits)||0)+r.credits
      );

      if(typeof saveGame==="function"){
        saveGame();
      }

      if(typeof render==="function"){
        render();
      }
    }
  }catch(e){
    console.warn("Main reward transfer failed.",e);
    return;
  }

  state.claimedRewards.push(index);
  save();
  render();

  if(typeof toast==="function"){
    toast(
      "🎁 Main Company Reward: "+
      money(cash)+
      " + "+
      r.credits+
      " Grid Credits"
    );
  }
}

window.GE25EventRunGenerate=generateBurst;
window.GE25EventRunSell=sellPower;
window.GE25EventRunUnlock=unlockPlant;
window.GE25EventRunUpgrade=upgradePlant;
window.GE25EventRunClaimReward=claimReward;

function plantHTML(p){
  const ps=state.plants[p.id];
  const unlocked=!!ps?.unlocked;
  const level=plantLevel(p);

  if(!unlocked){
    return `
      <div class="ge25er-plant locked">
        <div>
          <small>${p.type}</small>
          <strong>${p.name}</strong>
          <span>
            Unlock ${money(p.unlock)}
          </span>
        </div>

        <button
          type="button"
          onclick="GE25EventRunUnlock('${p.id}')"
        >
          UNLOCK
        </button>
      </div>
    `;
  }

  const cost=upgradeCost(p);

  return `
    <div class="ge25er-plant online">
      <div class="ge25er-plant-top">
        <div>
          <small>${p.type}</small>
          <strong>${p.name}</strong>
          <span>
            Level ${level} •
            ${power(plantOutput(p))}/cycle
          </span>
        </div>

        <b>ONLINE</b>
      </div>

      <div class="ge25er-levelbar">
        <i style="width:${Math.min(100,(level/25)*100)}%"></i>
      </div>

      <button
        type="button"
        onclick="GE25EventRunUpgrade('${p.id}')"
      >
        UPGRADE • ${money(cost)}
      </button>
    </div>
  `;
}

function taskHTML(t){
  const value=Math.min(
    t.target,
    Math.max(0,t.value(state))
  );

  const done=
    state.completedTasks.includes(t.id);

  const pct=Math.max(
    0,
    Math.min(100,(value/t.target)*100)
  );

  const displayValue=
    t.id==="earn"
      ? money(value)
      : Math.floor(value).toLocaleString();

  const displayTarget=
    t.id==="earn"
      ? money(t.target)
      : t.target.toLocaleString();

  return `
    <div class="ge25er-task ${done?"done":""}">
      <div class="ge25er-task-head">
        <div>
          <strong>${done?"✓ ":""}${t.name}</strong>
          <small>${t.text}</small>
        </div>

        <b>+${t.reward}</b>
      </div>

      <div class="ge25er-task-progress">
        <i style="width:${pct}%"></i>
      </div>

      <span>
        ${displayValue} / ${displayTarget}
      </span>
    </div>
  `;
}

function rewardHTML(r,i){
  const claimed=
    state.claimedRewards.includes(i);

  const ready=
    state.score>=r.score && !claimed;

  const cash=mainRewardCash(r.cashMult);

  return `
    <div class="ge25er-reward ${ready?"ready":""} ${claimed?"claimed":""}">
      <div class="ge25er-reward-node">
        ${claimed?"✓":ready?"!":"⚡"}
      </div>

      <div class="ge25er-reward-copy">
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
        type="button"
        ${ready?"":"disabled"}
        onclick="GE25EventRunClaimReward(${i})"
      >
        ${claimed?"CLAIMED":ready?"CLAIM":"LOCKED"}
      </button>
    </div>
  `;
}

function render(){
  if(window.GE25_EVENTRUN_V2_ACTIVE)return;
  ensureWeek();

  const c=document.getElementById("ge11EventContent");

  if(!c)return;

  checkTasks();

  const out=totalOutput();
  const price=marketPrice();
  const saleValue=state.power*price;

  c.innerHTML=`
    <div id="ge25EventRunRoot">

      <section class="ge25er-hero">
        <div class="ge25er-kicker">
          GRIDLINE EMPIRE • WEEKLY GRID RUN
        </div>

        <h1>⚡ Peak Demand Run</h1>

        <p>
          Build a temporary grid from nothing.
          Push it as far as you can before the weekly reset.
        </p>

        <div class="ge25er-topstats">
          <div>
            <small>EVENT SCORE</small>
            <b>${state.score.toLocaleString()}</b>
          </div>

          <div>
            <small>TIME LEFT</small>
            <b>${remaining()}</b>
          </div>

          <div>
            <small>PLANTS</small>
            <b>${unlockedCount()}/${PLANTS.length}</b>
          </div>
        </div>
      </section>

      <section class="ge25er-control">
        <div class="ge25er-livehead">
          <div>
            <small>EVENT GRID</small>
            <strong>${demandLabel()}</strong>
          </div>

          <div>
            <small>MARKET</small>
            <strong>$${price.toFixed(2)}/kWh</strong>
          </div>
        </div>

        <div class="ge25er-resources">
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
            <b>${power(out)}</b>
          </div>
        </div>

        <button
          class="ge25er-generate"
          type="button"
          onclick="GE25EventRunGenerate()"
        >
          ⚡ RUN GENERATION • +${power(out*5)}
        </button>

        <button
          class="ge25er-sell"
          type="button"
          onclick="GE25EventRunSell()"
        >
          💵 SELL EVENT POWER • ${money(saleValue)}
        </button>

        <p class="ge25er-hint">
          Event plants generate passively while the game is open.
          Market value changes over time, so selling at peak demand matters.
        </p>
      </section>

      <section class="ge25er-section">
        <div class="ge25er-section-title">
          <div>
            <small>BUILD FROM ZERO</small>
            <h2>Event Plant Fleet</h2>
          </div>

          <b>${power(out)}/cycle</b>
        </div>

        <div class="ge25er-plants">
          ${PLANTS.map(plantHTML).join("")}
        </div>
      </section>

      <section class="ge25er-section">
        <div class="ge25er-section-title">
          <div>
            <small>WEEKLY OPERATIONS</small>
            <h2>Event Tasks</h2>
          </div>

          <b>
            ${state.completedTasks.length}/${TASKS.length}
          </b>
        </div>

        <div class="ge25er-tasks">
          ${TASKS.map(taskHTML).join("")}
        </div>
      </section>

      <section class="ge25er-section">
        <div class="ge25er-section-title">
          <div>
            <small>PERMANENT VALUE</small>
            <h2>Main Company Rewards</h2>
          </div>

          <b>TRANSFERABLE</b>
        </div>

        <p class="ge25er-section-copy">
          Earn these in the temporary Event Run and claim them
          for your permanent Gridline Empire company.
        </p>

        <div class="ge25er-rewards">
          ${REWARDS.map(rewardHTML).join("")}
        </div>
      </section>

    </div>
  `;
}

/* Passive production while the app is open.
   This is intentionally event-only. */
setInterval(()=>{
  ensureWeek();

  const now=Date.now();
  const elapsed=Math.max(
    0,
    Math.min(
      5,
      (now-(state.lastTick||now))/1000
    )
  );

  state.lastTick=now;

  const gain=
    totalOutput()*.18*elapsed;

  if(gain>0){
    state.power+=gain;
    state.generated+=gain;

    addScore(gain/25);

    checkTasks();
    save();
  }
},1000);

/* Take control of the existing Events tab,
   but preserve the old overlay/navigation. */
const oldOpen=window.GE11OpenEvents;

if(typeof oldOpen==="function"){
  window.GE11OpenEvents=function(){
    oldOpen();
    setTimeout(render,0);
  };
}

/* Old weekly renderer refreshes periodically.
   If it replaces our content, immediately restore Event Run. */
function installObserver(){
  const c=document.getElementById("ge11EventContent");

  if(!c)return;

  const observer=new MutationObserver(()=>{
    if(
      document.getElementById("ge11EventOverlay")
        ?.classList.contains("open") &&
      !document.getElementById("ge25EventRunRoot")
    ){
      setTimeout(render,0);
    }
  });

  observer.observe(c,{
    childList:true,
    subtree:false
  });
}

function boot(){
  ensureWeek();
  installObserver();

  setInterval(()=>{
    if(
      document.getElementById("ge11EventOverlay")
        ?.classList.contains("open")
    ){
      render();
    }
  },5000);
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",boot);
}else{
  boot();
}

console.log(
  "Gridline Empire Build 25 Weekly Event Run loaded."
);

})();
