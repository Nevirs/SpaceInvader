
var sprites = {
    Player: [39, 24],
    Enemy1: [24, 24],
    Enemy2: [33, 24],
    Enemy3: [36, 24],
    EnemyBullet: [3, 12],
    PlayerBullet: [3, 12],
};

var loadSprites = function (image, sprites) {
    var spec = {};
    var x = 0;
    _.each(sprites, function (size, spriteName) {
        spec[spriteName + 'Sprite'] = [x, 0, size[0], size[1]];
        x += size[0];
    });
    Crafty.sprite(image, spec);
};

function cooldownThrottle (fn, cooldown, context) {
    return _.throttle(fn.bind(context),
                      cooldown,
                      {leading: true, trailing: false});
}

Crafty.c('Player', {
    required: '2D, Canvas, Twoway, Keyboard, PlayerSprite',
    init: function () {
        this.twoway(200);
        this.fire = cooldownThrottle(function () {
            Crafty.e('PlayerBullet')
                .attr({x: this.x + this.w/2 - 1.5, y: this.y});
        }, 500, this);
        this.life = 3;
        this.bind('damage', function() {
            this.life -= 1;
        });
    },
    events: {
        'KeyDown': function (e) {
            if (e.key === Crafty.keys.SPACE) {
                this.fire();
            }
        }
    }
});

Crafty.c('Enemy', {
    required: '2D, Canvas, Delay',
    init: function() {
        this.name = 'enemy';
    },
    enemy: function (spec) {
        this.delay(function() {
            if (_.random(0,30) === 0){
                Crafty.e('EnemyBullet')
                    .attr({x: this.x + this.w/2, y: this.y + this.h});
            }
        }, spec.cooldown, -1);
    }
});

Crafty.c('Enemy1', {
    required: 'Enemy, Enemy1Sprite',
    init: function () {
        this.enemy({
            cooldown: 1000,
        });
    },
});

Crafty.c('Enemy2', {
    required: 'Enemy, Enemy2Sprite',
    init: function () {
        this.enemy({
            cooldown: 1000,
        });
    },
});

Crafty.c('Enemy3', {
    required: 'Enemy, Enemy3Sprite',
    init: function () {
        this.enemy({
            cooldown: 1500,
        });
    },
});

Crafty.c('Bullet', {
    required: '2D, Canvas, Motion, Collision, Delay',
    bullet: function (spec) {
        this.checkHits(spec.target);
        this.delay(this.destroy, 5000);
        this.vy = spec.speed;
    },
    events: {
        'HitOn': function (data) {
            console.log(data[0].obj.name);
            if(data[0].obj.name === 'enemy') {
                data[0].obj.destroy();
            }
            Crafty.e('Floor, 2D, Canvas, Color')
                .attr({x: 70 + (data[0].obj.life-1)*50, y: 700, w: 39, h: 24})
                .color('black');
            //data[0].obj.life -= 1;
            data[0].obj.trigger('damage');
            this.destroy();
        }
    }
});

Crafty.c('PlayerBullet', {
    required: 'Bullet, PlayerBulletSprite',
    init: function () {
        this.bullet({
            speed: -200, // pixel per sec
            target: 'Enemy',
        });
    }
});

Crafty.c('EnemyBullet', {
    required: 'Bullet, EnemyBulletSprite',
    init: function () {
        this.bullet({
            speed: 200, // pixel per sec
            target: 'Player',
        });
    }
});

Crafty.c('Life', {
    required: '2D, Canvas, PlayerSprite',
    init: function() {
        this.bind('Destroy', function() {
            this.destroy();
        });
    }
});

window.onload = function () {
    Crafty.init(650, 750, 'game');
    Crafty.background("black");
    loadSprites('spritesheet.png', sprites);

    var life = {};
    _(3).times(function(n) {
        life['life'+n] = Crafty.e('Life')
                            .attr({x: 70 + (n*50), y: 700});
    });

    Crafty.e('Player')
        .attr({x: 325-player.x/2, y: 650});

    _(11).times(function(n) {
        Crafty.e('Enemy1')
            .attr({x: 20+(n+1)*50, y: 190});
    });

    _(11).times(function(x) {
        _(2).times(function(y) {
            Crafty.e('Enemy2')
                .attr({x: 17+(x+1)*50, y: 190+50*(y+1)});
        });
    });

    _(11).times(function(x) {
        _(2).times(function(y) {
            Crafty.e('Enemy3')
                .attr({x: 17+(x+1)*50, y: 290+50*(y+1)});
        });
    });

};
