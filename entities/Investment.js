{
  "name": "Investment",
  "type": "object",
  "properties": {
    "wallet_id": {
      "type": "string",
      "description": "Owner wallet ID"
    },
    "asset_id": {
      "type": "string",
      "description": "Asset identifier (e.g. bitcoin)"
    },
    "shares": {
      "type": "number",
      "description": "Number of shares owned"
    },
    "avg_buy_price": {
      "type": "number",
      "description": "Average price paid per share"
    }
  },
  "required": [
    "wallet_id",
    "asset_id",
    "shares",
    "avg_buy_price"
  ]
}