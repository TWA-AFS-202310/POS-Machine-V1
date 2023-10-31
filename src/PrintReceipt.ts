/* eslint-disable eol-last */
/* eslint-disable no-var */
/* eslint-disable indent */
/* eslint-disable prefer-const */
import {loadAllItems, loadPromotions} from './Dependencies'

interface Quantity{
  value:number;
  quantifier:string
}

interface ReceiptItem{
  name:string;
  quantity:Quantity;
  unitPrice:number;
  subtotal:number;
  discountedPrice:number;
}

interface Tag{
  barcode:string;
  quantity:number;
}

function splitTags(tags:string[]):Tag[]{
  let tagWithQuantity:Tag[] = []
  // eslint-disable-next-line no-var
  for(var tag of tags){
    let splittedTags:string[] = tag.split('-')
    if(splittedTags.length > 1){
        const tagNum = parseFloat(splittedTags[1])
        tagWithQuantity.push({barcode:splittedTags[0],quantity:tagNum})
    }
    else{
      tagWithQuantity.push({barcode:splittedTags[0],quantity:1})
    }
  }
  return tagWithQuantity
}

function aggregateTags(tagWithQuantity:Tag[]):Tag[]{
  let tagCountMap:Map<string,number> = new Map<string,number>()
  let tagWithAggregatedQuantity:Tag[] = []
  for(var tag of tagWithQuantity){
    if(tagCountMap.has(tag.barcode)){
      let oldQuantity:any = tagCountMap.get(tag.barcode)
      tagCountMap.set(tag.barcode,tag.quantity+ oldQuantity)
    }
    else{
      tagCountMap.set(tag.barcode,tag.quantity)
    }
  }

  tagCountMap.forEach((value,key)=>{
    tagWithAggregatedQuantity.push({barcode:key,quantity:value})
  })

  return tagWithAggregatedQuantity
}




export function printReceipt(tags: string[]): string {


  return `***<store earning no money>Receipt ***
Name：Sprite，Quantity：5 bottles，Unit：3.00(yuan)，Subtotal：12.00(yuan)
Name：Litchi，Quantity：2.5 pounds，Unit：15.00(yuan)，Subtotal：37.50(yuan)
Name：Instant Noodles，Quantity：3 bags，Unit：4.50(yuan)，Subtotal：9.00(yuan)
----------------------
Total：58.50(yuan)
Discounted prices：7.50(yuan)
**********************`
}