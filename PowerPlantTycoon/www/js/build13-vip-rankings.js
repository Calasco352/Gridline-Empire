/* POWER PLANT TYCOON — BUILD 13 EXECUTIVE GRID VIP + GAME CENTER RANKINGS */
/* PPT BUILD 14 VIP PURCHASE UI */
/* PPT BUILD 15 MONTHLY VIP V2 */
(function(){
  if(window.__pptBuild13VipRankings)return;
  window.__pptBuild13VipRankings=true;

  const VIP={
    monthly:"com.calascointeractive.gridlineempire.vip.monthly",
    yearly:"com.calascointeractive.gridlineempire.vip.yearly"
  };
  const LB={
    company:"com.calascointeractive.powerplanttycoon.lb.companyvalue",
    prestige:"com.calascointeractive.powerplanttycoon.lb.prestige",
    empire:"com.calascointeractive.powerplanttycoon.lb.empirelevel",
    weeklyCash:"com.calascointeractive.powerplanttycoon.lb.weeklygrowth",
    weeklyEnergy:"com.calascointeractive.powerplanttycoon.lb.weeklyenergy"
  };
  const LEGACY_VIP_MONTHLY=[
  "com.calascointeractive.powerplanttycoon.vip.monthly",
  "com.calascointeractive.powerplanttycoon.vip.monthly2"
];
const LEGACY_VIP_YEARLY=[
  "com.calascointeractive.powerplanttycoon.vip.yearly"
];

const RANK_KEY="PPT_B13_RANKINGS_V1";
  const VIP_KEY="PPT_B13_VIP_DAILY_V1";
  let vipActive=false;
  let vipPlan="";
let vipPriceRetryCount=0;
let vipPriceRetryTimer=null;

  let gameCenter={authenticated:false,alias:"",lastMessage:"Compare your Prestige and Ascension progress globally."};


  /* BUILD 30 — RESTORE EXECUTIVE GRID VIP HELPERS */

  function syncProductIDs(){

    if(
      typeof PPT_STOREKIT==="undefined" ||
      !PPT_STOREKIT
    ){
      return;
    }

    if(!PPT_STOREKIT.products){
      PPT_STOREKIT.products={};
    }

    PPT_STOREKIT.products.vipMonthly=
      VIP.monthly;

    PPT_STOREKIT.products.vipYearly=
      VIP.yearly;
  }


  function native(){

    return !!(
      typeof PPT_STOREKIT!=="undefined" &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers[
        PPT_STOREKIT.bridgeName
      ]
    );
  }


  function sendNative(
    action,
    payload={}
  ){

    if(!native()){
      return false;
    }

    try{

      const handler=
        window.webkit
          .messageHandlers[
            PPT_STOREKIT.bridgeName
          ];

      handler.postMessage(
        Object.assign(
          {action},
          payload || {}
        )
      );

      return true;

    }catch(e){

      console.warn(
        "Build 30 native bridge error",
        e
      );

      return false;
    }
  }


  function updateVipFromOwned(owned){

    const ids=
      Array.isArray(owned)
      ? owned
      : [];

    const yearlyIDs=[
      VIP.yearly,
      ...LEGACY_VIP_YEARLY
    ];

    const monthlyIDs=[
      VIP.monthly,
      ...LEGACY_VIP_MONTHLY
    ];

    const yearly=
      yearlyIDs.some(
        id=>ids.includes(id)
      );

    const monthly=
      monthlyIDs.some(
        id=>ids.includes(id)
      );

    vipActive=
      yearly ||
      monthly;

    vipPlan=
      yearly
      ? "YEARLY"
      : monthly
      ? "MONTHLY"
      : "";

    applyVipVisuals();
  }


  function vipDailyReward(){

    const x=game();

    const net=
      typeof netValuePerSecond==="function"
      ? n(netValuePerSecond())
      : 0;

    const out=
      typeof output==="function"
      ? n(output())
      : 0;

    const cash=
      n(x?.cash);

    return Math.max(
      25000,
      Math.round(net*900),
      Math.round(out*300),
      Math.round(cash*.01)
    );
  }


  function ensureVipStore(){

    const store=
      document.getElementById("store");

    if(!store){
      return null;
    }

    let card=
      document.getElementById(
        "ppt13VipStore"
      );

    if(card){
      return card;
    }


    card=
      document.createElement("div");

    card.id=
      "ppt13VipStore";

    card.className=
      "card ppt13-vip-card";


    card.innerHTML=`

      <div class="ppt13-vip-head">

        <div>

          <small>
            EXECUTIVE MEMBERSHIP
          </small>

          <h3>
            ⭐ Executive Grid VIP
          </h3>

          <p>
            Monthly or yearly membership
            with premium benefits while
            subscribed.
          </p>

        </div>

        <span id="ppt13VipState">
          NOT ACTIVE
        </span>

      </div>


      <div class="ppt13-vip-benefits">

        <div>
          <b>+10%</b>
          <small>OUTPUT</small>
        </div>

        <div>
          <b>+7%</b>
          <small>SALE QUALITY</small>
        </div>

        <div>
          <b>DAILY</b>
          <small>VIP SUPPLY</small>
        </div>

        <div>
          <b>NO</b>
          <small>FORCED ADS</small>
        </div>

      </div>


      <div class="ppt13-vip-plans">

        <button
          id="ppt13VipMonthly"
          class="btn gold"
          onclick="pptBuyVIP('monthly')"
        >
          MONTHLY • CHECKING…
        </button>

        <button
          id="ppt13VipYearly"
          class="btn gold"
          onclick="pptBuyVIP('yearly')"
        >
          YEARLY • CHECKING…
        </button>

      </div>


      <div class="ppt13-vip-actions">

        <button
          id="ppt13VipDaily"
          class="btn blue"
          onclick="pptClaimVIPDaily()"
        >
          VIP MEMBERS ONLY
        </button>

        <button
          class="btn dark"
          onclick="pptManageVIP()"
        >
          MANAGE SUBSCRIPTION
        </button>

      </div>


      <div style="
        margin-top:8px;
        text-align:center;
        color:#9e9479;
        font-size:8px;
        font-weight:800;
        letter-spacing:.5px
      ">
        TODAY'S VIP SUPPLY •
        <span id="ppt13VipDailyValue">
          —
        </span>
      </div>

    `;


    const status=
      store.querySelector(
        ".b6-store-status"
      );

    const featured=
      store.querySelector(
        ".b6-store-head"
      );


    if(status){

      status.insertAdjacentElement(
        "afterend",
        card
      );

    }else if(featured){

      featured.insertAdjacentElement(
        "beforebegin",
        card
      );

    }else{

      store.prepend(card);

    }


    return card;
  }


  function applyVipVisuals(){

    document.body
      ?.classList
      .toggle(
        "ppt13-vip-active",
        vipActive
      );


    const storeBtn=
      document.querySelector(
        '[data-nav="store"]'
      );


    if(!storeBtn){
      return;
    }


    let badge=
      document.getElementById(
        "ppt13VipBadge"
      );


    if(
      vipActive &&
      !badge
    ){

      badge=
        document.createElement(
          "span"
        );

      badge.id=
        "ppt13VipBadge";

      badge.textContent=
        "VIP";

      storeBtn.appendChild(
        badge
      );
    }


    if(badge){

      badge.style.display=
        vipActive
        ? "inline-flex"
        : "none";
    }
  }


  function n(v){v=Number(v);return Number.isFinite(v)?v:0}
  function game(){try{return typeof g!=="undefined"?g:null}catch(e){return null}}
  function esc(v){return String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
  function dayKey(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  function weekKey(){
    const d=new Date(),u=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
    const day=u.getUTCDay()||7;u.setUTCDate(u.getUTCDate()+4-day);
    const y0=new Date(Date.UTC(u.getUTCFullYear(),0,1));
    const w=Math.ceil((((u-y0)/86400000)+1)/7);
    return u.getUTCFullYear()+"-W"+String(w).padStart(2,"0");
  }
  function loadRankState(){
    let s={};try{s=JSON.parse(localStorage.getItem(RANK_KEY)||"{}")||{}}catch(e){}
    const wk=weekKey(),cash=n(game()?.lifetimeCash),gen=n(game()?.generated);
    if(s.week!==wk){s={week:wk,cashBase:cash,weeklyEnergy:0,lastGenerated:gen,lastSubmit:{}}}
    if(!s.lastSubmit)s.lastSubmit={};
    if(s.cashBase==null)s.cashBase=cash;
    if(s.lastGenerated==null)s.lastGenerated=gen;
    const delta=gen>=s.lastGenerated?gen-s.lastGenerated:gen; // handles prestige/reset
    if(delta>0&&Number.isFinite(delta))s.weeklyEnergy=n(s.weeklyEnergy)+delta;
    s.lastGenerated=gen;
    try{localStorage.setItem(RANK_KEY,JSON.stringify(s))}catch(e){}
    return s;
  }
  function saveRankState(s){try{localStorage.setItem(RANK_KEY,JSON.stringify(s))}catch(e){}}
  function gcScore(v){return Math.max(0,Math.min(9000000000000000,Math.floor(n(v))))}
  function metrics(){
 const prestige=
  (game()?.prestige)||0;

 const ascension=
  (game()?.empireLevel)||0;

 return [
  {
   key:"prestige",
   id:LB.prestige,
   title:"Prestige Level",
   value:gcScore(prestige),
   display:String(gcScore(prestige)),
   scope:"ALL TIME"
  },
  {
   key:"empire",
   id:LB.empire,
   title:"Ascension Level",
   value:gcScore(ascension),
   display:String(gcScore(ascension)),
   scope:"ALL TIME"
  }
 ];
}

function renderVip(){
    ensureVipStore();applyVipVisuals();
    const state=document.getElementById("ppt13VipState");if(state){state.textContent=vipActive?("ACTIVE • "+vipPlan):"NOT ACTIVE";state.classList.toggle("active",vipActive)}
    const dailyValue=document.getElementById("ppt13VipDailyValue");
    if(dailyValue){
      const reward=vipDailyReward();
      dailyValue.textContent=(typeof money==="function"?money(reward):String(Math.floor(reward)));
    }
    const m=document.getElementById("ppt13VipMonthly"),y=document.getElementById("ppt13VipYearly");
    const pm=PPT_STOREKIT?.prices?.[VIP.monthly]||"",py=PPT_STOREKIT?.prices?.[VIP.yearly]||"";
    if(m){m.textContent=vipPlan==="MONTHLY"?"MONTHLY ACTIVE":(pm?"MONTHLY • "+pm:"MONTHLY • CHECKING…");m.disabled=vipPlan==="MONTHLY"}
    if(y){
      if(vipPlan==="YEARLY"){
        y.textContent="YEARLY ACTIVE";
        y.disabled=true;
      }else if(py){
        y.textContent="YEARLY • "+py;
        y.disabled=false;
        vipPriceRetryCount=0;
        if(vipPriceRetryTimer){clearTimeout(vipPriceRetryTimer);vipPriceRetryTimer=null;}
      }else{
        y.textContent=vipPriceRetryCount>=4?"YEARLY • PRICE UNAVAILABLE":"YEARLY • CHECKING…";
        y.disabled=true;

        if(vipPriceRetryCount<4 && !vipPriceRetryTimer){
          vipPriceRetryTimer=setTimeout(()=>{
            vipPriceRetryTimer=null;
            vipPriceRetryCount++;
            if(typeof requestStoreKitStatus==="function")requestStoreKitStatus();
            renderVip();
          },1500);
        }
      }
    }
    const d=document.getElementById("ppt13VipDaily");if(d){let s={};try{s=JSON.parse(localStorage.getItem(VIP_KEY)||"{}")||{}}catch(e){}const claimed=s.day===dayKey();d.disabled=!vipActive||claimed;d.textContent=!vipActive?"VIP MEMBERS ONLY":claimed?"VIP SUPPLY CLAIMED TODAY":"CLAIM VIP DAILY SUPPLY"}
  }
  window.pptBuyVIP=function(plan){
    syncProductIDs();const id=plan==="yearly"?VIP.yearly:VIP.monthly;
    if(!native()){if(typeof toast==="function")toast("VIP subscriptions are available in the iPhone/iPad App Store build.");return}
    if(typeof setStoreKitStatus==="function")setStoreKitStatus("Checking Apple Store…");
    if(typeof requestStoreKitStatus==="function")requestStoreKitStatus();
    setTimeout(()=>{
      if(typeof setStoreKitStatus==="function")setStoreKitStatus("Opening Apple subscription…");
      sendNative("purchase",{productID:id});
    },250);
  };
  window.pptManageVIP=function(){
    if(!native()){if(typeof toast==="function")toast("Subscription management is available on iPhone/iPad.");return}
    sendNative("manageSubscriptions");
  };
  window.pptClaimVIPDaily=function(){
    if(!vipActive){if(typeof toast==="function")toast("Executive Grid VIP is not active.");return}
    let s={};try{s=JSON.parse(localStorage.getItem(VIP_KEY)||"{}")||{}}catch(e){}
    if(s.day===dayKey()){if(typeof toast==="function")toast("VIP daily supply already claimed.");return}
    let reward=vipDailyReward();
    if(typeof recordEarnedCash==="function")recordEarnedCash(reward);else if(game())g.cash=n(g.cash)+reward;
    s.day=dayKey();try{localStorage.setItem(VIP_KEY,JSON.stringify(s))}catch(e){}
    if(typeof addLog==="function")addLog("Executive Grid VIP daily supply received: "+(typeof money==="function"?money(reward):reward)+".");
    if(typeof saveGame==="function")saveGame();if(typeof render==="function")render();renderVip();
    if(typeof feedback==="function")feedback("big");if(typeof toast==="function")toast("💎 VIP daily supply: "+(typeof money==="function"?money(reward):reward));
  };

  function ensureRankings(){
 const stats=document.getElementById("stats");

 if(!stats)return;

 let card=document.getElementById("ppt13Rankings");

 if(card)return;

 card=document.createElement("div");
 card.id="ppt13Rankings";
 card.className="card ppt13-rank-card";

 card.innerHTML=`
  <div class="ppt13-rank-head">
   <div>
    <small>GLOBAL COMPETITION</small>
    <h3>🏆 Gridline Rankings</h3>
    <p id="ppt13GCStatus">
     Prestige and Ascension global rankings.
    </p>
   </div>

   <span id="ppt13GCAlias">OFFLINE</span>
  </div>

  <div id="ppt13RankList" class="ppt13-rank-list">

   <div class="ppt13-rank-row">
    <div>
     <small>ALL TIME</small>
     <strong>Prestige Level</strong>
     <span id="ppt13PrestigeValue">0</span>
    </div>

    <button
     class="btn dark"
     onclick="pptOpenLeaderboard('${LB.prestige}')"
    >
     VIEW
    </button>
   </div>

   <div class="ppt13-rank-row">
    <div>
     <small>ALL TIME</small>
     <strong>Ascension Level</strong>
     <span id="ppt13AscensionValue">0</span>
    </div>

    <button
     class="btn dark"
     onclick="pptOpenLeaderboard('${LB.empire}')"
    >
     VIEW
    </button>
   </div>

  </div>

  <div class="ppt13-rank-actions">
   <button
    class="btn blue"
    onclick="pptSyncRankings(true)"
   >
    SYNC SCORES
   </button>

   <button
    class="btn dark"
    onclick="pptGameCenterAuth()"
   >
    CONNECT GAME CENTER
   </button>
  </div>

  <p class="small">
   Prestige and Ascension scores are submitted to Apple Game Center.
  </p>
 `;

 const banner=stats.querySelector(".uf-banner");

 if(banner){
  banner.insertAdjacentElement("afterend",card);
 }else{
  stats.prepend(card);
 }
}
  function renderRankings(){
 ensureRankings();

 const current=
  typeof game==="function"
   ? game()
   : null;

 const prestige=
  gcScore(
   current &&
   Number.isFinite(Number(current.prestige))
    ? Number(current.prestige)
    : 0
  );

 const ascension=
  gcScore(
   current &&
   Number.isFinite(Number(current.empireLevel))
    ? Number(current.empireLevel)
    : 0
  );

 const prestigeEl=
  document.getElementById("ppt13PrestigeValue");

 if(prestigeEl){
  prestigeEl.textContent=
   prestige.toLocaleString();
 }

 const ascensionEl=
  document.getElementById("ppt13AscensionValue");

 if(ascensionEl){
  ascensionEl.textContent=
   ascension.toLocaleString();
 }

 const status=
  document.getElementById("ppt13GCStatus");

 if(status){
  status.textContent=
   gameCenter.lastMessage ||
   "Prestige and Ascension global rankings.";
 }

 const alias=
  document.getElementById("ppt13GCAlias");

 if(alias){
  alias.textContent=
   gameCenter.authenticated
    ? (gameCenter.alias || "CONNECTED")
    : (native() ? "OFFLINE" : "IPHONE/IPAD ONLY");

  alias.classList.toggle(
   "active",
   gameCenter.authenticated
  );
 }
}
  window.pptGameCenterAuth=function(){
    if(!native()){gameCenter.lastMessage="Game Center rankings are available in the iPhone/iPad build.";renderRankings();return}
    gameCenter.lastMessage="Connecting to Game Center…";renderRankings();sendNative("gameCenterAuth");
  };
  window.pptOpenLeaderboard=function(id){
    if(!native()){if(typeof toast==="function")toast("Game Center is available in the iPhone/iPad build.");return}
    sendNative("gameCenterShow",{leaderboardID:id});
  };
  window.pptSyncRankings=function(force){
    if(!native()||!gameCenter.authenticated){if(force)pptGameCenterAuth();return}
    const s=loadRankState();
    metrics().forEach(m=>{
      const last=n(s.lastSubmit?.[m.id]);
      if(force||m.value>last){sendNative("gameCenterSubmit",{leaderboardID:m.id,score:m.value});s.lastSubmit[m.id]=Math.max(last,m.value)}
    });
    saveRankState(s);gameCenter.lastMessage="Ranking scores synced with Game Center.";renderRankings();
  };

  /* VIP applies after all Build 8/Build 6 balance wrappers. */
  if(typeof totalMult==="function"&&!totalMult.__ppt13Vip){const base=totalMult;const f=function(){return base.apply(this,arguments)*(vipActive?1.10:1)};f.__ppt13Vip=true;totalMult=f}
  if(typeof marketSaleMult==="function"&&!marketSaleMult.__ppt13Vip){const base=marketSaleMult;const f=function(){return base.apply(this,arguments)*(vipActive?1.07:1)};f.__ppt13Vip=true;marketSaleMult=f}
  if(typeof markInterstitialOpportunity==="function"&&!markInterstitialOpportunity.__ppt13Vip){const base=markInterstitialOpportunity;const f=function(){if(vipActive)return;return base.apply(this,arguments)};f.__ppt13Vip=true;markInterstitialOpportunity=f}
  if(typeof tryShowPendingInterstitial==="function"&&!tryShowPendingInterstitial.__ppt13Vip){const base=tryShowPendingInterstitial;const f=function(){if(vipActive){if(game()?.adState)g.adState.pending=false;return}return base.apply(this,arguments)};f.__ppt13Vip=true;tryShowPendingInterstitial=f}

  const previousResult=window.powerPlantStoreKitResult;
  window.powerPlantStoreKitResult=function(p){
    try{
      const isGC=p&&typeof p.status==="string"&&p.status.startsWith("gameCenter");
      if(isGC){
        if(p.status==="gameCenterAuth"){
          gameCenter.authenticated=!!p.authenticated;gameCenter.alias=p.alias||"";
          gameCenter.lastMessage=gameCenter.authenticated?("Connected as "+(gameCenter.alias||"Game Center Player")):"Game Center sign-in is not active.";
          if(gameCenter.authenticated)setTimeout(()=>pptSyncRankings(false),300);
        }else if(p.status==="gameCenterSubmitted"){
          gameCenter.lastMessage="Scores are up to date on Game Center.";
        }else if(p.status==="gameCenterError"){
          gameCenter.lastMessage=p.message||"Game Center is unavailable right now.";
        }
        renderRankings();return;
      }
      if(p?.status==="error"&&(p.productID===VIP.monthly||p.productID===VIP.yearly)){
        const msg=p.message||"This VIP plan is not available from Apple yet. Please try again.";
        if(typeof setStoreKitStatus==="function")setStoreKitStatus(msg);
        if(typeof toast==="function")toast(msg);
        renderVip();return;
      }
      if(p?.status==="purchased"&&(p.productID===VIP.monthly||p.productID===VIP.yearly)){
        updateVipFromOwned(Array.isArray(p.ownedProductIDs)?p.ownedProductIDs:[p.productID]);
    renderVip();
    if(typeof saveGame==="function")saveGame();
        if(typeof toast==="function")toast("💎 Executive Grid VIP activated!");
        if(typeof setStoreKitStatus==="function")setStoreKitStatus("VIP membership active.");
        return;
      }
      if(typeof previousResult==="function")previousResult(p);
      if(p?.prices&&typeof p.prices==="object"&&typeof PPT_STOREKIT!=="undefined")Object.assign(PPT_STOREKIT.prices,p.prices);
      if(Array.isArray(p?.ownedProductIDs))updateVipFromOwned(p.ownedProductIDs);
      renderVip();
    }catch(e){console.warn("Build 13 VIP/Rankings bridge error",e);if(typeof previousResult==="function")previousResult(p)}
  };

  if(typeof render==="function"&&!render.__ppt13VipRankings){const base=render;const f=function(){const r=base.apply(this,arguments);renderVip();renderRankings();loadRankState();return r};f.__ppt13VipRankings=true;render=f}
  if(typeof showPage==="function"&&!showPage.__ppt13Rankings){const base=showPage;const f=function(id,b){const r=base.apply(this,arguments);if(id==="stats"){renderRankings();setTimeout(()=>pptSyncRankings(false),450)}return r};f.__ppt13Rankings=true;showPage=f}

  document.addEventListener("visibilitychange",()=>{if(!document.hidden){if(typeof requestStoreKitStatus==="function")requestStoreKitStatus();pptGameCenterAuth();setTimeout(()=>pptSyncRankings(false),900)}});

  syncProductIDs();ensureVipStore();ensureRankings();renderVip();renderRankings();loadRankState();
  if(native()){setTimeout(()=>pptGameCenterAuth(),700);setTimeout(()=>{if(typeof requestStoreKitStatus==="function")requestStoreKitStatus()},350)}

  window.pptBuild13LaunchAudit=function(){
    const a={vipActive,vipPlan,gameCenterAuthenticated:gameCenter.authenticated,leaderboards:Object.assign({},LB),vipProducts:Object.assign({},VIP),metrics:metrics(),hqThemeOwned:!!game()?.hqExecutiveThemeUnlocked};
    console.table(a);return a;
  };
})();

/* PPT BUILD 16 FINAL EARLY ECONOMY V2 */
(function(){
  if(window.__pptBuild16EarlyEconomyV2)return;
  window.__pptBuild16EarlyEconomyV2=true;
  const KEY="PPT_B16_EARLY_ECONOMY_V2";
  function num(v){v=Number(v);return Number.isFinite(v)?v:0}
  function game(){try{return typeof g!=="undefined"?g:null}catch(e){return null}}
  function state(){let s={};try{s=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}return s}
  function saveState(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  function runCash(){const x=game();if(!x)return 1e99;const r=num(x.prestigeRunCash);if(r>0)return r;return num(x.lifetimeCash)}
  function earlyMult(){const r=runCash();if(r<1000)return 1.25;if(r<5000)return 1.20;if(r<25000)return 1.10;return 1}
  function earlySaleMult(){const r=runCash();if(r<1000)return 1.08;if(r<5000)return 1.05;return 1}
  function ensureRestartHelp(){
    const x=game();if(!x)return;
    const prestige=Math.max(0,Math.floor(num(x.prestige)));
    const s=state();
    const firstRun=prestige===0 && num(x.lifetimeCash)<1000;
    const freshPrestige=prestige>0 && num(x.prestigeRunCash)<5000;
    const token=firstRun?"new":("p"+prestige);
    if((firstRun||freshPrestige) && s.lastGrant!==token && num(x.cash)<250){
      x.cash=250;
      s.lastGrant=token;saveState(s);
      if(typeof addLog==="function")addLog("Startup capital: $250 • early fleet momentum active.");
      if(typeof saveGame==="function")saveGame();
    }
  }
  if(typeof totalMult==="function"&&!totalMult.__ppt16EarlyEconomy){
    const base=totalMult;const f=function(){return base.apply(this,arguments)*earlyMult()};f.__ppt16EarlyEconomy=true;totalMult=f;
  }
  if(typeof marketSaleMult==="function"&&!marketSaleMult.__ppt16EarlyEconomy){
    const base=marketSaleMult;const f=function(){return base.apply(this,arguments)*earlySaleMult()};f.__ppt16EarlyEconomy=true;marketSaleMult=f;
  }
  if(typeof render==="function"&&!render.__ppt16EarlyEconomy){
    const base=render;const f=function(){ensureRestartHelp();return base.apply(this,arguments)};f.__ppt16EarlyEconomy=true;render=f;
  }
  ensureRestartHelp();
  window.pptBuild16EconomyAudit=function(){return {runCash:runCash(),productionMultiplier:earlyMult(),saleMultiplier:earlySaleMult(),cash:num(game()?.cash),prestige:num(game()?.prestige)}};
})();

