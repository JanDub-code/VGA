AFRAME.registerComponent('log-gltf-animations', {
    init: function () {
        this.el.addEventListener('model-loaded', (e) => {
            const model = e.detail.model;
            const animations = model.animations || model.scene.animations;

            if (!animations || animations.length === 0) {
                console.log('No animations found in GLTF model.');
                return;
            }

            console.log(
                'Animations found in GLTF model: ',
                animations.map((clip, i) => clip.name).join(', ')
            )
        });
    }
});