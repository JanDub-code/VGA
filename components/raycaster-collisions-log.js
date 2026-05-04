AFRAME.registerComponent('raycaster-collisions-log', {
    dependencies: ['raycaster'],

    init() {
        this.el.addEventListener('raycaster-intersection', event => {
            console.log('Raycaster hit an obstacle!', event.detail.els[0]);
        });
    }
});