import './style.css'
import './components/character'
import './components/obstacle'
import './components/air-obstacle'
import './components/air-balloon-obstacle'
import './components/enemy-plane'
import './components/raycaster-collisions-log'
import './components/log-gltf-animations'
import './shaders/glowing'

document.querySelector('#app').innerHTML = `
    <!-- UI -->
    <div id="game-over">You lost!</div>
    <div id="score">Score: 0</div>
    <div id="controls-hint">Turn: WASD<br>Shoot: Space</div>
    
    <!-- Scene -->
    <a-scene physics=" driver: ammo; debug: false; debugDrawMode: 1;">
        <!-- External files -->
        <a-assets>
            <a-asset-item id="tree" src="/models/tree/tree.gltf"></a-asset-item>
            <a-asset-item id="eva" src="/models/eva-animated-complete.glb"></a-asset-item>
            <a-asset-item id="player-airplane" src="/models/player-airplane.glb"></a-asset-item>
            <a-asset-item id="enemy-airplane" src="/models/enemy-airplane.glb"></a-asset-item>
            <a-asset-item id="terrain" src="/models/terrain.glb"></a-asset-item>
            <a-asset-item id="air-ring" src="/models/air-ring.glb"></a-asset-item>
            <a-asset-item id="hot-air-balloon" src="/models/Hot air balloon.glb"></a-asset-item>
            <img src="/models/asteroid.jpg" id="ball">
            <img src="/models/sky.jpg" id="sky">
        </a-assets>
        
        <!-- Lights -->
        <a-entity light="type: ambient; color: #FFF; intensity: 0.55;"></a-entity>
        <a-entity light="type: directional; color: #FFF; intensity: 1.2; castShadow: true; shadow-camera-automatic: [shadow]; shadowMapWidth: 1024; shadowMapHeight: 1024;" position="-2 6 3"></a-entity>
  
        <!-- Environment -->
        <!--  sky    --> <a-sky src="#sky"></a-sky>
        <!-- ground  --> <a-entity gltf-model="#terrain" ammo-body="type: static;" ammo-shape="type: mesh" position="0 -20 -4" scale="20 5 20" shadow="receive: true"></a-entity>
        <!--  tree   --> <a-entity class="raycaster-target" ammo-body="type: static;" ammo-shape="type: mesh;" gltf-model="#tree" position="2.9 -10 -7" scale="0.2 0.2 0.2"  shadow="cast: true"></a-entity> 

        <!-- Obstacles -->
        <a-sphere class="obstacle raycaster-target" ammo-body="type: dynamic" ammo-shape="type: box" obstacle="strength: 100" position="9 6 -22" radius="0.5" color="orange" shadow="cast: true"></a-sphere>
        <a-sphere class="obstacle raycaster-target" ammo-body="type: dynamic" ammo-shape="type: box" obstacle="strength: 100" position="-10 8 -48" radius="0.5" material="shader: glowing; transparent: true; color1: red; color2: blue; uMap: #ball;"></a-sphere>
        
        <!-- Air Rings -->
        <a-entity class="raycaster-target" gltf-model="#air-ring" air-obstacle="score: 10" position="0 5 -16" scale="0.05 0.05 0.05"></a-entity>
        <a-entity class="raycaster-target" gltf-model="#air-ring" air-obstacle="score: 10" position="-9 9 -32" scale="0.05 0.05 0.05"></a-entity>
        <a-entity class="raycaster-target" gltf-model="#air-ring" air-obstacle="score: 10" position="11 4 -50" scale="0.05 0.05 0.05"></a-entity>
        <a-entity class="raycaster-target" gltf-model="#air-ring" air-obstacle="score: 10" position="-14 12 -70" scale="0.05 0.05 0.05"></a-entity>
        <a-entity class="raycaster-target" gltf-model="#air-ring" air-obstacle="score: 10" position="5 7 -91" scale="0.05 0.05 0.05"></a-entity>
        <a-entity class="raycaster-target" gltf-model="#air-ring" air-obstacle="score: 10" position="15 14 -112" scale="0.05 0.05 0.05"></a-entity>
        <a-entity class="raycaster-target" gltf-model="#air-ring" air-obstacle="score: 10" position="-6 3 -134" scale="0.05 0.05 0.05"></a-entity>

        <!-- Air Balloons -->
        <a-entity class="raycaster-target" air-balloon-obstacle="strength: 100; score: 15; hitRadius: 3.5" position="13 8 -38">
            <a-entity gltf-model="#hot-air-balloon" rotation="270 90 45" scale="0.02 0.02 0.02" shadow="cast: true"></a-entity>
        </a-entity>
        <a-entity class="raycaster-target" air-balloon-obstacle="strength: 100; score: 15; hitRadius: 3.5" position="-16 11 -78">
            <a-entity gltf-model="#hot-air-balloon" rotation="270 90 45" scale="0.02 0.02 0.02" shadow="cast: true"></a-entity>
        </a-entity>

        <!-- Enemies -->
        <a-entity enemy-plane="phase: 0; speed: 4.4; health: 100; score: 50; hitRadius: 2.2" position="-4 5.5 -10" rotation="0 -12 0">
            <a-entity gltf-model="#enemy-airplane" position="0 0 0" rotation="0 90 0" scale="0.02 0.02 0.02" shadow="cast: true"></a-entity>
        </a-entity>
        <a-entity enemy-plane="phase: 3; speed: 4; health: 100; score: 50; hitRadius: 2.2" position="4 6.5 -16" rotation="0 14 0">
            <a-entity gltf-model="#enemy-airplane" position="0 0 0" rotation="0 90 0" scale="0.02 0.02 0.02" shadow="cast: true"></a-entity>
        </a-entity>
        
        <!-- Character -->
        <a-entity character position="0 5 6">
            <a-entity gltf-model="#player-airplane" position="0 0 0" rotation="0 90 0" scale="0.45 0.45 0.45" shadow="cast: true">
                <a-entity light="type: spot; penumbra: 0.2; angle: 45; intensity: 3; distance: 12; castShadow: true;" position="0 0.6 -0.8" rotation="-15 0 0"></a-entity>
            </a-entity>
            <a-entity camera="active: true; near: 0.01" position="0 0.9 2.2"></a-entity>
        </a-entity>
    </a-scene>
`
