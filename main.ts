module BABYLON {
    export class TP {
        // Public members
        public scene: Scene;

        // Private members
        private _ground: GroundMesh = null;
        private _cubes: Mesh[] = [];
        private _skybox: Mesh = null;
        private _obstacles: Mesh[] = [];

        private _light: PointLight = null;

        private _camera: ArcRotateCamera = null;

        private cubeSize = 4;

        constructor (scene: Scene) {
            this.scene = scene;
        }

        // Setups the physics bodies of each meshes
        public setupPhysics (): void {
            // Setup physics in scene
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());

            // Set physics bodies
            this._ground.setPhysicsState(PhysicsEngine.BoxImpostor, { mass: 0 });

            // Set physics bodies of obstacles
            this._obstacles.forEach((o) => o.setPhysicsState(PhysicsEngine.BoxImpostor, { mass: 0 }));

            this._cubes.forEach(cube => {
                // Set physics for a cube
                cube.setPhysicsState(PhysicsEngine.BoxImpostor, { mass: 0.5 });
                // Tap the ball
                cube.actionManager = new ActionManager(this.scene);
                cube.actionManager.registerAction(
                    new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (evt) => {
                        var pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
                        
                        var coef = 0.3;
                        var force = pick.pickedPoint.subtract(this._camera.position);
                        force = force.multiply(new Vector3(coef, coef, coef));

                        cube.applyImpulse(force, pick.pickedPoint);
                    })
                );
            });
        }

        // Setups collisions on objects and camera
        public setupCollisions (): void {
            // Setup camera collisions
            this.scene.gravity = new Vector3(0, -0.981, 0);
            // this._camera.ellipsoid = new Vector3(2, 3, 2);

            this._camera.checkCollisions = true;
            // this._camera.applyGravity = true;

            this._ground.checkCollisions = true;
            this._cubes.forEach(cube => {
                cube.checkCollisions = true;
            });
            // this._cube.checkCollisions = true;

            this._obstacles.forEach((o) => o.checkCollisions = true);
        }

        // Setups the meshes used to play football
        public createMeshes (): void {
            // Create camera
            this._camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0.5, 1, 0.5, new BABYLON.Vector3(60, 30, 0), this.scene);
            this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());

            // Map ZQSD keys to move camera
            this._camera.keysUp = [90]; // Z
            this._camera.keysDown = [83]; // S
            this._camera.keysLeft = [81] // Q
            this._camera.keysRight = [68]; // D

            this._camera.setTarget(new Vector3(0, 0, 0));

            // Create light
            this._light = new PointLight("light", new Vector3(0, 100, 0), this.scene);

            // Create scene meshes
            this._ground = <GroundMesh> Mesh.CreateGround("ground", 200, 200, 2, this.scene);

           // Create standard material
            var groundMaterial = new StandardMaterial("ground", this.scene);
            this._ground.material = groundMaterial;

            var gravelTexture = new Texture("assets/GravierDiff.jpg", this.scene, false, false, Texture.NEAREST_SAMPLINGMODE);
            gravelTexture.uScale = gravelTexture.vScale = 10.0;
            groundMaterial.diffuseTexture = gravelTexture;

            groundMaterial.diffuseColor = Color3.Gray();
            groundMaterial.specularColor = Color3.Black(); // new Color3(0, 0, 0);

            // Create obstacles
            var leftCube = Mesh.CreateBox("leftCube", 40, this.scene);
            leftCube.position.x -= this._ground._width / 2;
            leftCube.position.y = 5;
            leftCube.scaling.z = 5;
            leftCube.scaling.x = 0.1;

            var rightCube = Mesh.CreateBox("rightCube", 40, this.scene);
            rightCube.position.x += this._ground._width / 2; // Same as left cube except +this._ground._width
            rightCube.position.y = 5;
            rightCube.scaling.z = 5;
            rightCube.scaling.x = 0.1;

            var backCube = Mesh.CreateBox("backCube", 40, this.scene);
            backCube.position.z -= this._ground._height / 2;
            backCube.position.y = 5;
            backCube.scaling.x = 5;
            backCube.scaling.z = 0.1;

            var frontCube = Mesh.CreateBox("frontCube", 40, this.scene);
            frontCube.position.z += this._ground._height / 2;
            frontCube.position.y = 5;
            frontCube.scaling.x = 5;
            frontCube.scaling.z = 0.1;
            this._obstacles = [leftCube, rightCube, backCube, frontCube];

            // create a pile of cubes
            this.buildCubes();
        }

        public buildCubes (): void {
            // z-axe 
            for (var z=0; z<5; z++) {
                // y-axe
                for (var y=0; y<5; y++ ) {
                    // x-axe
                    for (var x=0; x<5; x++ ) {
                        var cube = Mesh.CreateBox("cube", this.cubeSize, this.scene);
                        cube.position.y = this.cubeSize/2 + y*this.cubeSize;
                        cube.position.z = -10 + z*this.cubeSize;
                        cube.position.x = -10 + x*this.cubeSize;
                        this._cubes.push(cube);
                    }
                }
            }
        }
    }
}
