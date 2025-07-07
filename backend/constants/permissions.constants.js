// Definición de todos los permisos disponibles en el sistema
export const PERMISSIONS = {
  // Permisos de servidor
  MANAGE_SERVER: 'MANAGE_SERVER',
  MANAGE_ROLES: 'MANAGE_ROLES',
  MANAGE_CHANNELS: 'MANAGE_CHANNELS',
  KICK_MEMBERS: 'KICK_MEMBERS',
  BAN_MEMBERS: 'BAN_MEMBERS',
  CREATE_INVITE: 'CREATE_INVITE',
  CHANGE_NICKNAME: 'CHANGE_NICKNAME',
  MANAGE_NICKNAMES: 'MANAGE_NICKNAMES',
  VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
  
  // Permisos de canales de texto
  VIEW_CHANNEL: 'VIEW_CHANNEL',
  SEND_MESSAGES: 'SEND_MESSAGES',
  SEND_TTS_MESSAGES: 'SEND_TTS_MESSAGES',
  MANAGE_MESSAGES: 'MANAGE_MESSAGES',
  EMBED_LINKS: 'EMBED_LINKS',
  ATTACH_FILES: 'ATTACH_FILES',
  READ_MESSAGE_HISTORY: 'READ_MESSAGE_HISTORY',
  MENTION_EVERYONE: 'MENTION_EVERYONE',
  USE_EXTERNAL_EMOJIS: 'USE_EXTERNAL_EMOJIS',
  ADD_REACTIONS: 'ADD_REACTIONS',
  
  // Permisos de canales de voz
  CONNECT: 'CONNECT',
  SPEAK: 'SPEAK',
  MUTE_MEMBERS: 'MUTE_MEMBERS',
  DEAFEN_MEMBERS: 'DEAFEN_MEMBERS',
  MOVE_MEMBERS: 'MOVE_MEMBERS',
  USE_VAD: 'USE_VAD',
  
  // Permisos administrativos
  ADMINISTRATOR: 'ADMINISTRATOR'
};

// Categorías de permisos para organizar en la UI
export const PERMISSION_CATEGORIES = {
  GENERAL: {
    name: 'General Server Permissions',
    permissions: [
      PERMISSIONS.VIEW_AUDIT_LOG,
      PERMISSIONS.MANAGE_SERVER,
      PERMISSIONS.MANAGE_ROLES,
      PERMISSIONS.MANAGE_CHANNELS,
      PERMISSIONS.KICK_MEMBERS,
      PERMISSIONS.BAN_MEMBERS,
      PERMISSIONS.CREATE_INVITE,
      PERMISSIONS.CHANGE_NICKNAME,
      PERMISSIONS.MANAGE_NICKNAMES,
      PERMISSIONS.ADMINISTRATOR
    ]
  },
  TEXT: {
    name: 'Text Channel Permissions',
    permissions: [
      PERMISSIONS.VIEW_CHANNEL,
      PERMISSIONS.SEND_MESSAGES,
      PERMISSIONS.SEND_TTS_MESSAGES,
      PERMISSIONS.MANAGE_MESSAGES,
      PERMISSIONS.EMBED_LINKS,
      PERMISSIONS.ATTACH_FILES,
      PERMISSIONS.READ_MESSAGE_HISTORY,
      PERMISSIONS.MENTION_EVERYONE,
      PERMISSIONS.USE_EXTERNAL_EMOJIS,
      PERMISSIONS.ADD_REACTIONS
    ]
  },
  VOICE: {
    name: 'Voice Channel Permissions',
    permissions: [
      PERMISSIONS.CONNECT,
      PERMISSIONS.SPEAK,
      PERMISSIONS.MUTE_MEMBERS,
      PERMISSIONS.DEAFEN_MEMBERS,
      PERMISSIONS.MOVE_MEMBERS,
      PERMISSIONS.USE_VAD
    ]
  }
};

// Descripciones de permisos para la UI
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.ADMINISTRATOR]: 'Members with this permission have every permission and can also edit server and channel permissions. This is a dangerous permission to grant.',
  [PERMISSIONS.VIEW_AUDIT_LOG]: 'Members with this permission can view the server audit log.',
  [PERMISSIONS.MANAGE_SERVER]: 'Members with this permission can edit the server information and settings.',
  [PERMISSIONS.MANAGE_ROLES]: 'Members with this permission can create new roles and edit or delete roles lower than their highest role.',
  [PERMISSIONS.MANAGE_CHANNELS]: 'Members with this permission can create, edit, or delete channels.',
  [PERMISSIONS.KICK_MEMBERS]: 'Members with this permission can remove other members from this server.',
  [PERMISSIONS.BAN_MEMBERS]: 'Members with this permission can ban other members from this server.',
  [PERMISSIONS.CREATE_INVITE]: 'Members with this permission can invite new people to this server.',
  [PERMISSIONS.CHANGE_NICKNAME]: 'Members with this permission can change their own nickname.',
  [PERMISSIONS.MANAGE_NICKNAMES]: 'Members with this permission can change other members\' nicknames.',
  [PERMISSIONS.VIEW_CHANNEL]: 'Members with this permission can view this channel.',
  [PERMISSIONS.SEND_MESSAGES]: 'Members with this permission can send messages in this channel.',
  [PERMISSIONS.SEND_TTS_MESSAGES]: 'Members with this permission can send text-to-speech messages.',
  [PERMISSIONS.MANAGE_MESSAGES]: 'Members with this permission can delete messages from other members or pin any message.',
  [PERMISSIONS.EMBED_LINKS]: 'Members with this permission can post content that display as website previews.',
  [PERMISSIONS.ATTACH_FILES]: 'Members with this permission can upload images and files.',
  [PERMISSIONS.READ_MESSAGE_HISTORY]: 'Members with this permission can read previous messages.',
  [PERMISSIONS.MENTION_EVERYONE]: 'Members with this permission can use @everyone or @here.',
  [PERMISSIONS.USE_EXTERNAL_EMOJIS]: 'Members with this permission can use emoji from other servers.',
  [PERMISSIONS.ADD_REACTIONS]: 'Members with this permission can add new reactions to a message.',
  [PERMISSIONS.CONNECT]: 'Members with this permission can connect to this voice channel.',
  [PERMISSIONS.SPEAK]: 'Members with this permission can speak in this voice channel.',
  [PERMISSIONS.MUTE_MEMBERS]: 'Members with this permission can mute other members in voice channels.',
  [PERMISSIONS.DEAFEN_MEMBERS]: 'Members with this permission can deafen other members in voice channels.',
  [PERMISSIONS.MOVE_MEMBERS]: 'Members with this permission can move members between voice channels.',
  [PERMISSIONS.USE_VAD]: 'Members with this permission can use voice activity detection in voice channels.'
};

// Permisos por defecto para roles
export const DEFAULT_PERMISSIONS = {
  EVERYONE: [
    PERMISSIONS.VIEW_CHANNEL,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.EMBED_LINKS,
    PERMISSIONS.ATTACH_FILES,
    PERMISSIONS.READ_MESSAGE_HISTORY,
    PERMISSIONS.USE_EXTERNAL_EMOJIS,
    PERMISSIONS.ADD_REACTIONS,
    PERMISSIONS.CONNECT,
    PERMISSIONS.SPEAK,
    PERMISSIONS.USE_VAD,
    PERMISSIONS.CHANGE_NICKNAME
  ],
  MODERATOR: [
    ...DEFAULT_PERMISSIONS.EVERYONE,
    PERMISSIONS.MANAGE_MESSAGES,
    PERMISSIONS.KICK_MEMBERS,
    PERMISSIONS.MUTE_MEMBERS,
    PERMISSIONS.DEAFEN_MEMBERS,
    PERMISSIONS.MOVE_MEMBERS,
    PERMISSIONS.MANAGE_NICKNAMES
  ],
  ADMIN: [
    ...DEFAULT_PERMISSIONS.MODERATOR,
    PERMISSIONS.MANAGE_SERVER,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.MANAGE_CHANNELS,
    PERMISSIONS.BAN_MEMBERS,
    PERMISSIONS.CREATE_INVITE,
    PERMISSIONS.VIEW_AUDIT_LOG
  ]
};