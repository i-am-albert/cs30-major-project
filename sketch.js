// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// will add ship connections with constraints

// Matter.js variables
let engine;
let world;
let shipBody;

let draggedModule;

// constants
const MODULE_SIZE = 64;
const FORCE = 0.001;
const TORQUE = 0.001;

// image variables
let moduleImages;
let planetImages;

// state variables
let started = false;

class Module {
  constructor(posx, posy, posx2, posy2, type) {
    this.type = type;
    this.body = Matter.Bodies.rectangle(posx*MODULE_SIZE, posy*MODULE_SIZE, MODULE_SIZE, MODULE_SIZE, {frictionAir: 0.0});
    Matter.World.add(world, this.body);
  }

  display() {
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    image(this.type, -MODULE_SIZE/2, -MODULE_SIZE/2, MODULE_SIZE, MODULE_SIZE);
    pop();
  }

  containsPoint(x, y) {
    return Matter.Bounds.contains(this.body.bounds, {x:x, y:y});
  }
}

let moduleArray = [];

function preload() {
  moduleImages = {
    booster: loadImage("assets/modules/booster.png"),
    cargo: loadImage("assets/modules/cargo.png"),
    eco_booster: loadImage("assets/modules/eco_booster.png"),
    hub_booster: loadImage("assets/modules/hub_booster.png"),
    heart_hub: loadImage("assets/modules/heart_hub.png"),
    hub: loadImage("assets/modules/hub.png"),
    landing_booster: loadImage("assets/modules/landing_booster.png"),
    landing_gear: loadImage("assets/modules/landing_gear.png"),
    power_hub: loadImage("assets/modules/power_hub.png"),
    solar_panel: loadImage("assets/modules/solar_panel.png"),
    super_booster: loadImage("assets/modules/super_booster.png"),
  };
  planetImages = {
    earth: loadImage("assets/planets/earth.png"),
  };
}

function displayStartScreen() {
  fill("white");
  text("click to start",width/2,height/2);
}

function displayModules() {
  Matter.Engine.update(engine);
  translate(width / 2 - shipBody.position.x, height / 2 - shipBody.position.y);

  push();
  translate(shipBody.position.x, shipBody.position.y);
  rotate(shipBody.angle);
  image(moduleImages.heart_hub, -MODULE_SIZE / 2, -MODULE_SIZE / 2, MODULE_SIZE, MODULE_SIZE);
  pop();

  push();
  translate(earthBody.position.x, earthBody.position.y);
  image(planetImages.earth, -150, -150, 300, 300);
  pop();
  for (let module of moduleArray) {
    module.display(module.type,0,0);
  }
  
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  engine = Matter.Engine.create();
  world = engine.world;
  engine.gravity.x = 0;
  engine.gravity.y = 0;
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,

  shipBody = Matter.Bodies.rectangle(width / 2, height / 2, MODULE_SIZE, MODULE_SIZE, {frictionAir: 0.0});
  Matter.World.add(world, shipBody);
  earthBody = Matter.Bodies.circle(width / 2, height / 2 - 200, 150, {isStatic: true});
  Matter.World.add(world, earthBody);

  // example test modules
  moduleArray.push(new Module(0, 0, 0, 0, moduleImages.booster));
  moduleArray.push(new Module(1, 0, 0, 0, moduleImages.cargo));
  moduleArray.push(new Module(2, 2, 0, 0, moduleImages.eco_booster));
  moduleArray.push(new Module(3, 3, 0, 0, moduleImages.hub_booster));
  moduleArray.push(new Module(4, 4, 0, 0, moduleImages.hub));
  moduleArray.push(new Module(5, 5, 0, 0, moduleImages.landing_booster));
  moduleArray.push(new Module(10, 10, 0, 0, moduleImages.landing_gear));
  moduleArray.push(new Module(10, 11, 0, 0, moduleImages.power_hub));
  moduleArray.push(new Module(8, 8, 0, 0, moduleImages.solar_panel));
  moduleArray.push(new Module(7, 9, 0, 0, moduleImages.super_booster));
  let options = {
    bodyA: moduleArray[6].body,
    bodyB: moduleArray[7].body,
    pointA: {x: moduleArray[6].body.position.x, y: moduleArray[6].body.position.y+MODULE_SIZE/2},
    pointB: {x: moduleArray[7].body.position.x, y: moduleArray[7].body.position.y-MODULE_SIZE/2},
    stiffness: 1,
  };
  constraint = Matter.Constraint.create(options);
  Matter.World.add(world,constraint);
}

function draw() {
  background(0);

  if (started) {
    displayModules();
    shipControls();
  } 
  else {
    displayStartScreen();
  }
}

function mousePressed() {
  if (!started) {
    started = true;
  }

  for (let module of moduleArray) {
    if (module.containsPoint(mouseX - (width/2 - shipBody.position.x), mouseY - (height/2 - shipBody.position.y))) {
      draggedModule = module;
    }
  }
}

function mouseDragged() {
  if (draggedModule) {
    Matter.Body.setPosition(draggedModule.body, {
      x: mouseX - (width/2 - shipBody.position.x),
      y: mouseY - (height/2 - shipBody.position.y)
    });
  }
}

function mouseReleased() {
  draggedModule = null;
}

function shipControls() {
  // W
  if (keyIsDown(87)) {
    Matter.Body.applyForce(shipBody, shipBody.position, {x: FORCE*Math.cos(shipBody.angle - HALF_PI), y: FORCE*Math.sin(shipBody.angle - HALF_PI)});
  }
  // A
  if (keyIsDown(65)) {
    Matter.Body.setAngularVelocity(shipBody, shipBody.angularVelocity - TORQUE);
  }
  // S
  if (keyIsDown(83)) {
    Matter.Body.applyForce(shipBody, shipBody.position, {x: -FORCE*Math.cos(shipBody.angle - PI/2), y: -FORCE*Math.sin(shipBody.angle - PI/2)});
  }
  // D
  if (keyIsDown(68)) {
    Matter.Body.setAngularVelocity(shipBody, shipBody.angularVelocity + TORQUE);
  }
}