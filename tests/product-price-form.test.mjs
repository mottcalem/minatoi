import test from 'node:test';
import assert from 'node:assert/strict';
import { syncProductPriceFields } from '../src/data/productPriceForm.ts';
import { validateProducts } from '../server/utils/productRepository.ts';
import { CUSTOM_PRODUCTS } from '../src/data/customProducts.ts';
const form = {price:'610',oldPrice:'920',sizePrices:'25*35 cm | 610 | 920\n35*50 cm | 990 | 1250'};
test('editing base price updates first size and preserves larger size prices',()=>{
 const next=syncProductPriceFields(form,'price','750');
 assert.equal(next.sizePrices,'25*35 cm | 750 | 920\n35*50 cm | 990 | 1250');
 assert.equal(form.price,'610');
});
test('old price can be changed or removed without stale size pricing',()=>{
 const changed=syncProductPriceFields(form,'oldPrice','1000');
 assert.equal(changed.sizePrices.split('\n')[0],'25*35 cm | 610 | 1000');
 const cleared=syncProductPriceFields(changed,'oldPrice','');
 assert.equal(cleared.sizePrices.split('\n')[0],'25*35 cm | 610 | ');
});
test('first size price edits synchronize base price and optional old price',()=>{
 const next=syncProductPriceFields(form,'sizePrices','25*35 cm | 800\n35*50 cm | 1100 | 1400');
 assert.equal(next.price,'800');assert.equal(next.oldPrice,'');
 const { customization, ...product }=CUSTOM_PRODUCTS[0];
 assert.doesNotThrow(()=>validateProducts([{...product,price:800,oldPrice:undefined,sizes:['25*35 cm','35*50 cm'],sizePrices:[{size:'25*35 cm',price:800},{size:'35*50 cm',price:1100,oldPrice:1400}]}]));
});
test('products without size prices keep base pricing independent',()=>{
 assert.deepEqual(syncProductPriceFields({...form,sizePrices:''},'price','900'),{...form,sizePrices:'',price:'900'});
});
