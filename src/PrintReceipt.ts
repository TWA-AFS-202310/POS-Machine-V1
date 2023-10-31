// import {loadAllItems, loadPromotions} from './Dependencies'

// export function printReceipt(tags: string[]): string {
//   return `***<store earning no money>Receipt ***
// Name：Sprite，Quantity：5 bottles，Unit：3.00(yuan)，Subtotal：12.00(yuan)
// Name：Litchi，Quantity：2.5 pounds，Unit：15.00(yuan)，Subtotal：37.50(yuan)
// Name：Instant Noodles，Quantity：3 bags，Unit：4.50(yuan)，Subtotal：9.00(yuan)
// ----------------------22ge
// Total：58.50(yuan)
// Discounted prices：7.50(yuan)
// **********************`
// }

import {loadAllItems, loadPromotions} from './Dependencies'
import {ReceiptItem,Quantity} from './receiptItem'
import {Tag} from './tag'
import {Item} from './item'


export class PosMachine{

  public  printReceipt(tags: string[]): string {
    const parsedTags:Tag[] = this.parseTags(tags)
    //console.log(parsedTags)
    const receiptItem:ReceiptItem[] = this.generateReceiptItems(parsedTags)
    // add.console.log(receiptItem)
    const receiptString:string = this.renderReceipt(receiptItem)
    return receiptString}

  //解析tags
  private parseTags(tags: string[]) :Tag[]{
    const tagsMap = new Map<string, number>()
    //split each item
    tags.forEach((item) => {
      const parts = item.split('-')
      const barcode = parts[0]
      const quantity = this.parseQuantity(item)
      //add quantity
      if (tagsMap.has(barcode)) {
        tagsMap.set(barcode, tagsMap.get(barcode)! + quantity)
      } else {
        tagsMap.set(barcode, quantity)
      }
    })
    //build new Tag[]
    const parsedTags:Tag[] = []
    //push parsedTag
    tagsMap.forEach((quantity, barcode) => {
      parsedTags.push({ barcode, quantity })
    })
    return parsedTags
  }
  //获取单个quantity
  private parseQuantity(item: string): number {
    const parts = item.split('-')
    return parts.length > 1 ? parseFloat(parts[1]) : 1
  }


  private generateReceiptItems(parsedTags: Tag[]): ReceiptItem[] {
    const receiptItem :ReceiptItem[] = []
    const allItem:Item[] = loadAllItems()
    const promotions  = loadPromotions()
    // 获取 barcodes 列表
    const promotionBarcodeList = promotions[0].barcodes
    // tags information
    for(let i =0; i<parsedTags.length;i++){
      const tag = parsedTags[i]
      const quantity = tag.quantity
      const barcode = tag.barcode
      const tagInfo = allItem.find((tag)=>tag.barcode===barcode)

      if (tagInfo) {
        const unitPrice = tagInfo.price
        const name = tagInfo.name
        let promotionType = undefined
        if (promotionBarcodeList.includes(barcode)) {
          promotionType = promotions[0].type
        }
        const subtotal = this.calculateDiscountedSubtotal(quantity,unitPrice,promotionType)
        const discountedPrice = quantity*unitPrice-subtotal
        const tagLine:ReceiptItem = {
          name,
          quantity: { value: quantity, quantifier: 'no' },
          unitPrice,
          subtotal,
          discountedPrice}
        receiptItem.push(tagLine)
      }
    }
    return receiptItem
  }

  private calculateDiscountedSubtotal(quantity: number, unitPrice: number, promotionType: string|undefined):number {
    let subtotalPrice = 0
    if (promotionType === 'BUY_TWO_GET_ONE_FREE') {
      const freeQuantity = Math.floor(quantity / 3) // 买二送一
      subtotalPrice += (quantity - freeQuantity) * unitPrice
    } else {
      subtotalPrice += quantity * unitPrice
    }
    return subtotalPrice
  }

  //
  private renderReceipt(receiptItem: ReceiptItem[]): string {
    let receiptString = '***<store earning no money>Receipt ***\n'
    const allItem: Item[] = loadAllItems()

    receiptItem.forEach((item) => {
      const tagInfo = allItem.find((tag) => tag.name === item.name)

      if (tagInfo) {

        const unit = tagInfo.unit
        const name = tagInfo.name
        const quantity = item.quantity.value
        const unitPrice = parseFloat(item.unitPrice.toFixed(2))
        const subtotal = parseFloat(item.subtotal.toFixed(2))



        receiptString += `Name:${name},Quantity:${quantity} `
        receiptString += `${unit}s,Unit:${unitPrice}(yuan),Subtotal:${subtotal}(yuan)\n`
      }
    }
    )
    // 计算 Total 和 Discounted prices
    const tatalPrice = receiptItem.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)
    const total = parseFloat(tatalPrice)
    const discountedPrices = (receiptItem.reduce((acc, item) => acc + item.discountedPrice, 0))


    receiptString += '----------------------\n'
    receiptString += `Total:${total}(yuan)\n`
    receiptString += `Discounted prices:${discountedPrices}(yuan)\n`
    receiptString += '**********************'

    return receiptString
  }
}





