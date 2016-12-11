window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

    var Weapon = {};

    var Enemy = {};

    function getSpawnpoint() {
        result = {};
        //get a number 0-3
        var side = Math.floor(Math.random() * 4);
        var x, y;
        if (side < 2) {
            if (side === 0) {
                //top
                y = 80;
            } else {
                //bottom
                y = game.world.height - 120;
            }
            x = Math.floor(Math.random()*600) + 40;

        } else {
            if (side === 2) {
                //left
                x = 80;
            } else {
                //right
                x = game.world.width - 120;
            }
            y = Math.floor(Math.random()*400) + 40;

        }
        result.x = x;
        result.y = y;
        return result;
    }

    Enemy.Controller = function(game) {

        this.game = game;
        this.shamblers = [];
        for (var i = 0; i < 20; i++) {
            this.shamblers.push(new Enemy.Shambler(game, this));
        }
        this.hoverers = [];
        for (var i = 0; i < 10; i++) {
          this.hoverers.push(new Enemy.Hoverer(game, this));
        }
        this.drifters = [];
        this.activeEnemies = [];
        this.player = game.player;



    };

    Enemy.Controller.prototype.update = function () {

        if (this.activeEnemies.length === 0) {
            for (var i = 0; i < 5; i++) {
              var pick = Math.floor(Math.random()*6);
              if (pick < 4) {
                  var shambler = this.shamblers.pop();
                  shambler.spawn();
                  this.activeEnemies.push(shambler);
              } else {
                  var hoverer = this.hoverers.pop();
                  hoverer.spawn();
                  this.activeEnemies.push(hoverer);
              }
            }
          console.dir(this.activeEnemies);
        }
        this.activeEnemies.forEach(function(enemy) {
            enemy.update();
        });

    };

    Enemy.Controller.prototype.cleanUpEnemy = function (enemy) {
        console.log(enemy.type + " died!");
        enemy.controller.activeEnemies.splice(enemy.controller.activeEnemies.indexOf(enemy), 1);
        enemy.enemy.exists = false;
        if (enemy.type === 'shambler') enemy.controller.shamblers.push(enemy);
        else if (enemy.type === 'hoverer') enemy.controller.hoverers.push(enemy);
        else if (enemy.type === 'drifter') enemy.controller.drifters.push(enemy);
        console.log(enemy.controller.activeEnemies.length, enemy.controller.shamblers.length, enemy.controller.hoverers.length, enemy.controller.drifters.length);
    };

    Enemy.Hoverer = function (game, controller) {

        this.game = game;
        this.controller = controller;
        this.health = 3;
        this.player = game.player;
        this.AITimer = 15;
        this.type = 'hoverer';
        this.weapon = new Weapon.EnemyBallBullet(game);
        this.hovererDeath = new Phaser.Signal();

        this.hovererDeath.add(controller.cleanUpEnemy, this);

        this.enemy = game.add.sprite(-100, -100, 'hoverer');
        this.enemy.enemyInfo = this;
        this.enemy.exists = false;
        this.enemy.anchor.set(0.5);

        game.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    };

    Enemy.Hoverer.prototype.spawn = function () {

        this.health = 3;
        this.enemy.alive = true;
        this.enemy.exists = true;
        this.enemy.visible = true;
        this.AITimer = 15;

        spawnpoint = getSpawnpoint();

        this.enemy.x = spawnpoint.x;
        this.enemy.y = spawnpoint.y;

    };

    Enemy.Hoverer.prototype.damage = function(damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.enemy.kill();
            this.hovererDeath.dispatch(this);

            return true;
        }

        return false;
    };

    Enemy.Hoverer.prototype.update = function() {

        game.physics.arcade.collide(this.enemy, this.game.walls);
        game.physics.arcade.collide(this.player, this.enemy, this.game.onEnemyCollide);
        game.physics.arcade.collide(this.enemy, this.game.weapons[0], this.game.bulletEnemyHandler);
        game.physics.arcade.collide(this.weapon, this,game.walls, this.game.bulletWallHandler);
        game.physics.arcade.collide(this.player, this.weapon, this.game.bulletPlayerHandler);

        if (this.AITimer === 0) {
            this.enemy.rotation = game.physics.arcade.angleBetween(this.enemy, this.player);

            this.weapon.fire(this.enemy);

            var movRot = this.enemy.rotation;
            if (game.physics.arcade.distanceBetween(this.enemy, this.player) < 300) {
                if (Math.random() < .5) {
                    movRot += (.75 * Math.PI);
                    if (movRot > Math.PI) movRot -= 2 * Math.PI;
                } else {
                    movRot -= (.75 * Math.PI);
                    if (movRot < -1 * Math.PI) movRot += 2 * Math.PI;
                }
            } else {
                if (Math.random() < .5) {
                    movRot += (.25 * Math.PI);
                    if (movRot > Math.PI) movRot -= 2 * Math.PI;
                } else {
                    movRot -= (.25 * Math.PI);
                    if (movRot < Math.PI) movRot += 2 * Math.PI;
                }
            }
            game.physics.arcade.velocityFromRotation(movRot, 75, this.enemy.body.velocity);

            this.AITimer = 15;
        } else {
            this.AITimer -= 1;
        }
    };

    Enemy.Shambler = function (game, controller) {

        this.game = game;
        this.controller = controller;
        this.health = 5;
        this.player = game.player;
        this.AITimer = 15;
        this.type = 'shambler';

        this.shamblerDeath = new Phaser.Signal();
        this.shamblerDeath.add(controller.cleanUpEnemy, this);

        this.enemy = game.add.sprite(-100, -100, 'shambler');
        this.enemy.enemyInfo = this;
        this.enemy.exists = false;
        this.enemy.anchor.set(0.5);

        game.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    };

    Enemy.Shambler.prototype.spawn = function () {

        this.health = 5;
        this.enemy.alive = true;
        this.enemy.exists = true;
        this.enemy.visible = true;
        this.AITimer = 15;

        spawnpoint = getSpawnpoint();

        this.enemy.x = spawnpoint.x;
        this.enemy.y = spawnpoint.y;
    };

    Enemy.Shambler.prototype.damage = function(damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.enemy.kill();
            this.shamblerDeath.dispatch(this);

            return true;
        }

        return false;

    };

    Enemy.Shambler.prototype.update = function() {

      game.physics.arcade.collide(this.enemy, this.game.walls);
      game.physics.arcade.collide(this.player, this.enemy, this.game.onEnemyCollide);
      game.physics.arcade.collide(this.enemy, this.game.weapons[0], this.game.bulletEnemyHandler);

      if (this.AITimer === 0) {
          this.enemy.rotation = game.physics.arcade.moveToObject(this.enemy, this.player, 50);
          this.AITimer = 15;
      } else {
        this.AITimer -= 1;
      }

    };

    var Bullet = function (game, key, health) {
        //health of bullets == the damage the bullet inflicts

        Phaser.Sprite.call(this, game, 0, 0, key);

        this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

        this.anchor.set(0.5);

        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;

        this.tracking = false;

        this.health = health;

    };

    Bullet.prototype = Object.create(Phaser.Sprite.prototype);
    Bullet.prototype.constructor = Bullet;

    Bullet.prototype.fire = function (x, y, rotation, speed) {

        this.reset(x, y);
        this.scale.set(1);

        this.game.physics.arcade.velocityFromRotation(rotation, speed, this.body.velocity);

        this.rotation = rotation;

    };

    Bullet.prototype.update = function () {
        if (this.tracking) {
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }
    };

    Weapon.SimpleBullet = function (game) {

        Phaser.Group.call(this, game, game.world, 'Simple Bullet', false, true, Phaser.Physics.ARCADE);

        this.nextFire = 0;
        this.bulletSpeed = 500;
        this.fireRate = 200;

        for (var i = 0; i < 64; i++) {
            this.add(new Bullet(game, 'pbullet', 1), true);
        }

        return this;

    };


    Weapon.SimpleBullet.prototype = Object.create(Phaser.Group.prototype);
    Weapon.SimpleBullet.prototype.constructor = Weapon.SimpleBullet;

    Weapon.SimpleBullet.prototype.fire = function (source) {

      if (this.game.time.time < this.nextFire) {return;}

      var offset = this.game.physics.arcade.velocityFromRotation(source.rotation, 20);
      var x = source.x + offset.x;
      var y = source.y + offset.y;

      this.getFirstExists(false).fire(x, y, source.rotation, this.bulletSpeed);

      this.nextFire = this.game.time.time + this.fireRate;
    };

    Weapon.EnemyBallBullet = function (game) {

        Phaser.Group.call(this, game, game.world, 'Enemy Ball Bullet', false, true, Phaser.Physics.ARCADE);

        this.nextFire = 0;
        this.bulletSpeed = 200;
        this.fireRate = 800;

        for (var i = 0; i < 64; i++) {
            this.add(new Bullet(game, 'eball', 2), true);
        }

        return this;
    };

    Weapon.EnemyBallBullet.prototype = Object.create(Phaser.Group.prototype);
    Weapon.EnemyBallBullet.prototype.constructor = Weapon.EnemyBallBullet;

    Weapon.EnemyBallBullet.prototype.fire = function(source) {

        if (this.game.time.time < this.nextFire) {return;}

        var offset = this.game.physics.arcade.velocityFromRotation(source.rotation, 15);
        var x = source.x + offset.x;
        var y = source.y + offset.y;

        this.getFirstExists(false).fire(x, y, source.rotation, this.bulletSpeed);

        this.nextFire = this.game.time.time + this.fireRate;
    };

    var PhaserGame = function () {

        this.background = null;
        this.foreground = null;

        this.player = null;
        this.enemies = null;
        this.cursors = null;
        this.speed = 100;
        this.hpDisplay = null;

        this.walls = null;

        this.weapons = [];
        this.currentWeapon = 0;
        this.weaponName = null;

    };

    PhaserGame.prototype = {

        init: function () {
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.stage.backgroundColor = 0x777777;
        },

        preload: function () {

            this.load.image('logo', 'phaser.png');
            //this.load.image('character', 'characterplaceholder.png');
            this.load.image('character', 'SRCharacter.png');
            this.load.image('hoverer', 'SRHoverer.png');
            this.load.image('shambler', 'SRshambler.png');
            //this.load.image('smlenemy', 'smallenemyplaceholder.png');
            this.load.image('drifter', 'SRdrifter.png');
            this.load.image('enemy', 'basicenemyplaceholder.png');
            //this.load.image('medenemy', 'mediumenemyplaceholder.png');
            this.load.image('lrgenemy', 'largeenemyplaceholder.png');
            this.load.image('wall', 'wallplaceholder.png');
            this.load.image('pbullet', 'pbullet.png');
            this.load.image('eball', 'eball.png');

        },

        create: function () {

            this.walls = game.add.group();

            this.walls.enableBody = true;

            //creating the horiz walls
            var xPos = 0;
            while (xPos < this.world.width) {
                var walltile = this.walls.create(xPos, 0, 'wall');
                walltile.body.immovable = true;
                walltile = this.walls.create(xPos, this.world.height - 40, 'wall');
                walltile.body.immovable = true;
                xPos = xPos + 40;
            }
            //creating the vertical walls
            var yPos = 40;
            while (yPos < this.world.height - 40) {
                var walltile = this.walls.create(0, yPos, 'wall');
                walltile.body.immovable = true;
                walltile = this.walls.create(this.world.width - 40, yPos, 'wall');
                walltile.body.immovable = true;
                yPos = yPos + 40;
            }

            this.weapons.push(new Weapon.SimpleBullet(this.game)); //0

            this.currentWeapon = 0;

            for (var i = 1; i < this.weapons.length; i++) {
                this.weapons[i].visible = false;
            }

            this.player = this.add.sprite(this.world.centerX - 120, this.world.centerY - 20, 'character');
            this.player.anchor.setTo(0.5, 0.5);

            this.physics.arcade.enable(this.player);

            this.player.health = 5;

            this.player.hurt = function (damage) {
                this.health -= damage;

                if (this.health < 1) {
                    this.kill()
                    return false;
                } else return true;
            }

            this.hpDisplay = this.add.text(20, 570, 'PLAYER HEALTH: *****');

            this.enemies = new Enemy.Controller(this);

            this.cursors = this.input.keyboard.createCursorKeys();
            this.cursors.pointer = this.input.activePointer;
        },

        update: function () {

            //collision
            var touchWall = this.physics.arcade.collide(this.player, this.walls);
            var bulletWall = this.physics.arcade.collide(this.weapons[0], this.walls, this.bulletWallHandler);

            //health display
            var hpText = 'PLAYER HEALTH: '
            for (var i = 0; i < this.player.health; i++) {
              hpText = hpText + '*'
            }
            this.hpDisplay.setText(hpText);

            //control
            this.player.body.velocity.set(0);

            if (this.cursors.left.isDown) {
                this.player.body.velocity.x = -100;
            } else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = 100;
            }
            if (this.cursors.up.isDown) {
                this.player.body.velocity.y = -100;
            } else if (this.cursors.down.isDown) {
                this.player.body.velocity.y = 100;
            }

            if (this.cursors.pointer.isDown) {
                this.weapons[this.currentWeapon].fire(this.player);
            }

            //rotation
            this.player.rotation = this.physics.arcade.angleToPointer(this.player);

            //enemies
            this.enemies.update();

        },

        onEnemyCollide: function (player, enemy) {

            player.hurt(1);

            enemy.body.velocity.x = 0;
            enemy.body.velocity.y = 0;

            var bump = game.physics.arcade.velocityFromRotation(enemy.rotation, 20);

            if (player.x + bump.x > 50 && player.x + bump.x < game.world.width - 50) player.x += bump.x;
            if (player.y + bump.y > 50 && player.y + bump.y < game.world.height - 50) player.y += bump.y;

            if (enemy.x - bump.x > 50 && enemy.x - bump.x < game.world.width - 50) enemy.x -= bump.x;
            if (enemy.y - bump.y > 50 && enemy.y - bump.y < game.world.height - 50) enemy.y -= bump.y;
        },

        bulletWallHandler: function (bullet, wall) {

            bullet.kill();

        },

        bulletEnemyHandler: function (enemy, bullet) {

            bullet.kill();
            if (!enemy.enemyInfo.damage(bullet.health)) {

              enemy.body.velocity.x = 0;
              enemy.body.velocity.y = 0;

              var bump = game.physics.arcade.velocityFromRotation(bullet.rotation, 10);

              if (enemy.x + bump.x > 50 && enemy.x + bump.x < game.world.width - 50) enemy.x += bump.x;
              if (enemy.y + bump.y > 50 && enemy.y + bump.y < game.world.height - 50) enemy.y += bump.y;
            }
        },

        bulletPlayerHandler: function (player, bullet) {

            bullet.kill();

            if (player.hurt(bullet.health)) {
                var bump = game.physics.arcade.velocityFromRotation(bullet.rotation, 10);

                if (player.x + bump.x > 50 && player.x + bump.x < game.world.width - 50) player.x += bump.x;
                if (player.y + bump.y > 50 && player.y + bump.y < game.world.height - 50) player.y += bump.y;
            }
        }

    };

    game.state.add('Game', PhaserGame, true);
};
