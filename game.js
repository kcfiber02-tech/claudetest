// Game Configuration
const Config = {
    // Scene
    fog: {
        color: 0x87CEEB,
        near: 10,
        far: 300
    },
    sky: {
        color: 0x87CEEB,
        radius: 500
    },

    // Camera
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        height: 2
    },

    // Lighting
    ambient: {
        color: 0xffffff,
        intensity: 0.6
    },
    directional: {
        color: 0xffffff,
        intensity: 0.8,
        position: { x: 50, y: 100, z: 50 }
    },

    // Road
    road: {
        width: 20,
        curveFrequency: 0.01,
        curveAmplitude: 30,
        segmentLength: 20,
        numSegments: 100,
        color: 0x404040,
        followStrength: 0.02
    },

    // Road markings
    marking: {
        width: 0.5,
        length: 4,
        color: 0xFFFFFF,
        spacing: 10,
        count: 200
    },

    // Grass
    grass: {
        width: 500,
        length: 2000,
        color: 0x228B22
    },

    // Car physics
    car: {
        maxSpeed: 150,
        acceleration: 0.5,
        braking: 1,
        deceleration: 0.3,
        turnSpeed: 0.03,
        maxReverseSpeed: 75,
        color: 0xFF0000
    },

    // Trees
    tree: {
        trunkColor: 0x8B4513,
        leavesColor: 0x228B22,
        spacing: 30,
        minOffset: 15,
        maxOffset: 35
    },

    // Obstacles
    obstacle: {
        count: 8,
        collisionWidth: 3,
        collisionLength: 5,
        laneOffset: 4,
        minSpawnDistance: 50,
        maxSpawnDistance: 450,
        collisionSpeedMultiplier: 0.5,
        collisionScorePenalty: 10
    }
};

// Input Controller
class InputController {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    isAccelerating() {
        return this.keys['w'] || this.keys['arrowup'];
    }

    isBraking() {
        return this.keys['s'] || this.keys['arrowdown'];
    }

    isTurningLeft() {
        return this.keys['a'] || this.keys['arrowleft'];
    }

    isTurningRight() {
        return this.keys['d'] || this.keys['arrowright'];
    }
}

// Road Manager
class RoadManager {
    constructor(scene) {
        this.scene = scene;
        this.segments = [];
        this.markings = [];
        this.createRoad();
        this.createMarkings();
        this.createGrass();
    }

    getRoadCenterX(z) {
        return Math.sin(z * Config.road.curveFrequency) * Config.road.curveAmplitude +
               Math.sin(z * Config.road.curveFrequency * 0.5) * Config.road.curveAmplitude * 0.5;
    }

    createRoad() {
        for (let i = 0; i < Config.road.numSegments; i++) {
            const z = i * Config.road.segmentLength - 500;
            const geometry = new THREE.PlaneGeometry(Config.road.width, Config.road.segmentLength);
            const material = new THREE.MeshLambertMaterial({ color: Config.road.color });
            const segment = new THREE.Mesh(geometry, material);

            segment.rotation.x = -Math.PI / 2;
            segment.position.x = this.getRoadCenterX(z);
            segment.position.z = z;
            segment.receiveShadow = true;

            this.scene.add(segment);
            this.segments.push(segment);
        }
    }

    createMarkings() {
        const geometry = new THREE.PlaneGeometry(Config.marking.width, Config.marking.length);
        const material = new THREE.MeshBasicMaterial({ color: Config.marking.color });

        for (let i = 0; i < Config.marking.count; i++) {
            const z = i * Config.marking.spacing - 1000;
            const marking = new THREE.Mesh(geometry, material);

            marking.rotation.x = -Math.PI / 2;
            marking.position.set(this.getRoadCenterX(z), 0.01, z);

            this.scene.add(marking);
            this.markings.push(marking);
        }
    }

    createGrass() {
        const geometry = new THREE.PlaneGeometry(Config.grass.width, Config.grass.length);
        const material = new THREE.MeshLambertMaterial({ color: Config.grass.color });
        const grass = new THREE.Mesh(geometry, material);

        grass.rotation.x = -Math.PI / 2;
        grass.position.y = -0.1;
        grass.receiveShadow = true;

        this.scene.add(grass);
    }

    update(carZ) {
        // Update road segments
        this.segments.forEach((segment) => {
            const relativeZ = segment.position.z - carZ;

            if (relativeZ > 500) {
                segment.position.z -= Config.road.numSegments * Config.road.segmentLength;
            } else if (relativeZ < -500) {
                segment.position.z += Config.road.numSegments * Config.road.segmentLength;
            }

            segment.position.x = this.getRoadCenterX(segment.position.z);
        });

        // Update road markings
        this.markings.forEach((marking) => {
            const relativeZ = marking.position.z - carZ;

            if (relativeZ > 1000) {
                marking.position.z -= 2000;
            } else if (relativeZ < -1000) {
                marking.position.z += 2000;
            }

            marking.position.x = this.getRoadCenterX(marking.position.z);
        });
    }
}

// Tree Manager
class TreeManager {
    constructor(scene, roadManager) {
        this.scene = scene;
        this.roadManager = roadManager;
        this.trees = [];
        this.createTrees();
    }

    createTree(x, z) {
        const tree = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: Config.tree.trunkColor });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);

        // Leaves
        const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: Config.tree.leavesColor });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 6;
        leaves.castShadow = true;
        tree.add(leaves);

        tree.position.set(x, 0, z);
        return tree;
    }

    createTrees() {
        for (let i = -1000; i < 1000; i += Config.tree.spacing) {
            const roadCenter = this.roadManager.getRoadCenterX(i);
            const randomOffset = Math.random() * (Config.tree.maxOffset - Config.tree.minOffset) + Config.tree.minOffset;
            const side = (Math.random() > 0.5) ? 1 : -1;
            const x = roadCenter + side * (Config.road.width / 2 + randomOffset);

            const tree = this.createTree(x, i);
            this.scene.add(tree);
            this.trees.push(tree);
        }
    }

    update(carZ) {
        this.trees.forEach((tree) => {
            const relativeZ = tree.position.z - carZ;

            if (relativeZ > 1000) {
                tree.position.z -= 2000;
                const roadCenter = this.roadManager.getRoadCenterX(tree.position.z);
                const currentOffset = tree.position.x - this.roadManager.getRoadCenterX(tree.position.z + 2000);
                tree.position.x = roadCenter + currentOffset;
            } else if (relativeZ < -1000) {
                tree.position.z += 2000;
                const roadCenter = this.roadManager.getRoadCenterX(tree.position.z);
                const currentOffset = tree.position.x - this.roadManager.getRoadCenterX(tree.position.z - 2000);
                tree.position.x = roadCenter + currentOffset;
            }
        });
    }
}

// Obstacle Manager
class ObstacleManager {
    constructor(scene, roadManager) {
        this.scene = scene;
        this.roadManager = roadManager;
        this.obstacles = [];
        this.createObstacles();
    }

    createObstacle(x, z) {
        const obstacle = new THREE.Group();

        // Car body
        const bodyGeometry = new THREE.BoxGeometry(3, 1.5, 5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        obstacle.add(body);

        // Car cabin
        const cabinGeometry = new THREE.BoxGeometry(2.5, 1, 3);
        const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.y = 2;
        cabin.castShadow = true;
        obstacle.add(cabin);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const wheelPositions = [
            [-1.5, 0.4, 1.5],
            [1.5, 0.4, 1.5],
            [-1.5, 0.4, -1.5],
            [1.5, 0.4, -1.5]
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos[0], pos[1], pos[2]);
            wheel.castShadow = true;
            obstacle.add(wheel);
        });

        obstacle.position.set(x, 0, z);
        return obstacle;
    }

    createObstacles() {
        for (let i = 0; i < Config.obstacle.count; i++) {
            const z = -Config.obstacle.minSpawnDistance -
                      Math.random() * (Config.obstacle.maxSpawnDistance - Config.obstacle.minSpawnDistance);
            const roadCenter = this.roadManager.getRoadCenterX(z);
            const lane = (Math.random() > 0.5) ? -Config.obstacle.laneOffset : Config.obstacle.laneOffset;

            const obstacle = this.createObstacle(roadCenter + lane, z);
            this.scene.add(obstacle);
            this.obstacles.push(obstacle);
        }
    }

    update(carX, carZ, speed) {
        let collision = false;

        this.obstacles.forEach((obstacle) => {
            const relativeZ = obstacle.position.z - carZ;

            if (relativeZ > 100 || relativeZ < -500) {
                const newZ = carZ - Config.obstacle.minSpawnDistance -
                            Math.random() * (Config.obstacle.maxSpawnDistance - Config.obstacle.minSpawnDistance);
                const roadCenter = this.roadManager.getRoadCenterX(newZ);
                const lane = (Math.random() > 0.5) ? -Config.obstacle.laneOffset : Config.obstacle.laneOffset;

                obstacle.position.x = roadCenter + lane;
                obstacle.position.z = newZ;
            }

            // Check collision
            const dx = Math.abs(obstacle.position.x - carX);
            const dz = Math.abs(obstacle.position.z - carZ);

            if (dx < Config.obstacle.collisionWidth &&
                dz < Config.obstacle.collisionLength &&
                speed > 0) {
                collision = true;
            }
        });

        return collision;
    }
}

// Player Car Interior
class PlayerCar {
    constructor(camera) {
        this.camera = camera;
        this.interior = new THREE.Group();
        this.steeringGroup = null;
        this.createInterior();
        this.camera.add(this.interior);
    }

    createInterior() {
        // Hood
        const hoodGeometry = new THREE.BoxGeometry(4, 0.2, 3);
        const hoodMaterial = new THREE.MeshLambertMaterial({ color: Config.car.color });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, -0.8, -2);
        this.interior.add(hood);

        // Dashboard
        const dashGeometry = new THREE.BoxGeometry(5, 0.5, 0.5);
        const dashMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const dashboard = new THREE.Mesh(dashGeometry, dashMaterial);
        dashboard.position.set(0, -1, -1);
        this.interior.add(dashboard);

        // Steering wheel
        this.steeringGroup = new THREE.Group();
        const steeringGeometry = new THREE.TorusGeometry(0.4, 0.05, 16, 100);
        const steeringMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const steering = new THREE.Mesh(steeringGeometry, steeringMaterial);
        steering.rotation.x = Math.PI / 3;
        this.steeringGroup.add(steering);
        this.steeringGroup.position.set(0, -0.7, -1.2);
        this.interior.add(this.steeringGroup);
    }

    updateSteering(isTurningLeft, isTurningRight) {
        const steeringSpeed = 0.05;
        const maxSteeringAngle = Math.PI / 4;

        if (isTurningLeft) {
            this.steeringGroup.rotation.z = Math.min(
                this.steeringGroup.rotation.z + steeringSpeed,
                maxSteeringAngle
            );
        } else if (isTurningRight) {
            this.steeringGroup.rotation.z = Math.max(
                this.steeringGroup.rotation.z - steeringSpeed,
                -maxSteeringAngle
            );
        } else {
            // Return to center
            if (this.steeringGroup.rotation.z > 0) {
                this.steeringGroup.rotation.z = Math.max(
                    this.steeringGroup.rotation.z - steeringSpeed,
                    0
                );
            } else if (this.steeringGroup.rotation.z < 0) {
                this.steeringGroup.rotation.z = Math.min(
                    this.steeringGroup.rotation.z + steeringSpeed,
                    0
                );
            }
        }
    }
}

// Main Game Class
class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.inputController = null;
        this.roadManager = null;
        this.treeManager = null;
        this.obstacleManager = null;
        this.playerCar = null;

        // Game state
        this.speed = 0;
        this.score = 0;
        this.carX = 0;
        this.carZ = 0;
        this.carRotation = 0;

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.setupSky();

        this.inputController = new InputController();
        this.roadManager = new RoadManager(this.scene);
        this.treeManager = new TreeManager(this.scene, this.roadManager);
        this.obstacleManager = new ObstacleManager(this.scene, this.roadManager);

        this.setupCamera();
        this.playerCar = new PlayerCar(this.camera);

        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(
            Config.fog.color,
            Config.fog.near,
            Config.fog.far
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(
            Config.ambient.color,
            Config.ambient.intensity
        );
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(
            Config.directional.color,
            Config.directional.intensity
        );
        directionalLight.position.set(
            Config.directional.position.x,
            Config.directional.position.y,
            Config.directional.position.z
        );
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }

    setupSky() {
        const skyGeometry = new THREE.SphereGeometry(Config.sky.radius, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: Config.sky.color,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            Config.camera.fov,
            window.innerWidth / window.innerHeight,
            Config.camera.near,
            Config.camera.far
        );
        this.camera.position.set(0, Config.camera.height, 0);
        this.scene.add(this.camera);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updatePhysics() {
        // Handle acceleration
        if (this.inputController.isAccelerating()) {
            this.speed = Math.min(this.speed + Config.car.acceleration, Config.car.maxSpeed);
        } else if (this.inputController.isBraking()) {
            this.speed = Math.max(this.speed - Config.car.braking, -Config.car.maxReverseSpeed);
        } else {
            // Gradual deceleration
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - Config.car.deceleration, 0);
            } else if (this.speed < 0) {
                this.speed = Math.min(this.speed + Config.car.deceleration, 0);
            }
        }

        // Handle turning
        if (this.inputController.isTurningLeft()) {
            this.carRotation += Config.car.turnSpeed * (this.speed / Config.car.maxSpeed);
        } else if (this.inputController.isTurningRight()) {
            this.carRotation -= Config.car.turnSpeed * (this.speed / Config.car.maxSpeed);
        }

        // Update steering wheel
        this.playerCar.updateSteering(
            this.inputController.isTurningLeft(),
            this.inputController.isTurningRight()
        );

        // Update car position
        const speedFactor = this.speed / 60;
        this.carX += Math.sin(-this.carRotation) * speedFactor;
        this.carZ -= Math.cos(-this.carRotation) * speedFactor;

        // Guide car toward road center
        const roadCenterX = this.roadManager.getRoadCenterX(this.carZ);
        const offsetFromCenter = this.carX - roadCenterX;
        this.carX -= offsetFromCenter * Config.road.followStrength;

        // Keep car on road
        const maxOffsetFromCenter = Config.road.width / 2 - 2;
        if (Math.abs(offsetFromCenter) > maxOffsetFromCenter) {
            this.carX = roadCenterX + Math.sign(offsetFromCenter) * maxOffsetFromCenter;
        }

        // Update camera position
        this.camera.position.x = this.carX;
        this.camera.position.z = this.carZ;
        this.camera.rotation.y = this.carRotation;
    }

    updateGameState() {
        // Check collisions
        const collision = this.obstacleManager.update(this.carX, this.carZ, this.speed);
        if (collision) {
            this.speed = Math.max(this.speed * Config.obstacle.collisionSpeedMultiplier, 0);
            this.score = Math.max(0, this.score - Config.obstacle.collisionScorePenalty);
        }

        // Update score
        if (this.speed > 0) {
            this.score += this.speed / 1000;
        }

        // Update HUD
        document.getElementById('speed').textContent = Math.round(Math.abs(this.speed));
        document.getElementById('score').textContent = Math.round(this.score);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.updatePhysics();
        this.roadManager.update(this.carZ);
        this.treeManager.update(this.carZ);
        this.updateGameState();

        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
