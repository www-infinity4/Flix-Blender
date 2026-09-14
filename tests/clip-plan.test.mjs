import test from "node:test";
import assert from "node:assert/strict";
import {clipOrder,clipPlan,shouldAdvance} from "../lib/clip-plan.mjs";

test("first ten clips visit all ten films in catalog order",()=>{
  assert.deepEqual(Array.from({length:10},(_,i)=>clipPlan(i,10,15,5000).index),[0,1,2,3,4,5,6,7,8,9]);
});

test("later rounds reshuffle without repeats inside a round",()=>{
  const first=clipOrder(10,0), second=clipOrder(10,1), third=clipOrder(10,2);
  assert.notDeepEqual(second,first);
  assert.notDeepEqual(third,second);
  assert.deepEqual([...second].sort((a,b)=>a-b),first);
  assert.deepEqual([...third].sort((a,b)=>a-b),first);
});

test("15-second cuts are exact when the source is long enough",()=>{
  for(let step=0;step<30;step++){
    const p=clipPlan(step,10,15,5000);
    assert.equal(p.end-p.start,15);
  }
});

test("short films cannot seek beyond duration",()=>{
  const p=clipPlan(99,10,15,8);
  assert.equal(p.start,0);
  assert.equal(p.end,8);
});

test("later rounds change offsets",()=>assert.notEqual(clipPlan(0,10,15).start,clipPlan(10,10,15).start));

test("no advancing while paused or seeking",()=>{
  assert.equal(shouldAdvance(80,70,true,true),false);
  assert.equal(shouldAdvance(80,70,false,false),false);
  assert.equal(shouldAdvance(69,70,false,true),false);
  assert.equal(shouldAdvance(70,70,false,true),true);
});
