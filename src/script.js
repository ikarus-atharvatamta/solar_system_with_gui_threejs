import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as dat from "dat.gui";
import starsTexture from "./assets/img/stars3.jpg";
import sunTexture from "./assets/img/sun.jpg";
import mercuryTexture from "./assets/img/mercury.jpg";
import venusTexture from "./assets/img/venus.jpg";
import earthTexture from "./assets/img/earth.jpg";
import marsTexture from "./assets/img/mercury.jpg";
import jupiterTexture from "./assets/img/jupiter.jpg";
import saturnTexture from "./assets/img/saturn.jpg";
import saturnRingTexture from "./assets/img/saturn_ring.png";
import uranusTexture from "./assets/img/uranus.jpg";
import uranusRingTexture from "./assets/img/mercury.jpg";
import neptuneTexture from "./assets/img/neptune.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// loading texture for background

// creating an instance of webgl renderer, setting its size,
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // add the output of the render function to the HTML

//creating an instanc eof scene class
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70, //field of view
  window.innerWidth / window.innerHeight, //aspect ratio
  0.1, // near plane
  1000 //far plane
);
camera.position.set(-60, 100, 100);
//adding orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, .46);
scene.add(ambientLight);
//spaceship

const shipOrbit = new THREE.Object3D();
scene.add(shipOrbit);

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "../public/assets/models/spaceship.glb",
  (gltf) => {
    const spaceship = gltf.scene;

    spaceship.scale.set(0.3, 0.3, 0.3);
    spaceship.position.set(70, 10, 40);
    spaceship.rotation.y = Math.PI / 2;
    shipOrbit.add(spaceship);
  },undefined,
  function(error) {
    console.error("error")
  }
  
);

//adding gridhelper to plane
// const gridHelper = new THREE.GridHelper(12,15);
// scene.add(gridHelper);
// //adding axes helper
// const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

// adding background texture as starsTexture.jpg
const textures = [];
const textureLoader = new THREE.TextureLoader(); //creating instance of texture Loader
const mercuryMap = textureLoader.load(mercuryTexture);
const venusMap = textureLoader.load(venusTexture);
const earthMap = textureLoader.load(earthTexture);
const marsMap = textureLoader.load(marsTexture);
const jupiterMap = textureLoader.load(jupiterTexture);
const saturnMap = textureLoader.load(saturnTexture);
const SaturnRing = textureLoader.load(saturnRingTexture);
const UranusRing = textureLoader.load(uranusRingTexture);
const uranusMap = textureLoader.load(uranusTexture);
const neptuneMap = textureLoader.load(neptuneTexture);

textures.push(
  mercuryMap,
  venusMap,
  earthMap,
  marsMap,
  jupiterMap,
  saturnMap,
  uranusMap,
  neptuneMap,
  SaturnRing,
  UranusRing
);

textures.forEach(function (t) {
  t.colorSpace = THREE.SRGBColorSpace;
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

// ========creating solar system =========
//creating light at the centre of the sun
const pointLight = new THREE.PointLight(0xffffff, 20030, 400);

pointLight.position.set(0, 0, 0);
scene.add(pointLight);
const lHelper = new THREE.PointLightHelper(pointLight);
scene.add(lHelper);

//sun
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sunTexture),
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanets(size, texture, position, ring) {
  const geo = new THREE.SphereGeometry(size, 30, 30);
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
  });
  const mesh = new THREE.Mesh(geo, mat);
  const obj = new THREE.Object3D();
  obj.add(mesh);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      32
    );
    const ringMat = new THREE.MeshBasicMaterial({
      map: ring.texture,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    obj.add(ringMesh);
    ringMesh.position.x = position;
    ringMesh.rotation.x = -0.5 * Math.PI;
  }
  scene.add(obj);
  mesh.position.x = position;
  return { mesh, obj };
}

const mercury = createPlanets(3.2, mercuryMap, 28);

const venus = createPlanets(5.8, venusMap, 44);
const mars = createPlanets(4, marsMap, 70);
const earth = createPlanets(6, earthMap, 55);
const jupiter = createPlanets(10, jupiterMap, 100);
const saturn = createPlanets(8, saturnMap, 128, {
  innerRadius: 10,
  outerRadius: 20,
  texture: SaturnRing,
});
const uranus = createPlanets(7, uranusMap, 150, {
  innerRadius: 7,
  outerRadius: 9,
  texture: UranusRing,
});
const neptune = createPlanets(7, neptuneMap, 175);

//lsit of planet meshes

const planets = [mercury, venus, mars, earth, jupiter, saturn, uranus, neptune];
//tag each planet mesh with a name

mercury.mesh.userData.name = "Mercury";
venus.mesh.userData.name = "Venus";
earth.mesh.userData.name = "Earth";
mars.mesh.userData.name = "Mars";
jupiter.mesh.userData.name = "Jupiter";
saturn.mesh.userData.name = "Saturn";
uranus.mesh.userData.name = "Uranus";
neptune.mesh.userData.name = "Neptune";

planets.forEach((p) => {
  p.mesh.userData.type = "planet";
});

//adding orbits
function orbitAdd(radius) {
  const geo = new THREE.RingGeometry(radius - 0.5, radius + 0.05, 155, 1, 0);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
  });
  const orbit = new THREE.Mesh(geo, mat);
  orbit.rotation.x = -0.5 * Math.PI;
  scene.add(orbit);
}
orbitAdd(28);
orbitAdd(44);
orbitAdd(55);
orbitAdd(70);
orbitAdd(128);
orbitAdd(100);
orbitAdd(150);
orbitAdd(170);

// adding gui controls
const gui = new dat.GUI();
const options = {
  mercury: 0.0004,
  venus: 0.0003,
  earth: 0.002,
  mars: 0.001,
  jupiter: 0.0009,
  saturn: 0.0008,
  uranus: 0.0007,
  neptune: 0.0006,
};
let step = 0;
const revolutionFolder = gui.addFolder("revolution speed control");

revolutionFolder.add(options, "mercury", 0, 0.05, 0.001);
revolutionFolder.add(options, "venus", 0, 0.05, 0.001);
revolutionFolder.add(options, "earth", 0, 0.05, 0.001);
revolutionFolder.add(options, "mars", 0, 0.05, 0.001);
revolutionFolder.add(options, "jupiter", 0, 0.05, 0.001);
revolutionFolder.add(options, "saturn", 0, 0.05, 0.001);
revolutionFolder.add(options, "uranus", 0, 0.05, 0.001);
revolutionFolder.add(options, "neptune", 0, 0.05, 0.001);

let selectedPlanet = null;

const whichPlanet = {
  selectedPlanet: "NONE",
};

gui.add(whichPlanet, "selectedPlanet").name("Selected Planet").listen();
function selectPlanet() {
  rayCaster.setFromCamera(mousePosition, camera);

  const intersects = rayCaster.intersectObjects(planets.map((p) => p.mesh));

  if (intersects.length > 0) {
    // reset previous
    if (selectedPlanet) {
      selectedPlanet.material.emissive.set(0);
    }

    selectedPlanet = intersects[0].object;
    selectedPlanet.material.emissive.set("green");

    whichPlanet.selectedPlanet = selectedPlanet.userData.name;

    console.log("Selected planet:", whichPlanet.selectedPlanet);
  }
}

//raycaster
const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;

  selectPlanet();
});
const rayCaster = new THREE.Raycaster();

function animate() {
  requestAnimationFrame(animate);

  sun.rotateY(0.004);
  mercury.mesh.rotateY(0.004);
  venus.mesh.rotateY(0.002);
  earth.mesh.rotateY(0.02);
  mars.mesh.rotateY(0.018);
  jupiter.mesh.rotateY(0.014);
  saturn.mesh.rotateY(0.048);
  uranus.mesh.rotateY(0.03);
  neptune.mesh.rotateY(0.032); //

  //rotate around the sun
  //   mercury.obj.rotateY(0.04);
  //   venus.obj.rotateY(0.015);
  //   earth.obj.rotateY(0.01);
  //   mars.obj.rotateY(0.008);
  //   jupiter.obj.rotateY(0.01);
  //   saturn.obj.rotateY(0.00909);
  //   uranus.obj.rotateY(0.0054);
  //   neptune.obj.rotateY(0.0031);

  mercury.obj.rotateY(options.mercury);
  venus.obj.rotateY(options.venus);
  earth.obj.rotateY(options.earth);
  mars.obj.rotateY(options.mars);
  jupiter.obj.rotateY(options.jupiter);
  saturn.obj.rotateY(options.saturn);
  uranus.obj.rotateY(options.uranus);
  neptune.obj.rotateY(options.neptune);

  shipOrbit.rotation.y += 0.002;
  shipOrbit.rotation.x += 0.003;
  shipOrbit.rotation.z += 0.001;

  renderer.render(scene, camera);
}

const mouse = new THREE.Vector2(); //normalised position of the cursor
const intersectionPoint = new THREE.Vector3(); // coordinates where the ray intersects the plane, specifically the location of the mouse click
const planeNormal = new THREE.Vector3(); // unit normal vector to represet direction of plane
const plane = new THREE.Plane(); // plane to be created whenever we change position of cursor
const raycaster = new THREE.Raycaster(); //emits the ray between the camera and the cursor.
const sphereGeometry = new THREE.SphereGeometry(0.35);

// to update the mouse variable with normalised coordiantes of current cursor position

window.addEventListener("click", function (e) {
  mouse.x = (e.clientX / this.window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
  planeNormal.copy(camera.position).normalize(); // to update plane normal
  //copy method copies coordinate of cameraposition
  // calling normalise on these coordinates generates the unit vector
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position); //create the plane.
  raycaster.setFromCamera(mouse, camera); // create the ray
  raycaster.ray.intersectPlane(plane, intersectionPoint);

  const sphere = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshBasicMaterial({
      color: "white",
    })
  );
  sphere.position.copy(intersectionPoint);
  scene.add(sphere);
});

animate();
// responsive window
window.addEventListener("resize", function(){
  camera.aspect = this.window.innerWidth/ this.window.innerHeight
  camera.updateProjectionMatrix();
  renderer.setSize(this.window.innerWidth, this.window.innerHeight)
})

/*creating mercury and addding ti to scene add it to sun's mesh so that sun becomes parent and maercury becomes its child
 const mercuryGeo = new THREE.SphereGeometry(3.2,30,30);
 const mercuryMesh = new THREE.MeshStandardMaterial({
    map: textureLoader.load(mercuryTexture)
 });
 const mercury = new THREE.Mesh(mercuryGeo,mercuryMesh)

 //creating mercuryObj so that mercury rotates around that
 const mercuryObj = new THREE.Object3D();
 mercuryObj.add(mercury);
 scene.add(mercuryObj)
 mercury.position.x = 28;

 //creating saturn
 const saturnGeo = new THREE.SphereGeometry(7,30,30);
 const saturnMat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(saturnTexture)
 });
 const saturn = new THREE.Mesh(saturnGeo,saturnMat)
 //creating saturnObj so that saturn rotates around that
 const saturnObj = new THREE.Object3D();
 saturnObj.add(saturn);
 scene.add(saturnObj)
 saturn.position.x = 128;

 
 const saturnRingGeo = new THREE.RingGeometry(8,18,32);
 const saturnRingMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(saturnRingTexture),
    side: THREE.DoubleSide
 });
 const saturnRing = new THREE.Mesh(saturnRingGeo,saturnRingMat)
 //creating saturnObj so that saturn rotates around that

 saturnObj.add(saturnRing);

 saturnRing.position.x = 128;
saturnRing.rotation.x = -0.5*Math.PI
*/
