window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

    var WEAPONKEYS = ['pbullet', 'pball', 'pmissile', 'plaser', 'pwave'];

    var globalEmitter = null;

    var Weapon = {};

    var Enemy = {};

    function getSpawnpoint(player) {
        result = {};
        invalidSpawn = true;
        var x, y;
        while (invalidSpawn) {
            //get a number 0-3
            var side = Math.floor(Math.random() * 4);
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
            if (game.physics.arcade.distanceToXY(player, x, y) > 100) invalidSpawn = false;
        }
        result.x = x;
        result.y = y;
        return result;
    }

    function spawnEnemy(e, health) {

      spawnpoint = getSpawnpoint(e.player);

      e.enemy.x = spawnpoint.x;
      e.enemy.y = spawnpoint.y;

      e.health = health;
      e.enemy.alive = true;
      e.enemy.exists = true;
      e.enemy.visible = true;
      if (e.weapon) e.weapon.reset();
      if (e.missile) e.missile.reset();
      e.AITimer = 15;

    }

    Enemy.Controller = function(game) {

        this.game = game;
        this.wave = 0;
        this.shamblers = [];
        var id = 0;
        var i;
        for (i = 0; i < 80; i++) {
            this.shamblers.push(new Enemy.Shambler(game, this, id));
            id += 1;
        }
        this.hoverers = [];
        for (i = 0; i < 30; i++) {
            this.hoverers.push(new Enemy.Hoverer(game, this, id));
            id += 1;
        }
        this.drifters = [];
        for (i = 0; i < 20; i++) {
            this.drifters.push(new Enemy.Drifter(game, this, id));
            id += 1;
        }
        this.guardians = [];
        for (i = 0; i < 3; i++) {
            this.guardians.push(new Enemy.Guardian(game, this, id));
            id += 1;
        }
        this.activeEnemies = [];
        this.player = game.player;



    };

    Enemy.Controller.prototype.update = function () {

        if (this.activeEnemies.length === 0) {
            this.wave += 1;
            for (var i = 0; i < Math.floor(3 + this.wave / 5); i++) {
                var pick = Math.floor(Math.random()*10);
                if (pick < 7) {
                    var shambler = this.shamblers.pop();
                    shambler.spawn();
                    this.activeEnemies.push(shambler);
                } else if (pick < 9) {
                    var hoverer = this.hoverers.pop();
                    hoverer.spawn();
                    this.activeEnemies.push(hoverer);
                } else {
                    var drifter = this.drifters.pop();
                    drifter.spawn();
                    this.activeEnemies.push(drifter);
                }
            }
            if (this.wave % 5 === 0) {
                var guardian = this.guardians.pop();
                guardian.spawn();
                this.activeEnemies.push(guardian);
            }
        }
        this.activeEnemies.forEach(function(enemy) {
            enemy.update();
        });

    };

    // Enemy.Controller.prototype.cleanUpEnemy = function (enemy) {
    //     console.log(enemy.type + ' died!');
    //     console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
    //     this.activeEnemies.splice(this.activeEnemies.indexOf(enemy), 1);
    //     enemy.enemy.exists = false;
    //     if (enemy.type === 0) this.shamblers.push(enemy);
    //     else if (enemy.type === 1) this.hoverers.push(enemy);
    //     else if (enemy.type === 2) this.drifters.push(enemy);
    //     else this.guardians.push(enemy);
    //     console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
    // };

    Enemy.Controller.prototype.cleanUpHoverer = function (e) {
        console.log('Hoverer died!');
        console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
        var toMove = this.activeEnemies.findIndex(function (element) { return element.id === e.id; });
        console.log(e.id, this.activeEnemies[toMove].id);
        this.activeEnemies.splice(toMove, 1);
        e.enemy.exists = false;
        this.hoverers.push(e);
        console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
    };

    Enemy.Controller.prototype.cleanUpShambler = function (e) {
        console.log('Shambler died!');
        console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
        var toMove = this.activeEnemies.findIndex(function (element) { return element.id === e.id; });
        console.log(e.id, this.activeEnemies[toMove].id);
        this.activeEnemies.splice(toMove, 1);
        e.enemy.exists = false;
        this.shamblers.push(e);
        console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
    };

    Enemy.Controller.prototype.cleanUpDrifter = function (e) {
        console.log('Drifter died!');
        console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
        var toMove = this.activeEnemies.findIndex(function (element) { return element.id === e.id; });
        console.log(e.id, this.activeEnemies[toMove].id);
        this.activeEnemies.splice(toMove, 1);
        e.enemy.exists = false;
        this.drifters.push(e);
        console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
    };

    Enemy.Controller.prototype.cleanUpGuardian = function (e) {
        console.log('Guardian died!');
        console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
        var toMove = this.activeEnemies.findIndex(function (element) { return element.id === e.id; });
        console.log(e.id, this.activeEnemies[toMove].id);
        this.activeEnemies.splice(toMove, 1);
        e.enemy.exists = false;
        this.guardians.push(e);
        console.log(this.shamblers.length, this.hoverers.length, this.drifters.length, this.guardians.length, this.activeEnemies.length);
    };

    Enemy.Hoverer = function (game, controller, id) {

        this.id = id;
        this.game = game;
        this.controller = controller;
        this.health = 3;
        this.player = game.player;
        this.AITimer = 15;
        this.type = 1;
        this.weapon = new Weapon.EnemyBallBullet(game);

        this.enemy = game.add.sprite(-100, -100, 'hoverer');
        this.enemy.enemyInfo = this;
        this.enemy.exists = false;
        this.enemy.anchor.set(0.5);

        this.enemy.autoCull = true;
        this.enemy.outOfCameraBoundsKill = true;

        game.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    };

    Enemy.Hoverer.prototype.spawn = function () {

        spawnEnemy(this, 3);

    };

    Enemy.Hoverer.prototype.damage = function(damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.enemy.kill();

            var roll = Math.floor(Math.random() * 100) + 1;
            if (roll >= 70) {
                roll = Math.floor(Math.random() * 100) + 1;
                if (roll <= 35) {
                    this.game.powerups.addPowerup('health', 0, this.enemy.x, this.enemy.y);
                } else if (roll <= 70) {
                    this.game.powerups.addPowerup('shield', 1, this.enemy.x, this.enemy.y);
                } else if (roll <= 80) {
                    this.game.powerups.addPowerup('power', 2, this.enemy.x, this.enemy.y);
                } else if (roll <= 90) {
                    this.game.powerups.addPowerup('speed', 3, this.enemy.x, this.enemy.y);
                } else {
                    this.game.powerups.addPowerup('shot', 4, this.enemy.x, this.enemy.y);
                }
            }


            this.controller.cleanUpHoverer(this);

            return true;
        }

        return false;
    };

    Enemy.Hoverer.prototype.update = function() {

        game.physics.arcade.collide(this.enemy, this.game.walls);
        game.physics.arcade.collide(this.player, this.enemy, this.game.onEnemyCollide);
        for (var i = 0; i < this.game.weapons.length; i++) {
            if (i != 3) game.physics.arcade.collide(this.enemy, this.game.weapons[i], this.game.bulletEnemyHandler);
        }
        game.physics.arcade.overlap(this.enemy, this.game.weapons[3], this.game.laserEnemyHandler);
        game.physics.arcade.collide(this.player, this.weapon, this.game.bulletPlayerHandler);

        if (this.AITimer === 0) {
            this.enemy.rotation = game.physics.arcade.angleBetween(this.enemy, this.player);

            this.weapon.fire(this.enemy);

            var movRot = this.enemy.rotation;
            if (game.physics.arcade.distanceBetween(this.enemy, this.player) < 300) {
                if (Math.random() < 0.5) {
                    movRot += (0.75 * Math.PI);
                    if (movRot > Math.PI) movRot -= 2 * Math.PI;
                } else {
                    movRot -= (0.75 * Math.PI);
                    if (movRot < -1 * Math.PI) movRot += 2 * Math.PI;
                }
            } else {
                if (Math.random() < 0.5) {
                    movRot += (0.25 * Math.PI);
                    if (movRot > Math.PI) movRot -= 2 * Math.PI;
                } else {
                    movRot -= (0.25 * Math.PI);
                    if (movRot < Math.PI) movRot += 2 * Math.PI;
                }
            }
            game.physics.arcade.velocityFromRotation(movRot, 75, this.enemy.body.velocity);

            this.AITimer = 15;
        } else {
            this.AITimer -= 1;
        }
    };

    Enemy.Shambler = function (game, controller, id) {

        this.id = id;
        this.game = game;
        this.controller = controller;
        this.health = 5;
        this.player = game.player;
        this.AITimer = 15;
        this.type = 0;

        this.enemy = game.add.sprite(-100, -100, 'shambler');
        this.enemy.enemyInfo = this;
        this.enemy.exists = false;
        this.enemy.anchor.set(0.5);
        this.enemy.animations.add('walk', [0, 1, 2, 3, 4, 5, 6 ,7], 10, true);
        this.enemy.animations.add('attack', [8, 9, 10, 11], 10, false);

        this.enemy.autoCull = true;
        this.enemy.outOfCameraBoundsKill = true;

        game.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    };

    Enemy.Shambler.prototype.spawn = function () {

        spawnEnemy(this, 5);

    };

    Enemy.Shambler.prototype.damage = function(damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.enemy.kill();
            var roll = Math.floor(Math.random() * 100) + 1;
            if (roll >= 80) {
                roll = Math.floor(Math.random() * 100) + 1;
                if (roll <= 50) this.game.powerups.addPowerup('health', 0, this.enemy.x, this.enemy.y);
                else this.game.powerups.addPowerup('shield', 1, this.enemy.x, this.enemy.y);
            }

            this.controller.cleanUpShambler(this);

            return true;
        }

        return false;
    };

    Enemy.Shambler.prototype.update = function() {

      game.physics.arcade.collide(this.enemy, this.game.walls);
      game.physics.arcade.collide(this.player, this.enemy, this.game.onEnemyCollide);
      for (var i = 0; i < this.game.weapons.length; i++) {
          if (i != 3) game.physics.arcade.collide(this.enemy, this.game.weapons[i], this.game.bulletEnemyHandler);
      }
      game.physics.arcade.overlap(this.enemy, this.game.weapons[3], this.game.laserEnemyHandler);

      if (this.AITimer === 0) {
          this.enemy.animations.play('walk');
          this.enemy.rotation = game.physics.arcade.moveToObject(this.enemy, this.player, 50);
          this.AITimer = 15;
      } else {
        this.AITimer -= 1;
      }

    };

    Enemy.Drifter = function (game, controller, id) {

        this.id = id;
        this.game = game;
        this.controller = controller;
        this.health = 7;
        this.player = game.player;
        this.AITimer = 15;
        this.type = 2;
        this.weapon = new Weapon.EnemyBurstGun(game);

        this.enemy = game.add.sprite(-100, -100, 'drifter');
        this.enemy.enemyInfo = this;
        this.enemy.exists = false;
        this.enemy.anchor.set(0.5);

        this.enemy.autoCull = true;
        this.enemy.outOfCameraBoundsKill = true;

        game.physics.enable(this.enemy, Phaser.Physics.ARCADE);

    };

    Enemy.Drifter.prototype.spawn = function () {

        spawnEnemy(this, 7);

    };

    Enemy.Drifter.prototype.damage = function(damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.enemy.kill();
            var roll = Math.floor(Math.random() * 100) + 1;
            if (roll >= 50) {
                roll = Math.floor(Math.random() * 100) + 1;
                if (roll <= 20) {
                    this.game.powerups.addPowerup('health', 0, this.enemy.x, this.enemy.y);
                } else if (roll <= 40) {
                    this.game.powerups.addPowerup('shield', 1, this.enemy.x, this.enemy.y);
                } else if (roll <= 60) {
                    this.game.powerups.addPowerup('power', 2, this.enemy.x, this.enemy.y);
                } else if (roll <= 80) {
                    this.game.powerups.addPowerup('speed', 3, this.enemy.x, this.enemy.y);
                } else {
                    this.game.powerups.addPowerup('shot', 4, this.enemy.x, this.enemy.y);
                }
            }

            this.controller.cleanUpDrifter(this);

            return true;
        }

        return false;
    };

    Enemy.Drifter.prototype.update = function() {

        game.physics.arcade.collide(this.enemy, this.game.walls);
        game.physics.arcade.collide(this.player, this.enemy, this.game.onEnemyCollide);
        for (var i = 0; i < this.game.weapons.length; i++) {
            if (i != 3) game.physics.arcade.collide(this.enemy, this.game.weapons[i], this.game.bulletEnemyHandler);
        }
        game.physics.arcade.overlap(this.enemy, this.game.weapons[3], this.game.laserEnemyHandler);
        game.physics.arcade.collide(this.player, this.weapon, this.game.bulletPlayerHandler);

        if (this.AITimer === 0) {
            this.enemy.rotation = game.physics.arcade.angleBetween(this.enemy, this.player);

            this.weapon.fire(this.enemy);

            var movRot = this.enemy.rotation;
            if (game.physics.arcade.distanceBetween(this.enemy, this.player) < 200) {
                if (Math.random() < 0.5) {
                    movRot += (0.75 * Math.PI);
                    if (movRot > Math.PI) movRot -= 2 * Math.PI;
                } else {
                    movRot -= (0.75 * Math.PI);
                    if (movRot < -1 * Math.PI) movRot += 2 * Math.PI;
                }
            } else {
                if (Math.random() < 0.5) {
                    movRot += (0.25 * Math.PI);
                    if (movRot > Math.PI) movRot -= 2 * Math.PI;
                } else {
                    movRot -= (0.25 * Math.PI);
                    if (movRot < Math.PI) movRot += 2 * Math.PI;
                }
            }
            game.physics.arcade.velocityFromRotation(movRot, 60, this.enemy.body.velocity);

            this.AITimer = 15;
        } else {
            this.AITimer -= 1;
        }

    };

    Enemy.Guardian = function (game, controller, id) {

        this.id = id;
        this.game = game;
        this.controller = controller;
        this.health = 20;
        this.player = game.player;
        this.AITimer = 15;
        this.type = 3;
        this.weapon = new Weapon.GuardianCannon(game);
        this.missile = new Weapon.GuardianMissile(game);

        this.enemy = game.add.sprite(-100, -100, 'guardian');
        this.enemy.enemyInfo = this;
        this.enemy.exists = false;
        this.enemy.anchor.set(0.5);

        this.enemy.autoCull = true;
        this.enemy.outOfCameraBoundsKill = true;

        this.enemy.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);

        this.turret = game.add.sprite(-100, -100, 'guardiancannon');
        this.turret.exists = false;
        this.turret.anchor.set(0.5);

        this.turret.autoCull = true;
        this.turret.outOfCameraBoundsKill = true;

        game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
    };

    Enemy.Guardian.prototype.spawn = function () {
        spawnEnemy(this, 20);

        this.turret.alive = true;
        this.turret.exists = true;
        this.turret.visible = true;

        offset = game.physics.arcade.velocityFromRotation(this.enemy.rotation + (Math.PI * 0.5), 26);
        this.turret.x = this.enemy.x + offset.x;
        this.turret.y = this.enemy.y + offset.y;
    };

    Enemy.Guardian.prototype.damage = function (damage) {
        this.health -= damage;

        if (this.health <= 0) {
            this.turret.kill();
            this.enemy.kill();
            weaponpool = [];
            for (var i = 1; i < 5 ; i++) {
                if (!this.game.weapons[i].available) weaponpool.push(i);
            }
            if (weaponpool.length > 0) {
                if (weaponpool.length === 1) this.game.powerups.addPowerup(WEAPONKEYS[weaponpool[0]], weaponpool[0]+4, this.enemy.x, this.enemy.y);
                else {
                    roll = Math.floor(Math.random() * weaponpool.length);
                    this.game.powerups.addPowerup(WEAPONKEYS[weaponpool[0]], weaponpool[0]+4, this.enemy.x, this.enemy.y);
                }
            } else {
                roll = Math.floor(Math.random() * 100) + 1;
                if (roll <= 5) {
                    this.game.powerups.addPowerup('health', 0, this.enemy.x, this.enemy.y);
                } else if (roll <= 10) {
                    this.game.powerups.addPowerup('shield', 1, this.enemy.x, this.enemy.y);
                } else if (roll <= 40) {
                    this.game.powerups.addPowerup('power', 2, this.enemy.x, this.enemy.y);
                } else if (roll <= 70) {
                    this.game.powerups.addPowerup('speed', 3, this.enemy.x, this.enemy.y);
                } else {
                    this.game.powerups.addPowerup('shot', 4, this.enemy.x, this.enemy.y);
                }
            }


            this.controller.cleanUpGuardian(this);

            return true;
        }

        return false;
    };

    Enemy.Guardian.prototype.update = function () {

        game.physics.arcade.collide(this.enemy, this.game.walls);
        game.physics.arcade.collide(this.player, this.enemy, this.game.onEnemyCollide);
        for (var i = 0; i < this.game.weapons.length; i++) {
            if (i != 3) game.physics.arcade.collide(this.enemy, this.game.weapons[i], this.game.bulletEnemyHandler);
        }
        game.physics.arcade.overlap(this.enemy, this.game.weapons[3], this.game.laserEnemyHandler);
        game.physics.arcade.collide(this.player, this.weapon, this.game.bulletPlayerHandler);
        game.physics.arcade.collide(this.player, this.missile, this.game.bulletPlayerHandler);

        offset = game.physics.arcade.velocityFromRotation(this.enemy.rotation + (Math.PI * 0.5), 26);
        this.turret.x = this.enemy.x + offset.x;
        this.turret.y = this.enemy.y + offset.y;

        this.turret.rotation = game.physics.arcade.angleBetween(this.turret, this.player);

        if (this.AITimer === 0) {
            this.enemy.rotation = game.physics.arcade.angleBetween(this.enemy, this.player);
            distance = game.physics.arcade.distanceBetween(this.enemy, this.player);
            if (distance < 200) {
                game.physics.arcade.velocityFromRotation(this.enemy.rotation, -40, this.enemy.body.velocity);
                this.enemy.animations.play('walk');
            } else if (distance > 300) {
                game.physics.arcade.velocityFromRotation(this.enemy.rotation, 40, this.enemy.body.velocity);
                this.enemy.animations.play('walk');
            } else {
                this.enemy.body.velocity.x = 0;
                this.enemy.body.velocity.y = 0;
                this.enemy.animations.stop();
                this.enemy.frame = 0;
            }

            this.weapon.fire(this.turret);
            this.missile.fire(this.enemy);

            this.AITimer = 15;
        } else {
          this.AITimer -= 1;
        }
    };

    var Bullet = function (game, key, damage, scale) {

        Phaser.Sprite.call(this, game, 0, 0, key);

        this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

        this.game = game;

        this.anchor.set(0.5);

        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;

        this.scale.x = scale;
        this.scale.y = scale;

        this.damageVal = damage;

    };

    Bullet.prototype = Object.create(Phaser.Sprite.prototype);
    Bullet.prototype.constructor = Bullet;

    Bullet.prototype.fire = function (x, y, rotation, speed) {

        this.reset(x, y);

        this.game.physics.arcade.velocityFromRotation(rotation, speed, this.body.velocity);

        this.rotation = rotation;

    };

    Bullet.prototype.update = function () {
        this.game.physics.arcade.collide(this, this.game.walls, this.game.bulletWallHandler);
    };

    var Missile = function (game, key, damage) {

        Phaser.Sprite.call(this, game, 0, 0, key);

        this.game = game;

        this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

        this.anchor.set(0.5);

        this.emitter = game.add.emitter(-100, -100, 40);

        this.emitter.makeParticles([ 'fire1', 'fire2', 'fire3', 'smoke' ]);
        this.emitter.setScale(0.5, 2, 0.5, 2);
        this.emitter.gravity = 0;

        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;

        this.damageVal = damage;
    };

    Missile.prototype = Object.create(Phaser.Sprite.prototype);
    Missile.prototype.constructor = Missile;

    Missile.prototype.fire = function (x, y, rotation, speed, accelerates) {
        this.reset(x, y);

        if (accelerates) {
            this.game.physics.arcade.accelerationFromRotation(rotation, speed, this.body.acceleration);
        } else {
            this.game.physics.arcade.velocityFromRotation(rotation, speed, this.body.velocity);
        }

        this.rotation = rotation;
        this.emitter.start(false, 2000, 50);
    };

    Missile.prototype.update = function () {

        this.game.physics.arcade.collide(this, this.game.walls, this.game.bulletWallHandler);

        var px = this.body.velocity.x;
        var py = this.body.velocity.y;

        px *= -1;
        py *= -1;

        this.emitter.minParticleSpeed.set(px, py);
        this.emitter.maxParticleSpeed.set(px, py);

        this.emitter.emitX = this.x;
        this.emitter.emitY = this.y;
    };

    Weapon.Bullet = function (game) {

        Phaser.Group.call(this, game, game.world, 'Bullet', false, true, Phaser.Physics.ARCADE);

        this.upgradeLevels = [0, 0, 0];
        this.powerUpgrades = [1, 1.5, 2, 3, 4];
        this.speedUpgrades = [
                                {speed: 400, rate: 300},
                                {speed: 450, rate: 275},
                                {speed: 500, rate: 250},
                                {speed: 600, rate: 200},
                                {speed: 700, rate: 150}
                             ];

        this.nextFire = 0;
        this.bulletSpeed = this.speedUpgrades[this.upgradeLevels[1]].speed;
        this.fireRate = this.speedUpgrades[this.upgradeLevels[1]].rate;

        this.available = true;

        for (var i = 0; i < 64; i++) {
            this.add(new Bullet(game, 'pbullet', this.powerUpgrades[this.upgradeLevels[0]], 1), true);
        }

        return this;

    };

    Weapon.Bullet.prototype = Object.create(Phaser.Group.prototype);
    Weapon.Bullet.prototype.constructor = Weapon.Bullet;

    Weapon.Bullet.prototype.fire = function (source) {

      if (this.game.time.time < this.nextFire) {return;}

      var offset = this.game.physics.arcade.velocityFromRotation(source.rotation - 0.67474429, 19.2);
      var x = source.x + offset.x;
      var y = source.y + offset.y;

      for (var i = 0; i <= this.upgradeLevels[2]; i++) {
          var rotationMod = (Math.random() * (Math.PI / 36)) - (Math.PI / 72);

          this.getFirstExists(false).fire(x, y, source.rotation + rotationMod, this.bulletSpeed);
      }

      this.nextFire = this.game.time.time + this.fireRate;
    };

    Weapon.Bullet.prototype.upgrade = function (type) {
        self = this;

        switch (type) {
          case 0:
              //power
              if (this.upgradeLevels[0] < 4) {
                  this.upgradeLevels[0] += 1;
                  this.forEach(function (b) {
                      b.damageVal = self.powerUpgrades[self.upgradeLevels[0]];
                  });
                  return true;
              } else return false;
          case 1:
              //speed
              if (this.upgradeLevels[1] < 4) {
                  this.upgradeLevels[1] += 1;
                  this.bulletSpeed = this.speedUpgrades[this.upgradeLevels[1]].speed;
                  this.fireRate = this.speedUpgrades[this.upgradeLevels[1]].rate;
                  return true;
              } else return false;
          case 2:
              //shot
              if (this.upgradeLevels[2] < 3) {
                  this.upgradeLevels[2] += 1;
                  return true;
              } else return false;
          default:
            console.error('malformed upgrade? ' + type);
        }
    };

    Weapon.Cannon = function (game) {

        Phaser.Group.call(this, game, game.world, 'Cannon', false, true, Phaser.Physics.ARCADE);

        this.upgradeLevels = [0, 0, 0];
        this.powerUpgrades = [2, 2.5, 3, 4, 5];
        this.speedUpgrades = [
                                {speed: 300, rate: 500},
                                {speed: 350, rate: 450},
                                {speed: 400, rate: 400},
                                {speed: 500, rate: 350},
                                {speed: 600, rate: 300}
                             ];

        this.nextFire = 0;
        this.bulletSpeed = this.speedUpgrades[this.upgradeLevels[1]].speed;
        this.fireRate = this.speedUpgrades[this.upgradeLevels[1]].rate;

        this.available = false;

        for (var i = 0; i < 64; i++) {
            this.add(new Bullet(game, 'pball', this.powerUpgrades[this.upgradeLevels[0]], 1), true);
        }

        return this;
    };

    Weapon.Cannon.prototype = Object.create(Phaser.Group.prototype);
    Weapon.Cannon.prototype.constructor = Weapon.Cannon;

    Weapon.Cannon.prototype.fire = function (source) {

        if (this.game.time.time < this.nextFire) {return;}

        var offset = this.game.physics.arcade.velocityFromRotation(source.rotation - 0.67474429, 19.2);
        var x = source.x + offset.x;
        var y = source.y + offset.y;

        for (var i = 0; i <= this.upgradeLevels[2]; i++) {
            var rotationMod = (Math.random() * (Math.PI / 18)) - (Math.PI / 36);

            this.getFirstExists(false).fire(x, y, source.rotation + rotationMod, this.bulletSpeed);
        }

        this.nextFire = this.game.time.time + this.fireRate;
    };

    Weapon.Cannon.prototype.upgrade = function (type) {
        self = this;

        switch (type) {
          case 0:
              //power
              if (this.upgradeLevels[0] < 4) {
                  this.upgradeLevels[0] += 1;
                  this.forEach(function (b) {
                      b.damageVal = self.powerUpgrades[self.upgradeLevels[0]];
                  });
                  return true;
              } else return false;
          case 1:
              //speed
              if (this.upgradeLevels[1] < 4) {
                  this.upgradeLevels[1] += 1;
                  this.bulletSpeed = this.speedUpgrades[this.upgradeLevels[1]].speed;
                  this.fireRate = this.speedUpgrades[this.upgradeLevels[1]].rate;
                  return true;
              } else return false;
          case 2:
              //shot
              if (this.upgradeLevels[2] < 3) {
                  this.upgradeLevels[2] += 1;
                  return true;
              } else return false;
          default:
            console.error('malformed upgrade? ' + type);
            return false;
        }
    };

    Weapon.Missile = function (game) {

        Phaser.Group.call(this, game, game.world, 'Missile', false, true, Phaser.Physics.ARCADE);

        this.upgradeLevels = [0, 0, 0];
        this.powerUpgrades = [3, 4, 5, 6, 7];
        this.speedUpgrades = [
                                {speed: 40, rate: 800},
                                {speed: 75, rate: 650},
                                {speed: 100, rate: 550},
                                {speed: 150, rate: 450},
                                {speed: 200, rate: 300}
                             ];

        this.nextFire = 0;
        this.bulletSpeed = this.speedUpgrades[this.upgradeLevels[1]].speed;
        this.fireRate = this.speedUpgrades[this.upgradeLevels[1]].rate;

        this.available = false;

        for (var i = 0; i < 64; i++) {
            this.add(new Missile(game, 'pmissile', this.powerUpgrades[this.upgradeLevels[0]]), true);
        }

        return this;
    };

    Weapon.Missile.prototype = Object.create(Phaser.Group.prototype);
    Weapon.Missile.prototype.constructor = Weapon.Missile;

    Weapon.Missile.prototype.fire = function (source) {
        if (this.game.time.time < this.nextFire) {return;}

        var offset = this.game.physics.arcade.velocityFromRotation(source.rotation - 0.67474429, 19.2);
        var x = source.x + offset.x;
        var y = source.y + offset.y;

        for (var i = 0; i <= this.upgradeLevels[2]; i++) {
            var rotationMod = (Math.random() * (Math.PI / 18)) - (Math.PI / 36);

            this.getFirstExists(false).fire(x, y, source.rotation + rotationMod, this.bulletSpeed, true);
        }

        this.nextFire = this.game.time.time + this.fireRate;
    };

    Weapon.Missile.prototype.upgrade = function (type) {
        self = this;

        switch (type) {
          case 0:
              //power
              if (this.upgradeLevels[0] < 4) {
                  this.upgradeLevels[0] += 1;
                  this.forEach(function (b) {
                      b.damageVal = self.powerUpgrades[self.upgradeLevels[0]];
                  });
                  return true;
              } else return false;
          case 1:
              //speed
              if (this.upgradeLevels[1] < 4) {
                  this.upgradeLevels[1] += 1;
                  this.bulletSpeed = this.speedUpgrades[this.upgradeLevels[1]].speed;
                  this.fireRate = this.speedUpgrades[this.upgradeLevels[1]].rate;
                  return true;
              } else return false;
          case 2:
              //shot
              if (this.upgradeLevels[2] < 3) {
                  this.upgradeLevels[2] += 1;
                  return true;
              } else return false;
          default:
            console.error('malformed upgrade? ' + type);
        }
    };

    Weapon.Laser = function (game) {

        Phaser.Group.call(this, game, game.world, 'Laser', false, true, Phaser.Physics.ARCADE);

        this.upgradeLevels = [0, 0, 0];
        this.powerUpgrades = [0.25, 0.5, 0.75, 1, 1.25];
        this.speedUpgrades = [
                                {heatLimit: 100, diss: 1},
                                {heatLimit: 200, diss: 1.5},
                                {heatLimit: 500, diss: 10},
                                {heatLimit: 1000, diss: 25},
                                {heatLimit: 2000, diss: 100}
                             ];

        this.nextFire = 0;
        this.bulletSpeed = 1000;
        this.fireRate = 15;

        this.heat = 0;
        this.heatLimit = this.speedUpgrades[this.upgradeLevels[1]].heatLimit;
        this.heatTick = 45;

        this.overheated = false;

        this.available = true;

        for (var i = 0; i < 64; i++) {
            this.add(new Bullet(game, 'plaser', this.powerUpgrades[this.upgradeLevels[0]], 1), true);
        }

        return this;
    };

    Weapon.Laser.prototype = Object.create(Phaser.Group.prototype);
    Weapon.Laser.prototype.constructor = Weapon.Laser;

    Weapon.Laser.prototype.fire = function (source) {

        if (this.game.time.time < this.nextFire || this.overheated) {return;}

        var offset = this.game.physics.arcade.velocityFromRotation(source.rotation - 0.67474429, 19.2);
        var x = source.x + offset.x;
        var y = source.y + offset.y;

        this.getFirstExists(false).fire(x, y, source.rotation, this.bulletSpeed, true);

        this.heat += 1 + this.upgradeLevels[2];

        this.nextFire = this.game.time.time + this.fireRate;
    };

    Weapon.Laser.prototype.update = function () {
        if (this.heatTick === 0) {
            if (this.heat > 0) {
                if (this.heat > this.heatLimit) this.overheated = true;
                this.heat -= this.speedUpgrades[this.upgradeLevels[1]].diss;
                if (this.overheated && this.heat <= 0) this.overheated = false;
            } else if (this.heat < 0) this.heat = 0;
            this.heatTick = 20;
        } else this.heatTick -= 1;
    };

    Weapon.Laser.prototype.upgrade = function (type) {
        self = this;

        switch (type) {
          case 0:
              //power
              if (this.upgradeLevels[0] < 4) {
                  this.upgradeLevels[0] += 1;
                  this.forEach(function (b) {
                      b.damageVal = self.powerUpgrades[self.upgradeLevels[0]] * self.upgradeLevels[2] + 1;
                  });
                  return true;
              } else return false;
          case 1:
              //speed
              if (this.upgradeLevels[1] < 4) {
                  this.upgradeLevels[1] += 1;
                  this.heatLimit = this.speedUpgrades[this.upgradeLevels[1]].heatLimit;
                  return true;
              } else return false;
          case 2:
              //shot
              if (this.upgradeLevels[2] < 3) {
                  this.upgradeLevels[2] += 1;
                  this.forEach(function (b) {
                      b.scale.y = self.upgradeLevels[2] + 1;
                      b.damageVal = self.powerUpgrades[self.upgradeLevels[0]] * self.upgradeLevels[2] + 1;
                  });
                  return true;
              } else return false;
          default:
            console.error('malformed upgrade? ' + type);
        }
    };

    Weapon.Wave = function (game) {

      Phaser.Group.call(this, game, game.world, 'Wave', false, true, Phaser.Physics.ARCADE);

      this.upgradeLevels = [0, 0, 0];
      this.powerUpgrades = [1, 2, 3, 4, 5];
      this.speedUpgrades = [
                                {speed: 400, rate: 300},
                                {speed: 450, rate: 275},
                                {speed: 500, rate: 250},
                                {speed: 600, rate: 200},
                                {speed: 700, rate: 150}
                           ];

      this.nextFire = 0;
      this.bulletSpeed = this.speedUpgrades[this.upgradeLevels[1]].speed;
      this.fireRate = this.speedUpgrades[this.upgradeLevels[1]].rate;

      this.available = false;

      for (var i = 0; i < 64; i++) {
          this.add(new Bullet(game, 'pwave', this.powerUpgrades[this.upgradeLevels[0]], 1), true);
      }

      return this;
    };

    Weapon.Wave.prototype = Object.create(Phaser.Group.prototype);
    Weapon.Wave.prototype.constructor = Weapon.Wave;

    Weapon.Wave.prototype.fire = function (source) {
        if (this.game.time.time < this.nextFire) {return;}

        var offset = this.game.physics.arcade.velocityFromRotation(source.rotation - 0.67474429, 19.2);
        var x = source.x + offset.x;
        var y = source.y + offset.y;

        if (this.upgradeLevels[2] === 0) {
            this.getFirstExists(false).fire(x, y, source.rotation, this.bulletSpeed);
        } else if (this.upgradeLevels[2] === 1) {
            this.getFirstExists(false).fire(x, y, source.rotation + (Math.PI / 12), this.bulletSpeed);
            this.getFirstExists(false).fire(x, y, source.rotation - (Math.PI / 12), this.bulletSpeed);
        } else if (this.upgradeLevels[2] === 2) {
            this.getFirstExists(false).fire(x, y, source.rotation + (Math.PI / 6), this.bulletSpeed);
            this.getFirstExists(false).fire(x, y, source.rotation - (Math.PI / 6), this.bulletSpeed);
            this.getFirstExists(false).fire(x, y, source.rotation, this.bulletSpeed);
        } else {
            this.getFirstExists(false).fire(x, y, source.rotation, this.bulletSpeed);
            this.getFirstExists(false).fire(x, y, source.rotation + (Math.PI / 6), this.bulletSpeed);
            this.getFirstExists(false).fire(x, y, source.rotation - (Math.PI / 6), this.bulletSpeed);
            this.getFirstExists(false).fire(x, y, source.rotation + (Math.PI / 3), this.bulletSpeed);
            this.getFirstExists(false).fire(x, y, source.rotation - (Math.PI / 3), this.bulletSpeed);
        }

        this.nextFire = this.game.time.time + this.fireRate;
    };

    Weapon.Wave.prototype.upgrade = function (type) {
        self = this;

        switch (type) {
          case 0:
              //power
              if (this.upgradeLevels[0] < 4) {
                  this.upgradeLevels[0] += 1;
                  this.forEach(function (b) {
                      b.damageVal = self.powerUpgrades[self.upgradeLevels[0]];
                  });
                  return true;
              } else return false;
          case 1:
              //speed
              if (this.upgradeLevels[1] < 4) {
                  this.upgradeLevels[1] += 1;
                  this.bulletSpeed = this.speedUpgrades[this.upgradeLevels[1]].speed;
                  this.fireRate = this.speedUpgrades[this.upgradeLevels[1]].rate;
                  return true;
              } else return false;
          case 2:
              //shot
              if (this.upgradeLevels[2] < 3) {
                  this.upgradeLevels[2] += 1;
                  return true;
              } else return false;
          default:
            console.error('malformed upgrade? ' + type);
        }
    };

    Weapon.EnemyBallBullet = function (game) {

        Phaser.Group.call(this, game, game.world, 'Enemy Ball Bullet', false, true, Phaser.Physics.ARCADE);

        this.nextFire = this.game.time.time + 1000;
        this.bulletSpeed = 200;
        this.fireRate = 1000;

        for (var i = 0; i < 32; i++) {
            this.add(new Bullet(game, 'eball', 2, 1), true);
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

    Weapon.EnemyBallBullet.prototype.reset = function() {
        this.nextFire = this.game.time.time + 1000;
    };

    Weapon.EnemyBurstGun = function(game) {

        Phaser.Group.call(this, game, game.world, 'Enemy Burst Gun', false, true, Phaser.Physics.ARCADE);

        this.nextFire = this.game.time.time + 1000;
        this.bulletSpeed = 350;
        this.fireRate = [2000, 100, 100, 100, 100];
        this.currentFireStep = 0;

        for (var i = 0; i < 20; i++) {
            this.add(new Bullet(game, 'ebullet', 1, 1), true);
        }

        return this;
    };

    Weapon.EnemyBurstGun.prototype = Object.create(Phaser.Group.prototype);
    Weapon.EnemyBurstGun.prototype.constructor = Weapon.EnemyBurstGun;

    Weapon.EnemyBurstGun.prototype.fire = function(source) {

        if (this.game.time.time < this.nextFire) {return;}

        var offset = this.game.physics.arcade.velocityFromRotation(source.rotation, 15);
        var x = source.x + offset.x;
        var y = source.y + offset.y;

        var rotationMod = (Math.random() * (Math.PI / 6)) - (Math.PI / 12);

        this.getFirstExists(false).fire(x, y, source.rotation + rotationMod, this.bulletSpeed);

        this.currentFireStep += 1;
        if (this.currentFireStep === this.fireRate.length) this.currentFireStep = 0;

        this.nextFire = this.game.time.time + this.fireRate[this.currentFireStep];
    };

    Weapon.EnemyBurstGun.prototype.reset = function() {
        this.nextFire = this.game.time.time + 1000;
        this.currentFireStep = 0;
    };

    Weapon.GuardianCannon = function(game) {

        Phaser.Group.call(this, game, game.world, 'Guardian Cannon', false, true, Phaser.Physics.ARCADE);

        this.nextFire = this.game.time.time + 1000;
        this.bulletSpeed = 300;
        this.fireRate = 1500;

        for (var i = 0; i < 32; i++) {
            this.add(new Bullet(game, 'eball', 5, 2), true);
        }

        return this;
    };

    Weapon.GuardianCannon.prototype = Object.create(Phaser.Group.prototype);
    Weapon.GuardianCannon.prototype.constructor = Weapon.GuardianCannon;

    Weapon.GuardianCannon.prototype.fire = function(source) {

        if (this.game.time.time < this.nextFire) {return;}

        var offset = this.game.physics.arcade.velocityFromRotation(source.rotation, 22);

        var x = source.x + offset.x;
        var y = source.y + offset.y;

        var rotationMod = (Math.random() * (Math.PI / 24)) - (Math.PI / 48);

        this.getFirstExists(false).fire(x, y, source.rotation + rotationMod, this.bulletSpeed);

        this.nextFire = this.game.time.time + this.fireRate;
    };

    Weapon.GuardianCannon.prototype.reset = function() {
        this.nextFire = this.game.time.time + 1000;
    };

    Weapon.GuardianMissile = function(game) {

        Phaser.Group.call(this, game, game.world, 'Guardian Missile', false, true, Phaser.Physics.ARCADE);

        this.nextFire = this.game.game.time + 1000;
        this.bulletSpeed = 50;
        this.fireRate = [3000, 100, 100];
        this.currentFireStep = 0;

        for (var i = 0; i < 10; i++) {
            this.add(new Missile(game, 'emissile', 3), true);
        }

        return this;
    };

    Weapon.GuardianMissile.prototype = Object.create(Phaser.Group.prototype);
    Weapon.GuardianMissile.prototype.constructor = Weapon.GuardianMissile;

    Weapon.GuardianMissile.prototype.fire = function(source) {

        if (this.game.time.time < this.nextFire) {return;}

        var offset = this.game.physics.arcade.velocityFromRotation(source.rotation - 1.1070623, 17.9);
        var x = source.x + offset.x;
        var y = source.y + offset.y;

        var rotationMod = (Math.random() * (Math.PI / 12)) - (Math.PI / 24);

        this.getFirstExists(false).fire(x, y, source.rotation + rotationMod, this.bulletSpeed, true);

        this.currentFireStep += 1;
        if (this.currentFireStep === this.fireRate.length) this.currentFireStep = 0;

        this.nextFire = this.game.time.time + this.fireRate[this.currentFireStep];
    };

    Weapon.GuardianMissile.prototype.reset = function() {
        this.nextFire = this.game.time.time + 1000;
        this.currentFireStep = 0;
    };

    var PowerupManager = function(game) {
        Phaser.Group.call(this, game, game.world, 'Powerups', false, true, Phaser.Physics.ARCADE);

        this.game = game;



        return this;
    };

    PowerupManager.prototype = Object.create(Phaser.Group.prototype);
    PowerupManager.prototype.constructor = PowerupManager;

    PowerupManager.prototype.addPowerup = function(key, type, x, y) {
        this.add(new Powerup(this.game, key, type)).reset(x, y);
    };

    PowerupManager.prototype.update = function() {
        this.forEachAlive(function (p) {
            p.update();
        });
    };

    var Powerup = function(game, key, type) {
        Phaser.Sprite.call(this, game, 0, 0, key);

        this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

        this.game = game;

        this.anchor.set(0.5);

        this.ptype = type;
        //powerup types:
        //0 health
        //1 shield
        //2 power
        //3 speed
        //4 shot
        //5 cannon
        //6 missile
        //7 laser
        //8 wave

    };

    Powerup.prototype = Object.create(Phaser.Sprite.prototype);
    Powerup.prototype.constructor = Powerup;

    Powerup.prototype.update = function() {

        this.game.physics.arcade.overlap(this, this.game.player, this.game.powerupHandler);
    };

    var PhaserGame = function () {

        this.background = null;
        this.foreground = null;

        this.player = null;
        this.enemies = null;
        this.cursors = null;
        this.speed = 100;
        this.hpDisplay = null;
        this.weaponDisplay = null;
        this.shieldDisplay = null;

        this.emitter = null;

        this.walls = null;

        this.weapons = [];
        this.currentWeapon = 0;
        this.weaponName = null;

        this.powerups = null;

    };

    PhaserGame.prototype = {

        init: function () {
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.stage.backgroundColor = 0x777777;
            var self = this;
        },

        preload: function () {

            this.load.spritesheet('character', 'SRCharacterAnimation.png', 30, 30);
            this.load.image('hoverer', 'SRHoverer.png');
            this.load.spritesheet('shambler', 'SRShamblerAnimation.png', 40, 40);
            this.load.image('drifter', 'SRdrifter.png');
            this.load.spritesheet('guardian', 'SRGuardianSprites.png', 80, 80);
            this.load.image('guardiancannon', 'SRGuardianCannon.png');
            this.load.image('bg', 'SRFloor.png');
            this.load.image('Ewall', 'SRwalleast.png');
            this.load.image('Wwall', 'SRwallwest.png');
            this.load.image('Nwall', 'SRwallnorth.png');
            this.load.image('Swall', 'SRwallsouth.png');
            this.load.image('Cwall', 'SRwallcorner.png');
            this.load.image('pbullet', 'pbullet.png');
            this.load.image('pball', 'pball.png');
            this.load.image('pmissile', 'pmissile.png');
            this.load.image('plaser', 'plaser.png');
            this.load.image('pwave', 'pwave.png');
            this.load.image('eball', 'eball.png');
            this.load.image('ebullet', 'ebullet.png');
            this.load.image('emissile', 'emissile.png');
            this.load.image('fire1', 'fire1.png');
            this.load.image('fire2', 'fire2.png');
            this.load.image('fire3', 'fire3.png');
            this.load.image('smoke', 'smoke.png');
            this.load.image('health', 'SRHealthUp.png');
            this.load.image('shield', 'SRShieldUp.png');
            this.load.image('power', 'SRShotUp.png');
            this.load.image('speed', 'SRSpeedUp.png');
            this.load.image('shot', 'SRDualShot.png');
            //this.load.image('cannon', 'SRCannon.png');
            //this.load.image('missile', 'SRMissile.png');
            //this.load.image('laser', 'SRLaser.png');
            //this.load.image('wave', 'SRWave.png');

        },

        create: function () {

            this.walls = game.add.group();

            this.walls.enableBody = true;

            var bg = this.add.image(0, 0, 'bg');
            bg.sendToBack();
            //corners
            var cornerTile = this.walls.create(0, 0, 'Cwall');
            cornerTile.body.immovable = true;
            cornerTile.rotation += Math.PI * 0.5;
            cornerTile.x += 40;
            cornerTile = this.walls.create(this.world.width - 40, 0, 'Cwall');
            cornerTile.body.immovable = true;
            cornerTile.rotation += Math.PI;
            cornerTile.x += 40;
            cornerTile.y += 40;
            cornerTile = this.walls.create(0, this.world.height - 40, 'Cwall');
            cornerTile.body.immovable = true;
            cornerTile = this.walls.create(this.world.width - 40, this.world.height - 40, 'Cwall');
            cornerTile.body.immovable = true;
            cornerTile.rotation -= Math.PI * 0.5;
            cornerTile.y += 40;
            var walltile;
            //creating the horiz walls
            var xPos = 40;
            while (xPos < this.world.width - 40) {
                walltile = this.walls.create(xPos, 0, 'Nwall');
                walltile.body.immovable = true;
                walltile = this.walls.create(xPos, this.world.height - 40, 'Swall');
                walltile.body.immovable = true;
                xPos = xPos + 40;
            }
            //creating the vertical walls
            var yPos = 40;
            while (yPos < this.world.height - 40) {
                walltile = this.walls.create(0, yPos, 'Wwall');
                walltile.body.immovable = true;
                walltile = this.walls.create(this.world.width - 40, yPos, 'Ewall');
                walltile.body.immovable = true;
                yPos = yPos + 40;
            }

            this.weapons.push(new Weapon.Bullet(this.game)); //0
            this.weapons.push(new Weapon.Cannon(this.game)); //1
            this.weapons.push(new Weapon.Missile(this.game)); //2
            this.weapons.push(new Weapon.Laser(this.game)); //3
            this.weapons.push(new Weapon.Wave(this.game)); //4

            this.currentWeapon = 0;

            this.player = this.add.sprite(this.world.centerX, this.world.centerY, 'character');
            this.player.anchor.setTo(0.5, 0.5);

            this.physics.arcade.enable(this.player);

            this.player.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);

            this.player.health = 10;
            this.player.shield = 0;

            this.player.hurt = function (damage) {
                if (this.shield > 0) {
                    this.shield -= damage;
                    if (this.shield < 0) {
                        this.health += this.shield;
                        this.shield = 0;
                    }
                } else this.health -= damage;

                if (this.health < 1) {
                    this.kill();
                    return false;
                } else return true;
            };

            this.player.applyPowerUp = function (type) {
                switch (type) {
                    case 0:
                        if (this.player.health < 10) {
                            this.player.health += 1;
                            return true;
                        } else return false;
                    case 1:
                        this.player.shield += 1;
                        return true;
                    case 2:
                        //power
                        if (this.weapons[this.currentWeapon].upgrade(0)) return true;
                        else return false;
                    case 3:
                        //speed
                        if (this.weapons[this.currentWeapon].upgrade(1)) return true;
                        else return false;
                    case 4:
                        //shot
                        if (this.weapons[this.currentWeapon].upgrade(2)) return true;
                        else return false;
                    case 5:
                        //cannon
                        this.weapons[1].available = true;
                        return true;
                    case 6:
                        //missile
                        this.weapons[2].available = true;
                        return true;
                    case 7:
                        //laser
                        this.weapons[3].available = true;
                        return true;
                    case 8:
                        //wave
                        this.weapons[4].available = true;
                        return true;
                    default:
                        console.error("malformed powerup? " + type);
                }
            }.bind(this);

            this.hpDisplay = this.add.text(10, 565, 'PLAYER HEALTH: **********');
            this.shieldDisplay = this.add.text(400, 565, 'SHIELDS: 0');
            this.weaponDisplay = this.add.text(10, 10, 'BULLET');

            this.enemies = new Enemy.Controller(this);

            globalEmitter = game.add.emitter(-100, -100, 600);

            globalEmitter.makeParticles([ 'fire1', 'fire2', 'fire3', 'smoke' ]);
            globalEmitter.setScale(0.5, 2, 0.5, 2);

            globalEmitter.gravity = 0;

            this.cursors = this.input.keyboard.createCursorKeys();
            this.cursors.ctrl = this.input.keyboard.addKey(Phaser.KeyCode.CONTROL);
            this.cursors.c = this.input.keyboard.addKey(Phaser.KeyCode.C);
            this.cursors.pointer = this.input.activePointer;

            this.cursors.ctrl.onDown.add(function() {
                weaponFound = false;
                while (!weaponFound) {
                    this.currentWeapon += 1;
                    if (this.currentWeapon === this.weapons.length) this.currentWeapon = 0;
                    if (this.weapons[this.currentWeapon].available) weaponFound = true;
                }
            }.bind(this));

            this.cursors.c.onDown.add(function() {
                console.dir(this.enemies, this);
            }.bind(this));

            this.powerups = new PowerupManager(this);
        },

        update: function () {

            //collision
            var touchWall = this.physics.arcade.collide(this.player, this.walls);
            for (var i = 0; i < this.weapons.length; i++) {
                game.physics.arcade.collide(this.weapons[i], this.walls, this.bulletWallHandler);
            }

            //health display
            var hpText = 'PLAYER HEALTH: ';
            for (var i = 0; i < this.player.health; i++) {
              hpText = hpText + '*';
            }
            this.hpDisplay.setText(hpText);

            //shield display
            this.shieldDisplay.setText('SHIELDS: ' + this.player.shield);

            //weapon display
            var weaponText = "";
            var upgradeLevels = this.weapons[this.currentWeapon].upgradeLevels;
            switch (this.currentWeapon) {
                case 0:
                    weaponText += 'BULLET';
                    break;
                case 1:
                    weaponText += 'CANNON';
                    break;
                case 2:
                    weaponText += 'ROCKET';
                    break;
                case 3:
                    weaponText += 'LASER';
                    break;
                case 4:
                    weaponText += 'WAVE';
                    break;
            }
            weaponText += ' POW' + upgradeLevels[0] + ' SPD' + upgradeLevels[1] + ' SHOT' + (upgradeLevels[2]);

            if (this.currentWeapon === 3) {
                weaponText += ' HEAT ' + Math.round((this.weapons[3].heat / this.weapons[3].heatLimit) * 100) + '%';
                if (this.weapons[3].overheated) weaponText += ' OVERHEATED';
            }

            this.weaponDisplay.setText(weaponText);

            //control
            this.player.body.velocity.set(0);
            if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) {
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
                this.player.animations.play('walk');
            } else {
                this.player.animations.stop();
                this.player.frame = 0;
            }

            if (this.cursors.pointer.isDown && this.player.alive) {
                this.weapons[this.currentWeapon].fire(this.player);
            }

            //rotation
            this.player.rotation = this.physics.arcade.angleToPointer(this.player);

            //enemies
            this.enemies.update();

            //powerups
            this.powerups.update();

            //laser heat
            if (this.weapons[3].available) this.weapons[3].update();

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
            if (bullet.emitter) {
                bullet.emitter.kill();
                bullet.emitter.forEachAlive(function (p) {
                    p.kill();
                });
                globalEmitter.emitX = bullet.x;
                globalEmitter.emitY = bullet.y;
                globalEmitter.explode(1000, 50);
            }

        },

        bulletEnemyHandler: function (enemy, bullet) {

            bullet.kill();
            if (bullet.emitter) {
                bullet.emitter.kill();
                bullet.emitter.forEachAlive(function (p) {
                    p.kill();
                });
                globalEmitter.emitX = bullet.x;
                globalEmitter.emitY = bullet.y;
                globalEmitter.explode(1000, 50);
            }
            if (!enemy.enemyInfo.damage(bullet.damageVal)) {

              enemy.body.velocity.x = 0;
              enemy.body.velocity.y = 0;

              var bump = game.physics.arcade.velocityFromRotation(bullet.rotation, 10);

              if (enemy.x + bump.x > 50 && enemy.x + bump.x < game.world.width - 50) enemy.x += bump.x;
              if (enemy.y + bump.y > 50 && enemy.y + bump.y < game.world.height - 50) enemy.y += bump.y;
            }
        },

        laserEnemyHandler: function (enemy, laser) {
            laser.kill();
            enemy.enemyInfo.damage(laser.damageVal);
        },

        bulletPlayerHandler: function (player, bullet) {

            bullet.kill();
            if (bullet.emitter) {
                bullet.emitter.kill();
                bullet.emitter.forEachAlive(function (p) {
                    p.kill();
                });
                globalEmitter.emitX = bullet.x;
                globalEmitter.emitY = bullet.y;
                globalEmitter.explode(1000, 50);
            }

            if (player.hurt(bullet.damageVal)) {
                var bump = game.physics.arcade.velocityFromRotation(bullet.rotation, 10);

                if (player.x + bump.x > 50 && player.x + bump.x < game.world.width - 50) player.x += bump.x;
                if (player.y + bump.y > 50 && player.y + bump.y < game.world.height - 50) player.y += bump.y;
            }
        },

        powerupHandler: function (powerup, player) {
            if (player.applyPowerUp(powerup.ptype)) powerup.destroy();
        }

    };

    game.state.add('Game', PhaserGame, true);
};
