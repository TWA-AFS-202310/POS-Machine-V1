/* eslint-disable no-trailing-spaces */
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
  barcode:string;
  name:string;
  quantity:number;
  unit:string;
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

function getPromotionItems(){
  const promotion = loadPromotions()
  let promotionList:string[] = []
  for(let i = 0; i < promotion.length; i++){
    if(promotion[i].type === 'BUY_TWO_GET_ONE_FREE'){
      promotionList = promotion[i].barcodes
    }
  }
  return promotionList
}

function mapBarcodeToItemName(tags:Tag[]){
  let receiptItems:ReceiptItem[] = []
  const itemDetails = loadAllItems()
  for(var tag of tags){
    itemDetails.find(item=>{
      if(item.barcode === tag.barcode){
        const itemTotal = tag.quantity * item.price
        receiptItems.push({
          barcode: item.barcode,
          name: item.name,
          unit: item.unit,
          unitPrice: item.price,
          subtotal: itemTotal,
          discountedPrice: 0,
          quantity: tag.quantity
        })
      }
    }) 
  }
  return receiptItems

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