import test from "node:test";
import assert from "node:assert/strict";
import {clipPlan,shouldAdvance} from "../lib/clip-plan.mjs";
test("cycles through five different film sources",()=>{assert.deepEqual(Array.from({length:6},(_,i)=>clipPlan(i,5,10,1000).index),[0,1,2,3,4,0]);});
test("all clip lengths are respected",()=>{for(const n of [5,10,15]){const p=clipPlan(3,5,n,1000);assert.equal(p.end-p.start,n);}});
test("short films cannot seek beyond duration",()=>{const p=clipPlan(99,5,15,8);assert.equal(p.start,0);assert.equal(p.end,8);});
test("later rounds change offsets",()=>assert.notEqual(clipPlan(0,5,10).start,clipPlan(5,5,10).start));
test("no advancing while paused or seeking",()=>{assert.equal(shouldAdvance(80,70,true,true),false);assert.equal(shouldAdvance(80,70,false,false),false);assert.equal(shouldAdvance(69,70,false,true),false);assert.equal(shouldAdvance(70,70,false,true),true);});
