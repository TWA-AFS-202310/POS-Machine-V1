/* eslint-disable no-trailing-spaces */
/* eslint-disable no-var */
/* eslint-disable indent */
/* eslint-disable prefer-const */
import {loadAllItems, loadPromotions} from './Dependencies'

interface ReceiptPrintingInfo {
  name: string;
  quantity: string;
  unitPrice: string;
  subTotal: string;
  unit: string
  discountedPrice: string
}

interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string
  unitPrice: number;
  subtotal: number;
  discountedPrice: number;
  ifPromoted: boolean;
  barcode: string;
}

interface Tag {
  barcode: string;
  quantity: number;
}

export function printReceipt(tags: string[]): string {
    let parsedTags = parseTags(tags)
    let productsInfos = getProductsInfo(parsedTags)
    checkIfPromoted(productsInfos)
    calculatePrice(productsInfos)
    let printingInfos = getReceiptPritingInfo(productsInfos)
    return constructReceipt(printingInfos)
}

function parseTags(tags: string[]): Tag[] {
  let map = new Map<string, number>()
  let parsedTags: Tag[] = []

  for (let tag of tags) {
    let splitedTag = tag.split('-')
    let barcode = splitedTag[0]
    let quantity = 1
    if (splitedTag.length > 1) {
      quantity = Number(splitedTag[1])
      console.log(quantity)
    }
    

    if (!checkIfBarcodeExist(barcode)) {
      throw new Error("Barcode does not exist")
    }
    
    if (map.has(barcode)) {
      var oldQuantity:any = map.get(barcode)
      var newQuantity = oldQuantity + quantity
      map.set(barcode, Number(newQuantity))
    }
    else {
      map.set(barcode, quantity)
    }
   }

   map.forEach((value, key) => {
     //console.log(key+ "  " + value)
     let tag = {barcode: key, quantity: value}
     parsedTags.push(tag)
  })

   return parsedTags
}

function checkIfBarcodeExist(barcode: string) {
  let productsList = loadAllItems()
  let ifExist = false
  productsList.find(item => {
    if (item.barcode === barcode) {
      ifExist = true
    }
  })

  return ifExist
}

function getProductsInfo(parsedTags: Tag[]): ReceiptItem[] {
  var productsList = loadAllItems()
  var receiptItems: ReceiptItem[] = []
  // console.log(parsedTags[0].barcode + "  " + parsedTags[0].quantity)
  // console.log(parsedTags[1].barcode + "  " + parsedTags[1].quantity)
  // console.log(parsedTags[2].barcode + "  " + parsedTags[2].quantity)
  for(var tag of parsedTags) {
    productsList.find(item => {
      if(item.barcode === tag.barcode)
        receiptItems.push({
          name: item.name,
          unitPrice: item.price,
          unit: item.unit,
          quantity: tag.quantity,
          subtotal: 0,
          discountedPrice: 0,
          ifPromoted: false,
          barcode: tag.barcode
        })
      })
    }

    return receiptItems
}

function checkIfPromoted(receiptItems: ReceiptItem[]) {
  var promotionList = loadPromotions()
  for (var item of receiptItems) {
    promotionList.find(promotionItem => {
      promotionItem.barcodes.find(barcode => {
        if (barcode === item.barcode) {
          item.ifPromoted = true
        }
      })
    })
  }
}

function calculatePrice(receiptItems: ReceiptItem[]) {
    for (var item of receiptItems) {
      if (item.ifPromoted) {
        var discountedPartPrice = Math.floor(item.quantity / 3)* 2 * item.unitPrice
        var normalPartPrice = item.quantity % 3 * item.unitPrice
        item.discountedPrice = discountedPartPrice + normalPartPrice
        item.subtotal = item.quantity * item.unitPrice
        //console.log(item.name + "  " + item.quantity + "  " + item.unitPrice)
      }
      else {
        item.discountedPrice = item.quantity * item.unitPrice
      }
    }
}

function getReceiptPritingInfo(receiptItems: ReceiptItem[]):ReceiptPrintingInfo[] {
  var receiptPrintingInfo: ReceiptPrintingInfo [] = []
  for (var item of receiptItems) {
    receiptPrintingInfo.push({
      name: item.name,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      subTotal: item.discountedPrice.toString(),
      unit: item.unit,
      discountedPrice: (item.unitPrice * item.quantity - item.discountedPrice).toString()
    })
  }

  return receiptPrintingInfo
}

function constructReceipt(receiptPrintingInfo: ReceiptPrintingInfo[]):string {
   var output = ""
   var totalPrice = 0
   var discountedTotalPrice = 0
   output += "***<store earning no money>Receipt ***" + '\n'
   for (var printingItem of receiptPrintingInfo) {
    totalPrice += Number(printingItem.subTotal)
    discountedTotalPrice += Number(printingItem.discountedPrice)
    output  += "Name：" + printingItem.name + "，" +
             "Quantity：" + printingItem.quantity + " " + printingItem.unit + "s，" +
             "Unit：" + Number(printingItem.unitPrice).toFixed(2) + "(yuan)" + "，" +
             "Subtotal：" + Number(printingItem.subTotal).toFixed(2) + "(yuan)" + '\n'
   }

   output += "----------------------" + '\n'
   output += "Total：" + Number(totalPrice).toFixed(2) + "(yuan)" + '\n'
   output += "Discounted prices：" + Number(discountedTotalPrice).toFixed(2) + "(yuan)" + '\n'
   output += "**********************"

   return output
}
