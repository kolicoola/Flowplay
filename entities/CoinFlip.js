{
  "name": "CoinFlip",
  "type": "object",
  "properties": {
    "creator_wallet_id": {
      "type": "string",
      "description": "Wallet ID of the creator"
    },
    "creator_username": {
      "type": "string"
    },
    "joiner_wallet_id": {
      "type": "string",
      "description": "Wallet ID of the joiner (empty until joined)"
    },
    "joiner_username": {
      "type": "string"
    },
    "amount": {
      "type": "number",
      "description": "Bet amount each player stakes"
    },
    "status": {
      "type": "string",
      "enum": [
        "waiting",
        "completed"
      ],
      "default": "waiting"
    },
    "winner_wallet_id": {
      "type": "string"
    },
    "winner_username": {
      "type": "string"
    }
  },
  "required": [
    "creator_wallet_id",
    "creator_username",
    "amount"
  ]
}