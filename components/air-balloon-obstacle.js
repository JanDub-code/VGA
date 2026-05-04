AFRAME.registerComponent('air-balloon-obstacle', {
    schema: {
        strength: {
            type: 'int',
            default: 100
        },
        score: {
            type: 'int',
            default: 15
        },
        hitRadius: {
            type: 'number',
            default: 3.5
        }
    },
    init() {
        console.log('Air balloon obstacle initialized!');
        this.damage = 0;
        this.hasBeenDestroyed = false;

        this.el.addEventListener('collide-with-character', event => {
            this.takeDamage(60);
        });

        this.el.addEventListener('hit-by-projectile', event => {
            this.takeDamage(event.detail.damage);
        });
    },

    takeDamage(damage) {
        this.damage += damage;

        if (this.damage > this.data.strength && !this.hasBeenDestroyed) {
            this.hasBeenDestroyed = true;

            const character = document.querySelector('[character]');
            if (character && character.components.character) {
                character.components.character.addScore(this.data.score);
            }

            this.el.remove();
        }
    }
});
