"use client";
import {useEffect,useRef,useState,forwardRef,useImperativeHandle} from "react";
import {Button} from "@/components/ui/button";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {films,filmURL} from "@/lib/catalog.mjs";
import {clipPlan,shouldAdvance} from "@/lib/clip-plan.mjs";

type Player={playVideo():void;pauseVideo():void;seekTo(n:number,b:boolean):void;playVideoAt(n:number):void;nextVideo():void;setLoop(b:boolean):void;destroy():void};
type YT={Player:new(el:HTMLElement,o:Record<string,unknown>)=>Player};
type Deck={play(reset?:boolean):void;pause():void};
let api:Promise<YT>|undefined;
function youtube(){
 const w=window as unknown as {YT?:YT;onYouTubeIframeAPIReady?:()=>void};
 if(w.YT?.Player)return Promise.resolve(w.YT);
 if(!api)api=new Promise<YT>((resolve,reject)=>{
  let done=false;const s=document.createElement("script");
  const fail=()=>{if(done)return;done=true;api=undefined;s.remove();reject(Error("Music controls unavailable"));};
  const timer=setTimeout(fail,15000);
  w.onYouTubeIframeAPIReady=()=>{if(done)return;done=true;clearTimeout(timer);resolve(w.YT!);};
  s.src="https://www.youtube.com/iframe_api";s.onerror=fail;document.head.appendChild(s);
 });
 return api;
}
const MusicDeck=forwardRef<Deck,{albumIndex:number;onIssue:()=>void}>(function MusicDeck({albumIndex,onIssue},ref){
 const f=films[albumIndex],mount=useRef<HTMLDivElement>(null),player=useRef<Player|null>(null),issue=useRef(onIssue);
 issue.current=onIssue;
 const [revision,setRevision]=useState(0),[single,setSingle]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState("");
 useImperativeHandle(ref,()=>({
  play(reset=false){const p=player.current;if(!p){setError("Tap Play inside the music player; shared controls are still connecting.");return;}if(reset){if(f.list&&!single)p.playVideoAt(0);else {p.seekTo(0,true);p.playVideo();}}else p.playVideo();},
  pause(){if(player.current)player.current.pauseVideo();else setRevision(n=>n+1);}
 }),[single,f]);
 useEffect(()=>{
  let disposed=false;let p:Player|undefined;setReady(false);setError("");
  const box=mount.current!,iframe=document.createElement("iframe"),useList=!!f.list&&!single;
  const params=new URLSearchParams({enablejsapi:"1",origin:window.location.origin,playsinline:"1",loop:"1"});
  if(useList){params.set("listType","playlist");params.set("list",f.list!);}else params.set("playlist",f.fallback!);
  iframe.src="https://www.youtube.com/embed/"+(useList?"videoseries":f.fallback)+"?"+params;
  iframe.title=f.artist+" — "+f.album;iframe.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";iframe.allowFullscreen=true;iframe.referrerPolicy="strict-origin-when-cross-origin";box.appendChild(iframe);
  youtube().then(yt=>{if(disposed)return;p=new yt.Player(iframe,{events:{
   onReady:()=>{if(disposed)return;player.current=p!;p!.setLoop(true);setReady(true);},
   onError:(e:{data:number})=>{if(disposed)return;issue.current();setError("Music unavailable ("+e.data+"). Try next song, reload, or the clearly labeled opening-track fallback.");},
   onAutoplayBlocked:()=>{if(disposed)return;issue.current();setError("Tap Play inside YouTube to allow sound, then resume.");}
  }});}).catch(()=>{if(!disposed)setError("Shared controls unavailable. The visible YouTube player still has its own controls.");});
  return()=>{disposed=true;player.current=null;p?.destroy();box.replaceChildren();};
 },[revision,single,f]);
 return <aside className="deck"><p className="kicker">SOUNDTRACK / REPEAT</p><h2>{f.album}</h2><p className="artist">{f.artist}</p><div className="youtube" ref={mount}/>
 <div className="deck-tools"><Button variant="ghost" disabled={!ready||!f.list||single} onClick={()=>{player.current?.nextVideo();setError("");}}>Next song →</Button><Button variant="ghost" onClick={()=>{issue.current();setRevision(n=>n+1);}}>Reload music</Button></div>
 {!!f.list&&<Button variant="outline" className="fallback" onClick={()=>{issue.current();setSingle(x=>!x);}}>{single?"Restore full album":"Try opening track only"}</Button>}
 {single&&<p className="notice">Fallback: only the opening song repeats—not the full album.</p>}
 {error&&<p role="alert" className="notice">{error}</p>}
 <a className="source" href={f.list&&!single?"https://www.youtube.com/playlist?list="+f.list:"https://www.youtube.com/watch?v="+f.fallback} target="_blank" rel="noreferrer">Music source ↗</a>
 </aside>;
});
function Screening({selection}:{selection:number}){
 const blend=selection===4,albumIndex=blend?3:selection;
 const [length,setLength]=useState(10),[step,setStep]=useState(0),[run,setRun]=useState(false),[started,setStarted]=useState(false),[error,setError]=useState(""),[loading,setLoading]=useState(false),[remaining,setRemaining]=useState(10);
 const video=useRef<HTMLVideoElement>(null),deck=useRef<Deck|null>(null),wanted=useRef(false),boundary=useRef({end:0,locked:true}),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),alive=useRef(true);
 const filmIndex=blend?clipPlan(step,films.length,length).index:selection,f=films[filmIndex];
 function clearTimer(){if(timer.current)clearTimeout(timer.current);timer.current=undefined;}
 function pause(){wanted.current=false;setRun(false);video.current?.pause();deck.current?.pause();clearTimer();setLoading(false);}
 function timeout(){clearTimer();timer.current=setTimeout(()=>{if(!alive.current)return;pause();setError("The film is taking too long to load or seek. Retry it, skip this clip, or choose a full feature.");},20000);}
 function playVideo(){const el=video.current;if(!el||!wanted.current)return;el.muted=true;el.play().catch(()=>{if(alive.current&&video.current===el){pause();setError("Playback was blocked. Tap Start again to resume.");}});}
 function start(reset=false){
  setError("");wanted.current=true;setRun(true);setStarted(true);deck.current?.play(reset||!started);
  if(reset){if(blend){boundary.current.locked=true;setStep(0);const p=clipPlan(0,films.length,length,video.current?.duration);if(step===0&&video.current){boundary.current.end=p.end;video.current.currentTime=p.start;}}else if(video.current)video.current.currentTime=0;}
  if(!blend||!boundary.current.locked)playVideo();else if(video.current?.readyState&&video.current.readyState>=1)prepare(video.current);
  timeout();
 }
 function advance(){boundary.current.locked=true;video.current?.pause();setLoading(true);setError("");setStep(n=>n+1);}
 function prepare(el:HTMLVideoElement){
  if(el!==video.current)return;
  if(!blend){if(wanted.current)playVideo();return;}
  const p=clipPlan(step,films.length,length,el.duration);boundary.current={end:p.end,locked:true};setRemaining(p.end-p.start);
  if(Math.abs(el.currentTime-p.start)<.05){boundary.current.locked=false;if(wanted.current)playVideo();}
  else el.currentTime=p.start;
 }
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;wanted.current=false;clearTimer();};},[]);
 useEffect(()=>{boundary.current.locked=blend;setLoading(blend&&wanted.current);setRemaining(length);if(wanted.current)timeout();return clearTimer;},[step,length]);
 return <section className="screening">
 <div className="screen-column"><div className="screen-label"><span>{blend?"BLEND / CLIP "+String(step+1).padStart(2,"0"):"FULL FEATURE / 0"+(selection+1)}</span><span>{blend?length+" SECOND CUTS":"ORIGINAL AUDIO MUTED"}</span></div>
 <div className="screen"><video key={blend?step+"-"+length:selection} ref={video} src={filmURL(f)} poster={"https://archive.org/services/img/"+f.archive} muted playsInline controls={!blend} preload="metadata" aria-label={f.title}
 onLoadedMetadata={e=>prepare(e.currentTarget)}
 onSeeked={e=>{if(e.currentTarget!==video.current)return;boundary.current.locked=false;if(wanted.current)playVideo();}}
 onPlaying={()=>{clearTimer();setLoading(false);}}
 onWaiting={()=>{if(wanted.current){setLoading(true);timeout();}}}
 onVolumeChange={()=>{if(video.current)video.current.muted=true;}}
 onTimeUpdate={e=>{if(!blend||e.currentTarget!==video.current)return;const el=e.currentTarget;setRemaining(Math.max(0,boundary.current.end-el.currentTime));if(!boundary.current.locked&&shouldAdvance(el.currentTime,boundary.current.end,el.seeking,wanted.current)){advance();}}}
 onEnded={()=>{if(blend&&wanted.current)advance();else pause();}}
 onError={()=>{pause();setError("This movie source is unavailable. Retry, skip the clip, or choose another feature.");}}/>
 {loading&&<span className="loading" role="status">Loading next picture…</span>}
 </div>
 <div className="now"><div><p className="kicker">{f.year} / {blend?"IN THE MIX":"NOW SHOWING"}</p><h2>{f.title}</h2></div>{blend&&<span className="countdown">{Math.ceil(remaining)}<small>SEC</small></span>}</div>
 {blend&&<div className="blend-settings"><label htmlFor="clip-length">CUT LENGTH</label><Select value={String(length)} onValueChange={s=>{video.current?.pause();boundary.current.locked=true;setLength(Number(s));}}><SelectTrigger id="clip-length" className="length-select"><SelectValue/></SelectTrigger><SelectContent>{[5,10,15].map(n=><SelectItem key={n} value={String(n)}>{n} seconds</SelectItem>)}</SelectContent></Select><span>5 FILMS · CONTINUOUS SOUNDTRACK</span></div>}
 <div className="controls"><Button onClick={()=>run?pause():start()}>{run?"Ⅱ Pause":started?"▶ Resume":"▶ Start "+(blend?"blend":"pairing")}</Button><Button variant="outline" onClick={()=>start(true)}>↻ Re-sync</Button>{blend&&<Button variant="outline" onClick={advance}>Next clip →</Button>}</div>
 {error&&<div role="alert" className="notice">{error}<Button variant="outline" onClick={()=>{setError("");video.current?.load();}}>Retry film</Button></div>}
 <p className="screen-note">{blend?"The mix rotates through these films in short cuts. If an ad or delay shifts music against the pictures, Re-sync resets the blend and soundtrack together from their opening point.":f.note}</p>
 {!blend&&<p className="edition">{f.edition}</p>}
 <p className="edition">YouTube advertising remains in YouTube’s player; Re-sync recovers the pairing without bypassing ads.</p>
 <a className="source" href={"https://archive.org/details/"+f.archive} target="_blank" rel="noreferrer">Current film source ↗</a>
 </div>
 <MusicDeck ref={deck} albumIndex={albumIndex} onIssue={pause}/>
 </section>;
}
export default function Home(){
 const [selection,setSelection]=useState(0);
 return <main><header><a className="logo" href="./">FLIX<span>BLENDER</span><i>↗</i></a><span className="header-tag">SILENT PICTURES. NEW COLLISIONS.</span><span className="issue">PROGRAM 02</span></header>
 <div className="intro"><div><p className="kicker">THE SOUNDTRACK CINEMA / Infinity ®</p><h1>Watch the classics.<br/><em>Or cut them loose.</em></h1></div><p>Four full features. One five-film mix.<br/>No uploads. Just press play.</p></div>
 <nav className="program" aria-label="Choose full film or clip blender">{films.slice(0,4).map((f,i)=><Button key={f.title} variant="outline" className={selection===i?"feature selected":"feature"} aria-pressed={selection===i} onClick={()=>setSelection(i)}><span className="feature-number">0{i+1}</span><span><small>{f.year} / FULL FEATURE</small><strong>{f.title}</strong><small>{f.artist} · {f.album}</small></span></Button>)}<Button variant="outline" className={selection===4?"blend-card selected":"blend-card"} aria-pressed={selection===4} onClick={()=>setSelection(4)}><small>EXPERIMENTAL MODE</small><strong>THE BLENDER ↗</strong><span>5 films / 5 · 10 · 15 second cuts</span></Button></nav>
 <Screening key={selection} selection={selection}/>
 <footer><span>FLIX BLENDER / Infinity ®</span><p>Albums repeat. Music may require a separate tap. If ads or network delays shift timing, use Re-sync.<br/>Streamed clip playback, not an exported remix. Switching modes stops the previous players.</p></footer>
 </main>;
}
