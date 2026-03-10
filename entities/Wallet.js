{
  "name": "Wallet",
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "description": "The display name chosen by the user"
    },
    "balance": {
      "type": "number",
      "default": 1000,
      "description": "Current balance"
    },
    "avatar_color": {
      "type": "string",
      "description": "Random color assigned to user avatar"
    },
    "avatar_background": {
      "type": "string",
      "description": "ID of the equipped avatar background from the store"
    },
    "owned_backgrounds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of owned avatar background IDs"
    },
    "avatar_font": {
      "type": "string",
      "description": "ID of the equipped font from the store"
    },
    "owned_fonts": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of owned font IDs"
    },
    "avatar_letter_color": {
      "type": "string",
      "description": "ID of the equipped letter color for the avatar"
    },
    "owned_letter_colors": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of owned letter color IDs"
    },
    "avatar_hair": {
      "type": "string",
      "description": "ID of the equipped hairstyle for the avatar"
    },
    "owned_hairs": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of owned hairstyle IDs"
    },
    "site_background": {
      "type": "string",
      "description": "ID of the equipped site background"
    },
    "owned_site_backgrounds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of owned site background IDs"
    },
    "auth_user_id": {
      "type": "string",
      "description": "The Supabase auth user ID linked to this wallet"
    }
  },
  "required": [
    "username",
    "balance"
  ]
}