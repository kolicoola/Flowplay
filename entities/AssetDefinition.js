{
  "name": "AssetDefinition",
  "type": "object",
  "properties": {
    "asset_id": {
      "type": "string",
      "description": "Unique identifier (lowercase, no spaces)"
    },
    "label": {
      "type": "string",
      "description": "Display name"
    },
    "symbol": {
      "type": "string",
      "description": "Short ticker symbol"
    },
    "emoji": {\
      "type": "string",
      "description": "Emoji icon"
    },
    "color": {
      "type": "string",
      "description": "Hex color for chart"
    },
    "start_price": {
      "type": "number",
      "description": "Starting price"
    },
    "volatility": {
      "type": "number",
      "description": "Price swing per tick (0.01\u20130.10)"
    },
    "drift": {
      "type": "number",
      "description": "Slight up/down bias per tick"
    }
  },
  "required": [
    "asset_id",
    "label",
    "symbol",
    "emoji",
    "start_price"
  ]
}