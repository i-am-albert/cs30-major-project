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

class Particle {
  constructor(x, y, type, color, size, rotation, dx, dy, lifetime, angle) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.size = size;
    this.rotation = rotation;
    this.dx = dx + shipBody.velocity.x + random(-2,2);
    this.dy = dy + shipBody.velocity.y + random(-2,2);
    this.lifetime = lifetime;
    this.angle = angle;
    this.age = 0;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(this.color.levels[0],this.color.levels[1],this.color.levels[2],255-this.age);
    rect(-this.size/2, -this.size/2, this.size, this.size);
    pop();
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
    this.age += 8;
  }
}

class Module {
  constructor(posx, posy, type) {
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
    if (this.body.type.attatched) {
      this.module.body.collisionFilter.category=1;
    }
  }

  containsPoint(x, y) {
    return Matter.Bounds.contains(this.body.bounds, {x:x, y:y});
  }

  boost() {
  }
}

class Booster extends Module {
  constructor(posx, posy, type, thrust) {
    super(posx, posy, type);
    this.thrust = thrust;
  }

  containsPoint(x, y) {
    return Matter.Bounds.contains(this.body.bounds, {x:x, y:y});
  }

  boost() {
    super.boost();
    if (this.type.attatched) {
      let dx = this.thrust*FORCE*Math.cos(this.body.angle - HALF_PI);
      let dy = this.thrust*FORCE*Math.sin(this.body.angle - HALF_PI);
      Matter.Body.applyForce(this.body, this.body.position, {x: dx, y: dy});
      particleArray.push(new Particle(this.body.position.x, this.body.position.y, square, color(random(255,255), random(0,127), 0), 20, 0, -dx*5000, -dy*5000, 255, this.body.angle));
    }
  }
}

let moduleArray = [];
let particleArray = [];

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
  translate(width/2 - shipBody.position.x, height/2 - shipBody.position.y);
  push();
  translate(shipBody.position.x, shipBody.position.y);
  rotate(shipBody.angle);
  image(moduleImages.heart_hub, -MODULE_SIZE/2, -MODULE_SIZE/2, MODULE_SIZE, MODULE_SIZE);
  pop();
  push();
  translate(earthBody.position.x, earthBody.position.y);
  image(planetImages.earth, -150, -150, 300, 300);
  pop();
  for (let module of moduleArray) {
    module.display(module.type,0,0);
  }
}

function displayParticles() {
  for (let particle of particleArray) {
    particle.display();
    particle.move();
    if (particle.lifetime - particle.age < 0) {
      particleArray.splice(particle, 1);
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

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
  moduleArray.push(new Booster(5, 5, moduleImages.booster, 3));
  // moduleArray.push(new Booster(5, 6, moduleImages.booster, 3));
  // moduleArray.push(new Booster(6, 5, moduleImages.booster, 1));
  // moduleArray.push(new Booster(6, 6, moduleImages.booster, 1));
  // moduleArray.push(new Booster(7, 5, moduleImages.booster, 1));
  // moduleArray.push(new Booster(7, 6, moduleImages.booster, 1));
  // moduleArray.push(new Module(1, 0, moduleImages.cargo));
  // moduleArray.push(new Booster(2, 2, moduleImages.eco_booster, 2));
  // moduleArray.push(new Booster(3, 3, moduleImages.hub_booster, 3));
  moduleArray.push(new Module(4, 4, moduleImages.hub));
  moduleArray.push(new Booster(5, 5, moduleImages.landing_booster, 2));
  moduleArray.push(new Module(10, 10, moduleImages.landing_gear));
  moduleArray.push(new Module(9.25, 7, moduleImages.power_hub));
  moduleArray.push(new Module(8, 8, moduleImages.solar_panel));
  moduleArray.push(new Booster(7, 9, moduleImages.super_booster, 5));
}

function draw() {
  background(0);

  if (started) {
    displayModules();
    shipControls();
    displayParticles();
    moduleDragging();
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

function moduleDragging() {
  if (draggedModule && !draggedModule.type.attatched) {
    draggedModule.body.collisionFilter.category=1;
    Matter.Body.setPosition(draggedModule.body, {
      x: mouseX - (width/2 - shipBody.position.x),
      y: mouseY - (height/2 - shipBody.position.y)
    });
    if (abs(draggedModule.body.position.x-shipBody.position.x) < MODULE_SIZE && abs(draggedModule.body.position.y-shipBody.position.y) < MODULE_SIZE) {
      let options = {
        bodyA: shipBody,
        bodyB: draggedModule.body,
        length: MODULE_SIZE,
      };
      let constraint = Matter.Constraint.create(options);
      Matter.World.add(world,constraint);
      draggedModule.type.attatched = true;
    }
    else {
      for (let module of moduleArray) {
        let closestDist = MODULE_SIZE*2;
        let xDist = abs(draggedModule.body.position.x-module.body.position.x);
        let yDist = abs(draggedModule.body.position.y-module.body.position.y);
        let xDistHeart = abs(draggedModule.body.position.x-shipBody.position.x);
        let yDistHeart = abs(draggedModule.body.position.y-shipBody.position.y);
        if (xDist < MODULE_SIZE && yDist < MODULE_SIZE && module.type.attatched === true) {
          let options = {
            bodyA: module.body,
            bodyB: draggedModule.body,
            pointA: {x: 0, y: 0},
            pointB: {x: 0, y: 0},
            length: MODULE_SIZE,
            stiffness: 0,
          };
          let constraint = Matter.Constraint.create(options);
          Matter.World.add(world,constraint);
          draggedModule.type.attatched = true;
        }
        let currentDistance = xDist + yDist;
        let heartDistance = xDistHeart + yDistHeart;
        if (currentDistance < closestDist && module !== draggedModule && module.type.attatched) {
          closestDist = currentDistance;
          draggedModule.body.angle = Math.atan2(module.body.position.y-draggedModule.body.position.y,module.body.position.x-draggedModule.body.position.x)+1.6;
        }
        else if (heartDistance < closestDist) {
          closestDist = currentDistance;
          draggedModule.body.angle = Math.atan2(shipBody.position.y-draggedModule.body.position.y,shipBody.position.x-draggedModule.body.position.x)+1.6;
        }
      }
    }
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

  for (let module of moduleArray) {
    if (module.type.attatched) {
      // https://academo.org/demos/rotation-about-point/
      let newModuleX = module.body.position.x;
      let newModuleY = module.body.position.y;
      // console.log(tempModuleX,tempModuleY);
      let tempModuleX = newModuleX*cos(-module.body.angle)-newModuleY*sin(-module.body.angle);
      let tempModuleY = newModuleX*cos(-module.body.angle)-newModuleY*sin(-module.body.angle);
      // console.log(tempModuleX,tempModuleY);
      console.log(module.body.angle%(PI*2));
      // W
      if (keyIsDown(87)) {
        // if (0 < sin(module.body.angle) && sin(module.body.angle) < 1) {
        if (PI/4 >= (module.body.angle-shipBody.angle)%(PI*2) && (module.body.angle-shipBody.angle)%(PI*2) <= PI/2) {
          module.boost();
        }
      }
      // A
      if (keyIsDown(65)) {
        // if (0 < sin(module.body.angle) && sin(module.body.angle) < 1) {
        if (newModuleY > shipBody.position.y && newModuleX > shipBody.position.x || newModuleY < shipBody.position.y && newModuleX < shipBody.position.x) {
          module.boost();
        }
      }
      // S
      if (keyIsDown(83)) {
        // if (0 < sin(module.body.angle) && sin(module.body.angle) < 1) {
        if (PI/4 < (module.body.angle-shipBody.angle)%(PI*2) || (module.body.angle-shipBody.angle)%(PI*2) > PI/2) {
          module.boost();
        }
      }
      // D
      if (keyIsDown(68)) {
        // if (0 < sin(module.body.angle) && sin(module.body.angle) < 1) {
        if (newModuleY > shipBody.position.y && newModuleX < shipBody.position.x || newModuleY < shipBody.position.y && newModuleX > shipBody.position.x) {
          module.boost();
        }
      }
    }
  }
}