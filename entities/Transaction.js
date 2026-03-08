{
  "name": "Transaction",
  "type": "object",
  "properties": {
    "from_wallet_id": {
      "type": "string",
      "description": "Wallet ID of the sender"
    },
    "to_wallet_id": {
      "type": "string",
      "description": "Wallet ID of the receiver"
    },
    "from_username": {
      "type": "string"
    },
    "to_username": {
      "type": "string"
    },
    "amount": {
      "type": "number"
    },
    "note": {
      "type": "string",
      "description": "Optional payment note"
    }
  },
  "required": [
    "from_wallet_id",
    "to_wallet_id",
    "amount"
  ]
}