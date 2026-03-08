{
  "name": "AssetPrice",
  "type": "object",
  "properties": {
    "asset_id": {
      "type": "string",
      "description": "Asset identifier"
    },
    "price": {
      "type": "number",
      "description": "Current price"
    },
    "history": {
      "type": "array",
      "items": {
        "type": "number"
      },
      "description": "Recent price history (last 30 ticks)"
    },
    "last_updated": {
      "type": "string",
      "description": "ISO timestamp of last price update"
    }
  },
  "required": [
    "asset_id",
    "price"
  ]
}