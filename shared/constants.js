// Shared constants between client and server
export const GAME_CONSTANTS = {
  INTERACTION_DISTANCE: 5,
  MOVEMENT_SPEED: 5,
  RUN_MULTIPLIER: 1.8,
  CAR_SPEED: 20,
  PLAYER_HEIGHT: 1.8,
  CITY_SIZE: 200,
  BLOCK_SIZE: 40,
};

export const BUILDING_TYPES = {
  HOUSE: 'house',
  MALL: 'mall',
  CLUB: 'club',
  SCHOOL: 'school',
  COLLEGE: 'college',
  SHOP: 'shop',
  CAR_DEALERSHIP: 'dealership',
  MARRIAGE_HALL: 'marriage_hall',
};

export const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

export const EMOTES = {
  WAVE: 'wave',
  DANCE: 'dance',
  SIT: 'sit',
  KISS: 'kiss',
  CLAP: 'clap',
};

export const JOB_TYPES = {
  DELIVERY: 'delivery',
  TAXI: 'taxi',
  SHOP_CLERK: 'shop_clerk',
  TEACHER: 'teacher',
};

export const NETWORK_EVENTS = {
  CREATE_ROOM: 'createRoom',
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  PLAYER_UPDATE: 'playerUpdate',
  WEBRTC_OFFER: 'webrtcOffer',
  WEBRTC_ANSWER: 'webrtcAnswer',
  WEBRTC_ICE: 'webrtcIce',
  ROOM_CREATED: 'roomCreated',
  ROOM_JOINED: 'roomJoined',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  ERROR: 'error',
};

export const INTERIOR_TYPES = {
  HOUSE_INTERIOR: 'house_interior',
  MALL_INTERIOR: 'mall_interior',
  CLUB_INTERIOR: 'club_interior',
  SCHOOL_INTERIOR: 'school_interior',
  COLLEGE_INTERIOR: 'college_interior',
  SHOP_INTERIOR: 'shop_interior',
  DEALERSHIP_INTERIOR: 'dealership_interior',
  MARRIAGE_HALL_INTERIOR: 'marriage_hall_interior',
  CAR_INTERIOR: 'car_interior',
};

export const DEFAULT_MONEY = 1000;
export const DEFAULT_CUSTOMIZATION = {
  hairColor: '#3d2817',
  skinColor: '#ffdbac',
  shirtColor: '#4287f5',
  pantsColor: '#2d2d2d',
  hairStyle: 'short',
};
