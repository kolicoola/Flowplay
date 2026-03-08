{
  "name": "Upgrade",
  "type": "object",
  "properties": {
    "wallet_id": {
      "type": "string",
      "description": "Owner wallet ID"
    },
    "upgrade_id": {
      "type": "string",
      "description": "The upgrade type ID"
    },
    "level": {
      "type": "number",
      "default": 1,
      "description": "Current level of the upgrade"
    }
  },
  "required": [
    "wallet_id",
    "upgrade_id",
    "level"
  ]
}