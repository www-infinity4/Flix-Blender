export function clipPlan(step, count, length, duration) {
 if(!Number.isInteger(count)||count<1)throw new Error("No films");
 if(![5,10,15].includes(length))throw new Error("Invalid clip length");
 const index=((step%count)+count)%count;
 const requested=60+(Math.floor(step/count)%12)*137+index*31;
 const known=Number.isFinite(duration)&&duration>0;
 const start=known?Math.max(0,Math.min(requested,duration-length-.5)):requested;
 return {index,start,end:known?Math.min(start+length,duration):start+length};
}
export function shouldAdvance(time,end,seeking,playing){
 return playing&&!seeking&&Number.isFinite(time)&&time>=end;
}
