AFRAME.registerComponent('enemy-plane', {
    schema: {
        health: {
            type: 'int',
            default: 100,
        },
        speed: {
            type: 'number',
            default: 4.5,
        },
        score: {
            type: 'int',
            default: 50,
        },
        hitRadius: {
            type: 'number',
            default: 1.4,
        },
        phase: {
            type: 'number',
            default: 0,
        },
    },

    init() {
        console.log('Enemy plane initialized!');

        this.health = this.data.health
        this.forward = new THREE.Vector3()
        this.model = this.el.children[0]
        this.modelBaseRotation = this.model.object3D.rotation.clone()

        const rotation = this.el.getAttribute('rotation')
        this.pitch = THREE.MathUtils.degToRad(rotation.x)
        this.yaw = THREE.MathUtils.degToRad(rotation.y)

        this.el.addEventListener('hit-by-projectile', event => {
            this.takeDamage(event.detail.damage)
        })
    },

    tick(time, delta) {
        const dt = delta / 1000
        const seconds = time / 1000 + this.data.phase
        const horizontalTurn = Math.sin(seconds * 0.75)
        const verticalTurn = Math.sin(seconds * 0.45) * 0.35

        this.yaw += horizontalTurn * THREE.MathUtils.degToRad(28) * dt
        this.pitch += verticalTurn * THREE.MathUtils.degToRad(18) * dt
        this.pitch = THREE.MathUtils.clamp(this.pitch, THREE.MathUtils.degToRad(-35), THREE.MathUtils.degToRad(35))

        this.el.object3D.rotation.set(this.pitch, this.yaw, 0, 'YXZ')
        this.getForwardDirection()
        this.el.object3D.position.addScaledVector(this.forward, this.data.speed * dt)

        if (this.model) {
            this.model.object3D.rotation.set(
                this.modelBaseRotation.x + horizontalTurn * THREE.MathUtils.degToRad(22),
                this.modelBaseRotation.y,
                this.modelBaseRotation.z
            )
        }
    },

    getForwardDirection() {
        return this.forward
            .set(0, 0, -1)
            .applyQuaternion(this.el.object3D.quaternion)
            .normalize()
    },

    takeDamage(damage) {
        this.health = 0

        if (this.health <= 0) {
            const character = document.querySelector('[character]')
            if (character && character.components.character) {
                character.components.character.addScore(this.data.score)
            }

            this.el.remove()
        }
    },
});
