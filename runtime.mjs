import {films,tracks,filmURL} from "./lib/catalog.mjs";
import {clipPlan,shouldAdvance} from "./lib/clip-plan.mjs";

const CUT=15;
const $=selector=>document.querySelector(selector);
const app=document.getElementById("app");

const extraCss=`
.mode-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 22px 18px}.mode-row button{min-height:48px;border:1px solid #6c8876;background:transparent;color:#eaf0e4;font-weight:800;letter-spacing:.4px}.mode-row button.active{background:#d7fc75;color:#18342a;border-color:#d7fc75}.round-chip{display:inline-block;background:#d7fc75;color:#18342a;padding:6px 9px;font:800 9px Arial;letter-spacing:1px;margin-top:8px}.track-player{padding:16px;background:#cfd8c4;border:1px solid #96a68f}.track-player audio{display:block;width:100%;margin:14px 0 8px}.track-number{font:800 10px Arial;letter-spacing:1.4px}.track-title{font:28px/1.1 Georgia;margin:9px 0 6px}.track-artist{font:800 11px Arial;letter-spacing:1.1px;text-transform:uppercase}.pool{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:18px 0 0}.pool-card{border:1px solid #a6b0a5;padding:9px 10px;min-height:70px;background:#f0eee6;color:#193328}.pool-card.live{background:#193328;color:#eef4e7}.pool-card b{display:block;font:15px/1.15 Georgia}.pool-card span{display:block;font-size:9px;margin-top:5px;opacity:.75}.legal-note{font-size:11px;line-height:1.55;color:#5d6b5c;margin:16px 0 0}.deck .controls{padding:0;margin-top:10px}.deck .controls button{color:#193328;border-color:#86927a;background:transparent}.deck .controls button:first-child{background:#193328;color:#eef4e7}.screen-note strong{color:#d7fc75}.source-audio .countdown{color:#f6b66d}.mode-explain{min-height:62px}.film-credit{font-size:10px;color:#b3c5b4;margin:0 22px 14px}.pool-heading{margin:20px 0 0;font:800 10px Arial;letter-spacing:1.4px}.player-status{min-height:1em}.screen video[controls]{max-height:560px}@media(max-width:760px){.pool{grid-template-columns:repeat(2,minmax(0,1fr))}.mode-row{margin-left:0;margin-right:0}.track-title{font-size:24px}}
`;

app.innerHTML=`<main>
<style>${extraCss}</style>
<header><a class="logo" href="./">FLIX<span>BLENDER</span><i>↗</i></a><span class="header-tag">TEN FILMS · TEN TRACKS · 15 SECOND CUTS</span><span class="issue">PROGRAM 03</span></header>
<div class="intro"><div><p class="kicker">THE SOUNDTRACK CINEMA / Infinity ®</p><h1>Ten pictures.<br><em>One moving experiment.</em></h1></div><p>Round one shows every film in order.<br>Later rounds remix the order and seek points.</p></div>
<section class="screening" id="screening">
 <div class="screen-column">
  <div class="screen-label"><span id="clip-label">BLEND / CLIP 01</span><span id="audio-label">15 SECOND CUT · FILM MUTED</span></div>
  <div class="screen"><video id="film" playsinline preload="metadata"></video><span class="loading" id="loading" role="status" hidden>Loading next picture…</span></div>
  <div class="now"><div><p class="kicker" id="film-meta"></p><h2 id="film-title"></h2><span class="round-chip" id="round-chip"></span></div><span class="countdown"><span id="remaining">15</span><small>SEC</small></span></div>
  <div class="mode-row" aria-label="Choose audio view"><button id="music-mode" class="active">MUSIC VIEW · silent film + soundtrack</button><button id="source-mode">SOURCE VIEW · film sound only</button></div>
  <div class="controls"><button id="start">▶ Start Blender</button><button id="restart">↻ Restart experiment</button><button id="next">Next 15-sec clip →</button></div>
  <div role="alert" class="notice player-status" id="error" hidden></div>
  <p class="screen-note mode-explain" id="mode-explain"></p>
  <p class="film-credit" id="film-note"></p>
  <a class="source" id="film-source" target="_blank" rel="noreferrer">Current film on Internet Archive ↗</a>
 </div>
 <aside class="deck">
  <p class="kicker">ARCHIVE SOUNDTRACK / 10 TRACK ROTATION</p>
  <div class="track-player"><div class="track-number" id="track-number"></div><h2 class="track-title" id="track-title"></h2><p class="track-artist" id="track-artist"></p><audio id="music" controls preload="metadata"></audio></div>
  <div class="controls"><button id="play-music">▶ Play music</button><button id="next-track">Next track →</button></div>
  <p class="notice" id="soundtrack-status"></p>
  <a class="source" id="music-source" target="_blank" rel="noreferrer">Current music source on Internet Archive ↗</a>
 </aside>
</section>
<p class="pool-heading">TEN-FILM SOURCE POOL</p><section class="pool" id="pool" aria-label="Ten film source pool"></section>
<p class="legal-note">Source rule for this build: only public-domain or clearly licensed/open material is put in the default remix pool. A 15-second duration is an editing rule for the experiment, not a blanket copyright exemption.</p>
<footer><span>FLIX BLENDER / Infinity ®</span><p>Direct-streamed from Internet Archive. No movie or song is copied into this repository.<br>If a source becomes unavailable, the player reports it and advances rather than faking playback.</p></footer>
</main>`;

const video=$("#film"),audio=$("#music"),loading=$("#loading"),errorBox=$("#error"),startButton=$("#start");
let step=0,trackIndex=0,mode="soundtrack",running=false,started=false;
let boundary={end:0,locked:true};
let seekTimer;

function plan(duration){return clipPlan(step,films.length,CUT,duration);}
function currentFilm(){return films[plan().index];}
function currentTrack(){return tracks[trackIndex];}
function clearSeekTimer(){if(seekTimer)clearTimeout(seekTimer);seekTimer=undefined;}
function armSeekTimer(){clearSeekTimer();seekTimer=setTimeout(()=>{setError("That Archive source took too long to seek. Skipping to the next 15-second cut.");if(running)advance();},22000);}
function setError(message=""){errorBox.textContent=message;errorBox.hidden=!message;}
function setLoading(value){loading.hidden=!value;}
function updatePool(activeIndex){
 $("#pool").innerHTML=films.map((f,i)=>`<div class="pool-card ${i===activeIndex?"live":""}"><b>${String(i+1).padStart(2,"0")} · ${f.title}</b><span>${f.year} · ${f.license}</span></div>`).join("");
}
function updateFilmText(){
 const p=plan(),f=films[p.index];
 $("#clip-label").textContent=`BLEND / CLIP ${String(step+1).padStart(2,"0")}`;
 $("#film-meta").textContent=`${f.year} / ${f.license}`;
 $("#film-title").textContent=f.title;
 $("#round-chip").textContent=`ROUND ${p.round+1} · ${p.ordered?"ORDERED INTRO":"REMIXED ORDER"}`;
 $("#film-note").textContent=`${f.note} Credit: ${f.credit}.`;
 $("#film-source").href=f.source;
 $("#remaining").textContent=String(CUT);
 updatePool(p.index);
}
function updateTrack(){
 const t=currentTrack();
 $("#track-number").textContent=`TRACK ${String(trackIndex+1).padStart(2,"0")} / 10 · ${t.year}`;
 $("#track-title").textContent=t.title;
 $("#track-artist").textContent=t.artist;
 $("#music-source").href=t.source;
 audio.src=t.url;audio.load();
 if(mode==="soundtrack"&&running)audio.play().catch(()=>setError("Tap Start or Play Music once to allow soundtrack playback on this device."));
}
function updateMode(){
 const music=mode==="soundtrack";
 $("#music-mode").classList.toggle("active",music);$("#source-mode").classList.toggle("active",!music);
 $("#screening").classList.toggle("source-audio",!music);
 $("#audio-label").textContent=`${CUT} SECOND CUT · ${music?"FILM MUTED":"SOURCE AUDIO"}`;
 $("#mode-explain").innerHTML=music?"<strong>MUSIC VIEW:</strong> the movie stays silent while the independent Archive soundtrack keeps moving across clip changes.":"<strong>SOURCE VIEW:</strong> the soundtrack deck is paused and the selected film's own audio is enabled for each 15-second cut.";
 $("#soundtrack-status").textContent=music?"Soundtrack mode is active. Music does not restart when the picture cuts.":"Source-audio mode is active. The soundtrack is paused.";
 $("#play-music").disabled=!music;
 video.muted=music;video.controls=!music;
 if(!music)audio.pause();else if(running)audio.play().catch(()=>{});
}
function loadClip(){
 clearSeekTimer();setError("");setLoading(running);boundary={end:0,locked:true};updateFilmText();
 const f=currentFilm();video.pause();video.src=filmURL(f);video.poster=f.source.replace("/details/","/services/img/");video.muted=mode==="soundtrack";video.controls=mode==="source";video.load();
 if(running)armSeekTimer();
}
function prepare(){
 const p=plan(video.duration);boundary={end:p.end,locked:true};$("#remaining").textContent=String(Math.max(0,Math.ceil(p.end-p.start)));
 if(Math.abs(video.currentTime-p.start)<.08){boundary.locked=false;if(running)playVideo();}else video.currentTime=p.start;
}
function playVideo(){
 video.muted=mode==="soundtrack";video.volume=1;
 if(!running)return;
 video.play().catch(()=>{running=false;startButton.textContent="▶ Resume";setError("Playback was blocked. Tap Start Blender again.");});
}
function playSoundtrack(){if(mode==="soundtrack"&&running)audio.play().catch(()=>setError("Tap Play Music once to allow soundtrack playback on this device."));else audio.pause();}
function start(reset=false){
 setError("");running=true;started=true;startButton.textContent="Ⅱ Pause";
 if(reset){step=0;trackIndex=0;updateTrack();audio.currentTime=0;loadClip();return;}
 if(video.readyState>=1)prepare();else loadClip();
 playSoundtrack();armSeekTimer();
}
function pause(){running=false;video.pause();audio.pause();clearSeekTimer();setLoading(false);startButton.textContent=started?"▶ Resume":"▶ Start Blender";}
function advance(){step+=1;loadClip();}
function nextTrack(){trackIndex=(trackIndex+1)%tracks.length;updateTrack();}
function switchMode(next){mode=next;setError("");updateMode();if(running){playVideo();playSoundtrack();}}

video.addEventListener("loadedmetadata",prepare);
video.addEventListener("seeked",()=>{boundary.locked=false;if(running){playVideo();playSoundtrack();}});
video.addEventListener("playing",()=>{clearSeekTimer();setLoading(false);});
video.addEventListener("waiting",()=>{if(running){setLoading(true);armSeekTimer();}});
video.addEventListener("timeupdate",()=>{const left=Math.max(0,boundary.end-video.currentTime);$("#remaining").textContent=String(Math.ceil(left));if(!boundary.locked&&shouldAdvance(video.currentTime,boundary.end,video.seeking,running))advance();});
video.addEventListener("ended",()=>{if(running)advance();});
video.addEventListener("error",()=>{setError("This Archive movie source failed. Moving to the next film.");if(running)setTimeout(advance,350);});
audio.addEventListener("ended",nextTrack);
audio.addEventListener("error",()=>{setError("That Archive music file failed; advancing to the next track.");setTimeout(nextTrack,250);});

startButton.addEventListener("click",()=>running?pause():start(false));
$("#restart").addEventListener("click",()=>start(true));
$("#next").addEventListener("click",advance);
$("#music-mode").addEventListener("click",()=>switchMode("soundtrack"));
$("#source-mode").addEventListener("click",()=>switchMode("source"));
$("#next-track").addEventListener("click",nextTrack);
$("#play-music").addEventListener("click",()=>{if(mode!=="soundtrack")return;audio.play().catch(()=>setError("Sound playback is blocked until the browser receives a tap."));});
window.addEventListener("beforeunload",()=>clearSeekTimer());

updateTrack();updateMode();loadClip();
