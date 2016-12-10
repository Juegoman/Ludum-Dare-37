window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

    var Weapon = {};

    var Enemy = {};

    Enemy.

    var Bullet = function (game, key) {
        //health of bullets == the damage the bullet inflicts

        Phaser.Sprite.call(this, game, 0, 0, key);

        this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

        this.anchor.set(0.5);

        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;

        this.tracking = false;

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
        this.health = 1;

        for (var i = 0; i < 64; i++) {
          this.add(new Bullet(game, 'pbullet'), true);
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



    var PhaserGame = function () {

        this.background = null;
        this.foreground = null;

        this.player = null;
        this.enemies = null;
        this.cursors = null;
        this.speed = 100;

        this.walls = null;

        this.weapons = [];
        this.currentWeapon = 0;
        this.weaponName = null;

    };

    PhaserGame.prototype = {

        init: function () {
            this.physics.startSystem(Phaser.Physics.ARCADE);
        },

        preload: function () {

            this.load.image('logo', 'phaser.png');
            //this.load.image('character', 'characterplaceholder.png');
            this.load.image('character', 'SRCharacter.png');
            this.load.image('smlenemy', 'smallenemyplaceholder.png');
            this.load.image('enemy', 'basicenemyplaceholder.png');
            this.load.image('medenemy', 'mediumenemyplaceholder.png');
            this.load.image('lrgenemy', 'largeenemyplaceholder.png');
            this.load.image('wall', 'wallplaceholder.png');
            this.load.image('pbullet', 'pbullet.png');

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

            this.weapons.push(new Weapon.SimpleBullet(this.game));

            this.currentWeapon = 0;

            for (var i = 1; i < this.weapons.length; i++) {
                this.weapons[i].visible = false;
            }

            this.player = this.add.sprite(this.world.centerX - 120, this.world.centerY - 20, 'character');
            this.player.anchor.setTo(0.5, 0.5);

            this.physics.arcade.enable(this.player);

            this.player.health = 3;



            //this.enemy = this.add.sprite(this.world.centerX + 80, this.world.centerY - 20, 'enemy');
            //this.enemy.anchor.setTo(0.5, 0.5);

            //this.physics.arcade.enable(this.enemy);

            //this.enemy.health = 3;
            //this.enemy.AITimer = 0;

            this.cursors = this.input.keyboard.createCursorKeys();
            this.cursors.pointer = this.input.activePointer;

            console.dir(this.cursors);
        },

        update: function () {

            //collision
            var touchWall = this.physics.arcade.collide(this.player, this.walls);
            //var enemyWall = this.physics.arcade.collide(this.enemy, this.walls);
            //var touchEnemy = this.physics.arcade.collide(this.player, this.enemy, this.onEnemyCollide);
            var bulletWall = this.physics.arcade.collide(this.weapons[0], this.walls, this.bulletWallHandler);
            //var bulletEnemy = this.physics.arcade.collide(this.weapons[0], this.enem, this.bulletEnemyHandler);

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

            //enemyAI
            // if (this.enemy.AITimer === 0) {
            //     this.enemy.rotation = this.physics.arcade.moveToObject(this.enemy, this.player, 50);
            //     this.enemy.AITimer = 15;
            // } else {
            //   this.enemy.AITimer -= 1;
            // }

        },

        // onEnemyCollide: function (player, enemy) {
        //
        //     player.health -= 1;
        //     enemy.body.velocity.x = 0;
        //     enemy.body.velocity.y = 0;
        //
        //     var bump = game.physics.arcade.velocityFromRotation(enemy.rotation, 20);
        //
        //     if (player.x + bump.x > 50 && player.x + bump.x < game.world.width - 50) player.x += bump.x;
        //     if (player.y + bump.y > 50 && player.y + bump.y < game.world.height - 50) player.y += bump.y;
        //
        //     if (enemy.x - bump.x > 50 && enemy.x - bump.x < game.world.width - 50) enemy.x -= bump.x;
        //     if (enemy.y - bump.y > 50 && enemy.y - bump.y < game.world.height - 50) enemy.y -= bump.y;
        // },

        bulletWallHandler: function (bullet, wall) {

            bullet.kill();

        },

        // bulletEnemyHandler: function (enemy, bullet) {
        //
        //     enemy.health -= bullet.health;
        //     bullet.kill();
        //
        //     if (enemy.health <= 0) {
        //       enemy.kill();
        //     }
        //
        //     enemy.body.velocity.x = 0;
        //     enemy.body.velocity.y = 0;
        //
        //     var bump = game.physics.arcade.velocityFromRotation(bullet.rotation, 10);
        //
        //     if (enemy.x + bump.x > 50 && enemy.x + bump.x < game.world.width - 50) enemy.x += bump.x;
        //     if (enemy.y + bump.y > 50 && enemy.y + bump.y < game.world.height - 50) enemy.y += bump.y;
        //
        //
        //
        // }

    };

    game.state.add('Game', PhaserGame, true);
};
