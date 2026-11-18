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
 q:{fische:"",koeder:"",gew:"",regeln:""},fg:"alle",kt:"alle",gl:"alle",form:null,more:false};
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
    h+="</div>"+'<button class="btn water" data-a="tab" data-v="gewaesser">Oder ein Gewässer aus dem Verzeichnis wählen</button>'+blSelect();
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
  h+='<div class="card sunk"><div class="row"><span class="pill '+(a>=2?"ok":a===1?"warn":"stop")+'">'+ACTL[a]+" im "+MONL[w.month]+'</span><span class="pill '+(tzm?"ok":"warn")+'">'+(tzm?TZL[w.tz]+" passt":"Besser: "+tzText(fi))+"</span></div>"+months(fi,w.sued,w.month)+'<p class="small">'+esc(fi.tipp)+"</p></div>";
  if(!w.sued)h+=ruleBox(fi.id,S.bl);
  h+='<h2>Deine Köder</h2>';
  if(!rec.length)h+='<p class="card">Mit diesem Filter ist kein Köder hinterlegt. Stelle die Köderart auf „Alle“.</p>';
  var n=S.more?rec.length:Math.min(5,rec.length);
  for(var i=0;i<n;i++){var r=rec[i],b=r.b,tt=tempoTip(w,b);
    h+='<div class="card"><div class="row"><h3 class="grow">'+(i+1)+". "+esc(b.n)+'</h3><span class="pill '+(b.t==="K"?"k":"n")+'">'+(b.t==="K"?"Kunstköder":"Naturköder")+"</span>"+dots(r.e[1])+"</div>"+
      photo("b_"+b.id,b.n,true)+'<p><b>'+esc(r.e[2])+"</b></p>"+(r.why.length?'<p class="small muted">Heute passend: '+esc(r.why.join("; "))+".</p>":"")+
      '<dl class="kv"><dt>Größe</dt><dd>'+esc(b.groesse)+"</dd><dt>"+(b.t==="K"?"Farbe":"Anbieten")+"</dt><dd>"+esc(colorTip(w,b))+"</dd><dt>Führung</dt><dd>"+esc(b.fuehrung)+(tt?" "+esc(tt):"")+"</dd><dt>Montage</dt><dd>"+esc(b.montage)+"</dd></dl></div>"}
  if(rec.length>n)h+='<button class="btn" data-a="more">Weitere '+(rec.length-n)+" Köder zeigen</button>";
  h+='<div class="row"><button class="btn grow" data-a="wizstep" data-v="2">Bedingungen ändern</button><button class="btn grow" data-a="wizreset">Neu starten</button></div>';
  return h;
}

function search(key,ph){return '<div class="field"><input id="q_'+key+'" type="search" placeholder="'+ph+'" value="'+esc(S.q[key])+'" data-i="'+key+'" aria-label="'+ph+'"></div>'}
function match(q,str){return !q||str.toLowerCase().indexOf(q.toLowerCase())>=0}

function vFische(){
  if(S.view&&S.view.t==="fish"){var f=F[S.view.id],m=now.getMonth(),h=head(f.n,"closeview")+'<p class="lat">'+esc(f.lat)+" · "+esc(f.g)+"</p>"+photo("f_"+f.id,f.n,true);
    h+='<div class="card"><span class="label">Beißzeiten (Nordhalbkugel)</span>'+months(f,false,m)+'<dl class="kv"><dt>Tageszeit</dt><dd>'+esc(tzText(f))+"</dd><dt>Wasser</dt><dd>"+esc(f.temp)+" °C</dd><dt>Übliche Größe</dt><dd>"+esc(f.size)+"</dd><dt>Gewässer</dt><dd>"+esc(f.w.map(function(x){return WT[x]?WT[x].n:x}).join(", "))+"</dd></dl><p>"+esc(f.tipp)+"</p></div>";
    h+=ruleBox(f.id,S.bl)+'<button class="btn primary" data-a="startfish" data-v="'+f.id+'">Köder für heute finden</button><h2>Alle Köder für '+esc(f.n)+'</h2><div class="list">';
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
    h+='<div class="card"><p>'+esc(b.info)+'</p><dl class="kv"><dt>Größe</dt><dd>'+esc(b.groesse)+"</dd><dt>Führung</dt><dd>"+esc(b.fuehrung)+"</dd><dt>Montage</dt><dd>"+esc(b.montage)+"</dd><dt>Tiefe</dt><dd>"+({o:"Oberfläche / flach",m:"Mittelwasser",g:"Grund"}[b.tiefe])+"</dd></dl></div><h2>Fängt diese Fische</h2><div class=\"list\">";
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
    if(w.t)h+='<div class="card"><span class="label">Tipp</span><p>'+esc(w.t)+"</p></div>";
    h+='<h2>Fische hier</h2><p class="muted small">Fisch antippen, dann bekommst du die Köder für heute.</p><div class="list">';
    var m=now.getMonth(),sd=SOUTH.indexOf(w.land)>=0;
    w.f.map(function(id){return F[id]}).filter(Boolean).sort(function(a,b){return fishAct(b,m,sd)-fishAct(a,m,sd)}).forEach(function(f){var a=fishAct(f,m,sd);
      h+='<button class="item" data-a="waterfish" data-v="'+f.id+'"><span class="grow"><b>'+esc(f.n)+'</b><span class="small muted">'+ACTL[a]+" im "+MONL[m]+"</span></span>"+dots(a)+"</button>"});
    h+="</div>";
    if(w.bl&&REGS[w.bl])h+='<button class="btn" data-a="showbl" data-v="'+w.bl+'">Regeln für '+esc(REGS[w.bl].name)+" ansehen</button>";
    if(w.own!=null)h+='<button class="btn" data-a="editown" data-v="'+w.own+'">Bearbeiten</button>';
    return h}
  var lands=[];WATERS.forEach(function(w){if(lands.indexOf(w.land)<0)lands.push(w.land)});
  h=head("Gewässer",null,all.length+" Gewässer: Prignitz, Deutschland, Angelziele weltweit und deine eigenen.");
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
  var reg=REGS[S.bl],h=head("Schonzeiten",null,"Schonzeiten und Mindestmaße aller 16 Bundesländer, Küste und Binnen getrennt.")+blSelect();
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

var ICON={finden:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',fische:'<path d="M3 12c3-5 9-6 13-2l5-3v10l-5-3c-4 4-10 3-13-2z"/><circle cx="8" cy="11" r=".6"/>',koeder:'<path d="M12 2v9a4 4 0 1 1-4 4"/><path d="M10 4h4"/>',gewaesser:'<path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',regeln:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h3"/>'};
var TABS=[["finden","Finden"],["fische","Fische"],["koeder","Köder"],["gewaesser","Gewässer"],["regeln","Regeln"]];
function render(keepScroll){
  var v={finden:vFinden,fische:vFische,koeder:vKoeder,gewaesser:vGew,regeln:vRegeln}[S.tab]();
  document.getElementById("app").innerHTML=v;
  document.getElementById("tabs").innerHTML="<div>"+TABS.map(function(t){return'<button data-a="tab" data-v="'+t[0]+'" class="'+(S.tab===t[0]?"on":"")+'"'+(S.tab===t[0]?' aria-current="page"':"")+'><svg viewBox="0 0 24 24" aria-hidden="true">'+ICON[t[0]]+"</svg>"+t[1]+"</button>"}).join("")+"</div>";
  if(!keepScroll)window.scrollTo(0,0);
}
function go(tab){S.tab=tab;S.view=null;S.form=null;try{if(location.hash!=="#"+tab)location.hash=tab}catch(e){}render()}
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
    case"fishview":S.tab="fische";S.view={t:"fish",id:v};render();break;
    case"bait":S.tab="koeder";S.view={t:"bait",id:v};render();break;
    case"closeview":S.view=null;render();break;
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
    case"delask":S.form.del=true;render(true);break;
    case"delno":S.form.del=false;render(true);break;
    case"delyes":S.own.splice(S.form.idx,1);store.set("own",S.own);S.form=null;render();break;
  }
});
document.addEventListener("input",function(ev){
  var t=ev.target,k=t.getAttribute("data-i");
  if(k){S.q[k]=t.value;var r=document.getElementById("res");if(r)r.innerHTML={fische:fishList,koeder:baitList,gew:waterList,regeln:ruleTable}[k]();return}
  var f=t.getAttribute("data-f");if(f&&S.form)S.form[f]=t.value;
});
document.addEventListener("change",function(ev){
  var c=ev.target.getAttribute("data-c");
  if(c==="bl"){S.bl=ev.target.value;store.set("bl",S.bl);render(true)}
  if(c==="gl"){S.gl=ev.target.value;render(true)}
});
window.addEventListener("hashchange",function(){var t=location.hash.replace("#","");if(t&&t!==S.tab&&TABS.some(function(x){return x[0]===t})){S.tab=t;S.view=null;S.form=null;render()}});
(function(){var t=location.hash.replace("#","");if(TABS.some(function(x){return x[0]===t}))S.tab=t;render()})();
})();
