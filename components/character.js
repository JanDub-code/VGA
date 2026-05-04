AFRAME.registerComponent('character', {
    init() {
        console.log('Hello, character!');

        this.health = 100
        this.score = 0
        this.collisionBodies = []
        this.flightSpeed = 7
        this.turnSpeed = THREE.MathUtils.degToRad(70)
        this.pitchSpeed = THREE.MathUtils.degToRad(50)
        this.maxPitch = THREE.MathUtils.degToRad(65)
        this.shootCooldown = 250
        this.lastShotTime = 0
        this.keys = {}
        this.characterModel = this.el.children[0]
        this.modelBaseRotation = this.characterModel.object3D.rotation.clone()
        this.forward = new THREE.Vector3()
        this.currentPosition = new THREE.Vector3()
        this.obstaclePosition = new THREE.Vector3()

        const rotation = this.el.getAttribute('rotation')
        this.pitch = THREE.MathUtils.degToRad(rotation.x)
        this.yaw = THREE.MathUtils.degToRad(rotation.y)

        this.keydownHandler = event => {
            this.wakeUp()

            if (['KeyA', 'KeyW', 'KeyS', 'KeyD'].includes(event.code)) {
                this.keys[event.code] = true
            } else if (event.code === 'Space') {
                event.preventDefault()
                this.shoot()
            }
        }

        this.keyupHandler = event => {
            if (['KeyA', 'KeyW', 'KeyS', 'KeyD'].includes(event.code)) {
                this.keys[event.code] = false
            }
        }

        document.addEventListener('keydown', this.keydownHandler)
        document.addEventListener('keyup', this.keyupHandler)
        this.el.addEventListener('collidestart', event => this.processCollision(event))
    },

    wakeUp() {
        if (this.el.body) {
            this.el.body.setActivationState(1); // Wake it up
        }
    },

    addScore(points) {
        this.score += points;
        console.log('Score:', this.score);
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.textContent = 'Score: ' + this.score;
        }
    },

    shoot() {
        const now = performance.now()
        if (now - this.lastShotTime < this.shootCooldown) {
            return
        }
        this.lastShotTime = now

        this.getForwardDirection()

        const projectile = document.createElement('a-sphere')
        const muzzlePosition = this.el.object3D.getWorldPosition(new THREE.Vector3())
            .add(this.forward.clone().multiplyScalar(1.5))

        projectile.classList.add('projectile')
        projectile.setAttribute('radius', 0.07)
        projectile.setAttribute('position', muzzlePosition)
        projectile.setAttribute('material', 'color: #66f7ff; emissive: #66f7ff; emissiveIntensity: 3')
        projectile.setAttribute('projectile', {
            direction: { x: this.forward.x, y: this.forward.y, z: this.forward.z },
            speed: 35,
            maxAge: 2500,
            damage: 60,
        })

        this.el.sceneEl.appendChild(projectile)
    },

    tick(time, delta) {
        const dt = delta / 1000
        const horizontalTurn = (this.keys.KeyA ? 1 : 0) - (this.keys.KeyD ? 1 : 0)
        const verticalTurn = (this.keys.KeyW ? 1 : 0) - (this.keys.KeyS ? 1 : 0)

        this.yaw += horizontalTurn * this.turnSpeed * dt
        this.pitch += verticalTurn * this.pitchSpeed * dt
        this.pitch = THREE.MathUtils.clamp(this.pitch, -this.maxPitch, this.maxPitch)

        this.el.object3D.rotation.set(this.pitch, this.yaw, 0, 'YXZ')
        this.getForwardDirection()
        this.el.object3D.position.add(this.forward.multiplyScalar(this.flightSpeed * dt))

        // The airplane model is turned 90 degrees in the scene, so its bank is on the model's X axis.
        if (this.characterModel) {
            this.characterModel.object3D.rotation.set(
                this.modelBaseRotation.x - horizontalTurn * THREE.MathUtils.degToRad(25),
                this.modelBaseRotation.y,
                this.modelBaseRotation.z
            )
        }

        this.checkObstacleCollisions()
    },

    getForwardDirection() {
        return this.forward
            .set(0, 0, -1)
            .applyQuaternion(this.el.object3D.quaternion)
            .normalize()
    },

    checkObstacleCollisions() {
        this.el.object3D.getWorldPosition(this.currentPosition)

        this.el.sceneEl.querySelectorAll('[obstacle]').forEach(otherEntity => {
            otherEntity.object3D.getWorldPosition(this.obstaclePosition)

            if (this.currentPosition.distanceTo(this.obstaclePosition) < 1.1) {
                this.processCollision({ detail: { targetEl: otherEntity } })
            }
        })

        this.el.sceneEl.querySelectorAll('[air-obstacle]').forEach(otherEntity => {
            otherEntity.object3D.getWorldPosition(this.obstaclePosition)

            if (this.currentPosition.distanceTo(this.obstaclePosition) < 1.5) {
                otherEntity.emit('collide-with-character')
            }
        })

        this.el.sceneEl.querySelectorAll('[air-balloon-obstacle]').forEach(otherEntity => {
            otherEntity.object3D.getWorldPosition(this.obstaclePosition)

            if (this.currentPosition.distanceTo(this.obstaclePosition) < 1.5) {
                this.processCollision({ detail: { targetEl: otherEntity } })
            }
        })
    },

    processCollision(event) {
        const otherEntity = event.detail.targetEl;

        // consider only collisions with obstacles (entities having obstacle component)
        if (!otherEntity?.hasAttribute('obstacle')) {
            return;
        }

        console.log('Collision with obstacle detected.', event)

        // do not collide repeatedly with the same entity
        if (this.collisionBodies.includes(otherEntity)) {
            return;
        }

        // add the entity, which we collided with, to the array, so we can avoid another collision with the same entity
        this.collisionBodies.push(otherEntity);

        // if there is a delay of at least 500ms between the collisions, enable collision with the same entity
        // in other words: remove the collided entity from the array after 500ms if no other collisions happen in the meantime
        clearTimeout(this.clearTimeout);
        this.clearTimeout = setTimeout(() => {
                const index = this.collisionBodies.indexOf(otherEntity)
                if (index !== -1) {
                    this.collisionBodies.splice(index, 1)
                }
            },
            500
        )

        // the collision affects the character's health
        this.health -= 40;
        console.log('Health', this.health)

        // if there is no health remaining, the game is over
        if (this.health < 0) {
            document.getElementById('game-over').style.display = 'block';
        }

        // tell the other entity that the collision happened, so it can destroy itself
        otherEntity.emit('collide-with-character')
    },

    remove() {
        document.removeEventListener('keydown', this.keydownHandler)
        document.removeEventListener('keyup', this.keyupHandler)
    },
});

AFRAME.registerComponent('projectile', {
    schema: {
        direction: {
            type: 'vec3',
            default: { x: 0, y: 0, z: -1 },
        },
        speed: {
            type: 'number',
            default: 35,
        },
        maxAge: {
            type: 'int',
            default: 2500,
        },
        damage: {
            type: 'int',
            default: 60,
        },
    },

    init() {
        this.age = 0
        this.direction = new THREE.Vector3(this.data.direction.x, this.data.direction.y, this.data.direction.z).normalize()
        this.previousPosition = new THREE.Vector3()
        this.currentPosition = new THREE.Vector3()
        this.obstaclePosition = new THREE.Vector3()
        this.segment = new THREE.Vector3()
        this.targetToStart = new THREE.Vector3()
        this.closestPoint = new THREE.Vector3()
    },

    tick(time, delta) {
        const dt = delta / 1000
        this.age += delta

        if (this.age > this.data.maxAge) {
            this.el.remove()
            return
        }

        this.el.object3D.getWorldPosition(this.previousPosition)
        this.el.object3D.position.addScaledVector(this.direction, this.data.speed * dt)
        this.checkObstacleHit()
    },

    checkObstacleHit() {
        this.el.object3D.getWorldPosition(this.currentPosition)

        this.el.sceneEl.querySelectorAll('[obstacle], [enemy-plane], [air-balloon-obstacle]').forEach(otherEntity => {
            if (!this.el.parentNode) {
                return
            }

            otherEntity.object3D.getWorldPosition(this.obstaclePosition)
            let hitRadius = 0.75
            if (otherEntity.components['enemy-plane']) {
                hitRadius = otherEntity.components['enemy-plane'].data.hitRadius
            } else if (otherEntity.components['air-balloon-obstacle']) {
                hitRadius = otherEntity.components['air-balloon-obstacle'].data.hitRadius
            }

            if (this.distanceToCurrentPath(this.obstaclePosition) < hitRadius) {
                otherEntity.emit('hit-by-projectile', { damage: this.data.damage })
                this.el.remove()
            }
        })
    },

    distanceToCurrentPath(targetPosition) {
        this.segment.subVectors(this.currentPosition, this.previousPosition)
        const segmentLengthSq = this.segment.lengthSq()

        if (segmentLengthSq === 0) {
            return this.currentPosition.distanceTo(targetPosition)
        }

        this.targetToStart.subVectors(targetPosition, this.previousPosition)
        const t = THREE.MathUtils.clamp(this.targetToStart.dot(this.segment) / segmentLengthSq, 0, 1)
        this.closestPoint.copy(this.previousPosition).addScaledVector(this.segment, t)

        return this.closestPoint.distanceTo(targetPosition)
    },
});
