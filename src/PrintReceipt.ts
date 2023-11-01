import {loadAllItems, loadPromotions} from './Dependencies'
import { Quantity } from './interfaces/Quantity'
import { ReceiptItem } from './interfaces/ReceiptItem'
import { Tag } from './interfaces/Tag'

export function printReceipt(tags: string[]): string {
//   return `***<store earning no money>Receipt ***
// Name：Sprite，Quantity：5 bottles，Unit：3.00(yuan)，Subtotal：12.00(yuan)
// Name：Litchi，Quantity：2.5 pounds，Unit：15.00(yuan)，Subtotal：37.50(yuan)
// Name：Instant Noodles，Quantity：3 bags，Unit：4.50(yuan)，Subtotal：9.00(yuan)
// ----------------------
// Total：58.50(yuan)
// Discounted prices：7.50(yuan)
// **********************`
  const parsedTags = parseTags(tags)
  const receiptItems = generateReceiptItems(parsedTags)
  const receipt = renderReceipt(receiptItems)
  return receipt
}

function renderReceipt(receiptItems: ReceiptItem[]): string {
  let total = 0
  receiptItems.map(item => { return total += item.subtotal} )
  let discountedPrice = 0
  receiptItems.map(item => { discountedPrice += item.discountedPrice})
  const str = '***<store earning no money>Receipt ***\n'.concat(
    receiptItems.map(item => {return `  Name：${item.name}，Quantity：${item.quantity.value} ${item.unit}s，Unit：${item.unitPrice.toFixed(2)}(yuan)，Subtotal：${item.subtotal.toFixed(2)}(yuan)`})
      .join('\n')
  ).concat('\n  ----------------------\n').concat(`  Total：${total.toFixed(2)}(yuan)\n`).concat(`  Discounted prices：${discountedPrice.toFixed(2)}(yuan)\n`).concat(`  **********************`)
  return str

  // const subStr1 = '***<store earning no money>Receipt ***\n'
  // const subStr2 =  receiptItems.map(item =>
  // {
  //   return `Name：${item.name}，Quantity：${item.quantity.value} ${item.unit}s，Unit：${item.unitPrice.toFixed(2)}(yuan)，Subtotal：${item.subtotal.toFixed(2)}(yuan)`
  // }).join('\n')
  // const subStr3 = `\n----------------------\nTotal：${total.toFixed(2)}(yuan)\n`
  // const subStr4 = `Discounted prices：${discountedPrice.toFixed(2)}(yuan)\n**********************`

  // return subStr1.concat(subStr2, subStr3, subStr4)

}

function generateReceiptItems(tags: Tag[]): ReceiptItem[] {
  const allItems = loadAllItems()
  const promotions = loadPromotions()
  const receiptItems: ReceiptItem[] = []
  const promotionBarcode = promotions.find(promote => promote.type ==='BUY_TWO_GET_ONE_FREE')?.barcodes
  for(let i = 0; i < tags.length; i++) {
    console.log(tags[i])
    const ind = allItems.findIndex(item => tags[i].barcode === item.barcode)
    const name = allItems[ind].name
    const unitPrice = allItems[ind].price
    const unit = allItems[ind].unit
    let discountedPrice = 0
    if(promotionBarcode?.some(barcode => barcode===tags[i].barcode)){
      discountedPrice = calculateDiscountedSubtotal(tags[i].quantity.value, unitPrice)
    }
    const subtotal = unitPrice * tags[i].quantity.value - discountedPrice
    receiptItems.push({
      name: name,
      quantity: tags[i].quantity,
      unit: unit,
      unitPrice: unitPrice,
      subtotal: subtotal,
      discountedPrice: discountedPrice,
    })
  }

  return receiptItems
}

function calculateDiscountedSubtotal(quantity: number, price: number): number{
  return Math.floor(quantity/3) * price
}

function parseTags(tags: string[]): Tag[] {
  const parsedTags: Tag[] = []
  const barcodeMap = new Map<string, number>()
  const tagOrder: string[] = []
  for(const tag of tags){
    const tagArr = tag.split('-')
    if( !barcodeMap.has(tagArr[0]) ){
      tagOrder.push(tagArr[0])
      if(tagArr.length === 2){
        barcodeMap.set(tagArr[0], parseFloat(tagArr[1]))
      }else{
        barcodeMap.set(tagArr[0], 1)
      }
    }else {
      const recentNum = barcodeMap.get(tagArr[0]) as number
      if(tagArr.length === 2){
        barcodeMap.set(tagArr[0], recentNum + parseFloat(tagArr[1]) )
      }else {
        barcodeMap.set(tagArr[0], recentNum + 1)
      }
    }
  }

  for(const barcode of tagOrder){
    const quantity = barcodeMap.get(barcode) as number
    parsedTags.push({
      barcode: barcode,
      quantity: {
        value: quantity,
        quantifier: quantity.toString()
      },
    })
  }
  return parsedTags
}


// function parseTags(tags: string[]): Tag[]{
//   const parsedTags: Tag[] = []
//   let tempCount = 1
//   let tempQuantity
//   for(let i = 1; i < tags.length; i++){
//     if(tags[i].split('-')[0] === tags[i-1].split('-')[0]){
//       if(tags[i].split('-').length === 2){
//         tempCount += parseFloat(tags[i].split('-')[1])
//       }else{
//         tempCount += 1
//       }
//       continue
//     }else {
//       tempQuantity = parseQuantity(tags[i-1], tempCount)
//       parsedTags.push({
//         barcode: tags[i-1].split('-')[0],
//         quantity: tempQuantity
//       })
//     }
//     tempCount = 1
//   }
//   tempQuantity = parseQuantity(tags[tags.length-1], tempCount)
//   parsedTags.push({
//     barcode: tags[tags.length-1].split('-')[0],
//     quantity: tempQuantity
//   })
//   return parsedTags
// }

function parseQuantity(tag: string, num: number): Quantity {
  const allItems = loadAllItems()
  const splitArr = tag.split('-')

  const barcode = splitArr[0]
  console.log(splitArr)
  const isContain: boolean = allItems.some(item => item.barcode === barcode)
  if(!isContain){
    num = 0
  }
  // if(splitArr.length === 2){
  //   num = parseFloat(splitArr[1])
  //   console.log(num)
  // }
  return {
    value: num,
    quantifier: num.toString()
  }

  // return {
  //   value: num,
  //   quantifier: num.toString()
  // }
}


const input = [
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000001',
  'ITEM000003-2.5',
  'ITEM000005',
  'ITEM000005-2',
]




const tags = parseTags(input)
console.log(tags)
const receiptItems = generateReceiptItems(tags)
console.log(receiptItems)
const str = renderReceipt(receiptItems)
console.log(str)
