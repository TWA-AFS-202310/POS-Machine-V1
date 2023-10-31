export function loadAllItems() {
  return [
    {
      barcode: "ITEM000000",
      name: "Coca-Cola",
      unit: "bottles",
      price: 3.0,
    },
    {
      barcode: "ITEM000001",
      name: "Sprite",
      unit: "bottles",
      price: 3.0,
    },
    {
      barcode: "ITEM000002",
      name: "Apple",
      unit: "pounds",
      price: 5.5,
    },
    {
      barcode: "ITEM000003",
      name: "Litchi",
      unit: "pounds",
      price: 15.0,
    },
    {
      barcode: "ITEM000004",
      name: "Battery",
      unit: "a",
      price: 2.0,
    },
    {
      barcode: "ITEM000005",
      name: "Instant Noodles",
      unit: "bags",
      price: 4.5,
    },
  ];
}

export function loadPromotions() {
  return [
    {
      type: "BUY_TWO_GET_ONE_FREE",
      barcodes: ["ITEM000000", "ITEM000001", "ITEM000005"],
    },
  ];
}
