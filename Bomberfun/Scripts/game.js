/// <reference path="phaser/phaser.d.ts" />
/// <reference path="typings/signalr/signalr.d.ts" />
/// <reference path="typings/jquerymobile/jquerymobile.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var game;
function preload() {
    game.load.tilemap('map', '../assets/tilemaps/maps/map OUR.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('bomb_party_v4_bank_32s', '../assets/tilemaps/maps/bomb_party_v4_bank_32.png', 48, 48);
    game.load.image('bomb_party_v4_bank_32', '../assets/tilemaps/maps/bomb_party_v4_bank_32.png');
    game.load.image('bombPowerup', '../assets/tilemaps/maps/bombPowerup.png');
    game.load.image('flamePowerup', '../assets/tilemaps/maps/flamePowerup.png');
    game.load.image('clickable', '../assets/tilemaps/maps/clickable.png');
    game.time.advancedTiming = true;
    //  This sets a limit on the up-scale
    //game.scale.maxWidth = 720;
    //game.scale.maxHeight = 624;
    //  Then we tell Phaser that we want it to scale up to whatever the browser can handle, but to do it proportionally
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    if (this.game.device.desktop) {
        game.scale.maxWidth = 720;
        game.scale.maxHeight = 624;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    }
    else {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    }
    //    var myheight = $(window).innerHeight();
    //    var mywidth = $(window).innerWidth();
    //game.scale.setUserScale(1, 1);
    //game.scale.setGameSize(mywidth, myheight);
    //    game.scale.refresh();
}
var player1;
var player2;
var clickable;
var map;
var layer1;
var layer2;
var cursors;
var controlKey;
var bombs = [];
var tiles = [];
var crates = [];
var explosionsAll = [];
var powerups = [];
var bombsGroup;
var pGroup;
var gameEnded;
var eKey;
var sKey;
var fKey;
var dKey;
var qKey;
var p1CollisionGroup;
var p2CollisionGroup;
var bombCollisionGroup;
var mapCollisionGroup;
var powerupsCollisionGroup;
var CratePosition = (function () {
    function CratePosition() {
    }
    return CratePosition;
})();
var PlayerSprite = (function (_super) {
    __extends(PlayerSprite, _super);
    function PlayerSprite() {
        _super.apply(this, arguments);
    }
    return PlayerSprite;
})(Phaser.Sprite);
var BombSprite = (function (_super) {
    __extends(BombSprite, _super);
    function BombSprite() {
        _super.apply(this, arguments);
    }
    return BombSprite;
})(Phaser.Sprite);
var PowerUpSprite = (function (_super) {
    __extends(PowerUpSprite, _super);
    function PowerUpSprite() {
        _super.apply(this, arguments);
    }
    return PowerUpSprite;
})(Phaser.Sprite);
function create() {
    //    if ((<any>window).orientation == 90 || (<any>window).orientation == -90) {
    //        game.scale.setGameSize(1440, 624);
    //    } else {
    //        game.scale.setGameSize(720, 1248);
    //    }
    game.stage.disableVisibilityChange = true;
    //game.raf._isSetTimeOut = true;
    game.time.desiredFps = 60;
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    //    game.physics.p2.restitution = 0.3;
    game.physics.p2.restitution = 0;
    game.physics.p2.friction = 0;
    game.physics.p2.applyGravity = false;
    game.physics.p2.applyDamping = false;
    game.stage.backgroundColor = '#2d2d2d';
    mapCollisionGroup = game.physics.p2.createCollisionGroup();
    p1CollisionGroup = game.physics.p2.createCollisionGroup();
    p2CollisionGroup = game.physics.p2.createCollisionGroup();
    bombCollisionGroup = game.physics.p2.createCollisionGroup();
    powerupsCollisionGroup = game.physics.p2.createCollisionGroup();
    map = game.add.tilemap('map');
    map.addTilesetImage('bomb_party_v4_bank_32', "bomb_party_v4_bank_32");
    //map.addTilesetImage('walls_1x2');
    //map.addTilesetImage('tiles2');
    layer1 = map.createLayer("Tile Layer 1");
    layer2 = map.createLayer('Tile Layer 2');
    layer1.resizeWorld();
    //  Set the tiles for collision.
    //  Do this BEFORE generating the p2 bodies below.
    map.setCollisionBetween(1, 2, true);
    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
    //  This call returns an array of body objects which you can perform addition actions on if
    //  required. There is also a parameter to control optimising the map build.
    tiles = game.physics.p2.convertTilemap(map, layer1, true, false);
    for (var i = 0; i < tiles.length; i++) {
        //tiles[i].bounce = 0;
        tiles[i].setZeroDamping();
        tiles[i].setCircle(24, 24, 24);
        tiles[i].setCollisionGroup(mapCollisionGroup);
        tiles[i].collides([p1CollisionGroup, p2CollisionGroup]);
    }
    ;
    for (var j = 0; j < cratePositions.length; j++) {
        var crate = game.add.sprite(48 + 24 + cratePositions[j].X * 48, 48 + 24 + cratePositions[j].Y * 48, 'bomb_party_v4_bank_32s');
        crate.anchor.setTo(.5, .5);
        crate.frame = 10;
        game.physics.p2.enable(crate);
        crate.body.mass = 10000000000000000000;
        crate.body.setCollisionGroup(mapCollisionGroup);
        crate.body.collides([p1CollisionGroup, p2CollisionGroup]);
        crates.push(crate);
    }
    var myheight = $(window).innerHeight();
    var mywidth = $(window).innerWidth();
    if (!game.device.desktop || mobileDebug) {
        clickable = game.add.sprite(720, 0, 'clickable');
        if (!portraitDebug || window.orientation == 90 || window.orientation == -90) {
            clickable.x = 720;
        }
        else {
            clickable.x = 0;
            clickable.y = 624;
        }
        clickable.width = 720;
        clickable.height = 624;
    }
    player1 = game.add.sprite(48 + 24, 48 + 24, 'bomb_party_v4_bank_32s');
    player1.bombs = 1;
    player1.bombsAvailable = 1;
    player1.flame = 1;
    player1.frame = 17;
    player1.anchor.setTo(.5, .5);
    player1.smoothed = false;
    player1.animations.add('down', [18, 19]);
    player1.animations.add('up', [24, 25]);
    player1.animations.add('left', [21, 22, 23, 22]);
    player1.animations.add('right', [21, 22, 23, 22]);
    if (isPlayer1) {
        game.physics.p2.enable(player1);
        player1.body.fixedRotation = true;
        player1.body.setZeroDamping();
        player1.body.restitution = 0;
        //        player1.body.debug = true;
        player1.body.setRectangle(40, 43, 0.5, 0.5);
        //player1.body.addCircle(20, 0.5, 0.5);
        player1.body.damping = 0;
        player1.body.angularDamping = 0;
    }
    // PLAYER 2 CREATIOn
    player2 = game.add.sprite(48 * 13 + 24, 48 + 24, 'bomb_party_v4_bank_32s');
    player2.bombs = 1;
    player2.bombsAvailable = 1;
    player2.flame = 1;
    player2.frame = 17 + 15;
    player2.anchor.setTo(.5, .5);
    player2.smoothed = false;
    if (!isPlayer1) {
        game.physics.p2.enable(player2);
        //player2.body.data.shapes[0].sensor = true;
        player2.body.fixedRotation = true;
        player2.body.setZeroDamping();
        player2.body.restitution = 0;
        //        player2.body.debug = true;
        player2.body.setRectangle(40, 43, 0.5, 0.5);
    }
    //player2.body.addCircle(20, 0.5, 0.5);
    player2.animations.add('down', [18 + 15, 19 + 15]);
    player2.animations.add('up', [24 + 15, 25 + 15]);
    player2.animations.add('left', [21 + 15, 22 + 15, 23 + 15, 22 + 15]);
    player2.animations.add('right', [21 + 15, 22 + 15, 23 + 15, 22 + 15]);
    //game.camera.follow(player1);
    //  By default the ship will collide with the World bounds,
    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap
    //  you need to rebuild the physics world boundary as well. The following
    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.
    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require
    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.
    game.physics.p2.setBoundsToWorld(true, true, true, true, false);
    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:
    // ship.body.collideWorldBounds = false;
    cursors = game.input.keyboard.createCursorKeys();
    controlKey = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
    if (isPlayer1)
        controlKey.onUp.add(placeBomb, player1);
    else
        controlKey.onUp.add(placeBomb, player2);
    eKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
    sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    fKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
    dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    qKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
    //qKey.onUp.add(placeBomb, player2);
    //    game.world.forEach(function (o) {
    //        console.log(o);
    //    });
    //    for (var j = 0; j < cratePositions.length; j++) {
    //        var crate = game.add.sprite(48 + 24 + cratePositions[j].X * 48, 48 + 24 + cratePositions[j].Y * 48, 'bomb_party_v4_bank_32s');
    //        crate.anchor.setTo(.5, .5);
    //        crate.frame = 10;
    //        game.physics.p2.enable(crate);
    //        crate.body.mass = 10000000000000000000;
    //        //crate.body.setCollisionGroup(mapCollisionGroup);
    //        crates.push(crate);
    //    }
    bombsGroup = game.add.group();
    bombsGroup.enableBody = true;
    bombsGroup.physicsBodyType = Phaser.Physics.P2JS;
    if (isPlayer1) {
        player1.body.setCollisionGroup(p1CollisionGroup);
        player1.body.collides([bombCollisionGroup, mapCollisionGroup, powerupsCollisionGroup]);
    }
    else {
        player2.body.setCollisionGroup(p2CollisionGroup);
        player2.body.collides([bombCollisionGroup, mapCollisionGroup, powerupsCollisionGroup]);
    }
    game.physics.p2.updateBoundsCollisionGroup();
}
function placeBomb() {
    //console.log(ship.position);
    //var bomb = game.add.sprite(ship.position.x-(ship.position.x%48), ship.position.y-24, 'bomb_party_v4_bank_32s');
    //console.log(ship.position.x);
    //console.log(Phaser.Math.snapTo(ship.position.x,48));
    if (this.bombsAvailable == 0)
        return;
    var snapPosX = this.x;
    var snapPosY = this.y;
    if (isPlayer1) {
        if (p1wasUp)
            snapPosY += 24;
        if (p1wasDown)
            snapPosY -= 24;
        if (p1wasLeft)
            snapPosX += 20;
        if (p1wasRight)
            snapPosX -= 20;
    }
    else {
        if (p2wasUp)
            snapPosY += 24;
        if (p2wasDown)
            snapPosY -= 24;
        if (p2wasLeft)
            snapPosX += 20;
        if (p2wasRight)
            snapPosX -= 20;
    }
    var posX = Phaser.Math.snapToFloor(snapPosX, 48) + 24;
    var posY = Phaser.Math.snapToFloor(snapPosY, 48) + 24;
    var tile = map.getTileWorldXY(posX, posY, 48, 48, layer2);
    var anyCratesHit = crates.filter(function (crate) {
        return posX >= crate.position.x - 24 && posX <= crate.position.x + 24 && posY >= crate.position.y - 24 && posY <= crate.position.y + 24;
    });
    if (tile != null || anyCratesHit.length != 0) {
        snapPosX = this.x;
        snapPosY = this.y;
        posX = Phaser.Math.snapToFloor(snapPosX, 48) + 24;
        posY = Phaser.Math.snapToFloor(snapPosY, 48) + 24;
    }
    if (bombs.filter(function (sprite) {
        return Math.abs(sprite.position.x - posX) < 10 && Math.abs(sprite.position.y - posY) < 10;
    }).length == 0) {
        var position = { x: posX, y: posY };
        gameHub.server.laidDownBomb(position, this.flame);
        var bomb = game.add.sprite(posX, posY, 'bomb_party_v4_bank_32s');
        //var bomb = bombsGroup.create(posX, posY, 'bomb_party_v4_bank_32s');
        //game.physics.p2.enable(bomb);
        bomb.frame = 77;
        bomb.animations.add('start', [77, 78]);
        bomb.animations.add('burning', [79, 80]);
        bomb.animations.play('start', 4, true);
        bomb.anchor.setTo(.5, .5);
        this.bringToTop();
        bomb.phyEnabledPlayer1 = false;
        bomb.phyEnabledPlayer1 = false;
        bomb.owner = this;
        bomb.flame = this.flame;
        this.bombsAvailable--;
        bomb.bringToTop();
        game.physics.p2.enable(bomb);
        bomb.body.kinematic = true;
        bomb.body.setCollisionGroup(bombCollisionGroup);
        game.time.events.add(Phaser.Timer.SECOND * 1, changeBombFrame1, this, bomb);
        bombs.push(bomb);
    }
    else {
        console.log("bomb exists");
    }
    //bomb.body.fixedRotation = true;
    //bomb.body.setZeroDamping();
    //bomb.body.restitution = 0;
    //bomb.smoothed = false;
}
function changeBombFrame1(bomb) {
    bomb.animations.play('burning', 4, true);
    game.time.events.add(Phaser.Timer.SECOND * 1, changeBombFrame2, this, bomb);
}
function changeBombFrame3(bomb) {
    bomb.animations.stop();
    bomb.frame = 81;
    game.time.events.add(Phaser.Timer.SECOND * 0.5, detonateBomb, this, bomb, true);
}
function createExplosion(posX, posY, explosions, currentExplosionIndex, frame, explosionEndFrame) {
    var anyCratesHit = crates.filter(function (crate) {
        return posX >= crate.position.x - 24 && posX <= crate.position.x + 24 && posY >= crate.position.y - 24 && posY <= crate.position.y + 24;
    });
    if (anyCratesHit.length != 0) {
        anyCratesHit[0].frame = 86;
        game.time.events.add(Phaser.Timer.SECOND * 0.5, function () {
            gameHub.server.destroyCrate(anyCratesHit[0].x, anyCratesHit[0].y);
            var crateToRemoveIndex = crates.indexOf(anyCratesHit[0]);
            if (crateToRemoveIndex > -1)
                crates.splice(crateToRemoveIndex, 1);
            anyCratesHit[0].destroy();
        }, this);
        return true;
    }
    var anyBombsHit = bombs.filter(function (bomb) {
        return posX >= bomb.position.x - 24 && posX <= bomb.position.x + 24 && posY >= bomb.position.y - 24 && posY <= bomb.position.y + 24;
    });
    if (anyBombsHit.length != 0) {
        var explosionsOther = detonateBomb(anyBombsHit[0], false);
        explosionsOther.forEach(function (explosion) {
            explosions.push(explosion);
        });
        return true;
    }
    var anyPowerupsHit = powerups.filter(function (powerup) {
        return posX >= powerup.position.x - 24 && posX <= powerup.position.x + 24 && posY >= powerup.position.y - 24 && posY <= powerup.position.y + 2;
    });
    if (anyPowerupsHit.length != 0) {
        var powerupToRemoveIndex = powerups.indexOf(anyPowerupsHit[0]);
        if (powerupToRemoveIndex > -1)
            powerups.splice(powerupToRemoveIndex, 1);
        anyPowerupsHit[0].destroy();
    }
    var tile = map.getTileWorldXY(posX, posY, 48, 48, layer2);
    //    console.log(tile);
    if (tile != null)
        return true;
    var explosionRigth = game.add.sprite(posX, posY, 'bomb_party_v4_bank_32s');
    explosionRigth.anchor.setTo(.5, .5);
    explosionRigth.frame = frame;
    if (currentExplosionIndex == 1)
        explosionRigth.frame = explosionEndFrame;
    game.physics.p2.enable(explosionRigth);
    explosionRigth.body.setRectangle(35, 40, 0.5, 0.5);
    explosionRigth.body.data.shapes[0].sensor = true;
    explosionRigth.body.setCollisionGroup(mapCollisionGroup);
    explosionRigth.body.collides([p1CollisionGroup, p2CollisionGroup]);
    explosionRigth.body.onBeginContact.add(onBeginContact, this);
    explosions.push(explosionRigth);
    explosionsAll.push(explosionRigth);
    var anyExplosionsHit = explosionsAll.filter(function (explosion) {
        return posX >= explosion.position.x - 24 && posX <= explosion.position.x + 24 && posY >= explosion.position.y - 24 && posY <= explosion.position.y + 2;
    });
    for (var i = 0; i < anyExplosionsHit.length; i++) {
        if (anyExplosionsHit[i].frame == 75) {
            anyExplosionsHit[i].bringToTop();
        }
    }
    return false;
}
function powerupOnBeginContact(body) {
    if (this.destroyPhase)
        return;
    if (this.pickedUp)
        return;
    if (body == player1.body || body == player2.body) {
        if (this.name == "bomb powerup") {
            body.sprite.bombs++;
            body.sprite.bombsAvailable++;
        }
        else if (this.name == "flame powerup") {
            body.sprite.flame++;
        }
        gameHub.server.removePowerup(this.x, this.y);
        this.pickedUp = true;
        var powerupToRemoveIndex = powerups.indexOf(this);
        if (powerupToRemoveIndex > -1)
            powerups.splice(powerupToRemoveIndex, 1);
        this.destroy();
    }
}
function detonateBomb(bomb, destroyExplosions) {
    if (bombs.indexOf(bomb) == -1)
        return;
    bomb.destroy();
    bomb.owner.bombsAvailable++;
    var bombToRemoveIndex = bombs.indexOf(bomb);
    if (bombToRemoveIndex > -1)
        bombs.splice(bombToRemoveIndex, 1);
    var explosions = [];
    var explosion = game.add.sprite(bomb.position.x, bomb.position.y, 'bomb_party_v4_bank_32s');
    explosion.anchor.setTo(.5, .5);
    explosion.frame = 75;
    game.physics.p2.enable(explosion);
    explosion.body.setRectangle(35, 40, 0.5, 0.5);
    explosion.body.data.shapes[0].sensor = true;
    explosion.body.setCollisionGroup(mapCollisionGroup);
    explosion.body.collides([p1CollisionGroup, p2CollisionGroup]);
    explosion.body.onBeginContact.add(onBeginContact, this);
    explosions.push(explosion);
    explosionsAll.push(explosion);
    var posX = explosion.position.x + 48;
    var i = bomb.flame;
    while (i > 0) {
        var posY = explosion.position.y;
        var hitSomething = createExplosion(posX, posY, explosions, i, 74, 76);
        if (hitSomething)
            break;
        posX += 48;
        i--;
    }
    var posX = explosion.position.x - 48;
    var i = bomb.flame;
    while (i > 0) {
        var posY = explosion.position.y;
        var hitSomething = createExplosion(posX, posY, explosions, i, 74, 73);
        if (hitSomething)
            break;
        posX -= 48;
        i--;
    }
    var posY = explosion.position.y - 48;
    var i = bomb.flame;
    while (i > 0) {
        var posX = explosion.position.x;
        var hitSomething = createExplosion(posX, posY, explosions, i, 30, 15);
        if (hitSomething)
            break;
        posY -= 48;
        i--;
    }
    var posY = explosion.position.y + 48;
    var i = bomb.flame;
    while (i > 0) {
        var posX = explosion.position.x;
        var hitSomething = createExplosion(posX, posY, explosions, i, 30, 45);
        if (hitSomething)
            break;
        posY += 48;
        i--;
    }
    if (destroyExplosions)
        game.time.events.add(Phaser.Timer.SECOND * 0.5, removeExplosion, this, explosions);
    else
        return explosions;
}
function removeExplosion(explosions) {
    explosions.forEach(function (explosion) {
        var explosionToRemoveIndex = explosionsAll.indexOf(explosion);
        if (explosionToRemoveIndex > -1)
            explosionsAll.splice(explosionToRemoveIndex, 1);
        explosion.destroy();
    });
}
function onBeginContact(_body2, _shapeA, _shapeB, _equation) {
    if (_body2 === player1.body) {
        player1.isDead = true;
        gameHub.server.died();
        game.time.events.add(Phaser.Timer.SECOND * 1, endGame, this);
        player1.bringToTop();
        player1.animations.stop();
        var anim = player1.animations.add('die', [85, 72, 60]);
        //var anim = player1.animations.add('die', [72]);
        anim.onComplete.add(destroyPlayer, player1);
        anim.play(3);
        gameHub.server.died();
        //player1.events.onAnimationComplete.add(destroyPlayer, this);
        //var dieAnimation = player1.animations.play("die", 15,false)
        console.log("HIT SOMETHING");
    }
    if (_body2 === player2.body) {
        player2.isDead = true;
        gameHub.server.died();
        game.time.events.add(Phaser.Timer.SECOND * 1, endGame, this);
        player2.bringToTop();
        player2.animations.stop();
        var anim = player2.animations.add('die', [85, 72, 60]);
        //var anim = player1.animations.add('die', [72]);
        anim.onComplete.add(destroyPlayer, player2);
        anim.play(3);
        gameHub.server.died();
        //player1.events.onAnimationComplete.add(destroyPlayer, this);
        //var dieAnimation = player1.animations.play("die", 15,false)
        console.log("HIT SOMETHING");
    }
}
function endGame() {
    if (gameEnded)
        return;
    gameEnded = true;
    var text;
    var style = { font: "65px Arial", fill: "red", align: "center" };
    if (player1.isDead && player2.isDead) {
        var modal = $('#myModalDraw');
        text = "YOU DRAW!";
        style.fill = "purple";
    }
    else {
        if (isPlayer1) {
            if (player1.isDead) {
                var modal = $('#myModalLost');
                text = "YOU LOST!";
                style.fill = "red";
            }
            else {
                var modal = $('#myModalWon');
                text = "YOU WON!";
                style.fill = "lime";
            }
        }
        else {
            if (player2.isDead) {
                var modal = $('#myModalLost');
                text = "YOU LOST!";
                style.fill = "red";
            }
            else {
                var modal = $('#myModalWon');
                text = "YOU WON!";
                style.fill = "lime";
            }
        }
    }
    var gameOverText = game.add.text(game.world.centerX, game.world.centerY, text, style);
    gameOverText.anchor.set(0.5, 0.5);
}
// OUR PLAYER ISN'T GETTING DESTROYED
function destroyPlayer(player) {
    player.kill();
    player.destroy();
    console.log("should be destroyed");
}
function changeBombFrame2(bomb) {
    game.time.events.add(Phaser.Timer.SECOND * 1, changeBombFrame3, this, bomb);
}
function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}
function PointInTriangle(pt, v1, v2, v3) {
    var b1, b2, b3;
    b1 = sign(pt, v1, v2) < 0.0;
    b2 = sign(pt, v2, v3) < 0.0;
    b3 = sign(pt, v3, v1) < 0.0;
    return ((b1 == b2) && (b2 == b3));
}
var p1wasLeft = false;
var p1wasRight = false;
var p1wasUp = false;
var p1wasDown = false;
var p2wasLeft = false;
var p2wasRight = false;
var p2wasUp = false;
var p2wasDown = false;
var sendThisFrame = 0;
var xOnLastSend;
var yOnLastSend;
function update() {
    var myheight = game.height; //$(window).innerHeight();
    var mywidth = game.width; //$(window).innerWidth();
    if (connected) {
        var position = isPlayer1 ? player1.position : player2.position;
        if (sendThisFrame == 0) {
            if (xOnLastSend != position.x || yOnLastSend != position.y) {
                gameHub.server.playerMove(game.time.totalElapsedSeconds(), position);
                xOnLastSend = position.x;
                yOnLastSend = position.y;
            }
            sendThisFrame = 3; //3 is a good choice
        }
        else {
            sendThisFrame--;
        }
    }
    var filtered = bombs.filter(function (bomb) {
        return !bomb.phyEnabledPlayer1;
    });
    filtered.forEach(function (bomb) {
        if (player1.position.x + 24 < bomb.position.x - 24 || player1.position.x - 24 > bomb.position.x + 24 || player1.position.y + 24 < bomb.position.y - 24 || player1.position.y - 24 > bomb.position.y + 24) {
            bomb.phyEnabledPlayer1 = true;
            bomb.body.collides([p1CollisionGroup]);
            console.log("enabling phy for p1");
        }
    });
    var filtered = bombs.filter(function (bomb) {
        return !bomb.phyEnabledPlayer2;
    });
    filtered.forEach(function (bomb) {
        if (player2.position.x + 24 < bomb.position.x - 24 || player2.position.x - 24 > bomb.position.x + 24 || player2.position.y + 24 < bomb.position.y - 24 || player2.position.y - 24 > bomb.position.y + 24) {
            bomb.phyEnabledPlayer2 = true;
            bomb.body.collides([p2CollisionGroup]);
            console.log("enabling phy for p2");
        }
    });
    //    powerups.forEach(function (powerup) {
    //        if (isPlayer1) {
    //            if (Phaser.Rectangle.intersects(<any>player2.getBounds(), powerup.getBounds())) {
    //                var powerupToRemoveIndex = powerups.indexOf(this);
    //                if (powerupToRemoveIndex > -1) powerups.splice(powerupToRemoveIndex, 1);
    //                powerup.destroy();
    //            };
    //        } else {
    //            if (Phaser.Rectangle.intersects(<any>player1.getBounds(), powerup.getBounds())) {
    //                var powerupToRemoveIndex = powerups.indexOf(this);
    //                if (powerupToRemoveIndex > -1) powerups.splice(powerupToRemoveIndex, 1);
    //                powerup.destroy();
    //            };
    //        }
    //    });
    var wasKeyDown = true;
    //var myheight = 624;//$(window).innerHeight();
    //var mywidth = 1440;//$(window).innerWidth();
    var touchIsDown = mobileDebug ? game.input.mousePointer.isDown : game.input.pointer1.isDown;
    var inputMethod = mobileDebug ? game.input.mousePointer : game.input.pointer1;
    if (!game.device.desktop || mobileDebug) {
        if ((touchIsDown && inputMethod.x < 720 || game.input.pointer2.isDown && game.input.pointer2.x < 720) && ((mobileDebug && !portraitDebug) || window.orientation == 90 || window.orientation == -90)) {
            placeBomb.apply(isPlayer1 ? player1 : player2);
            ;
        }
        else if ((touchIsDown && inputMethod.y < 624 || game.input.pointer2.isDown && game.input.pointer2.y < 624) && ((mobileDebug && portraitDebug) || window.orientation == 0)) {
            placeBomb.apply(isPlayer1 ? player1 : player2);
        }
    }
    if (isPlayer1) {
        if (cursors.left.isDown || touchIsDown && isLeftButtonTriggered()) {
            player1.body.setRectangle(26, 43, 2, 0);
            //            player1.body.setCircle(26);
            player1.animations.play('left', 4, true);
            if (player1.scale.x > 0)
                player1.scale.x *= -1;
            if (!p1wasLeft) {
                if (!cursors.up.isDown && !cursors.down.isDown)
                    gameHub.server.playerTurn("left");
            }
            p1wasDown = false;
            p1wasUp = false;
            p1wasLeft = false;
            p1wasRight = false;
            p1wasLeft = true;
            player1.body.moveLeft(300);
        }
        else if (cursors.right.isDown || touchIsDown && isRightButtonTriggered()) {
            player1.body.setRectangle(26, 43, -2, 0);
            player1.animations.play('right', 4, true);
            //player1.body.addCircle(20, 0.5, 0.5);;
            if (player1.scale.x < 0) {
                player1.scale.x *= -1;
            }
            if (!p1wasRight) {
                if (!cursors.up.isDown && !cursors.down.isDown)
                    gameHub.server.playerTurn("right");
            }
            p1wasDown = false;
            p1wasUp = false;
            p1wasLeft = false;
            p1wasRight = false;
            p1wasRight = true;
            player1.body.moveRight(300);
        }
        else {
            wasKeyDown = false;
        }
        if (cursors.up.isDown || touchIsDown && isUpButtonTriggered()) {
            player1.animations.play('up', 4, true);
            player1.body.setRectangle(40, 43, 0.5, 0.5);
            player1.body.moveUp(300);
            wasKeyDown = true;
            if (!p1wasUp)
                gameHub.server.playerTurn("up");
            p1wasDown = false;
            p1wasUp = false;
            p1wasLeft = false;
            p1wasRight = false;
            p1wasUp = true;
        }
        else if (cursors.down.isDown || touchIsDown && isDownButtonTriggered()) {
            player1.animations.play('down', 4, true);
            player1.body.setRectangle(40, 43, 0.5, 0.5);
            player1.body.moveDown(300);
            wasKeyDown = true;
            if (!p1wasDown)
                gameHub.server.playerTurn("down");
            p1wasUp = false;
            p1wasLeft = false;
            p1wasRight = false;
            p1wasDown = true;
        }
        if (!wasKeyDown) {
            player1.body.setZeroVelocity();
            player1.animations.stop();
            if (p1wasDown || p1wasUp || p1wasLeft || p1wasRight)
                gameHub.server.stoppedMoving();
            if (p1wasDown)
                player1.frame = 17;
            if (p1wasUp)
                player1.frame = 16;
            if (p1wasLeft)
                player1.frame = 21;
            if (p1wasRight)
                player1.frame = 21;
            p1wasDown = false;
            p1wasUp = false;
            p1wasLeft = false;
            p1wasRight = false;
        }
    }
    // PLAYER 2 INPUT
    var wasKeyDown = true;
    if (!isPlayer1) {
        //if (sKey.isDown) {
        if (cursors.left.isDown) {
            player2.animations.play('left', 4, true);
            player2.body.setRectangle(26, 43, 2, 0);
            if (player2.scale.x > 0)
                player2.scale.x *= -1;
            if (!p2wasLeft)
                gameHub.server.playerTurn("left");
            p2wasRight = false;
            p2wasUp = false;
            p2wasDown = false;
            p2wasLeft = true;
            player2.body.moveLeft(300); //rotateLeft(100);
        }
        else if (cursors.right.isDown) {
            player2.animations.play('right', 4, true);
            player2.body.setRectangle(26, 43, -2, 0);
            //player2.body.addCircle(20, 0.5, 0.5);
            if (player2.scale.x < 0) {
                player2.scale.x *= -1;
            }
            if (!p2wasRight)
                gameHub.server.playerTurn("right");
            p2wasLeft = false;
            p2wasUp = false;
            p2wasDown = false;
            p2wasRight = true;
            player2.body.moveRight(300);
        }
        else {
            wasKeyDown = false;
        }
        //        if (eKey.isDown) {
        if (cursors.up.isDown) {
            player2.animations.play('up', 4, true);
            player2.body.setRectangle(40, 43, 0.5, 0.5);
            player2.body.moveUp(300);
            wasKeyDown = true;
            if (!p2wasUp)
                gameHub.server.playerTurn("up");
            p2wasDown = false;
            p2wasLeft = false;
            p2wasRight = false;
            p2wasUp = true;
        }
        else if (cursors.down.isDown) {
            player2.animations.play('down', 4, true);
            player2.body.setRectangle(40, 43, 0.5, 0.5);
            player2.body.moveDown(300);
            wasKeyDown = true;
            if (!p2wasDown)
                gameHub.server.playerTurn("down");
            p2wasUp = false;
            p2wasRight = false;
            p2wasLeft = false;
            p2wasDown = true;
        }
        if (!wasKeyDown) {
            player2.body.setZeroVelocity();
            player2.animations.stop();
            if (p2wasDown || p2wasUp || p2wasLeft || p2wasRight)
                gameHub.server.stoppedMoving();
            if (p2wasDown)
                player2.frame = 17 + 15;
            if (p2wasUp)
                player2.frame = 16 + 15;
            if (p2wasLeft)
                player2.frame = 21 + 15;
            if (p2wasRight)
                player2.frame = 21 + 15;
            p2wasDown = false;
            p2wasUp = false;
            p2wasLeft = false;
            p2wasRight = false;
        }
    }
    if (isPlayer1) {
        player1.body.setCollisionGroup(p1CollisionGroup);
        player1.body.collides([bombCollisionGroup, mapCollisionGroup, powerupsCollisionGroup]);
    }
    else {
        player2.body.setCollisionGroup(p2CollisionGroup);
        player2.body.collides([bombCollisionGroup, mapCollisionGroup, powerupsCollisionGroup]);
    }
}
function render() {
    //    game.debug.text('render FPS: ' + (game.time.fps || '--'), 2, 14, "#00ff00");
    //    game.debug.pointer(game.input.pointer1);
    //    game.debug.pointer(game.input.pointer2);
}
function isLeftButtonTriggered() {
    if (game.device.desktop && !mobileDebug)
        return false;
    var myheight = game.height; //$(window).innerHeight();
    var mywidth = game.width; //$(window).innerWidth();
    var inputMethod = mobileDebug ? game.input.mousePointer : game.input.pointer1;
    if (!portraitDebug || window.orientation == 90 || window.orientation == -90) {
        return PointInTriangle({ x: inputMethod.x, y: inputMethod.y }, { x: 720, y: 0 }, { x: mywidth * 0.75, y: myheight / 2 }, { x: 720, y: myheight });
    }
    else {
        return PointInTriangle({ x: inputMethod.x, y: inputMethod.y }, { x: 0, y: 624 }, { x: mywidth / 2, y: myheight * 0.75 }, { x: 0, y: myheight });
    }
}
function isRightButtonTriggered() {
    if (game.device.desktop && !mobileDebug)
        return false;
    var myheight = game.height; //$(window).innerHeight();
    var mywidth = game.width; //$(window).innerWidth();
    var inputMethod = mobileDebug ? game.input.mousePointer : game.input.pointer1;
    if (!portraitDebug || window.orientation == 90 || window.orientation == -90) {
        return PointInTriangle({ x: inputMethod.x, y: inputMethod.y }, { x: mywidth, y: 0 }, { x: mywidth, y: myheight }, { x: mywidth * 0.75, y: myheight / 2 });
    }
    else {
        return PointInTriangle({ x: inputMethod.x, y: inputMethod.y }, { x: mywidth, y: myheight / 2 }, { x: mywidth, y: myheight }, { x: mywidth / 2, y: myheight * 0.75 });
    }
}
function isUpButtonTriggered() {
    if (game.device.desktop && !mobileDebug)
        return false;
    var myheight = game.height; //$(window).innerHeight();
    var mywidth = game.width; //$(window).innerWidth();
    var inputMethod = mobileDebug ? game.input.mousePointer : game.input.pointer1;
    if (!portraitDebug || window.orientation == 90 || window.orientation == -90) {
        return PointInTriangle({ x: inputMethod.x, y: inputMethod.y }, { x: 720, y: 0 }, { x: mywidth, y: 0 }, { x: mywidth * 0.75, y: myheight / 2 });
    }
    else {
        return PointInTriangle({ x: inputMethod.x, y: inputMethod.y }, { x: 0, y: myheight / 2 }, { x: mywidth, y: myheight / 2 }, { x: mywidth / 2, y: myheight * 0.75 });
    }
}
function isDownButtonTriggered() {
    if (game.device.desktop && !mobileDebug)
        return false;
    var myheight = game.height; //$(window).innerHeight();
    var mywidth = game.width; //$(window).innerWidth();
    var inputMethod = mobileDebug ? game.input.mousePointer : game.input.pointer1;
    if (!portraitDebug || window.orientation == 90 || window.orientation == -90) {
        return PointInTriangle({ x: inputMethod.x, y: inputMethod.y }, { x: mywidth * 0.75, y: myheight / 2 }, { x: mywidth, y: myheight }, { x: 720, y: myheight });
    }
    else {
        return PointInTriangle({ x: inputMethod.x, y: inputMethod.y }, { x: mywidth / 2, y: myheight * 0.75 }, { x: mywidth, y: myheight }, { x: 0, y: myheight });
    }
}
//# sourceMappingURL=game.js.map