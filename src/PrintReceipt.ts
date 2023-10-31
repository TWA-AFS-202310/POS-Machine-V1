/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-trailing-spaces */
/* eslint-disable eol-last */
/* eslint-disable no-var */
/* eslint-disable indent */
/* eslint-disable prefer-const */
import {loadAllItems, loadPromotions} from './Dependencies'

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

function calculateDiscount(quantity:number, unitPrice:number):number{
  const originalPrice:number = quantity * unitPrice
  const priceAfterDiscounted:number = (Math.floor(quantity / 3) * 2 + (quantity % 3)) * unitPrice
  return originalPrice - priceAfterDiscounted
}

function getDiscountedItems( receiptItems:ReceiptItem[]):ReceiptItem[]{
    const promotionList = getPromotionItems()
    for(var item of receiptItems){
      if(promotionList.indexOf(item.barcode) > -1){
        item.discountedPrice = calculateDiscount(item.quantity,item.unitPrice)
        item.subtotal = item.subtotal - item.discountedPrice
      }
    }
    return receiptItems
}

function generateItemDetails(receiptItems:ReceiptItem[]):string{
   let itemDetail:string = ''
   let totalDicount:number = 0
   let total = 0
  for(var item of receiptItems){
    const oneInfo:string = "Name：" + item.name + "，" + "Quantity：" + item.quantity + " " + item.unit + "s，Unit：" + (item.unitPrice).toFixed(2) + "(yuan)，Subtotal：" + (item.subtotal).toFixed(2) + "(yuan)\n"
    itemDetail += oneInfo
    totalDicount += item.discountedPrice
    total += item.subtotal
  }
  const header = "***<store earning no money>Receipt ***\n"
  const dividerDash = "----------------------\n"
  const dividerStar = "**********************"
  const totalInfo = "Total：" + (total).toFixed(2) + "(yuan)\n"
  const discountInfo = "Discounted prices：" + (totalDicount).toFixed(2) + "(yuan)\n"

  return header + itemDetail+ dividerDash + totalInfo + discountInfo + dividerStar
}


export function printReceipt(tags: string[]): string {
  const splittedTag = splitTags(tags)
  const countedTags = aggregateTags(splittedTag)
  const tagWithBarcode = mapBarcodeToItemName(countedTags)
  const itemsAfterDiscounted = getDiscountedItems(tagWithBarcode)
  return generateItemDetails(itemsAfterDiscounted)

}