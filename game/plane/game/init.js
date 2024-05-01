var win = document.getElementById('win')
var score = document.getElementById('score')
var hp = document.getElementById('hp')

var PERFIX_SRC = 'https://zm50.github.io/game/plane/resource/img/'

var PlAYER_SRC = PERFIX_SRC + 'player.png'
var BULLET_SRC = PERFIX_SRC + 'bullet.png'
var POSTFIX_ROCK = 'rock.png'
var SHIELD_SRC = PERFIX_SRC + 'shield.png'
var LIGHT_SRC = PERFIX_SRC + 'gun.png'

var PLAYER_SPEED = 20
var BULLET_SPEED = 20
var MAX_ROCK_SPEED_X = 2
var MIN_ROCK_SPEED_Y = 3
var VAR_ROCK_SPEED_Y = 5

var BULLET_CREATE_INTERVAL = 100

var ROCK_COUNT = 10
var ROCK_KIND = 5

var ROCK_HURT = 10

var TOOL_PROBABILITY = 0.05

var SHIELD_NUM = 10
var LIGHT_NUM = 5