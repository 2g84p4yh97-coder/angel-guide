(function(){
"use strict";
var FISH=window.FISH,BAITS=window.BAITS,WATERS=window.WATERS,WTYPES=window.WTYPES,REGIONS=window.REGIONS,REGS=window.REGS;
var F={},B={},WT={};FISH.forEach(function(f){F[f.id]=f});BAITS.forEach(function(b){B[b.id]=b});WTYPES.forEach(function(w){WT[w.id]=w});
var MON=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
var MONL=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
var SOUTH=["Australien","Neuseeland","Argentinien/Chile","Argentinien","Südafrika","Brasilien","Sambia/Simbabwe"];
// Namen in den Schonzeit-Tabellen je Fisch
var ALIAS={hecht:["Hecht"],zander:["Zander"],barsch:["Barsch","Flussbarsch"],wels:["Wels"],rapfen:["Rapfen","Schied, Rapfen"],aal:["Aal"],
 quappe:["Quappe","Rutte"],huchen:["Huchen"],bachforelle:["Bachforelle"],regenbogen:["Regenbogenforelle"],seeforelle:["Seeforelle"],
 saibling:["Seesaibling","Bachsaibling"],aesche:["Äsche"],lachs:["Lachs","Atlantischer Lachs"],meerforelle:["Meerforelle"],
 renke:["Große Maräne","Maräne","Renken","Felchen","Blaufelchen","Kleine Maräne"],karpfen:["Karpfen"],schleie:["Schleie"],rotauge:["Rotauge","Plötze"],
 rotfeder:["Rotfeder"],doebel:["Döbel"],aland:["Aland","Nerfling"],barbe:["Barbe"],karausche:["Karausche"],stoer:["Stör","Atlantischer Stör","Sterlet"],
 dorsch:["Dorsch"],hering:["Hering"],makrele:["Makrele"],plattfisch:["Scholle","Flunder","Kliesche","Scharbe","Seezunge","Glattbutt"],steinbutt:["Steinbutt"],wolfsbarsch:["Wolfsbarsch"]};
var BLS=Object.keys(REGS);
// Bekannte Änderungen nach dem Tabellenstand (aus Recherche 11/2026, unbestätigt gegen den Gesetzestext)
var BLNOTE={
 "bayern":"Laut Gesetzblatt 2024 (AVBayFiG) geändert: Hecht und Zander 15.02.–30.04., je 50 cm; Bachforelle 01.10.–15.03.; Huchen 15.02.–30.06., 90 cm.",
 "mecklenburg-vorpommern-kueste":"Neuere Küstenregeln: Hecht nur 60–90 cm und 1 Fisch pro Tag, Barsch höchstens 15 pro Tag, Meerforelle 48 cm. Dorsch: EU-Fangbeschränkungen für Angler in der westlichen Ostsee prüfen.",
 "mecklenburg-vorpommern-binnen":"Gesetzlich keine Hecht-/Zander-Schonzeit im Binnenland. Auf Gewässern des Landesanglerverbands gelten eigene Regeln (Hecht 01.03.–30.04., 50 cm; Zander 15.04.–01.06., 45 cm).",
 "schleswig-holstein-kueste":"Dorsch und Lachs: jährliche EU-Fangbeschränkungen für Angler in der Ostsee prüfen.",
 "niedersachsen-binnen":"Weser und Hunte: Freizeitfischerei auf Aal seit 2025 verboten. Viele Gewässer haben strengere Verbandsregeln (z. B. Steinhuder Meer, Dümmer).",
 "nordrhein-westfalen":"Die Landesfischereiverordnung wurde 2025/2026 geändert (u. a. Aal 50 cm). Werte unbedingt mit recht.nrw.de abgleichen.",
 "sachsen":"Laut Übersicht 2022 (SächsFischVO): Hecht 01.02.–30.04., 50 cm; Zander 01.02.–31.05., 50 cm; Bachforelle ganzjährig geschont.",
 "thueringen":"Neue Thüringer Verordnung von 2020: Aal 01.11.–28.02., 50 cm; Äsche 01.02.–31.05., 35 cm."
};
var store={get:function(k,d){try{var v=localStorage.getItem("ag_"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem("ag_"+k,JSON.stringify(v))}catch(e){}}};
var now=new Date();
function tzNow(){var h=now.getHours();return h<5?"n":h<9?"mo":h<17?"t":h<21?"ab":"n"}
function tempFor(m){return [0,0,0,1,1,2,2,2,1,1,0,0][m]}
var S={tab:"finden",view:null,bl:store.get("bl","brandenburg"),own:store.get("own",[]),
 wiz:{step:0,wt:null,fish:null,water:null,month:now.getMonth(),tz:tzNow(),wetter:"wolken",wasser:"mittel",temp:tempFor(now.getMonth()),sued:false,art:"alle",region:"alle"},
 q:{fische:"",koeder:"",gew:"",regeln:"",rigs:""},rm:"rigs",rk:"alle",fg:"alle",kt:"alle",gl:"alle",form:null,more:false,cf:null,fr:"alle"};
var IMG=window.IMG||{};
function photo(key,alt,big){var m=IMG[key];if(!m)return"";
  if(!big)return '<img class="thumb" src="img/'+key+'.jpg" alt="" loading="lazy" width="56" height="56">';
  return '<figure class="photo"><img src="img/'+key+'.jpg" alt="'+esc(alt)+'" loading="lazy"><figcaption>'+(m.ki?"KI-Illustration (ChatGPT), Beispielbild":"Beispielfoto: "+esc(m.a||"unbekannt")+(m.l?" · "+esc(m.l):"")+" · Wikimedia Commons")+"</figcaption></figure>"}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function allWaters(){return S.own.map(function(w,i){var c={};for(var k in w)c[k]=w[k];c.own=i;return c}).concat(WATERS)}
function fishAct(f,m,sued){var i=sued?(m+6)%12:m;return +f.m.charAt(i)}
function dots(n){var h='<span class="dots" aria-label="Eignung '+n+' von 3">';for(var i=1;i<=3;i++)h+='<i class="'+(i<=n?"f":"")+'"></i>';return h+"</span>"}
function months(f,sued,cur){var h='<div class="months">';for(var i=0;i<12;i++){var a=fishAct(f,i,sued);h+='<i class="a'+a+(i===cur?" now":"")+'">'+MON[i].charAt(0)+"</i>"}return h+"</div>"}
var ACTL=["Kaum Bisse zu erwarten","Mäßige Zeit","Gute Zeit","Beste Zeit"];
var TZL={mo:"Morgen",t:"Tag",ab:"Abend",n:"Nacht"};
function tzCode(t){return t==="mo"||t==="ab"?"d":t}
function tzText(f){var m={d:"Dämmerung",t:"Tag",n:"Nacht"};return f.tz.split("").map(function(c){return m[c]}).join(", ")}

// ---------- Regeln ----------
function parseD(s){var m=/^(\d\d)\.(\d\d)\.?$/.exec(s);return m?(+m[2])*100+(+m[1]):null}
function rowStatus(r,d){
  d=d||now;var t=(d.getMonth()+1)*100+d.getDate();
  if(/ganzj/.test(r.von))return{c:"stop",l:"Ganzjährig geschont"};
  if(r.von==="-")return{c:"warn",l:"Sonderregel, siehe Fußnote"};
  var a=parseD(r.von),b=parseD(r.bis);
  if(a==null||b==null)return{c:"ok",l:"Keine Schonzeit"};
  var inn=a<=b?(t>=a&&t<=b):(t>=a||t<=b);
  return inn?{c:"stop",l:"Schonzeit bis "+r.bis}:{c:"ok",l:"Frei (Schonzeit "+r.von+"–"+r.bis+")"};
}
function rulesFor(fid,bl){
  var al=ALIAS[fid];if(!al||!REGS[bl])return[];
  return REGS[bl].rows.filter(function(r){var n=r.art.split(" (")[0].trim();
    return al.some(function(a){return n===a||n.indexOf(a+",")===0||n.indexOf(a+"/")===0||n.indexOf(", "+a)>0||(a==="Karpfen"&&n.indexOf("Karpfen")===0)})});
}
function ruleBox(fid,bl){
  var reg=REGS[bl];if(!reg)return"";
  var rows=rulesFor(fid,bl);var h='<div class="card"><div class="row"><span class="label grow">Regeln · '+esc(reg.name)+'</span><button class="chip" data-a="tab" data-v="regeln">Alle Regeln</button></div>';
  if(!rows.length)h+='<p class="small muted">Für diese Art steht nichts in der Tabelle dieses Landes. Das heißt nicht automatisch „frei“: Gewässerordnung und Erlaubnisschein prüfen.</p>';
  rows.forEach(function(r){var st=rowStatus(r);
    h+='<div class="rule"><span class="pill '+st.c+'">'+esc(st.l)+'</span><span class="small">'+esc(r.art.split(" (")[0])+' · Mindestmaß '+(r.mass==="-"||!r.mass?"keins":esc(r.mass)+" cm")+(r.fn&&reg.notes[r.fn]?' · <span class="muted">'+esc(reg.notes[r.fn])+"</span>":"")+"</span></div>"});
  if(BLNOTE[bl])h+='<p class="notice">'+esc(BLNOTE[bl])+"</p>";
  h+='<p class="small muted">Tabellenstand '+esc(reg.stand)+', ohne Gewähr. Es gilt immer der aktuelle Gesetzestext und dein Erlaubnisschein.</p></div>';
  return h;
}

// ---------- Empfehlung ----------
function recommend(w){
  var f=F[w.fish],cold=w.temp===0,warm=w.temp===2,tz=tzCode(w.tz),out=[];
  f.b.forEach(function(e){
    var b=B[e[0]];if(!b)return;
    if(w.art!=="alle"&&b.t!==w.art)return;
    var s=e[1]*10,why=[];
    var top=b.tiefe==="o"&&b.t==="K";
    if(cold){ if(b.tempo===1){s+=4;why.push("langsam, passt zu kaltem Wasser")} if(b.tempo===3)s-=4; if(top)s-=7; if(b.tiefe==="g")s+=2 }
    if(warm){ if(top){s+=4;why.push("warmes Wasser: Fische jagen oben")} if(b.tempo===3)s+=2 }
    if(w.wasser==="trueb"){ if(b.laut>=2){s+=3;why.push("viel Druck/Reiz für trübes Wasser")} if(b.t==="N"){s+=3;why.push("Duft wirkt im Trüben")} if(b.t==="K"&&b.laut===0)s-=3 }
    if(w.wasser==="klar"){ if(b.laut<=1&&b.t==="K"){s+=2;why.push("dezent, gut bei klarem Wasser")} if(b.laut===3)s-=2 }
    if(tz==="n"){ if(b.t==="N"){s+=3;why.push("nachts fängt Naturköder am sichersten")} if(b.laut>=2)s+=1; if(b.t==="K"&&b.laut===0)s-=2 }
    if(tz==="d"&&top&&!cold){s+=3;why.push("Dämmerung ist Oberflächenzeit")}
    if(w.wetter==="sonne"){ if(top&&tz==="t")s-=3; if(b.tiefe==="g"){s+=1} }
    if(w.wetter==="regen"){ if(b.id==="tauwurm"||b.id==="rotwurm"){s+=3;why.push("Regen spült Würmer ins Wasser")} if(b.laut>=2)s+=1 }
    if(w.wetter==="wind"){ if(b.laut>=2)s+=1; if(b.kat==="Fliege")s-=3; if(top)s-=1 }
    out.push({b:b,e:e,s:s,why:why});
  });
  out.sort(function(a,b){return b.s-a.s});
  return out;
}
function colorTip(w,b){
  var tz=tzCode(w.tz);
  if(b.t==="N")return w.wasser==="trueb"?"Größere Portion, zusätzlich Lockstoff oder Futter":"Frischer Köder, feines Vorfach";
  if(tz==="n")return "Dunkel (Schwarz, Violett) für die Silhouette oder UV/Glow";
  if(w.wasser==="trueb")return "Schockfarben: Chartreuse, Orange, Weiß, Firetiger";
  if(w.wasser==="klar")return w.wetter==="sonne"?"Natürlich: Braun, Grün, Silber, transparent mit Glitter":"Natürlich mit etwas Kontrast: Weißfisch-Dekor, Perlmutt";
  return tz==="d"?"Kontrastreich: Weiß, Motoroil, zweifarbig":"Zwischen Natur und Schock: Motoroil, Perlweiß, Ayu";
}
function tempoTip(w,b){
  if(b.t==="N")return null;
  if(w.temp===0)return "Kaltes Wasser: sehr langsam, lange Pausen, eher kleinere Köder dicht am Grund.";
  if(w.temp===2)return "Warmes Wasser: zügiger führen, flache und obere Wasserschichten absuchen.";
  return null;
}

// ---------- Ansichten ----------
function head(title,back,sub){return '<div class="head">'+(back?'<button class="btn back" data-a="'+back+'">‹ Zurück</button>':'<span class="float" aria-hidden="true"></span>')+'<h1>'+esc(title)+"</h1></div>"+(sub?'<p class="muted">'+sub+"</p>":"")}
function steps(n){var h='<div class="steps" aria-label="Schritt '+(n+1)+' von 3">';for(var i=0;i<3;i++)h+='<i class="'+(i<=n?"f":"")+'"></i>';return h+"</div>"}
function blSelect(){var h='<div class="field"><label class="label" for="blsel">Dein Bundesland für die Regeln</label><select id="blsel" data-c="bl">';BLS.forEach(function(k){h+='<option value="'+k+'"'+(k===S.bl?" selected":"")+">"+esc(REGS[k].name)+"</option>"});return h+"</select></div>"}

function vFinden(){
  var w=S.wiz,h="";
  if(w.step===0){
    h+=head("Köder-Guide",null,"Sag mir, wo und worauf du angelst. Ich nenne dir die passenden Köder mit Farbe, Führung und Montage.");
    h+=steps(0)+'<h2>1. Wo angelst du?</h2><div class="grid g3">';
    WTYPES.forEach(function(t){h+='<button class="tile" data-a="wt" data-v="'+t.id+'"><b>'+esc(t.n)+"</b><span>"+esc(t.d)+"</span></button>"});
    h+="</div>"+'<button class="btn water" data-a="tab" data-v="gewaesser">Oder ein Gewässer aus dem Verzeichnis wählen</button><button class="btn" data-a="tab" data-v="stellen">Angelstellen lesen lernen (mit Erklärfilm)</button><button class="btn" data-a="tab" data-v="arten">Angelarten lernen: Fliegenfischen, Spinnfischen und mehr</button>'+blSelect();
    return h;
  }
  if(w.step===1){
    var wat=w.water!=null?allWaters()[w.water]:null;
    h+=head("Zielfisch","wizback")+steps(1)+'<h2>2. Worauf angelst du?</h2><p class="muted">'+esc(wat?wat.n:WT[w.wt].n)+" · sortiert nach Beißzeit im "+MONL[w.month]+"</p>";
    var list;
    if(wat){list=wat.f.map(function(id){return F[id]}).filter(Boolean)}
    else{
      h+='<div class="chips"><button class="chip'+(w.region==="alle"?" on":"")+'" data-a="region" data-v="alle">Alle Regionen</button>';
      REGIONS.forEach(function(r){h+='<button class="chip'+(w.region===r.id?" on":"")+'" data-a="region" data-v="'+r.id+'">'+esc(r.n)+"</button>"});h+="</div>";
      list=FISH.filter(function(f){return f.w.indexOf(w.wt)>=0&&(w.region==="alle"||f.r.indexOf(w.region)>=0)});
    }
    list=list.slice().sort(function(a,b){return fishAct(b,w.month,w.sued)-fishAct(a,w.month,w.sued)});
    if(!list.length)h+='<p class="card">Für diese Auswahl ist kein Fisch hinterlegt. Wähle eine andere Region.</p>';
    h+='<div class="list">';
    list.forEach(function(f){var a=fishAct(f,w.month,w.sued);h+='<button class="item" data-a="fish" data-v="'+f.id+'">'+photo("f_"+f.id)+'<span class="grow"><b>'+esc(f.n)+'</b><span class="small muted">'+esc(ACTL[a])+" · "+esc(f.g)+"</span></span>"+dots(a)+"</button>"});
    return h+"</div>";
  }
  if(w.step===2){
    var f=F[w.fish];
    h+=head("Bedingungen","wizback")+steps(2)+'<h2>3. Wie sind die Bedingungen?</h2><p class="muted">'+esc(f.n)+" · alles ist auf heute und jetzt voreingestellt.</p>";
    function grp(lab,key,opts){var x='<div class="field"><span class="label">'+lab+'</span><div class="chips">';opts.forEach(function(o){x+='<button class="chip'+(String(w[key])===String(o[0])?" on":"")+'" data-a="set" data-k="'+key+'" data-v="'+o[0]+'">'+o[1]+"</button>"});return x+"</div></div>"}
    h+=grp("Monat","month",MON.map(function(m,i){return[i,m]}));
    h+=grp("Tageszeit","tz",[["mo","Morgen"],["t","Tag"],["ab","Abend"],["n","Nacht"]]);
    h+=grp("Wetter","wetter",[["sonne","Sonnig"],["wolken","Bewölkt"],["regen","Regen"],["wind","Windig"]]);
    h+=grp("Wasser","wasser",[["klar","Klar"],["mittel","Leicht trüb"],["trueb","Trüb"]]);
    h+=grp("Wassertemperatur","temp",[[0,"Kalt (unter 8 °C)"],[1,"Mittel"],[2,"Warm (über 18 °C)"]]);
    h+=grp("Köderart","art",[["alle","Alle"],["K","Nur Kunstköder"],["N","Nur Naturköder"]]);
    h+=grp("Erdhalbkugel","sued",[[false,"Nord"],[true,"Süd (Saison um 6 Monate verschoben)"]]);
    h+='<button class="btn primary" data-a="result">Köder anzeigen</button>';
    return h;
  }
  // Ergebnis
  var fi=F[w.fish],a=fishAct(fi,w.month,w.sued),rec=recommend(w),tzm=fi.tz.indexOf(tzCode(w.tz))>=0;
  h+=head(fi.n,"wizback")+photo("f_"+fi.id,fi.n,true);
  h+='<div class="card sunk"><div class="row"><span class="pill '+(a>=2?"ok":a===1?"warn":"stop")+'">'+ACTL[a]+" im "+MONL[w.month]+'</span><span class="pill '+(tzm?"ok":"warn")+'">'+(tzm?TZL[w.tz]+" passt":"Besser: "+tzText(fi))+"</span></div>"+months(fi,w.sued,w.month)+'<p class="small">'+lk(fi.tipp,"fishview:"+fi.id)+"</p></div>";
  h+=spotChips(fi.id,w.wt);
  if(!w.sued)h+=ruleBox(fi.id,S.bl);
  h+='<h2>Deine Köder</h2>';
  if(!rec.length)h+='<p class="card">Mit diesem Filter ist kein Köder hinterlegt. Stelle die Köderart auf „Alle“.</p>';
  var n=S.more?rec.length:Math.min(5,rec.length);
  for(var i=0;i<n;i++){var r=rec[i],b=r.b,tt=tempoTip(w,b);
    h+='<div class="card"><div class="row"><h3 class="grow">'+(i+1)+'. <button class="lk" data-a="bait" data-v="'+b.id+'">'+esc(b.n)+'</button></h3><span class="pill '+(b.t==="K"?"k":"n")+'">'+(b.t==="K"?"Kunstköder":"Naturköder")+"</span>"+dots(r.e[1])+"</div>"+
      photo("b_"+b.id,b.n,true)+'<p><b>'+lk(r.e[2],"bait:"+b.id)+"</b></p>"+(r.why.length?'<p class="small muted">Heute passend: '+esc(r.why.join("; "))+".</p>":"")+
      '<dl class="kv"><dt>Größe</dt><dd>'+esc(b.groesse)+"</dd><dt>"+(b.t==="K"?"Farbe":"Anbieten")+"</dt><dd>"+esc(colorTip(w,b))+"</dd><dt>Führung</dt><dd>"+lk(b.fuehrung,"bait:"+b.id)+(tt?" "+esc(tt):"")+"</dd><dt>Montage</dt><dd>"+lk(b.montage,"bait:"+b.id)+"</dd></dl>"+rigsForBait(b.id).slice(0,3).map(function(x){return'<button class="chip" data-a="rig" data-v="'+x.id+'">Rig: '+esc(x.n)+"</button>"}).join(" ")+"</div>"}
  if(rec.length>n)h+='<button class="btn" data-a="more">Weitere '+(rec.length-n)+" Köder zeigen</button>";
  h+='<div class="row"><button class="btn grow" data-a="wizstep" data-v="2">Bedingungen ändern</button><button class="btn grow" data-a="wizreset">Neu starten</button></div><button class="btn" data-a="newcatch" data-v="'+fi.id+'">Gefangen? Fang eintragen</button>';
  return h;
}

function search(key,ph){return '<div class="field"><input id="q_'+key+'" type="search" placeholder="'+ph+'" value="'+esc(S.q[key])+'" data-i="'+key+'" aria-label="'+ph+'"></div>'}
function match(q,str){return !q||str.toLowerCase().indexOf(q.toLowerCase())>=0}

function vFische(){
  if(S.view&&S.view.t==="fish"){var f=F[S.view.id],m=now.getMonth(),h=head(f.n,"closeview")+'<p class="lat">'+esc(f.lat)+" · "+esc(f.g)+"</p>"+photo("f_"+f.id,f.n,true);
    h+='<div class="card"><span class="label">Beißzeiten (Nordhalbkugel)</span>'+months(f,false,m)+'<dl class="kv"><dt>Tageszeit</dt><dd>'+esc(tzText(f))+"</dd><dt>Wasser</dt><dd>"+esc(f.temp)+" °C</dd><dt>Übliche Größe</dt><dd>"+esc(f.size)+"</dd><dt>Gewässer</dt><dd>"+esc(f.w.map(function(x){return WT[x]?WT[x].n:x}).join(", "))+"</dd></dl><p>"+lk(f.tipp,"fishview:"+f.id)+"</p></div>";
    h+=methChips(f.id)+spotChips(f.id)+gearCard(f.id)+ruleBox(f.id,S.bl)+'<button class="btn primary" data-a="startfish" data-v="'+f.id+'">Köder für heute finden</button><button class="btn" data-a="newcatch" data-v="'+f.id+'">Fang eintragen</button><h2>Alle Köder für '+esc(f.n)+'</h2><div class="list">';
    f.b.slice().sort(function(a,b){return b[1]-a[1]}).forEach(function(e){var b=B[e[0]];if(!b)return;h+='<button class="item" data-a="bait" data-v="'+b.id+'">'+photo("b_"+b.id)+'<span class="grow"><b>'+esc(b.n)+'</b><span class="small muted">'+esc(e[2])+"</span></span>"+dots(e[1])+"</button>"});
    return h+"</div>"}
  var groups=["alle","Raubfisch","Friedfisch","Salmonide","Meer"],h2=head("Fische",null,FISH.length+" Arten weltweit, mit Beißzeiten und Ködern.")+search("fische","Fisch suchen")+'<div class="chips">';
  groups.forEach(function(g){h2+='<button class="chip'+(S.fg===g?" on":"")+'" data-a="fg" data-v="'+g+'">'+(g==="alle"?"Alle":g)+"</button>"});
  h2+='</div><div class="list" id="res">'+fishList()+"</div>";return h2;
}
function fishList(){var m=now.getMonth(),h="";FISH.filter(function(f){return(S.fg==="alle"||f.g===S.fg)&&match(S.q.fische,f.n+" "+f.lat)}).sort(function(a,b){return a.n.localeCompare(b.n,"de")}).forEach(function(f){
  h+='<button class="item" data-a="fishview" data-v="'+f.id+'">'+photo("f_"+f.id)+'<span class="grow"><b>'+esc(f.n)+'</b><span class="lat">'+esc(f.lat)+"</span></span>"+dots(fishAct(f,m,false))+"</button>"});return h||'<p class="card">Nichts gefunden.</p>'}

function vKoeder(){
  if(S.view&&S.view.t==="bait"){var b=B[S.view.id],h=head(b.n,"closeview")+'<div class="row"><span class="pill '+(b.t==="K"?"k":"n")+'">'+(b.t==="K"?"Kunstköder":"Naturköder")+'</span><span class="muted small">'+esc(b.kat)+"</span></div>"+photo("b_"+b.id,b.n,true);
    h+='<div class="card"><p>'+lk(b.info,"bait:"+b.id)+'</p><dl class="kv"><dt>Größe</dt><dd>'+esc(b.groesse)+"</dd><dt>Führung</dt><dd>"+lk(b.fuehrung,"bait:"+b.id)+"</dd><dt>Montage</dt><dd>"+lk(b.montage,"bait:"+b.id)+"</dd><dt>Tiefe</dt><dd>"+({o:"Oberfläche / flach",m:"Mittelwasser",g:"Grund"}[b.tiefe])+"</dd></dl></div>";var rb=rigsForBait(b.id);if(rb.length){h+='<h2>Passende Montagen</h2><div class="list">';rb.forEach(function(r){h+=rigItem(r)});h+="</div>"}h+='<h2>Fängt diese Fische</h2><div class="list">';
    FISH.forEach(function(f){f.b.forEach(function(e){if(e[0]===b.id)h+='<button class="item" data-a="fishview" data-v="'+f.id+'"><span class="grow"><b>'+esc(f.n)+'</b><span class="small muted">'+esc(e[2])+"</span></span>"+dots(e[1])+"</button>"})});
    return h+"</div>"}
  var h2=head("Köder",null,BAITS.length+" Kunst- und Naturköder mit Führung und Montage.")+search("koeder","Köder suchen")+'<div class="chips">';
  [["alle","Alle"],["K","Kunstköder"],["N","Naturköder"]].forEach(function(o){h2+='<button class="chip'+(S.kt===o[0]?" on":"")+'" data-a="kt" data-v="'+o[0]+'">'+o[1]+"</button>"});
  return h2+'</div><div class="list" id="res">'+baitList()+"</div>";
}
function baitList(){var h="";BAITS.filter(function(b){return(S.kt==="alle"||b.t===S.kt)&&match(S.q.koeder,b.n+" "+b.kat)}).forEach(function(b){
  h+='<button class="item" data-a="bait" data-v="'+b.id+'">'+photo("b_"+b.id)+'<span class="grow"><b>'+esc(b.n)+'</b><span class="small muted">'+esc(b.kat)+" · "+esc(b.groesse)+'</span></span><span class="pill '+(b.t==="K"?"k":"n")+'">'+(b.t==="K"?"Kunst":"Natur")+"</span></button>"});return h||'<p class="card">Nichts gefunden.</p>'}

function vGew(){
  var all=allWaters(),h;
  if(S.form){var fm=S.form;h=head(fm.idx==null?"Eigenes Gewässer":"Gewässer bearbeiten","closeform");
    h+='<div class="field"><label class="label" for="f_n">Name</label><input id="f_n" data-f="n" value="'+esc(fm.n)+'" placeholder="z. B. Vereinsteich Breese"></div>';
    h+='<div class="field"><label class="label" for="f_typ">Gewässertyp</label><select id="f_typ" data-f="typ">'+WTYPES.map(function(t){return'<option value="'+t.id+'"'+(fm.typ===t.id?" selected":"")+">"+esc(t.n)+"</option>"}).join("")+"</select></div>";
    h+='<div class="field"><label class="label" for="f_ort">Ort / Land</label><input id="f_ort" data-f="ort" value="'+esc(fm.ort)+'" placeholder="z. B. Wittenberge"></div>';
    h+='<div class="field"><label class="label" for="f_t">Deine Tipps (Stellen, Köder, Zeiten)</label><textarea id="f_t" data-f="t" rows="3">'+esc(fm.t)+"</textarea></div>";
    h+='<div class="field"><span class="label">Fische dort (antippen)</span><div class="chips">'+FISH.slice().sort(function(a,b){return a.n.localeCompare(b.n,"de")}).map(function(f){return'<button class="chip'+(fm.f.indexOf(f.id)>=0?" on":"")+'" data-a="ffish" data-v="'+f.id+'">'+esc(f.n)+"</button>"}).join("")+"</div></div>";
    h+='<p class="small muted" id="formmsg" role="status"></p><button class="btn primary" data-a="saveform">Speichern</button>'+(fm.idx!=null?(fm.del?'<div class="row"><button class="btn grow" data-a="delno">Behalten</button><button class="btn grow" data-a="delyes" style="color:var(--stop)">Wirklich löschen</button></div>':'<button class="btn" data-a="delask" style="color:var(--stop)">Gewässer löschen</button>'):"");
    return h}
  if(S.view&&S.view.t==="water"){var w=all[S.view.id];if(!w){S.view=null;return vGew()}
    h=head(w.n,"closeview")+'<p class="muted">'+esc(WT[w.typ]?WT[w.typ].n:"")+(w.ort?" · "+esc(w.ort):"")+(w.land?" · "+esc(w.land):"")+(w.own!=null?' · <span class="pill k">Eigenes</span>':"")+"</p>";
    if(w.t)h+='<div class="card"><span class="label">Tipp</span><p>'+lk(w.t)+"</p></div>";
    h+='<h2>Fische hier</h2><p class="muted small">Fisch antippen, dann bekommst du die Köder für heute.</p><div class="list">';
    var m=now.getMonth(),sd=SOUTH.indexOf(w.land)>=0;
    w.f.map(function(id){return F[id]}).filter(Boolean).sort(function(a,b){return fishAct(b,m,sd)-fishAct(a,m,sd)}).forEach(function(f){var a=fishAct(f,m,sd);
      h+='<button class="item" data-a="waterfish" data-v="'+f.id+'"><span class="grow"><b>'+esc(f.n)+'</b><span class="small muted">'+ACTL[a]+" im "+MONL[m]+"</span></span>"+dots(a)+"</button>"});
    h+="</div>";
    if(w.bl&&REGS[w.bl])h+='<button class="btn" data-a="showbl" data-v="'+w.bl+'">Regeln für '+esc(REGS[w.bl].name)+" ansehen</button>";
    if(w.own!=null)h+='<button class="btn" data-a="editown" data-v="'+w.own+'">Bearbeiten</button>';
    return h}
  var lands=[];WATERS.forEach(function(w){if(lands.indexOf(w.land)<0)lands.push(w.land)});
  h=head("Gewässer","mehr",all.length+" Gewässer: Prignitz, Deutschland, Angelziele weltweit und deine eigenen.");
  h+='<button class="btn water" data-a="newown">+ Eigenes Gewässer eintragen</button>'+search("gew","Gewässer, Ort oder Fisch suchen");
  h+='<div class="field"><label class="label" for="glsel">Land / Bundesland</label><select id="glsel" data-c="gl"><option value="alle">Alle</option><option value="eigene"'+(S.gl==="eigene"?" selected":"")+">Nur eigene</option>"+lands.map(function(l){return'<option value="'+esc(l)+'"'+(S.gl===l?" selected":"")+">"+esc(l)+"</option>"}).join("")+"</select></div>";
  return h+'<div class="list" id="res">'+waterList()+"</div>";
}
function waterList(){var h="",q=S.q.gew;allWaters().forEach(function(w,i){
  if(S.gl==="eigene"?w.own==null:(S.gl!=="alle"&&w.land!==S.gl))return;
  var names=w.f.map(function(id){return F[id]?F[id].n:""}).join(" ");
  if(!match(q,w.n+" "+(w.ort||"")+" "+(w.land||"")+" "+names))return;
  h+='<button class="item" data-a="water" data-v="'+i+'"><span class="grow"><b>'+esc(w.n)+'</b><span class="small muted">'+esc(WT[w.typ]?WT[w.typ].n:"")+(w.land?" · "+esc(w.land):"")+" · "+w.f.length+" Fischarten</span></span>"+(w.own!=null?'<span class="pill k">Eigenes</span>':'<span class="chev">›</span>')+"</button>"});
  return h||'<p class="card">Nichts gefunden. Du kannst das Gewässer oben selbst eintragen.</p>'}

function vRegeln(){
  var reg=REGS[S.bl],h=head("Schonzeiten","mehr","Schonzeiten und Mindestmaße aller 16 Bundesländer, Küste und Binnen getrennt.")+blSelect();
  h+='<p class="notice stop"><b>Ohne Gewähr.</b> Tabellenstand '+esc(reg.stand)+" (Quelle: fischlexikon.eu). Seitdem wurden Verordnungen geändert. Verbindlich sind der aktuelle Gesetzestext deines Landes und dein Erlaubnisschein, der strenger sein darf.</p>";
  if(BLNOTE[S.bl])h+='<p class="notice"><b>Bekannte Änderungen:</b> '+esc(BLNOTE[S.bl])+"</p>";
  h+=search("regeln","Fischart suchen")+'<div id="res">'+ruleTable()+"</div>";
  var keys=Object.keys(reg.notes);if(keys.length){h+='<div class="card"><span class="label">Fußnoten</span>';keys.forEach(function(k){h+='<p class="small">('+k+") "+esc(reg.notes[k])+"</p>"});h+="</div>"}
  var ks=Object.keys(IMG);if(ks.length){h+='<details class="card"><summary><b>Bildnachweise ('+ks.length+' Fotos)</b></summary><p class="small muted">Fotos von Wikimedia Commons unter der jeweils genannten freien Lizenz, verkleinert. KI-Illustrationen sind als solche gekennzeichnet.</p>';
    ks.forEach(function(k){var m=IMG[k],o=k.charAt(0)==="f"?F[k.slice(2)]:B[k.slice(2)];h+='<p class="small">'+esc(o?o.n:k)+": "+(m.ki?"KI-Illustration (ChatGPT)":esc(m.a||"unbekannt"))+(m.l?", "+esc(m.l):"")+(m.p?' · <a href="'+esc(m.p)+'" target="_blank" rel="noopener">Quelle</a>':"")+"</p>"});h+="</details>"}
  return h;
}
function ruleTable(){var reg=REGS[S.bl],h='<div class="tablewrap"><table><thead><tr><th>Fischart</th><th>Schonzeit</th><th>Maß</th><th>Heute</th></tr></thead><tbody>',n=0;
  reg.rows.forEach(function(r){if(!match(S.q.regeln,r.art))return;n++;var st=rowStatus(r),gz=/ganzj/.test(r.von),ks=parseD(r.von)==null&&!gz;
    h+="<tr><td>"+esc(r.art.split(" (")[0])+(r.fn?" <span class=\"muted\">("+r.fn+")</span>":"")+"</td><td>"+(gz?"ganzjährig":r.von==="-"?"siehe Fußnote":ks?"keine":esc(r.von)+"–"+esc(r.bis))+"</td><td>"+(r.mass==="-"||!r.mass?"–":esc(r.mass)+" cm")+'</td><td><span class="pill '+st.c+'">'+(st.c==="stop"?"Geschont":st.c==="warn"?"Fußnote":"Frei")+"</span></td></tr>"});
  return n?h+"</tbody></table></div>":'<p class="card">Diese Art steht nicht in der Tabelle. Das heißt nicht automatisch „frei“.</p>'}

var ICON={finden:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',fische:'<path d="M3 12c3-5 9-6 13-2l5-3v10l-5-3c-4 4-10 3-13-2z"/><circle cx="8" cy="11" r=".6"/>',koeder:'<path d="M12 2v9a4 4 0 1 1-4 4"/><path d="M10 4h4"/>',gewaesser:'<path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',knoten:'<path d="M2 14h5c6 0 4-8 8-8s4 8 0 8-3-8 3-8h4"/>',rigs:'<path d="M12 2v5"/><circle cx="12" cy="9.5" r="2.5"/><path d="M12 12v4a4 4 0 0 0 8 0v-3"/><path d="M5 5c3 0 3 4 0 4s-3 4 0 4"/>',faenge:'<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 20h8"/>',mehr:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',regeln:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h3"/>'};// ---------- Rigs und Knoten ----------
var RIGS=window.RIGS||[],KNOTS=window.KNOTS||[],RIGKATS=window.RIGKATS||[],R={},KN={};RIGS.forEach(function(r){R[r.id]=r});KNOTS.forEach(function(k){KN[k.id]=k});
// ---------- Verlinkung: erwähnte Köder, Fische, Rigs und Knoten werden antippbar ----------
var SPOTS=window.SPOTS||[],SP={};SPOTS.forEach(function(x){SP[x.id]=x});
var LK={},LKRE=null,HIST=[],MEIDS={};
(function(){
  var SKIP={"wo erlaubt":1,Amazonas:1,tot:1,Wels:1,Blei:1,Meer:1,ganz:1,King:1,Silver:1,Area:1,Holz:1,Wels:0,Finesse:1,realistisch:1,Hartplastik:1,Amur:1,Vibration:1,Schritt:1,Stahlvorfach:1,Pose:1,Grund:1,Fliege:1,Jighead:1,Partikel:1,Hanf:1,Krebs:1};
  function add(term,act,id,force){term=term.trim();if(term.length<3||(!force&&SKIP[term])||LK[term])return;LK[term]=[act,id]}
  function parts(n){return n.split(/\s*\/\s*|\s*[(),]\s*/).filter(Boolean)}
  var KA={clinch:["Clinchknoten","Clinch"],palomar:["Palomar"],uni:["Uni-Knoten","Grinner"],doppeluni:["Doppelter Uni","Doppelten Uni","Doppeltem Uni"],fg:["FG-Knoten"],albright:["Albright"],chirurg:["Chirurgenschlaufe"],arbor:["Arbor-Knoten"],stopper:["Stopperknoten"],rapala:["Rapala-Knoten","Schlaufenknoten"],noknot:["No-Knot"],blut:["Blutknoten"],dropper:["Seitenarm-Schlaufe","Dropper Loop"],schlaufe2:["Schlaufe in Schlaufe"],crimp:["Quetschhülse","Quetschhülsen"],plaettchen:["Plättchenhaken"]};
  var RA={texas:["Texas-Rig","Texas"],carolina:["Carolina-Rig","Carolina"],dropshot:["Dropshot-Rig","Dropshot"],wacky:["Wacky-Rig","Wacky"],neko:["Neko-Rig","Neko"],free:["Free-Rig"],cheburashka:["Cheburashka"],jigkopf:["Jigkopf","Jigköpfe"],jika:["Jika-Rig"],tokyo:["Tokyo-Rig"],ned:["Ned-Rig"],haar:["Haar-Rig","Safety-Clip"],method:["Method-Feeder"],feeder:["Feeder-Montage","Futterkorb"],laufblei:["Laufblei-Montage","Grundmontage"],sbirolino:["Sbirolino"],tremarella:["Tremarella"],brandung:["Brandungsvorfach"],laufpose:["Laufpose","Posenmontage"],helikopter:["Helikopter-Rig"],chod:["Chod-Rig"],ronnie:["Ronnie-Rig"],zig:["Zig-Rig"],angsthaken:["Angsthaken","Stinger"],pulley:["Pulley-Rig"],upose:["Unterwasserpose","U-Pose"],fishfinder:["Kreishaken"],assist:["Assist-Haken","Assist-Hooks"],tiroler:["Tiroler Hölzl"],bodentaster:["Bodentaster"],nachlaeufer:["Nachläufer"],buttloeffel:["Buttlöffel"],hering:["Heringspaternoster"],seitenarm:["Seitenarm-Montage"],auftrieb:["Auftriebsmontage"],punch:["Punch-Rig"],mojo:[],weightless:["Weightless"],alabama:["Alabama-Rig"]};
  var BA={gummifisch:["Gummifisch","Gummifische","Gummifischs","Shad"],twister:["Twister"],creature:["Creature","Creature-Bait"],pintail:["Pintail"],wurm_gummi:["Gummiwurm","Stickbait oder Gummiwurm"],wobbler_flach:["Wobbler","Crankbait"],jerkbait:["Jerkbait"],topwater_popper:["Popper"],topwater_stick:["Stickbait"],spinner:["Spinner"],spinnerbait:["Spinnerbait","Chatterbait"],blinker:["Blinker"],pilker:["Pilker"],tauwurm:["Tauwurm","Tauwürmer","Tauwurmbündel","Wurm"],made:["Made","Maden","Bienenmade","Bienenmaden"],mais:["Mais"],boilie:["Boilie","Boilies","Pop-up"],pellet:["Pellet","Pellets"],koederfisch:["Köderfisch","Köderfische"],fetzen:["Fetzen","Fischstück"],garnele:["Garnele"],krabbe:["Krabbe"],tintenfisch:["Tintenfisch"],wattwurm:["Wattwurm"],seeringler:["Seeringler"],leber_kaese:["Käse"],teig_forelle:["Forellenteig","Schwimmteig","Teig"],streamer:["Streamer"],nymphe:["Nymphe","Nymphen"],trockenfliege:["Trockenfliege"],jerkbait_gummi:["Softjerk","Softjerks"],swimbait:["Swimbait"],krautkoeder:["Gummifrosch"],jig_metall:["Metalljig","Metalljigs"],zocker:["Zocker"],brot:["Brot"]};
  var FA={barsch:["Barsch","Barsche"],regenbogen:["Forelle","Forellen"],wels:["Wels","Welse","Waller"],bluefin:["Thun"],schwarzbarsch:["Schwarzbarsch"],plattfisch:["Plattfische","Butt"],lachs:["Lachs"],hai_klein:["Haie"]};
  function al(map,act){for(var k in map)map[k].forEach(function(t){add(t,act,k,true)})}
  al(KA,"knot");KNOTS.forEach(function(k){add(k.n,"knot",k.id)});
  al(RA,"rig");RIGS.forEach(function(r){add(r.n,"rig",r.id)});
  al(FA,"fishview");FISH.forEach(function(f){add(f.n,"fishview",f.id);parts(f.n).forEach(function(p){add(p,"fishview",f.id)})});
  al(BA,"bait");BAITS.forEach(function(b){add(b.n,"bait",b.id);parts(b.n).forEach(function(p){add(p,"bait",b.id)})});
  SPOTS.forEach(function(x){(x.a||[]).forEach(function(t){add(t,"spot",x.id)})});
  (window.METHODS||[]).forEach(function(x){add(x.n,"meth",x.id)});MEIDS={};(window.METHODS||[]).forEach(function(x){MEIDS[x.id]=1});
  var terms=Object.keys(LK).filter(function(t){return (MEIDS[LK[t][1]]||SP[LK[t][1]]||R[LK[t][1]]||KN[LK[t][1]]||F[LK[t][1]]||B[LK[t][1]])}).sort(function(a,b){return b.length-a.length}).map(function(t){return esc(t).replace(/[.*+?^${}()|[\]\\\/-]/g,"\\$&")});
  LKRE=new RegExp("(^|[^A-Za-zÄÖÜäöüß0-9])("+terms.join("|")+")(?![A-Za-zÄÖÜäöüß0-9])","g");
})();
function lk(text,self){if(text==null||text==="")return"";return esc(text).replace(LKRE,function(m,pre,t){var raw=t.replace(/&amp;/g,"&").replace(/&#39;/g,"'"),e=LK[raw];if(!e||e[0]+":"+e[1]===self)return m;return pre+'<button class="lk" data-a="'+e[0]+'" data-v="'+e[1]+'" data-h="1">'+t+"</button>"})}
function pushHist(){if(S.view||S.tab==="profil"||(S.tab==="finden"&&S.wiz.step===3))HIST.push({tab:S.tab,view:S.view,y:window.scrollY});if(HIST.length>30)HIST.shift()}
function popHist(){var p=HIST.pop();if(!p)return false;S.tab=p.tab;S.view=p.view;try{location.hash=p.tab}catch(e){}render(true);window.scrollTo(0,p.y||0);return true}

var LN='<path class="ln" d="M24 0v48"/>';
var PART={
 schnur:'<path class="ln b" d="M24 0v48"/>',
 vorfach:'<path class="ln d" d="M24 0v48"/>',
 stahl:'<path class="ln" d="M24 0v6l-3 4 6 4-6 4 6 4-6 4 6 4-3 4v6"/>',
 stopper:LN+'<ellipse class="fp" cx="24" cy="24" rx="5" ry="7"/><path class="ln" d="M19 20l-5-3M29 28l5 3"/>',
 perle:LN+'<circle class="fw" cx="24" cy="24" r="6"/>',
 pose:'<path class="ln" d="M24 0v8M24 40v8"/><path class="fs" d="M24 8c6 6 7 20 0 32-7-12-6-26 0-32z"/><path class="fp" d="M24 8c4 4 5.5 9 5.8 14h-11.6c.3-5 1.8-10 5.8-14z"/>',
 bullet:LN+'<path class="fm" d="M24 10c5 4 8 14 8 26H16c0-12 3-22 8-26z"/>',
 lauf:LN+'<ellipse class="fm" cx="24" cy="24" rx="7" ry="13"/>',
 birne:LN+'<path class="ln" d="M24 14l10 8"/><path class="fm" d="M34 21c5 5 7 11 6 16-1 4-7 6-11 3-4-3-1-12 5-19z"/>',
 schrot:LN+'<circle class="fm" cx="24" cy="10" r="4"/><circle class="fm" cx="24" cy="24" r="4"/><circle class="fm" cx="24" cy="38" r="3"/>',
 wirbel:'<path class="ln" d="M24 0v8M24 40v8"/><circle class="st" cx="24" cy="12" r="4"/><rect class="fm" x="20.5" y="17" width="7" height="14" rx="3"/><circle class="st" cx="24" cy="36" r="4"/>',
 snap:'<path class="ln" d="M24 0v8M24 42v6"/><circle class="st" cx="24" cy="12" r="4"/><path class="st" d="M24 16c-5 4-6 16-2 24h4c4-8 3-20-2-24"/>',
 haken:'<path class="ln" d="M24 0v6"/><circle class="st" cx="24" cy="9" r="3"/><path class="hk" d="M24 12v20a8 8 0 0 0 16 0v-8l-4 5"/>',
 offset:'<path class="ln" d="M24 0v4"/><circle class="st" cx="24" cy="7" r="3"/><path class="hk" d="M24 10v5h6v17a8 8 0 0 0 14 0v-9l-4 5"/>',
 jig:'<path class="ln" d="M24 0v6"/><circle class="fm" cx="24" cy="14" r="8"/><path class="hk" d="M24 22v10a8 8 0 0 0 16 0v-7l-4 5"/>',
 drilling:'<path class="ln" d="M24 0v6"/><circle class="st" cx="24" cy="9" r="3"/><path class="hk" d="M24 12v22M24 34a7 7 0 0 0 14-2v-5l-3 4M24 34a7 7 0 0 1-14-2v-5l3 4M24 34v8l-4-3"/>',
 gummi:'<path class="fw" d="M6 24c4-9 18-10 26-3l4-1c0 3 3 4 7 4-4 0-7 1-7 4l-4-1c-8 7-22 6-26-3z"/><circle class="eye" cx="13" cy="22" r="1.6"/>',
 koeder:'<path class="wm" d="M8 30c4-10 8 8 12-2s8 8 12-2 6 4 8-4"/>',
 fisch:'<path class="fs" d="M5 24c6-10 20-11 28-3l9-6v18l-9-6c-8 8-22 7-28-3z"/><circle class="eye" cx="13" cy="22" r="1.6"/><path class="ln" d="M19 18c2 4 2 8 0 12"/>',
 korb:LN+'<rect class="fs" x="13" y="10" width="22" height="28" rx="4"/><path class="ln" d="M13 19h22M13 29h22M20 10v28M28 10v28"/>',
 boilie:'<path class="ln d" d="M24 0v14"/><circle class="fp" cx="24" cy="26" r="11"/><path class="ln" d="M20 40h8"/>',
 sbiro:'<path class="ln" d="M24 0v48"/><path class="fw" d="M22 4h4v14c5 3 6 16 2 24h-8c-4-8-3-21 2-24z"/>',
 auftrieb:LN+'<circle class="fs" cx="24" cy="24" r="10"/><path class="ln" d="M19 20c2-3 5-4 8-3"/>',
 kunst:'<path class="fw" d="M8 22c5-8 18-9 26-2l6-4v14l-6-4c-8 7-21 6-26-2z"/><path class="ln" d="M9 25l-5 8"/><circle class="eye" cx="15" cy="21" r="1.6"/><path class="hk" d="M24 30v6a4 4 0 0 0 7 0"/>',
 fliege:'<path class="ln" d="M24 0v8"/><path class="hk" d="M24 8v24a7 7 0 0 0 13 0v-6"/><path class="wm" d="M24 14l-10-6M24 14l10-6M24 18l-11-2M24 18l11-2M24 22l-9 3M24 22l9 3"/>',
 arm:LN+'<path class="ln" d="M24 18l16 8"/><circle class="fm" cx="24" cy="18" r="3"/>'
};
function partSvg(t){return '<svg class="part" viewBox="0 0 48 48" aria-hidden="true">'+(PART[t]||LN)+"</svg>"}
function chain(r){var h='<ol class="chain" aria-label="Aufbau von der Rute zum Köder"><li class="end">Zur Rute</li>';r.teile.forEach(function(t){h+="<li>"+partSvg(t[0])+'<span><b>'+lk(t[1],"rig:"+r.id)+"</b>"+(t[2]?'<span class="small muted">'+lk(t[2],"rig:"+r.id)+"</span>":"")+"</span></li>"});return h+"</ol>"}
function stepList(a,self){return '<ol class="stepsl">'+a.map(function(s){return"<li><span>"+lk(s,self)+"</span></li>"}).join("")+"</ol>"}
function knotItem(k){return '<button class="item" data-a="knot" data-v="'+k.id+'">'+photo("k_"+k.id)+'<span class="grow"><b>'+esc(k.n)+'</b><span class="small muted">'+esc(k.fuer)+'</span></span><span class="pill k">'+esc(k.lvl)+"</span></button>"}
function rigItem(r){return '<button class="item" data-a="rig" data-v="'+r.id+'"><span class="grow"><b>'+esc(r.n)+'</b><span class="small muted">'+esc(r.fuer)+'</span></span><span class="chev" aria-hidden="true">›</span></button>'}
function rigsForBait(id){return RIGS.filter(function(r){return r.b.indexOf(id)>=0})}
function knotPics(k){var h="";if(IMG["k_"+k.id])h+=photo("k_"+k.id,k.n,true).replace('class="photo"','class="photo fit"');return h}
// ---------- Erklärfilm je Rig: Aufbau + Unterwasser-Szene ----------
var MOVE={jigkopf:"hop",cheburashka:"hop",angsthaken:"hop",tube:"hop",shaky:"hop",jika:"hop",punch:"hop",
 texas:"drag",carolina:"drag",free:"drag",tokyo:"drag",splitshot:"drag",ned:"drag",buttloeffel:"drag",tiroler:"drag",
 dropshot:"hover",neko:"hover",wacky:"sink",damiki:"vert",
 spinn:"swim",chatter:"swim",alabama:"swim",shallow:"swim",sbirolino:"swim",tremarella:"swim",trolling:"swim",fliege:"swim",springer:"swim",duo:"swim",weightless:"swim",freeline:"swim",
 laufpose:"float",feststellpose:"float",hechtpose:"float",floatfly:"float",teichschlepp:"float",boje:"float",abspann:"float",
 hering:"vert",pilk:"vert",klopf:"vert",assist:"vert"};
var WEIGHTS=["bullet","lauf","birne","korb","jig","sbiro","schrot"],ENDS=["gummi","koeder","fisch","boilie","kunst","fliege","auftrieb","jig"];
function pick(r,list){for(var i=r.teile.length-1;i>=0;i--)if(list.indexOf(r.teile[i][0])>=0)return r.teile[i];return null}
function animSteps(r){var st=[{k:"intro",c:r.info}];r.teile.forEach(function(t,i){st.push({k:"part",p:i,c:t[1]+(t[2]?": "+t[2]:"")})});
  var f=r.fuehrung.match(/[^.!?]+[.!?]+/g)||[r.fuehrung],a=[],cur="";f.forEach(function(x){if((cur+x).length>110&&cur){a.push(cur.trim());cur=x}else cur+=x});if(cur.trim())a.push(cur.trim());
  a.slice(0,3).forEach(function(x){st.push({k:"water",c:x})});st.push({k:"bite",c:"Biss! "+(r.tipp||"Jetzt Kontakt halten und den Fisch sicher landen.")});return st}
function icon(t,x,y,s,flip){return '<g transform="translate('+x+" "+y+") scale("+(flip?-s:s)+" "+s+') translate(-24 -24)">'+(PART[t]||"")+"</g>"}
function waterSvg(r){var mv=MOVE[r.id]||"bottom",w=pick(r,WEIGHTS),e=pick(r,ENDS)||["koeder"],wt=w&&w[0]!==e[0]?w[0]:null,g="";
  var bait=icon(e[0]==="jig"?"gummi":e[0],0,0,1.1,true);
  if(mv==="float"){g='<g class="mv float"><path class="ln" d="M0 -150L420 -420"/><path class="ln d" d="M0 -150V0"/>'+icon("pose",0,-152,1.2)+(wt?icon("schrot",0,-60,.7):"")+bait+"</g>"}
  else if(mv==="bottom"){g='<g class="mv bottom"><path class="ln" d="M70 0L470 -420"/><path class="ln d" d="M0 -4H70"/>'+icon(wt||"lauf",70,-6,.9)+bait+"</g>"}
  else if(mv==="hover"){g='<g class="mv"><path class="ln" d="M0 -300V52"/><path class="ln" d="M0 -300L300 -520"/>'+icon(wt||"birne",-6,44,.8)+'<g class="jit">'+bait+"</g></g>"}
  else if(mv==="vert"){g='<g class="mv vert"><path class="ln" d="M0 -520V0"/>'+bait+"</g>"}
  else{g='<g class="mv '+mv+'"><path class="ln" d="M14 -8L440 -430"/>'+(wt&&wt!=="jig"?icon(wt,26,-20,.7):"")+bait+(e[0]==="jig"||wt==="jig"?'<circle class="fm" cx="18" cy="-2" r="7"/>':"")+"</g>"}
  var by={float:250,bottom:372,hover:320,vert:300,swim:210,sink:230}[mv]||368,bx={float:170,bottom:150,hover:190,vert:180}[mv]||200;
  var h='<svg class="scene part" viewBox="0 0 360 450" role="img" aria-label="Unterwasser-Szene: '+esc(r.n)+'"><defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="w0"/><stop offset="1" class="w1"/></linearGradient></defs><rect width="360" height="450" fill="url(#wg)"/>';
  h+='<path class="ray" d="M40 0l60 0-90 450h-60zM170 0h40l-70 450h-50zM290 0h50l-60 450h-60z"/><path class="surf" d="M0 26c30-8 60 8 90 0s60-8 90 0 60 8 90 0 60-8 90 0V0H0z"/>';
  h+='<path class="sand" d="M0 396c60-10 120 6 180-2s120-8 180 2v54H0z"/><g class="weed"><path d="M30 400c-8-40 8-60 0-100M44 400c6-30-6-50 2-80M18 400c4-24-6-40 0-60"/><path d="M318 400c-6-30 8-50 0-84M334 400c6-24-4-40 2-60"/></g>';
  var MT={hop:"anheben · absinken",drag:"schleifen · Pause",hover:"auf der Stelle zittern",swim:"gleichmäßig einholen",sink:"absinken lassen",float:"Pose beobachten",bottom:"liegen lassen",vert:"heben · senken"}[mv];
  h+='<g class="mtag"><rect x="12" y="40" width="'+(MT.length*7.4+24)+'" height="28" rx="14"/><text x="24" y="59">'+MT+"</text></g>";
  h+='<g class="pred" style="--px:'+(bx-150)+'px"><g transform="translate(0 '+(by-22)+')"><path class="pb" d="M0 20L16 4v10c26-10 66-10 92-2l14 8-14 8c-26 8-66 8-92-2v10z"/><path class="pf" d="M40 8l12-9 8 8zM46 32l8 9 8-9z"/><path class="pl" d="M16 22c26 8 66 8 92 2"/><circle class="pe" cx="104" cy="16" r="3"/><circle cx="104.5" cy="16" r="1.3"/><path class="pm" d="M110 22h10"/></g></g>';
  return h+'<g transform="translate('+bx+" "+by+')">'+g+"</g></svg>"}
function buildSvg(r){var n=r.teile.length,sp=Math.min(46,400/n),y0=(450-sp*n)/2+sp/2,h='<svg class="build part" viewBox="0 0 360 450" role="img" aria-label="Aufbau: '+esc(r.n)+'"><path class="ln guide" d="M70 0v450"/>';
  r.teile.forEach(function(t,i){var y=y0+i*sp;h+='<g class="bp" data-p="'+i+'"><g transform="translate(70 '+y+") scale("+(sp/48)+') translate(-24 -24)">'+(PART[t[0]]||LN)+'</g><g transform="translate(104 '+y+')"><rect class="tag" x="0" y="-13" width="'+Math.min(240,t[1].length*7.2+22)+'" height="26" rx="13"/><text x="11" y="4.5">'+esc(t[1].length>31?t[1].slice(0,30)+"…":t[1])+"</text></g></g>"});
  return h+"</svg>"}
var AN={r:null,i:0,st:[],t:null,voice:store.get("voice",false)};var SY=window.speechSynthesis||null;
function sayText(c){return c.replace(/(\d),(\d)/g,"$1 Komma $2").replace(/–/g," bis ").replace(/\bmm\b/g,"Millimeter").replace(/\bcm\b/g,"Zentimeter").replace(/(\d) ?g\b/g,"$1 Gramm").replace(/(\d) ?m\b/g,"$1 Meter").replace(/(\d) ?lb\b/g,"$1 Pfund").replace(/(\d)\/0/g,"$1 Null").replace(/·/g,",")}
function say(c,done){if(!SY||!AN.voice)return false;try{SY.cancel();var u=new SpeechSynthesisUtterance(sayText(c));u.lang="de-DE";u.rate=1;if(done){u.onend=done;u.onerror=done}SY.speak(u);return true}catch(e){return false}}
function animBox(r){AN.r=r;AN.spot=false;AN.i=0;AN.st=animSteps(r);return '<div class="anim" id="anim" data-k="intro"><div class="stage">'+buildSvg(r)+waterSvg(r)+'<button class="bigplay" data-a="aplay" aria-label="Erklärfilm abspielen">▶</button></div><div class="bar"><i id="abar"></i></div><p class="cap" id="acap" aria-live="polite">'+esc(r.info)+'</p><div class="row"><button class="btn" data-a="aprev" aria-label="Schritt zurück">‹</button><button class="btn grow water" data-a="aplay" id="aplay">▶ Erklärfilm abspielen</button><button class="btn" data-a="anext" aria-label="Schritt vor">›</button></div>'+(SY?'<button class="chip'+(AN.voice?" on":"")+'" data-a="avoice" id="avoice" aria-pressed="'+AN.voice+'">🔊 Stimme '+(AN.voice?"an":"aus")+"</button>":"")+"</div>"}
function animShow(){var el=document.getElementById("anim");if(!el)return animStop();var s=AN.st[AN.i];
  if(el.classList.contains("spot")){el.classList.toggle("started",AN.i>0||!!AN.t);[].forEach.call(el.querySelectorAll("[data-s]"),function(g){g.classList.toggle("on",(","+g.getAttribute("data-s")+",").indexOf(","+AN.i+",")>=0)});document.getElementById("acap").textContent=s.c;document.getElementById("abar").style.width=(100*(AN.i+1)/AN.st.length)+"%";document.getElementById("aplay").textContent=AN.t?"❚❚ Pause":AN.i>=AN.st.length-1?"↺ Nochmal":"▶ Weiter abspielen";return}
  el.setAttribute("data-k",s.k==="bite"?"water":s.k==="part"?"intro":s.k);el.classList.toggle("bite",s.k==="bite");el.classList.toggle("started",AN.i>0||!!AN.t);
  var shown=s.k==="intro"?-1:s.k==="part"?s.p:99;[].forEach.call(el.querySelectorAll(".bp"),function(g){var p=+g.getAttribute("data-p");g.classList.toggle("on",p<=shown);g.classList.toggle("cur",p===shown)});
  document.getElementById("acap").textContent=s.c;var mt=el.querySelector(".mtag text");if(mt){if(!mt.getAttribute("data-t"))mt.setAttribute("data-t",mt.textContent);mt.textContent=s.k==="bite"?"Biss!":mt.getAttribute("data-t")}document.getElementById("abar").style.width=(100*(AN.i+1)/AN.st.length)+"%";
  document.getElementById("aplay").textContent=AN.t?"❚❚ Pause":AN.i>=AN.st.length-1?"↺ Nochmal":"▶ Weiter abspielen"}
function animStop(){if(AN.t){clearInterval(AN.t);clearTimeout(AN.t);AN.t=null}if(SY)try{SY.cancel()}catch(e){}}
function animTick(){if(!document.getElementById("anim"))return animStop();if(AN.i>=AN.st.length-1){AN.t=null;return animShow()}AN.i++;animShow();animQueue()}
function animQueue(){var tok={};AN.tok=tok;var done=false,next=function(){if(done||AN.tok!==tok||!AN.t)return;done=true;AN.t=setTimeout(animTick,500)};AN.t=1;if(say(AN.st[AN.i].c,next))setTimeout(next,2500+AN.st[AN.i].c.length*95);else AN.t=setTimeout(animTick,3400)}
function animPlay(){if(AN.t){animStop();return animShow()}if(AN.i>=AN.st.length-1)AN.i=0;else if(AN.i===0)AN.i=1;AN.t=1;animShow();animQueue()}
function animGo(d){animStop();AN.i=Math.max(0,Math.min(AN.st.length-1,AN.i+d));animShow();say(AN.st[AN.i].c)}

function videoBtn(o,q){return '<a class="btn" href="'+esc(o.yt||("https://www.youtube.com/results?search_query="+encodeURIComponent(q)))+'" target="_blank" rel="noopener">Videos auf YouTube suchen</a><p class="small muted">Öffnet YouTube, braucht Internet.</p>'}
function vRigs(){
  var v=S.view,h;
  if(v&&v.t==="rig"){var r=R[v.id];h=head(r.n,"closeview")+'<div class="row"><span class="pill k">'+esc(r.kat)+'</span><span class="muted small">'+lk(r.fuer)+"</span></div>"+photo("r_"+r.id,r.n,true).replace('class="photo"','class="photo fit"');
    h+='<h2>Erklärfilm</h2>'+animBox(r)+"<h2>Aufbau</h2>"+'<div class="card">'+chain(r)+"</div><h2>So bindest du es</h2>"+'<div class="card">'+stepList(r.bau,"rig:"+r.id)+"</div>";
    h+='<div class="card"><span class="label">Führung</span><p>'+lk(r.fuehrung,"rig:"+r.id)+"</p>"+(r.tipp?'<span class="label">Tipp</span><p>'+lk(r.tipp,"rig:"+r.id)+"</p>":"")+"</div>";
    h+=videoBtn(r,r.n+" binden Anleitung");
    if(r.k.length){h+='<h2>Knoten dafür</h2><div class="list">';r.k.forEach(function(id){h+=knotItem(KN[id])});h+="</div>"}
    if(r.b.length){h+='<h2>Passende Köder</h2><div class="list">';r.b.forEach(function(id){var b=B[id];if(b)h+='<button class="item" data-a="bait" data-v="'+b.id+'">'+photo("b_"+b.id)+'<span class="grow"><b>'+esc(b.n)+'</b><span class="small muted">'+esc(b.kat)+"</span></span></button>"});h+="</div>"}
    return h}
  h=head("Rigs",null,RIGS.length+" Montagen mit Erklärfilm, Aufbau und Führung.");
  h+=search("rigs","Montage, Fisch oder Köder suchen")+'<div class="chips"><button class="chip'+(S.rk==="alle"?" on":"")+'" data-a="rk" data-v="alle">Alle</button>';
  RIGKATS.forEach(function(c){h+='<button class="chip'+(S.rk===c?" on":"")+'" data-a="rk" data-v="'+esc(c)+'">'+esc(c)+"</button>"});
  return h+'</div><div class="list" id="res">'+rigList()+"</div>";
}
function vKnoten(){var v=S.view,h;
  if(v&&v.t==="knot"){var k=KN[v.id];h=head(k.n,"closeview")+'<div class="card"><dl class="kv"><dt>Wofür</dt><dd>'+lk(k.fuer,"knot:"+k.id)+"</dd><dt>Schnur</dt><dd>"+esc(k.schnur)+"</dd><dt>Schwierigkeit</dt><dd>"+esc(k.lvl)+"</dd><dt>Tragkraft</dt><dd>"+esc(k.kraft)+"</dd></dl></div>"+knotPics(k);
    h+='<h2>Schritt für Schritt</h2><div class="card">'+stepList(k.s,"knot:"+k.id)+"</div>"+(k.tipp?'<div class="card"><span class="label">Tipp</span><p>'+lk(k.tipp,"knot:"+k.id)+"</p></div>":"");
    h+='<p class="notice">Jeden Knoten vor dem Festziehen anfeuchten, langsam zuziehen und danach einmal kräftig auf Zug prüfen.</p>';
    h+=videoBtn(k,k.n+" Angelknoten binden Anleitung");
    if(k.url)h+='<a class="btn" href="'+esc(k.url)+'" target="_blank" rel="noopener">Fotoserie ansehen (englisch, braucht Internet)</a>';
    var rr=RIGS.filter(function(r){return r.k.indexOf(k.id)>=0});if(rr.length){h+='<h2>Wird gebraucht für</h2><div class="list">';rr.forEach(function(r){h+=rigItem(r)});h+="</div>"}
    return h}
  return head("Knoten",null,KNOTS.length+" Knoten, Schritt für Schritt.")+'<p class="card sunk small">Mit vier Knoten kommst du überall durch: Clinch (Mono an Wirbel), Palomar (Geflecht an Wirbel), Doppelter Uni (Geflecht an Vorfach) und Stopperknoten (Pose).</p><div class="list">'+KNOTS.map(knotItem).join("")+"</div>";
}
function rigList(){var h="";RIGS.filter(function(r){return(S.rk==="alle"||r.kat===S.rk)&&match(S.q.rigs,r.n+" "+r.fuer+" "+r.kat+" "+r.b.map(function(x){return B[x]?B[x].n:""}).join(" "))}).forEach(function(r){h+=rigItem(r)});return h||'<p class="card">Nichts gefunden.</p>'}


// ---------- Angelstellen mit Erklärfilm ----------
var STT=["Die Stelle","Hier stehen die Fische","Hier hinwerfen","So führen","Tipp","Häufiger Fehler"];
function gY(bot,x){for(var i=1;i<bot.length;i++)if(x<=bot[i][0]){var a=bot[i-1],b=bot[i];return a[1]+(b[1]-a[1])*(x-a[0])/((b[0]-a[0])||1)}return bot[bot.length-1][1]}
function spotDeco(sp,d){var b=sp.bot,h="",x,y,i,g;
  if(d[0]==="reed"){for(x=d[1],i=0;x<=d[2];x+=6,i++){g=gY(b,x);var top=22+(i*37%26),bend=(i%3-1)*5;h+='<path class="reed" d="M'+x+" "+g+"Q"+(x+bend)+" "+((g+top)/2)+" "+(x+bend*1.6)+" "+top+'"/>';if(i%3===0)h+='<ellipse class="cat" cx="'+(x+bend*1.6)+'" cy="'+(top+8)+'" rx="2.6" ry="8"/>'}}
  else if(d[0]==="lily"){for(x=d[1],i=0;x<=d[2];x+=23,i++){g=gY(b,x);h+='<path class="stem" d="M'+x+" 90Q"+(x+(i%2?9:-9))+" "+((90+g)/2)+" "+(x+(i%2?-4:5))+" "+g+'"/><ellipse class="pad" cx="'+x+'" cy="89" rx="11.5" ry="3.6"/>';if(i%3===1)h+='<path class="bloom" d="M'+(x-5)+" 87q5-11 10 0q-5 3-10 0z\"/>"}}
  else if(d[0]==="stones"){for(x=d[1],i=0;x<=d[2];x+=13,i++){g=gY(b,x);var t=83+(x-d[1])*.07;for(y=t+(i%2?4:0);y<g+4;y+=11)h+='<ellipse class="stone" cx="'+(x+(Math.round(y)%2?2:-2))+'" cy="'+y+'" rx="8.2" ry="6.3"/>'}g=gY(b,d[2]+16);for(y=110;y<g+4;y+=11)h+='<ellipse class="stone" cx="'+(d[2]+14-(y-110)*.02)+'" cy="'+y+'" rx="8.2" ry="6.3"/>'}
  else if(d[0]==="riprap"){for(x=d[1],i=0;x<=d[2];x+=12,i++){g=gY(b,x);h+='<ellipse class="stone" cx="'+x+'" cy="'+(g-4)+'" rx="8" ry="6.2"/>'+(i%2?'<ellipse class="stone" cx="'+(x+5)+'" cy="'+(g-13)+'" rx="6.5" ry="5"/>':"")}}
  else if(d[0]==="posts"){for(x=d[1];x<=d[2];x+=39){g=gY(b,x);h+='<rect class="wood" x="'+(x-3.5)+'" y="76" width="7" height="'+(g-70)+'"/>'}h+='<rect class="wood" x="'+(d[1]-34)+'" y="71" width="'+(d[2]-d[1]+44)+'" height="7" rx="2"/>'}
  else if(d[0]==="tree"){var x0=d[1],y0=gY(b,x0)-6,x1=d[2],y1=d[3];h+='<path class="trunk" d="M'+x0+" "+y0+"L"+x1+" "+y1+'"/>';[.35,.5,.65,.8,.92].forEach(function(f,k){var px=x0+(x1-x0)*f,py=y0+(y1-y0)*f,up=k%2?-1:1,len=46-k*5;h+='<path class="branch" d="M'+px+" "+py+"l"+(len*.8)+" "+(up*len*.75)+"M"+(px+len*.45)+" "+(py+up*len*.42)+"l"+(len*.5)+" "+(-up*len*.12)+'"/>'})}
  else if(d[0]==="weedbed"){h+='<g class="weed">';for(x=d[1],i=0;x<=d[2];x+=8,i++){g=gY(b,x);var hh=d[3]*(.55+(i*29%45)/100),s=i%2?7:-7;h+='<path d="M'+x+" "+g+"q"+s+" "+(-hh/2)+" 0 "+(-hh)+'"/>'}h+="</g>"}
  else if(d[0]==="inflow"){x=d[1];g=gY(b,x);h+='<rect class="pipe" x="'+(x-30)+'" y="'+(g-2)+'" width="38" height="15" rx="7"/><path class="gush" d="M'+(x+6)+" "+(g+6)+"q22 0 26 "+(90-g-2)+'"/><ellipse class="foamy" cx="'+(x+34)+'" cy="91" rx="15" ry="4"/>'}
  else if(d[0]==="pillar"){g=gY(b,(d[1]+d[2])/2);h+='<rect class="conc" x="'+d[1]+'" y="24" width="'+(d[2]-d[1])+'" height="'+(g-14)+'"/><rect class="deck" x="0" y="0" width="360" height="26"/><path class="rail" d="M0 5H360"/>'}
  else if(d[0]==="flow"){h+='<path class="flow" d="M'+d[1]+" "+d[2]+"h"+(34*d[3])+"m"+(-8*d[3])+" -6l"+(8*d[3])+" 6l"+(-8*d[3])+' 6"/>'}
  else if(d[0]==="rock"){h+='<ellipse class="stone" cx="'+d[1]+'" cy="'+(d[2]-6)+'" rx="17" ry="12"/>'}
  else if(d[0]==="bush"){x=d[1];h+='<path class="branch" d="M'+x+" 84q-10 30-4 70M"+(x-2)+' 96q-14 16-12 44"/><circle class="leaf" cx="'+(x-8)+'" cy="62" r="17"/><circle class="leaf" cx="'+(x+6)+'" cy="50" r="15"/><circle class="leaf" cx="'+(x-20)+'" cy="76" r="11"/>'}
  else if(d[0]==="foam"){for(x=d[1],i=0;x<=d[2];x+=14,i++)h+='<ellipse class="foamy" cx="'+x+'" cy="'+(88-(i%2)*4)+'" rx="10" ry="4"/>'}
  return h}
function spotSvg(sp){var b=sp.bot,i,d=sp.to,gp="M0 450L"+b.map(function(p){return p[0]+" "+p[1]}).join("L")+"L360 450Z",land="";
  for(i=1;i<b.length;i++)if(b[i-1][1]<=90&&b[i][1]<=92)land+="M"+b[i-1][0]+" "+b[i-1][1]+"L"+b[i][0]+" "+Math.min(b[i][1],90);
  var h='<svg class="scene spotsc" viewBox="0 0 360 450" role="img" aria-label="Angelstelle im Querschnitt: '+esc(sp.n)+'"><defs><linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="w0"/><stop offset="1" class="w1"/></linearGradient></defs><rect class="sky" width="360" height="92"/><rect y="90" width="360" height="360" fill="url(#wg2)"/><path class="ray" d="M60 90h50l-70 360h-60zM200 90h40l-60 360h-50zM300 90h46l-50 360h-56z"/>',bg=IMG["s_"+sp.id];
  if(bg)h=h.slice(0,h.indexOf('<rect class="sky"'))+'<image href="img/s_'+sp.id+'.jpg" width="360" height="450" preserveAspectRatio="none"/>';
  var back="",front="";sp.deco.forEach(function(x){if(x[0]==="pillar"||x[0]==="stones"||x[0]==="posts"||x[0]==="lily")back+=spotDeco(sp,x);else front+=spotDeco(sp,x)});
  if(!bg)h+='<path class="surfl" d="M0 90c15-3 30 3 45 0s30-3 45 0 30 3 45 0 30-3 45 0 30 3 45 0 30-3 45 0 30 3 45 0 30-3 45 0"/>'+back+'<path class="sand" d="'+gp+'"/>'+(land?'<path class="grass" d="'+land+'"/>':"")+front;
  // Angler
  var a=sp.ang,ax=a[1],dir=d>ax?1:-1,tip;
  if(a[0]==="boat"){tip=[ax+dir*52,16];h+='<g transform="translate('+ax+' 0) scale('+(-dir)+' 1)"><image href="img/k_angler_boot.webp" x="-52" y="15" width="102" height="88"/></g>'}
  else{var ay=a[2]||gY(b,ax);tip=[ax+dir*42.5,ay-75];h+='<g transform="translate('+ax+" "+ay+') scale('+(-dir)+' 1)"><image href="img/k_angler_steh.webp" x="-42.5" y="-76" width="49.4" height="77"/></g>'}
  // Fische
  var sf=sp.f.filter(function(x){return SPR[x]}),SW={hecht:58,wels:62,aal:54,zander:48,karpfen:46,rapfen:46,doebel:42,barsch:36,barbe:46,schleie:40,rotfeder:32,bachforelle:40,wolfsbarsch:46,quappe:44,brasse:42,rotauge:32};
  sp.fish.forEach(function(f,i){var id=sf.length?sf[i%sf.length]:"",w=SW[id]||44;h+='<g data-s="1,3,4,5" transform="translate('+f[0]+" "+f[1]+") scale("+(f[2]*-1)+' 1)">'+(id?'<image class="spr" href="img/k_'+id+'.webp" x="'+(-w/2)+'" y="'+(-w*SPR[id]/2).toFixed(1)+'" width="'+w+'" height="'+(w*SPR[id]).toFixed(1)+'"/>':'<path class="sfish" d="M-17 0c9-8 22-8 30 0c-8 8-21 8-30 0zM13 0l9-7v14z"/><circle class="sfe" cx="-10" cy="-1.5" r="1.4"/>')+'</g><circle class="ring" data-s="1" cx="'+f[0]+'" cy="'+f[1]+'" r="24"/>'});
  // Wurf
  var cy=Math.max(6,Math.min(tip[1],90)-74);
  h+='<path class="arc" data-s="2" pathLength="100" d="M'+tip[0]+" "+tip[1]+"Q"+((tip[0]+d)/2)+" "+cy+" "+d+' 90"/><g data-s="2"><circle class="tgt" cx="'+d+'" cy="90" r="6"/><circle class="ring" cx="'+d+'" cy="90" r="14"/></g>';
  var p=sp.path;
  h+='<g class="lure" data-s="3,4" style="--x1:'+p[0][0]+"px;--y1:"+p[0][1]+"px;--x2:"+p[1][0]+"px;--y2:"+p[1][1]+"px;--x3:"+p[2][0]+"px;--y3:"+p[2][1]+'px"><path class="lpath" d="M-9 0c5-6 13-6 18 0c-5 6-13 6-18 0zM9 0l6-5v10z"/><circle cx="-4" cy="-1" r="1.3"/></g>';
  h+='<path class="trail" data-s="3,4" d="M'+p[0][0]+" "+p[0][1]+"L"+p[1][0]+" "+p[1][1]+"L"+p[2][0]+" "+p[2][1]+'"/>';
  var ty=412;
  [[1,"Hier stehen die Fische"],[2,"Hier hinwerfen"],[3,sp.mt],[4,"Tipp"],[5,"Fehler vermeiden"]].forEach(function(t){h+='<g class="mtag stag'+(t[0]===5?" bad":"")+'" data-s="'+t[0]+'"><rect x="10" y="'+ty+'" width="'+Math.min(340,t[1].length*7.5+26)+'" height="28" rx="14"/><text x="23" y="'+(ty+19)+'">'+esc(t[1])+"</text></g>"});
  return h+"</svg>"}
function spotBox(sp){AN.r=sp;AN.spot=true;AN.i=0;AN.st=sp.st.map(function(c,i){return{k:"s",c:(i===5?"Häufiger Fehler: ":"")+c}});
  return '<div class="anim spot" id="anim" data-k="water"><div class="stage">'+spotSvg(sp)+'<button class="bigplay" data-a="aplay" aria-label="Erklärfilm abspielen">▶</button></div><div class="bar"><i id="abar"></i></div><p class="cap" id="acap" aria-live="polite">'+esc(sp.st[0])+'</p><div class="row"><button class="btn" data-a="aprev" aria-label="Schritt zurück">‹</button><button class="btn grow water" data-a="aplay" id="aplay">▶ Erklärfilm abspielen</button><button class="btn" data-a="anext" aria-label="Schritt vor">›</button></div>'+(SY?'<button class="chip'+(AN.voice?" on":"")+'" data-a="avoice" id="avoice" aria-pressed="'+AN.voice+'">🔊 Stimme '+(AN.voice?"an":"aus")+"</button>":"")+"</div>"}
function spotItem(sp){return'<button class="item" data-a="spot" data-v="'+sp.id+'"><span class="grow"><b>'+esc(sp.n)+'</b><span class="small muted">'+esc(sp.f.slice(0,4).map(function(x){return F[x]?F[x].n:""}).filter(Boolean).join(", "))+'</span></span><span class="chev" aria-hidden="true">›</span></button>'}
function spotsFor(fid,wt){var a=SPOTS.filter(function(s){return s.f.indexOf(fid)>=0&&(!wt||s.w.indexOf(wt)>=0)});return a}
function spotChips(fid,wt){var a=spotsFor(fid,wt);if(!a.length)a=spotsFor(fid);if(!a.length)return"";return'<div class="card"><span class="label">Wo steht der Fisch?</span><div class="chips">'+a.slice(0,6).map(function(s){return'<button class="chip" data-a="spot" data-v="'+s.id+'">'+esc(s.n)+"</button>"}).join("")+"</div></div>"}
function vStellen(){var v=S.view,h;
  if(v&&v.t==="spot"&&SP[v.id]){var sp=SP[v.id],self="spot:"+sp.id;h=head(sp.n,"closeview")+'<p class="muted small">'+esc(sp.w.map(function(x){return WT[x]?WT[x].n:""}).filter(Boolean).join(" · "))+"</p><h2>Erklärfilm</h2>"+spotBox(sp);
    h+='<div class="card">';sp.st.forEach(function(c,i){if(i)h+='<span class="label">'+STT[i]+"</span><p>"+lk(c,self)+"</p>"});h+="</div>";
    h+='<h2>Fische an dieser Stelle</h2><div class="chips">'+sp.f.map(function(x){return F[x]?'<button class="chip" data-a="fishview" data-v="'+x+'">'+esc(F[x].n)+"</button>":""}).join("")+"</div>";
    h+='<h2>Passende Köder</h2><div class="list">';sp.b.forEach(function(id){var b=B[id];if(b)h+='<button class="item" data-a="bait" data-v="'+b.id+'">'+photo("b_"+b.id)+'<span class="grow"><b>'+esc(b.n)+'</b><span class="small muted">'+esc(b.kat)+"</span></span></button>"});
    h+='</div><h2>Passende Rigs</h2><div class="list">';sp.r.forEach(function(id){if(R[id])h+=rigItem(R[id])});return h+"</div>"}
  h=head("Angelstellen","mehr",SPOTS.length+" Stellen mit Erklärfilm: wo die Fische stehen, wohin du wirfst und wie du führst.")+'<div class="list">';
  SPOTS.forEach(function(sp){h+=spotItem(sp)});return h+"</div>"}

// ---------- Rute und Rolle ----------
function gearSet(fid){for(var i=0;i<GEAR.sets.length;i++)if(GEAR.sets[i].f.indexOf(fid)>=0)return GEAR.sets[i];return null}
function gearKv(s){return'<dl class="kv"><dt>Rute</dt><dd>'+esc(s.rute)+"</dd><dt>Rolle</dt><dd>"+esc(s.rolle)+"</dd><dt>Schnur</dt><dd>"+esc(s.schnur)+"</dd><dt>Vorfach</dt><dd>"+esc(s.vorfach)+'</dd></dl><p class="small muted">'+esc(s.tip)+"</p>"}
function gearCard(fid){var s=gearSet(fid);if(!s)return"";return'<div class="card"><span class="label">Rute und Rolle dafür</span>'+gearKv(s)+'<button class="btn" data-a="gear" data-v="wissen">Rute und Rolle verstehen</button></div>'}
function vGeraet(){var v=S.view,h,G=GEAR;
  if(v&&v.t==="gear"){
    if(v.id==="sets"){h=head("Was passt zu meinem Fisch?","closeview","Richtwerte für eine stimmige Kombination. Hausgewässer und Ködergröße entscheiden mit.");G.sets.forEach(function(s){h+='<div class="card"><b>'+esc(s.n)+"</b>"+gearKv(s)+'<div class="chips">'+s.f.slice(0,5).map(function(x){return F[x]?'<button class="chip" data-a="fishview" data-v="'+x+'">'+esc(F[x].n)+"</button>":""}).join("")+"</div></div>"});return h}
    if(v.id==="ruten"){h=head("Rutenarten","closeview",G.ruten.length+" Rutentypen und wofür sie gebaut sind.");G.ruten.forEach(function(r){h+='<div class="card"><b>'+esc(r.n)+"</b><p>"+esc(r.t)+'</p><dl class="kv"><dt>Länge</dt><dd>'+esc(r.l)+"</dd><dt>Wurfgewicht</dt><dd>"+esc(r.wg)+"</dd><dt>Aktion</dt><dd>"+esc(r.akt)+"</dd><dt>Für</dt><dd>"+esc(r.f)+"</dd></dl></div>"});return h}
    if(v.id==="rollen"){h=head("Rollenarten","closeview",G.rollen.length+" Rollentypen im Überblick.");G.rollen.forEach(function(r){h+='<div class="card"><b>'+esc(r.n)+"</b><p>"+esc(r.t)+'</p><dl class="kv"><dt>Größen</dt><dd>'+esc(r.gr)+"</dd></dl></div>"});return h}
    h=head("Rute und Rolle verstehen","closeview","Länge, Wurfgewicht, Aktion, Rollengröße, Bremse und Schnur.");G.wissen.forEach(function(w){h+='<div class="card"><b>'+esc(w[0])+"</b><p>"+esc(w[1])+"</p></div>"});return h}
  var it=function(id,t,s){return'<button class="item" data-a="gear" data-v="'+id+'"><span class="grow"><b>'+t+'</b><span class="small muted">'+s+'</span></span><span class="chev" aria-hidden="true">›</span></button>'};
  return head("Rute und Rolle","mehr","Welche Rute, welche Rolle, welche Schnur. Alle Angaben sind Richtwerte.")+'<div class="list">'+it("sets","Was passt zu meinem Fisch?",G.sets.length+" fertige Kombinationen mit Schnur und Vorfach")+it("ruten","Rutenarten","Von Ultralight bis Brandung")+it("rollen","Rollenarten","Stationärrolle, Freilauf, Baitcaster und mehr")+it("wissen","Rute und Rolle verstehen","Wurfgewicht, Aktion, Übersetzung, Bremse, Schnur")+"</div>"}

// ---------- Angelarten ----------
var METHODS=window.METHODS||[],ME={};METHODS.forEach(function(x){ME[x.id]=x});
function methItem(m){return'<button class="item" data-a="meth" data-v="'+m.id+'"><span class="grow"><b>'+esc(m.n)+'</b><span class="small muted">'+esc(m.kurz)+'</span></span><span class="chev" aria-hidden="true">›</span></button>'}
function methChips(fid){var a=METHODS.filter(function(m){return m.f.indexOf(fid)>=0});if(!a.length)return"";return'<div class="card"><span class="label">So wird er gefangen</span><div class="chips">'+a.map(function(m){return'<button class="chip" data-a="meth" data-v="'+m.id+'">'+esc(m.n)+"</button>"}).join("")+"</div></div>"}
function vArten(){var v=S.view,h;
  if(v&&v.t==="meth"&&ME[v.id]){var m=ME[v.id],self="meth:"+m.id;h=head(m.n,"closeview")+'<p class="muted">'+esc(m.kurz)+'</p><div class="card"><p>'+lk(m.info,self)+"</p></div>";
    h+='<h2>Ausrüstung</h2><div class="card"><dl class="kv">'+m.geraet.map(function(g){return"<dt>"+esc(g[0])+"</dt><dd>"+lk(g[1],self)+"</dd>"}).join("")+"</dl></div>";
    m.sek.forEach(function(x){h+="<h2>"+esc(x[0])+'</h2><div class="card">'+stepList(x[1],self)+"</div>"});
    h+='<h2>Häufige Fehler</h2><div class="card"><ul class="plain">'+m.fehler.map(function(x){return"<li>"+lk(x,self)+"</li>"}).join("")+"</ul></div>";
    h+='<h2>Zielfische</h2><div class="chips">'+m.f.map(function(x){return F[x]?'<button class="chip" data-a="fishview" data-v="'+x+'">'+esc(F[x].n)+"</button>":""}).join("")+"</div>";
    if(m.r.length){h+='<h2>Montagen dazu</h2><div class="list">';m.r.forEach(function(id){if(R[id])h+=rigItem(R[id])});h+="</div>"}
    if(m.k.length){h+='<h2>Knoten dazu</h2><div class="list">';m.k.forEach(function(id){if(KN[id])h+=knotItem(KN[id])});h+="</div>"}
    if(m.b.length){h+='<h2>Köder dazu</h2><div class="list">';m.b.forEach(function(id){var b=B[id];if(b)h+='<button class="item" data-a="bait" data-v="'+b.id+'">'+photo("b_"+b.id)+'<span class="grow"><b>'+esc(b.n)+'</b><span class="small muted">'+esc(b.kat)+"</span></span></button>"});h+="</div>"}
    if(m.s.length){h+='<h2>Gute Stellen dafür</h2><div class="list">';m.s.forEach(function(id){if(SP[id])h+=spotItem(SP[id])});h+="</div>"}
    return h}
  h=head("Angelarten","mehr",METHODS.length+" Anleitungen von der Ausrüstung bis zur Technik.")+'<div class="list">';METHODS.forEach(function(m){h+=methItem(m)});return h+"</div>"}

// ---------- Fangbuch (liegt nur auf diesem Gerät) ----------
var CATCH=[],DB=null,CPH={};window.agCatches=function(){return CATCH};
function dbOpen(cb){try{var rq=indexedDB.open("ag_fang",1);rq.onupgradeneeded=function(){var d=rq.result;if(!d.objectStoreNames.contains("c"))d.createObjectStore("c",{keyPath:"id"});if(!d.objectStoreNames.contains("p"))d.createObjectStore("p")};rq.onsuccess=function(){DB=rq.result;cb()};rq.onerror=function(){cb()};rq.onblocked=function(){cb()}}catch(e){cb()}}
function dbLoad(cb){if(!DB){CATCH=store.get("catches",[]);return cb()}try{var rq=DB.transaction("c").objectStore("c").getAll();rq.onsuccess=function(){CATCH=rq.result||[];cb()};rq.onerror=function(){cb()}}catch(e){cb()}}
function dbSave(rec,ph){if(ph){CPH={};CPH[rec.id]=ph}if(!DB){store.set("catches",CATCH);return}try{var tx=DB.transaction(["c","p"],"readwrite");tx.objectStore("c").put(rec);if(ph)tx.objectStore("p").put(ph,rec.id)}catch(e){}}
function dbDel(id){delete CPH[id];if(!DB){store.set("catches",CATCH);return}try{var tx=DB.transaction(["c","p"],"readwrite");tx.objectStore("c")["delete"](id);tx.objectStore("p")["delete"](id)}catch(e){}}
function dbPhoto(id,cb){if(CPH[id])return cb(CPH[id]);if(!DB)return cb(null);try{var rq=DB.transaction("p").objectStore("p").get(id);rq.onsuccess=function(){if(rq.result){CPH={};CPH[id]=rq.result}cb(rq.result||null)};rq.onerror=function(){cb(null)}}catch(e){cb(null)}}
function iso(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function cDate(s){var p=String(s).split("-");return new Date(+p[0]||2000,(+p[1]||1)-1,+p[2]||1)}
function fmtD(s){var p=String(s).split("-");return p[2]+"."+p[1]+"."+p[0]}
function cById(id){for(var i=0;i<CATCH.length;i++)if(CATCH[i].id===id)return CATCH[i];return null}
function cSorted(a){return(a||CATCH).slice().sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:(a.id<b.id?1:-1)})}
function cTitle(c){var f=F[c.fish];return(f?f.n:"Fang")+(c.len?" · "+String(c.len).replace(".",",")+" cm":"")}
function catchWarn(c){var out=[],seen={},reg=REGS[c.bl];if(!reg||!c.fish)return out;var rows=rulesFor(c.fish,c.bl),clear=rows.some(function(r){return r.von!=="-"});
  function add(k,l){if(!seen[l]){seen[l]=1;out.push({c:k,l:l})}}
  rows.forEach(function(r){var st=rowStatus(r,cDate(c.d)),nm=r.art.split(" (")[0],m=parseFloat(r.mass);
    if(st.c==="stop")add("stop",nm+": "+st.l.replace(/\.$/,"")+". Bitte zurücksetzen.");
    else if(st.c==="warn"&&!clear)add("warn",nm+": Sonderregel"+(r.fn&&reg.notes[r.fn]?" ("+reg.notes[r.fn]+")":"")+", in den Schonzeiten nachsehen.");
    if(m&&c.len&&+c.len<m)add("stop",nm+": untermaßig, Mindestmaß "+m+" cm. Bitte zurücksetzen.");
    else if(m&&!c.len)add("warn",nm+": Mindestmaß "+m+" cm, Länge eintragen.")});
  return out}
function warnBox(c){if(!c.fish||!REGS[c.bl])return"";var reg=REGS[c.bl],rows=rulesFor(c.fish,c.bl),w=catchWarn(c),h='<div class="card"><span class="label">Schonzeit-Warner · '+esc(reg.name)+" · "+fmtD(c.d)+"</span>";
  if(!rows.length)h+='<p class="small muted">Für diese Art steht nichts in der Tabelle dieses Landes. Das heißt nicht automatisch „frei“.</p>';
  else if(!w.length)h+='<div class="rule"><span class="pill ok">Frei'+(c.len?" und maßig":"")+"</span></div>";
  w.forEach(function(x){h+='<div class="rule"><span class="pill '+x.c+'">'+(x.c==="stop"?"Achtung":"Hinweis")+'</span><span class="small">'+esc(x.l)+"</span></div>"});
  return h+'<p class="small muted">Tabellenstand '+esc(reg.stand)+", ohne Gewähr. Es gilt dein Erlaubnisschein.</p></div>"}
function ym(c){return c.d.slice(0,7)}
function fomFor(m){var a=CATCH.filter(function(c){return ym(c)===m});if(!a.length)return null;var p=a.filter(function(c){return c.fom})[0];if(p)return p;return a.sort(function(x,y){return(+y.len||0)-(+x.len||0)||(x.id<y.id?-1:1)})[0]}
function firstOf(fish){var a=CATCH.filter(function(c){return c.fish===fish}).sort(function(x,y){return x.d<y.d?-1:x.d>y.d?1:(x.id<y.id?-1:1)});return a[0]||null}
function bestOf(fish,year){var a=CATCH.filter(function(c){return c.fish===fish&&c.len&&(!year||c.d.slice(0,4)===year)}).sort(function(x,y){return y.len-x.len||(x.id<y.id?-1:1)});return a[0]||null}
function cBadges(c){var b=[];var f=fomFor(ym(c));if(f&&f.id===c.id)b.push(["k","Fang des Monats"]);var p=bestOf(c.fish);if(p&&p.id===c.id)b.push(["ok","Persönlicher Rekord"]);var e=firstOf(c.fish);if(e&&e.id===c.id)b.push(["k","Erstfang"]);if(c.kur)b.push(["n","Kuriosität"]);if(c.rel)b.push(["k","Zurückgesetzt"]);return b}
function pills(b){return b.map(function(x){return'<span class="pill '+x[0]+'">'+x[1]+"</span>"}).join(" ")}
function cItem(c,sub){var bt=B[c.bait];return'<button class="item" data-a="catch" data-v="'+c.id+'">'+(c.th?'<img class="cth" src="'+c.th+'" alt="">':'<span class="cth none" aria-hidden="true"></span>')+'<span class="grow"><b>'+esc(cTitle(c))+'</b><span class="small muted">'+(sub||fmtD(c.d)+(c.water?" · "+esc(c.water):"")+(bt?" · "+esc(bt.n):""))+'</span><span class="cbad">'+pills(cBadges(c))+"</span></span></button>"}
function topOf(key,map){var n={},best=null;CATCH.forEach(function(c){var v=c[key];if(!v)return;n[v]=(n[v]||0)+1;if(!best||n[v]>n[best])best=v});return best?(map&&map[best]?map[best].n:best)+" ("+n[best]+")":"–"}
function scaleImg(im,max,q){var w=im.naturalWidth,h=im.naturalHeight,k=Math.min(1,max/Math.max(w,h)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));c.getContext("2d").drawImage(im,0,0,c.width,c.height);return c.toDataURL("image/jpeg",q)}
function readPhoto(file){var msg=document.getElementById("cfmsg");try{var rd=new FileReader();rd.onload=function(){var im=new Image();im.onload=function(){if(!S.cf)return;try{S.cf.ph=scaleImg(im,1280,.82);S.cf.th=scaleImg(im,240,.72);S.cf.newph=true;var p=document.getElementById("cprev");if(p)p.innerHTML='<img src="'+S.cf.ph+'" alt="Dein Fangfoto">'}catch(e){if(msg)msg.textContent="Das Foto konnte nicht verarbeitet werden."}};im.onerror=function(){if(msg)msg.textContent="Dieses Bildformat kann ich nicht lesen."};im.src=rd.result};rd.readAsDataURL(file)}catch(e){if(msg)msg.textContent="Das Foto konnte nicht gelesen werden."}}
function dataFile(u,name){var p=u.split(","),bin=atob(p[1]),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new File([a],name,{type:"image/jpeg"})}
function cText(c){var f=F[c.fish],b=B[c.bait],r=R[c.rig];return(f?f.n:"Fang")+(c.len?" mit "+String(c.len).replace(".",",")+" cm":"")+(c.kg?" und "+String(c.kg).replace(".",",")+" kg":"")+", gefangen am "+fmtD(c.d)+(b?" auf "+b.n:"")+(r?" am "+r.n:"")+(c.water&&c.spot!=="geheim"?" ("+c.water+")":"")+"."}
function shareCatch(c){var data={title:"Mein Fang",text:cText(c)};try{var ph=CPH[c.id];if(ph&&navigator.canShare){var fl=dataFile(ph,"fang.jpg");if(navigator.canShare({files:[fl]}))data.files=[fl]}var p=navigator.share(data);if(p&&p["catch"])p["catch"](function(){})}catch(e){}}
function newCf(fish){return{id:null,d:iso(new Date()),fish:fish||"",len:"",kg:"",bait:"",rig:"",water:"",bl:S.bl,note:"",rel:false,kur:false,spot:"grob",th:"",ph:"",newph:false}}
function opt(v,l,cur){return'<option value="'+esc(v)+'"'+(String(cur)===String(v)?" selected":"")+">"+esc(l)+"</option>"}
function cForm(){var c=S.cf,f=F[c.fish],h=head(c.id?"Fang bearbeiten":"Fang eintragen","closecf");
  h+='<div class="cprev" id="cprev">'+(c.ph||c.th?'<img src="'+(c.ph||c.th)+'" alt="Dein Fangfoto">':"")+'</div><label class="btn water" for="cphoto">Foto aufnehmen oder auswählen</label><input class="vh" id="cphoto" type="file" accept="image/*" data-c="cphoto">';
  h+='<div class="field"><label class="label" for="c_fish">Fisch</label><select id="c_fish" data-g="fish"><option value="">Bitte wählen</option>'+FISH.slice().sort(function(a,b){return a.n.localeCompare(b.n,"de")}).map(function(x){return opt(x.id,x.n,c.fish)}).join("")+"</select></div>";
  h+='<div class="row"><div class="field grow"><label class="label" for="c_len">Länge in cm</label><input id="c_len" data-g="len" type="number" inputmode="decimal" min="0" step="0.5" value="'+esc(c.len)+'"></div><div class="field grow"><label class="label" for="c_kg">Gewicht in kg</label><input id="c_kg" data-g="kg" type="number" inputmode="decimal" min="0" step="0.01" value="'+esc(c.kg)+'"></div></div>';
  h+='<div class="field"><label class="label" for="c_d">Datum</label><input id="c_d" data-g="d" type="date" value="'+esc(c.d)+'" max="'+iso(new Date())+'"></div>';
  h+='<div class="field"><label class="label" for="c_w">Gewässer</label><input id="c_w" data-g="water" list="c_wl" value="'+esc(c.water)+'" placeholder="z. B. Elbe bei Wittenberge"><datalist id="c_wl">'+allWaters().map(function(w){return'<option value="'+esc(w.n)+'">'}).join("")+"</datalist></div>";
  h+='<div class="field"><label class="label" for="c_bl">Bundesland für den Schonzeit-Warner</label><select id="c_bl" data-g="bl">'+BLS.map(function(k){return opt(k,REGS[k].name,c.bl)}).join("")+'<option value="-"'+(c.bl==="-"?" selected":"")+">Ausland / nicht prüfen</option></select></div>";
  h+='<div id="cwarn">'+warnBox(c)+"</div>";
  var fb=f?f.b.map(function(e){return B[e[0]]}).filter(Boolean):[],all=BAITS.slice().sort(function(a,b){return a.n.localeCompare(b.n,"de")});
  h+='<div class="field"><label class="label" for="c_bait">Köder</label><select id="c_bait" data-g="bait"><option value="">Nicht angegeben</option>'+(fb.length?'<optgroup label="Passt zu '+esc(f.n)+'">'+fb.map(function(b){return opt(b.id,b.n,c.bait)}).join("")+'</optgroup><optgroup label="Alle Köder">':"")+all.filter(function(b){return fb.indexOf(b)<0}).map(function(b){return opt(b.id,b.n,c.bait)}).join("")+(fb.length?"</optgroup>":"")+"</select></div>";
  var rb=c.bait?rigsForBait(c.bait):[];
  h+='<div class="field"><label class="label" for="c_rig">Rig / Montage</label><select id="c_rig" data-g="rig"><option value="">Nicht angegeben</option>'+(rb.length?'<optgroup label="Passt zum Köder">'+rb.map(function(r){return opt(r.id,r.n,c.rig)}).join("")+'</optgroup><optgroup label="Alle Rigs">':"")+RIGS.filter(function(r){return rb.indexOf(r)<0}).map(function(r){return opt(r.id,r.n,c.rig)}).join("")+(rb.length?"</optgroup>":"")+"</select></div>";
  h+='<div class="field"><label class="label" for="c_note">Notiz (Stelle, Wetter, Geschichte dazu)</label><textarea id="c_note" data-g="note" rows="3">'+esc(c.note)+"</textarea></div>";
  h+='<div class="chips"><button class="chip'+(c.rel?" on":"")+'" data-a="ctog" data-v="rel" aria-pressed="'+c.rel+'">Zurückgesetzt</button><button class="chip'+(c.kur?" on":"")+'" data-a="ctog" data-v="kur" aria-pressed="'+c.kur+'">Kuriosität</button></div>';
  h+='<div class="field"><span class="label">Fangplatz später für Freunde</span><div class="chips">'+[["genau","Genau"],["grob","Nur Gewässer"],["geheim","Geheim"]].map(function(o){return'<button class="chip'+(c.spot===o[0]?" on":"")+'" data-a="cspot" data-v="'+o[0]+'">'+o[1]+"</button>"}).join("")+'</div><span class="small muted">Gilt erst, wenn der Austausch mit Freunden angeschlossen ist. Bis dahin bleibt alles auf diesem Gerät.</span></div>';
  h+='<p class="small" id="cfmsg" role="status" style="color:var(--stop)"></p><button class="btn primary" data-a="csave">Fang speichern</button>';
  if(c.id)h+=c.del?'<div class="row"><button class="btn grow" data-a="cdelno">Behalten</button><button class="btn grow" data-a="cdelyes" style="color:var(--stop)">Wirklich löschen</button></div>':'<button class="btn" data-a="cdelask" style="color:var(--stop)">Fang löschen</button>';
  return h}
function cDetail(c){var f=F[c.fish],b=B[c.bait],r=R[c.rig],h=head(f?f.n:"Fang","closeview");
  h+='<figure class="photo fit cfull">'+(c.th?'<img id="cfull" src="'+(CPH[c.id]||c.th)+'" alt="'+esc(cTitle(c))+'">':"")+"</figure>";
  var bd=cBadges(c);if(bd.length)h+='<div class="row wrap">'+pills(bd)+"</div>";
  h+='<div class="card"><dl class="kv">'+(c.len?"<dt>Länge</dt><dd>"+String(c.len).replace(".",",")+" cm</dd>":"")+(c.kg?"<dt>Gewicht</dt><dd>"+String(c.kg).replace(".",",")+" kg</dd>":"")+"<dt>Datum</dt><dd>"+fmtD(c.d)+"</dd>"+(c.water?"<dt>Gewässer</dt><dd>"+esc(c.water)+"</dd>":"")+"<dt>Fangplatz</dt><dd>"+({genau:"Genau zeigen",grob:"Nur Gewässer zeigen",geheim:"Geheim"}[c.spot]||"Nur Gewässer zeigen")+"</dd></dl>"+(c.note?"<p>"+lk(c.note)+"</p>":"")+"</div>";
  h+='<h2>So wurde er gefangen</h2><div class="list">';
  if(f)h+='<button class="item" data-a="fishview" data-v="'+f.id+'">'+photo("f_"+f.id)+'<span class="grow"><b>'+esc(f.n)+'</b><span class="small muted">Fisch: Beißzeiten und Köder</span></span><span class="chev" aria-hidden="true">›</span></button>';
  if(b)h+='<button class="item" data-a="bait" data-v="'+b.id+'">'+photo("b_"+b.id)+'<span class="grow"><b>'+esc(b.n)+'</b><span class="small muted">Köder: '+esc(b.groesse)+'</span></span><span class="chev" aria-hidden="true">›</span></button>';
  if(r){h+='<button class="item" data-a="rig" data-v="'+r.id+'"><span class="grow"><b>'+esc(r.n)+'</b><span class="small muted">Rig mit Erklärfilm</span></span><span class="chev" aria-hidden="true">›</span></button>';
    (r.k||[]).forEach(function(k){if(KN[k])h+='<button class="item" data-a="knot" data-v="'+k+'"><span class="grow"><b>'+esc(KN[k].n)+'</b><span class="small muted">Knoten dazu</span></span><span class="chev" aria-hidden="true">›</span></button>'})}
  h+="</div>";if(!b&&!r)h+='<p class="small muted">Köder und Rig sind nicht eingetragen. Über „Bearbeiten“ kannst du sie ergänzen.</p>';
  if(c.bl!=="-")h+=warnBox(c);
  var fm=fomFor(ym(c));
  if(navigator.share)h+='<button class="btn water" data-a="cshare" data-v="'+c.id+'">Fang verschicken</button>';
  if(!fm||fm.id!==c.id||!c.fom)h+='<button class="btn" data-a="cfom" data-v="'+c.id+'">Als meinen Fang des Monats festlegen</button>';
  h+='<button class="btn" data-a="cedit" data-v="'+c.id+'">Bearbeiten</button>';
  return h}
var FRUB=[["alle","Alle"],["monat","Fang des Monats"],["jahr","Größter des Jahres"],["erst","Erster Fisch"],["kurios","Kuriositäten"],["stat","Statistik"]];
function vFang(){
  if(S.cf)return cForm();
  if(S.view&&S.view.t==="catch"){var c=cById(S.view.id);if(c)return cDetail(c);S.view=null}
  var h=head("Fänge",null,CATCH.length?CATCH.length+(CATCH.length===1?" Fang":" Fänge")+" in deinem Fangbuch.":"Dein Fangbuch mit Foto, Köder, Rig und Schonzeit-Warner.");
  h+='<button class="btn primary" data-a="newcatch">+ Fang eintragen</button>';
  if(!CATCH.length)return h+'<div class="card"><p><b>Noch kein Fang eingetragen.</b></p><p class="small muted">Foto machen, Fisch und Länge eintragen, fertig. Der Guide prüft Schonzeit und Mindestmaß und merkt sich, womit du gefangen hast.</p></div><p class="small muted">Das Fangbuch liegt nur auf diesem Gerät. Der Austausch mit Freunden wird später angeschlossen.</p>';
  h+='<div class="chips">'+FRUB.map(function(o){return'<button class="chip'+(S.fr===o[0]?" on":"")+'" data-a="fr" data-v="'+o[0]+'">'+o[1]+"</button>"}).join("")+"</div>";
  var r=S.fr,l="";
  if(r==="alle"){l='<div class="list">'+cSorted().map(function(c){return cItem(c)}).join("")+"</div>"}
  else if(r==="monat"){var ms=[];CATCH.forEach(function(c){if(ms.indexOf(ym(c))<0)ms.push(ym(c))});ms.sort().reverse();
    l='<p class="small muted">Bis deine Freunde abstimmen können, gewinnt der längste Fisch des Monats oder der, den du selbst festlegst.</p>';
    ms.forEach(function(m){var w=fomFor(m),n=CATCH.filter(function(c){return ym(c)===m}).length;l+="<h2>"+MONL[+m.slice(5)-1]+" "+m.slice(0,4)+'</h2><div class="list">'+cItem(w,(w.fom?"Von dir festgelegt":"Längster Fisch")+" · aus "+n+(n===1?" Fang":" Fängen"))+"</div>"})}
  else if(r==="jahr"){var ys=[];CATCH.forEach(function(c){var y=c.d.slice(0,4);if(ys.indexOf(y)<0)ys.push(y)});ys.sort().reverse();
    ys.forEach(function(y){var sp=[],rows=[];CATCH.forEach(function(c){if(c.d.slice(0,4)===y&&sp.indexOf(c.fish)<0)sp.push(c.fish)});sp.forEach(function(s){var x=bestOf(s,y);if(x)rows.push(x)});rows.sort(function(a,b){return b.len-a.len});
      l+="<h2>"+y+"</h2>"+(rows.length?'<div class="list">'+rows.map(function(c,i){return cItem(c,(i===0?"Größter Fisch des Jahres":"Größter "+esc(F[c.fish]?F[c.fish].n:"Fisch")+" des Jahres")+" · "+fmtD(c.d))}).join("")+"</div>":'<p class="card">Für dieses Jahr ist noch keine Länge eingetragen.</p>')})}
  else if(r==="erst"){var sp2=[],fs=[];CATCH.forEach(function(c){if(sp2.indexOf(c.fish)<0)sp2.push(c.fish)});sp2.forEach(function(s){fs.push(firstOf(s))});fs.sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0});
    l='<div class="card sunk"><b>'+sp2.length+" von "+FISH.length+' Arten gefangen</b><div class="bar"><i style="width:'+Math.max(2,Math.round(sp2.length/FISH.length*100))+'%"></i></div></div><div class="list">'+fs.map(function(c,i){return cItem(c,(i===0?"Dein allererster Fang":"Erster "+esc(F[c.fish]?F[c.fish].n:"Fisch"))+" · "+fmtD(c.d))}).join("")+"</div>"}
  else if(r==="kurios"){var ku=cSorted(CATCH.filter(function(c){return c.kur}));l=ku.length?'<div class="list">'+ku.map(function(c){return cItem(c)}).join("")+"</div>":'<p class="card">Noch keine Kuriosität. Beim Eintragen „Kuriosität“ antippen: Beifang, seltsame Farbe, verrückte Geschichte.</p>'}
  else{var sp3={},mo=[0,0,0,0,0,0,0,0,0,0,0,0],rel=0,big=null;CATCH.forEach(function(c){sp3[c.fish]=1;mo[+c.d.slice(5,7)-1]++;if(c.rel)rel++;if(c.len&&(!big||+c.len>+big.len))big=c});var mx=Math.max.apply(null,mo);
    l='<div class="card"><dl class="kv"><dt>Fänge</dt><dd>'+CATCH.length+"</dd><dt>Arten</dt><dd>"+Object.keys(sp3).length+"</dd><dt>Zurückgesetzt</dt><dd>"+rel+"</dd><dt>Längster</dt><dd>"+(big?esc(cTitle(big)):"–")+"</dd><dt>Häufigster Fisch</dt><dd>"+esc(topOf("fish",F))+"</dd><dt>Bester Köder</dt><dd>"+esc(topOf("bait",B))+"</dd><dt>Bestes Rig</dt><dd>"+esc(topOf("rig",R))+"</dd><dt>Bestes Gewässer</dt><dd>"+esc(topOf("water"))+'</dd></dl></div><div class="card"><span class="label">Fänge je Monat</span><div class="mbars" role="img" aria-label="Fänge je Monat">'+mo.map(function(n,i){return'<span><i style="height:'+(mx?Math.round(n/mx*100):0)+'%"></i><b>'+(n||"")+"</b><em>"+MON[i].charAt(0)+"</em></span>"}).join("")+"</div></div>"}
  return h+l+'<p class="small muted">Das Fangbuch liegt nur auf diesem Gerät.</p>'}
// ---------- Profil (liegt nur auf diesem Gerät) ----------
var PROF=store.get("profil",{name:"",ort:"",bio:"",lieb:"",av:""});
function abz(){var sp={},rel=0,ku=0,ph=0;CATCH.forEach(function(c){sp[c.fish]=1;if(c.rel)rel++;if(c.kur)ku++;if(c.th)ph++});var n=CATCH.length,a=Object.keys(sp).length;
  return[["Erster Fang","Den ersten Fang eingetragen",n>=1],["10 Fänge","Zehn Fänge im Fangbuch",n>=10],["50 Fänge","Fünfzig Fänge im Fangbuch",n>=50],["3 Arten","Drei verschiedene Fischarten",a>=3],["10 Arten","Zehn verschiedene Fischarten",a>=10],["Schonend","Fünf Fische zurückgesetzt",rel>=5],["Kurios","Eine Kuriosität gefangen",ku>=1],["Fotograf","Zehn Fänge mit Foto",ph>=10],["Meterfisch","Ein Fisch ab 100 cm",CATCH.some(function(c){return c.len>=100})]]}
function avatar(big){return PROF.av?'<img class="av'+(big?" big":"")+'" src="'+PROF.av+'" alt="Profilbild">':'<span class="av none'+(big?" big":"")+'" aria-hidden="true">'+esc((PROF.name||"?").charAt(0).toUpperCase())+"</span>"}
function vProfil(){var h;
  if(S.pf){var f=S.pf;h=head("Profil bearbeiten","closepf")+'<div class="pcenter" id="pprev">'+(f.av?'<img class="av big" src="'+f.av+'" alt="Profilbild">':'<span class="av none big" aria-hidden="true">?</span>')+'</div><label class="btn water" for="pphoto">Profilbild auswählen</label><input class="vh" id="pphoto" type="file" accept="image/*" data-c="pphoto">';
    h+='<div class="field"><label class="label" for="p_n">Anglername</label><input id="p_n" data-p="name" maxlength="30" value="'+esc(f.name)+'" placeholder="So sehen dich später andere"></div>';
    h+='<div class="field"><label class="label" for="p_o">Heimatrevier</label><input id="p_o" data-p="ort" maxlength="40" value="'+esc(f.ort)+'" placeholder="z. B. Elbe, Prignitz"></div>';
    h+='<div class="field"><label class="label" for="p_l">Lieblingsfisch</label><select id="p_l" data-p="lieb"><option value="">Keiner</option>'+FISH.slice().sort(function(a,b){return a.n.localeCompare(b.n,"de")}).map(function(x){return opt(x.id,x.n,f.lieb)}).join("")+"</select></div>";
    h+='<div class="field"><label class="label" for="p_b">Über mich</label><textarea id="p_b" data-p="bio" rows="3" maxlength="200">'+esc(f.bio)+"</textarea></div>";
    return h+'<button class="btn primary" data-a="psave">Profil speichern</button>'}
  var sp={},big=null;CATCH.forEach(function(c){sp[c.fish]=1;if(c.len&&(!big||+c.len>+big.len))big=c});var a=abz(),got=a.filter(function(x){return x[2]}).length,lf=F[PROF.lieb];
  h=head("Mein Profil","mehr")+'<div class="pcenter">'+avatar(true)+"<h2>"+esc(PROF.name||"Noch ohne Namen")+"</h2>"+(PROF.ort?'<p class="muted">'+esc(PROF.ort)+"</p>":"")+(PROF.bio?"<p>"+esc(PROF.bio)+"</p>":"")+"</div>";
  h+='<div class="pstats"><span><b>'+CATCH.length+"</b>Fänge</span><span><b>"+Object.keys(sp).length+"</b>Arten</span><span><b>"+got+"</b>Abzeichen</span></div>";
  h+='<button class="btn" data-a="pedit">Profil bearbeiten</button>';
  if(lf)h+='<div class="list"><button class="item" data-a="fishview" data-v="'+lf.id+'">'+photo("f_"+lf.id)+'<span class="grow"><b>'+esc(lf.n)+'</b><span class="small muted">Lieblingsfisch</span></span><span class="chev" aria-hidden="true">›</span></button></div>';
  if(big)h+='<h2>Größter Fang</h2><div class="list">'+cItem(big)+"</div>";
  h+='<h2>Abzeichen</h2><div class="badges">'+a.map(function(x){return'<div class="badge'+(x[2]?" on":"")+'"><b>'+x[0]+'</b><span class="small">'+x[1]+"</span></div>"}).join("")+"</div>";
  var ph=cSorted(CATCH.filter(function(c){return c.th})).slice(0,9);
  if(ph.length)h+='<h2>Meine Fänge</h2><div class="pgrid">'+ph.map(function(c){return'<button data-a="catch" data-v="'+c.id+'" aria-label="'+esc(cTitle(c))+'"><img src="'+c.th+'" alt=""></button>'}).join("")+"</div>";
  return h+'<p class="small muted">Dein Profil liegt nur auf diesem Gerät, bis der Austausch mit Freunden angeschlossen ist.</p>'}
function vMehr(){return head("Mehr",null,"Profil, Gewässer, Schonzeiten und was noch kommt.")+'<div class="list"><button class="item" data-a="tab" data-v="profil">'+avatar()+'<span class="grow"><b>Mein Profil</b><span class="small muted">'+esc(PROF.name||"Name, Bild, Abzeichen")+'</span></span><span class="chev" aria-hidden="true">›</span></button><button class="item" data-a="tab" data-v="arten"><span class="grow"><b>Angelarten</b><span class="small muted">Fliegenfischen, Spinnfischen, Feedern und mehr</span></span><span class="chev" aria-hidden="true">›</span></button><button class="item" data-a="tab" data-v="geraet"><span class="grow"><b>Rute und Rolle</b><span class="small muted">Was passt zu welchem Fisch, Rutenarten, Rollenarten</span></span><span class="chev" aria-hidden="true">›</span></button><button class="item" data-a="tab" data-v="stellen"><span class="grow"><b>Angelstellen</b><span class="small muted">Schilf, Kante, Buhne und mehr, mit Erklärfilm</span></span><span class="chev" aria-hidden="true">›</span></button><button class="item" data-a="tab" data-v="gewaesser"><span class="grow"><b>Gewässer</b><span class="small muted">Verzeichnis und deine eigenen Gewässer</span></span><span class="chev" aria-hidden="true">›</span></button><button class="item" data-a="tab" data-v="regeln"><span class="grow"><b>Schonzeiten</b><span class="small muted">Schonzeiten und Mindestmaße aller Bundesländer</span></span><span class="chev" aria-hidden="true">›</span></button></div><div class="card sunk"><b>In Arbeit: Austausch mit Freunden</b><p class="small muted">Fänge zeigen, Chat, Fang des Monats mit Abstimmung. Dein Fangbuch wird dann angeschlossen.</p></div>'}

var TABS=[["finden","Finden"],["fische","Fische"],["koeder","Köder"],["rigs","Rigs"],["knoten","Knoten"],["faenge","Fänge"],["mehr","Mehr"]],ROUTES=["finden","fische","koeder","rigs","knoten","faenge","mehr","gewaesser","regeln","profil","stellen","arten","geraet"];
function tabOn(t){return S.tab===t||(t==="mehr"&&(S.tab==="gewaesser"||S.tab==="regeln"||S.tab==="profil"||S.tab==="stellen"||S.tab==="arten"||S.tab==="geraet"))}

function render(keepScroll){animStop();
  var v={finden:vFinden,fische:vFische,koeder:vKoeder,rigs:vRigs,knoten:vKnoten,gewaesser:vGew,regeln:vRegeln,faenge:vFang,mehr:vMehr,profil:vProfil,stellen:vStellen,arten:vArten,geraet:vGeraet}[S.tab]();
  document.getElementById("app").innerHTML=v;
  document.getElementById("tabs").innerHTML="<div>"+TABS.map(function(t){return'<button data-a="tab" data-v="'+t[0]+'" class="'+(tabOn(t[0])?"on":"")+'"'+(tabOn(t[0])?' aria-current="page"':"")+'><svg viewBox="0 0 24 24" aria-hidden="true">'+ICON[t[0]]+"</svg>"+t[1]+"</button>"}).join("")+"</div>";
  if(!keepScroll)window.scrollTo(0,0);
}
function go(tab){HIST=[];S.tab=tab;S.view=null;S.form=null;S.cf=null;S.pf=null;try{if(location.hash!=="#"+tab)location.hash=tab}catch(e){}render()}
function startWiz(fid,waterIdx){var w=S.wiz,wat=waterIdx!=null?allWaters()[waterIdx]:null;w.fish=fid;w.water=waterIdx;w.wt=wat?wat.typ:(w.wt&&F[fid].w.indexOf(w.wt)>=0?w.wt:F[fid].w[0]);
  w.sued=wat?SOUTH.indexOf(wat.land)>=0:false;w.temp=tempFor(w.sued?(w.month+6)%12:w.month);if(wat&&wat.bl){}w.step=2;S.more=false;S.tab="finden";S.view=null;try{location.hash="finden"}catch(e){}render()}

document.addEventListener("click",function(ev){
  var el=ev.target.closest("[data-a]");if(!el)return;var a=el.getAttribute("data-a"),v=el.getAttribute("data-v"),w=S.wiz;
  switch(a){
    case"tab":go(v);break;
    case"wt":w.wt=v;w.water=null;w.step=1;render();break;
    case"region":w.region=v;render(true);break;
    case"fish":w.fish=v;w.step=2;render();break;
    case"set":var k=el.getAttribute("data-k");w[k]=k==="month"||k==="temp"?+v:k==="sued"?v==="true":v;if(k==="month"||k==="sued")w.temp=tempFor(w.sued?(w.month+6)%12:w.month);render(true);break;
    case"result":w.step=3;S.more=false;render();break;
    case"more":S.more=true;render(true);break;
    case"wizback":if(w.step===2&&w.water!=null&&S.wizFrom==="water"){S.tab="gewaesser";S.view={t:"water",id:w.water};w.step=0;render();break}w.step=Math.max(0,w.step-1);render();break;
    case"wizstep":w.step=+v;render();break;
    case"wizreset":w.step=0;w.water=null;w.fish=null;S.wizFrom=null;render();break;
    case"fg":S.fg=v;render(true);break;
    case"kt":S.kt=v;render(true);break;
    case"fishview":pushHist();S.tab="fische";try{location.hash="fische"}catch(e){}S.view={t:"fish",id:v};render();break;
    case"bait":pushHist();S.tab="koeder";try{location.hash="koeder"}catch(e){}S.view={t:"bait",id:v};render();break;
    case"rig":pushHist();S.tab="rigs";S.view={t:"rig",id:v};try{location.hash="rigs"}catch(e){}render();break;
    case"knot":pushHist();S.tab="knoten";try{location.hash="knoten"}catch(e){}S.view={t:"knot",id:v};render();break;
    case"aplay":animPlay();break;
    case"avoice":AN.voice=!AN.voice;store.set("voice",AN.voice);if(!AN.voice&&SY)SY.cancel();el.classList.toggle("on",AN.voice);el.textContent="🔊 Stimme "+(AN.voice?"an":"aus");el.setAttribute("aria-pressed",AN.voice);if(AN.voice)say(AN.st[AN.i].c);break;
    case"aprev":animGo(-1);break;
    case"anext":animGo(1);break;
    case"rm":S.rm=v;render();break;
    case"rk":S.rk=v;render(true);break;
    case"closeview":if(!popHist()){S.view=null;render()}break;
    case"startfish":S.wizFrom=null;startWiz(v,null);break;
    case"water":S.view={t:"water",id:+v};render();break;
    case"waterfish":S.wizFrom="water";startWiz(v,S.view.id);break;
    case"showbl":S.bl=v;store.set("bl",v);go("regeln");break;
    case"newown":S.form={idx:null,n:"",typ:"see",ort:"",t:"",f:[]};render();break;
    case"editown":var o=S.own[+v];S.form={idx:+v,n:o.n,typ:o.typ,ort:o.ort||"",t:o.t||"",f:o.f.slice()};S.view=null;render();break;
    case"ffish":var i=S.form.f.indexOf(v);if(i>=0)S.form.f.splice(i,1);else S.form.f.push(v);el.classList.toggle("on");break;
    case"closeform":S.form=null;render();break;
    case"saveform":var fm=S.form;if(!fm.n.trim()){document.getElementById("formmsg").textContent="Bitte einen Namen eintragen.";break}
      var rec={n:fm.n.trim(),typ:fm.typ,ort:fm.ort.trim(),land:"Eigene",bl:null,t:fm.t.trim(),f:fm.f.slice()};
      if(fm.idx==null)S.own.unshift(rec);else S.own[fm.idx]=rec;store.set("own",S.own);S.form=null;S.gl="alle";render();break;
    case"mehr":go("mehr");break;
    case"gear":pushHist();S.tab="geraet";try{location.hash="geraet"}catch(e){}S.view={t:"gear",id:v};render();break;
    case"meth":pushHist();S.tab="arten";try{location.hash="arten"}catch(e){}S.view={t:"meth",id:v};render();break;
    case"spot":pushHist();S.tab="stellen";try{location.hash="stellen"}catch(e){}S.view={t:"spot",id:v};render();break;
    case"pedit":S.pf={name:PROF.name,ort:PROF.ort,bio:PROF.bio,lieb:PROF.lieb,av:PROF.av};render();break;
    case"closepf":S.pf=null;render();break;
    case"psave":PROF={name:S.pf.name.trim(),ort:S.pf.ort.trim(),bio:S.pf.bio.trim(),lieb:S.pf.lieb,av:S.pf.av};store.set("profil",PROF);S.pf=null;render();break;
    case"newcatch":HIST=[];S.tab="faenge";S.view=null;S.cf=newCf(v);try{location.hash="faenge"}catch(e){}render();break;
    case"catch":pushHist();S.tab="faenge";S.view={t:"catch",id:v};render();dbPhoto(v,function(ph){var im=document.getElementById("cfull");if(ph&&im&&S.view&&S.view.id===v)im.src=ph});break;
    case"fr":S.fr=v;render(true);break;
    case"closecf":var back=S.cf&&S.cf.id;S.cf=null;if(back)S.view={t:"catch",id:back};render();break;
    case"ctog":S.cf[v]=!S.cf[v];el.classList.toggle("on",S.cf[v]);el.setAttribute("aria-pressed",S.cf[v]);break;
    case"cspot":S.cf.spot=v;render(true);break;
    case"cedit":var ce=cById(v);if(!ce)break;S.cf={};for(var ck in ce)S.cf[ck]=ce[ck];S.cf.len=ce.len||"";S.cf.kg=ce.kg||"";S.cf.ph=CPH[v]||"";S.cf.newph=false;render();break;
    case"csave":var cf=S.cf,cm=document.getElementById("cfmsg");if(!cf.fish){cm.textContent="Bitte den Fisch auswählen.";break}if(!/^\d{4}-\d\d-\d\d$/.test(cf.d)){cm.textContent="Bitte ein Datum eintragen.";break}
      var cr={id:cf.id||(Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36)),d:cf.d,fish:cf.fish,len:parseFloat(String(cf.len).replace(",","."))||null,kg:parseFloat(String(cf.kg).replace(",","."))||null,bait:cf.bait,rig:cf.rig,water:String(cf.water).trim(),bl:cf.bl,note:String(cf.note).trim(),rel:!!cf.rel,kur:!!cf.kur,spot:cf.spot,th:cf.th||"",fom:!!cf.fom};
      var ci=-1;CATCH.forEach(function(x,i){if(x.id===cr.id)ci=i});if(ci>=0)CATCH[ci]=cr;else CATCH.push(cr);dbSave(cr,cf.newph?cf.ph:null);
      try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
      S.cf=null;S.fr="alle";S.view={t:"catch",id:cr.id};render();break;
    case"cdelask":S.cf.del=true;render(true);break;
    case"cdelno":S.cf.del=false;render(true);break;
    case"cdelyes":var di=S.cf.id;CATCH=CATCH.filter(function(x){return x.id!==di});dbDel(di);S.cf=null;S.view=null;HIST=[];render();break;
    case"cfom":var cx=cById(v);if(!cx)break;CATCH.forEach(function(x){if(x.fom&&ym(x)===ym(cx)){x.fom=false;dbSave(x)}});cx.fom=true;dbSave(cx);render(true);break;
    case"cshare":var cs=cById(v);if(cs)shareCatch(cs);break;
    case"delask":S.form.del=true;render(true);break;
    case"delno":S.form.del=false;render(true);break;
    case"delyes":S.own.splice(S.form.idx,1);store.set("own",S.own);S.form=null;render();break;
  }
});
document.addEventListener("input",function(ev){
  var t=ev.target,k=t.getAttribute("data-i");
  if(k){S.q[k]=t.value;var r=document.getElementById("res");if(r)r.innerHTML={fische:fishList,koeder:baitList,gew:waterList,regeln:ruleTable,rigs:rigList}[k]();return}
  var f=t.getAttribute("data-f");if(f&&S.form)S.form[f]=t.value;
  var pp=t.getAttribute("data-p");if(pp&&S.pf)S.pf[pp]=t.value;
  var g=t.getAttribute("data-g");if(g&&S.cf){S.cf[g]=t.value;var cw=document.getElementById("cwarn");if(cw)cw.innerHTML=warnBox(S.cf)}
});
document.addEventListener("change",function(ev){
  var c=ev.target.getAttribute("data-c");
  if(c==="bl"){S.bl=ev.target.value;store.set("bl",S.bl);render(true)}
  if(c==="gl"){S.gl=ev.target.value;render(true)}
  var pp=ev.target.getAttribute("data-p");if(pp&&S.pf)S.pf[pp]=ev.target.value;
  if(c==="pphoto"&&S.pf&&ev.target.files&&ev.target.files[0]){var rd=new FileReader();rd.onload=function(){var im=new Image();im.onload=function(){if(!S.pf)return;var k=Math.min(im.naturalWidth,im.naturalHeight),cv=document.createElement("canvas");cv.width=cv.height=240;cv.getContext("2d").drawImage(im,(im.naturalWidth-k)/2,(im.naturalHeight-k)/2,k,k,0,0,240,240);S.pf.av=cv.toDataURL("image/jpeg",.8);var pv=document.getElementById("pprev");if(pv)pv.innerHTML='<img class="av big" src="'+S.pf.av+'" alt="Profilbild">'};im.src=rd.result};rd.readAsDataURL(ev.target.files[0])}
  if(c==="cphoto"&&S.cf&&ev.target.files&&ev.target.files[0])readPhoto(ev.target.files[0]);
  var g=ev.target.getAttribute("data-g");if(g&&S.cf){S.cf[g]=ev.target.value;if(g==="fish"||g==="bait")render(true);else{var cw=document.getElementById("cwarn");if(cw)cw.innerHTML=warnBox(S.cf)}}
});
window.addEventListener("hashchange",function(){var t=location.hash.replace("#","");if(t&&t!==S.tab&&ROUTES.indexOf(t)>=0){S.tab=t;S.view=null;S.form=null;S.cf=null;render()}});
(function(){var t=location.hash.replace("#","");if(ROUTES.indexOf(t)>=0)S.tab=t;render();dbOpen(function(){dbLoad(function(){if(S.tab==="faenge"||S.tab==="profil")render(true)})})})();
})();
