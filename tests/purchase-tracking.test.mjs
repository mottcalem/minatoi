import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackPaidOrder } from '../src/lib/purchase-tracking.ts';
test('confirmed payment sends actual discounted value once to each platform', () => {
 const storage = new Map(); const meta=[];
 globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
 globalThis.window={dataLayer:[],fbq:(...args)=>meta.push(args)};
 const order={id:'MT'+'a'.repeat(32),status:'paid',amount:610,items:[{slug:'one',name:'Cam Tablo',size:'S',quantity:1,unitAmount:61000,discount:60390}]};
 trackPaidOrder({...order,status:'pending'}); trackPaidOrder({...order,status:'failed'}); trackPaidOrder({...order,test_mode:true});
 assert.equal(window.dataLayer.length,0); assert.equal(meta.length,0);
 trackPaidOrder(order); trackPaidOrder(order);
 const ga=Array.from(window.dataLayer[0]);
 assert.equal(window.dataLayer.length,1); assert.equal(meta.length,1);
 assert.equal(ga[1],'purchase'); assert.equal(ga[2].value,6.1); assert.equal(ga[2].currency,'TRY');
 assert.equal(ga[2].transaction_id,order.id); assert.equal(ga[2].items[0].price,6.1);
 assert.equal(meta[0][1],'Purchase'); assert.equal(meta[0][2].value,6.1); assert.equal(meta[0][3].eventID,'purchase_'+order.id);
 assert.equal(storage.size,2);
});
test('stored receipt suppresses a repeat across a fresh module load',async()=>{
 const {trackPaidOrder: fresh}=await import('../src/lib/purchase-tracking.ts?fresh');
 fresh({id:'MT'+'a'.repeat(32),status:'paid',amount:610});
 assert.equal(window.dataLayer.length,1); assert.equal(window.fbq instanceof Function,true);
});
test('invalid amounts and identifiers never emit purchases',()=>{
 for(const amount of [0,-1,NaN,Infinity,1.5]) trackPaidOrder({id:'MT'+'b'.repeat(32),status:'paid',amount});
 trackPaidOrder({id:'invalid',status:'paid',amount:610});
 assert.equal(window.dataLayer.length,1);
});
