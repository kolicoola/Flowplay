{
  "name": "Charity",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the charity"
    },
    "description": {
      "type": "string",
      "description": "What this charity is for"
    },
    "founders": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of wallet IDs that are founders and share donations equally"
    },
    "founder_names": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Display names of founders"
    },
    "minimum_donation": {
      "type": "number",
      "default": 1,
      "description": "Minimum amount required to donate"
    },
    "total_raised": {
      "type": "number",
      "default": 0,
      "description": "Total amount raised by this charity"
    },
    "creator_wallet_id": {
      "type": "string",
      "description": "Wallet ID of the charity creator"
    }
  },
  "required": [
    "name",
    "description",
    "minimum_donation"
  ]
}