AFRAME.registerComponent('air-obstacle', {
    schema: {
        score: {
            type: 'int',
            default: 10
        },
        radius: {
            type: 'number',
            default: 4
        },
        depth: {
            type: 'number',
            default: 2.5
        }
    },
    init() {
        console.log('Air ring obstacle initialized!');
        this.collected = false;
        this.currentPosition = new THREE.Vector3();
        this.characterPosition = new THREE.Vector3();

        this.el.addEventListener('collide-with-character', event => {
            this.collect();
        });
    },

    tick() {
        if (this.collected) return;

        const character = document.querySelector('[character]');
        if (!character) return;

        this.el.object3D.getWorldPosition(this.currentPosition);
        character.object3D.getWorldPosition(this.characterPosition);

        const offsetX = this.characterPosition.x - this.currentPosition.x;
        const offsetY = this.characterPosition.y - this.currentPosition.y;
        const offsetZ = this.characterPosition.z - this.currentPosition.z;
        const distanceFromRingCenter = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

        if (distanceFromRingCenter < this.data.radius && Math.abs(offsetZ) < this.data.depth) {
            this.collect();
        }
    },

    collect() {
        if (this.collected) return;
        this.collected = true;

        const character = document.querySelector('[character]');
        if (character && character.components.character) {
            character.components.character.addScore(this.data.score);
        }

        this.el.remove();
    }
});
