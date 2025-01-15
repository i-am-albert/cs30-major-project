// Glap.io recreated
// Albert Auer
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


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

// booster particles
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

// general modules
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
    if (this.body.type.attached) {
      this.module.body.collisionFilter.category=1;
    }
  }

  containsPoint(x, y) {
    return Matter.Bounds.contains(this.body.bounds, {x:x, y:y});
  }

  boost() {
  }
}

// booster specific module
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
    if (this.type.attached) {
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
  backgroundImage = loadImage("assets/background.png"),
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
    mercury: loadImage("assets/planets/mercury.svg"),
    venus: loadImage("assets/planets/venus.svg"),
    earth: loadImage("assets/planets/earth.svg"),
    moon: loadImage("assets/planets/moon.svg"),
    mars: loadImage("assets/planets/mars.svg"),
    jupiter: loadImage("assets/planets/jupiter.svg"),
    saturn: loadImage("assets/planets/saturn.svg"),
    uranus: loadImage("assets/planets/uranus.svg"),
    neptune: loadImage("assets/planets/neptune.svg"),
    pluto: loadImage("assets/planets/pluto.svg"),
  };
}

function displayStartScreen() {
  background(0);

  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text("Glap.io Recreation", width/2, height/5);
  image(moduleImages.heart_hub, width/2 - 100, height/2 - 75, 200, 200)

  textSize(24);
  text("WASD to move, drag modules to attach to your ship", width/2, height/3);

  fill(0, 200, 0);

  rect(width/2 - 100, height * 3/4 - 30, 200, 60, 10);

  fill(255);
  textSize(28);
  text("Start Game", width/2, height * 3/4);
}



function drawPlanet(body, planetImage) {
  push();
  translate(body.position.x, body.position.y);
  image(planetImage, -body.circleRadius, -body.circleRadius, body.circleRadius * 2, body.circleRadius * 2);
  pop();
}

function displayModules() {
  // draw heart module
  Matter.Engine.update(engine);
  translate(width/2 - shipBody.position.x, height/2 - shipBody.position.y);
  push();
  translate(shipBody.position.x, shipBody.position.y);
  rotate(shipBody.angle);
  image(moduleImages.heart_hub, -MODULE_SIZE/2, -MODULE_SIZE/2, MODULE_SIZE, MODULE_SIZE);
  pop();

  // draw planets
  drawPlanet(earthBody, planetImages.earth);
  drawPlanet(moonBody, planetImages.moon);
  drawPlanet(mercuryBody, planetImages.mercury);
  drawPlanet(venusBody, planetImages.venus);
  drawPlanet(marsBody, planetImages.mars);
  drawPlanet(jupiterBody, planetImages.jupiter);
  drawPlanet(saturnBody, planetImages.saturn);
  drawPlanet(uranusBody, planetImages.uranus);
  drawPlanet(neptuneBody, planetImages.neptune);
  drawPlanet(uranusBody, planetImages.uranus);
  drawPlanet(plutoBody, planetImages.pluto);

  // draw modules
  for (let module of moduleArray) {
    module.display(module.type,0,0);
  }
}

function displayParticles() {
  push();
  translate((width / 2 - shipBody.position.x), (height / 2 - shipBody.position.y));

  for (let particle of particleArray) {
    particle.display();
    particle.move();
    if (particle.lifetime - particle.age < 0) {
      particleArray.splice(particleArray.indexOf(particle), 1);
    }
  }

  pop();
}


function setup() {
  // basic setup
  createCanvas(windowWidth, windowHeight);
  noStroke();

  engine = Matter.Engine.create();
  world = engine.world;
  engine.gravity.x = 0;
  engine.gravity.y = 0;
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,

  // hardcode all planets
  shipBody = Matter.Bodies.rectangle(width / 2, height / 2, MODULE_SIZE, MODULE_SIZE, {frictionAir: 0.0});
  Matter.World.add(world, shipBody);
  earthBody = Matter.Bodies.circle(width / 2, height / 2 - 200, 300, {isStatic: true});
  Matter.World.add(world, earthBody);
  moonBody = Matter.Bodies.circle(0, 0, 250, {isStatic: true});
  Matter.World.add(world, moonBody);
  mercuryBody = Matter.Bodies.circle(0, 500, 150, {isStatic: true});
  Matter.World.add(world, mercuryBody);
  venusBody = Matter.Bodies.circle(0, 750, 150, {isStatic: true});
  Matter.World.add(world, venusBody);
  marsBody = Matter.Bodies.circle(0, 1000, 150, {isStatic: true});
  Matter.World.add(world, marsBody);
  jupiterBody = Matter.Bodies.circle(0, 1250, 150, {isStatic: true});
  Matter.World.add(world, jupiterBody);
  saturnBody = Matter.Bodies.circle(0, 1500, 150, {isStatic: true});
  Matter.World.add(world, saturnBody);
  uranusBody = Matter.Bodies.circle(0, 1750, 150, {isStatic: true});
  Matter.World.add(world, uranusBody);
  neptuneBody = Matter.Bodies.circle(0, 2000, 150, {isStatic: true});
  Matter.World.add(world, neptuneBody);
  plutoBody = Matter.Bodies.circle(0, 2250, 150, {isStatic: true});
  Matter.World.add(world, plutoBody);

  // example test modules
  moduleArray.push(new Booster(1, 10, moduleImages.booster, 3));
  moduleArray.push(new Module(2, 10, moduleImages.cargo));
  moduleArray.push(new Booster(3, 10, moduleImages.eco_booster, 2));
  moduleArray.push(new Booster(4, 10, moduleImages.hub_booster, 3));
  moduleArray.push(new Module(5, 10, moduleImages.hub));
  moduleArray.push(new Booster(6, 10, moduleImages.landing_booster, 2));
  moduleArray.push(new Module(7, 10, moduleImages.landing_gear));
  moduleArray.push(new Module(8, 10, moduleImages.power_hub));
  moduleArray.push(new Module(9, 10, moduleImages.solar_panel));
  moduleArray.push(new Booster(10, 10, moduleImages.super_booster, 5));
}

function draw() {
  image(backgroundImage, 0, 0, width, height);

  if (started) {
    displayParticles();
    displayModules();
    shipControls();
    moduleDragging();
    drawEarthIndicator();
  } else {
    displayStartScreen();
  }
}

function drawEarthIndicator() {

  // distance to earth
  const dx = earthBody.position.x - shipBody.position.x;
  const dy = earthBody.position.y - shipBody.position.y;
  const distance = Math.sqrt(dx*dx + dy*dy);

  // indicator position
  const angleToEarth = atan2(dy, dx);
  const maxIndicatorRadius = 200;
  const indicatorX = maxIndicatorRadius*cos(angleToEarth);
  const indicatorY = maxIndicatorRadius*sin(angleToEarth);

  // indicator size
  const minSize = 50;
  const maxSize = 200;
  const maxDistance = 20000;
  const indicatorSize = map(distance, 0, maxDistance, maxSize, minSize);
  const constraintedSize = constrain(indicatorSize, minSize, maxSize);

  // background of cross

  push();
  translate(shipBody.position.x, shipBody.position.y);
  noStroke();
  fill(200, 100);
  ellipse(indicatorX, indicatorY, constraintedSize, constraintedSize);

  stroke(0, 150);
  strokeWeight(constraintedSize/10);
  noFill();
  ellipse(indicatorX, indicatorY, constraintedSize*0.8, constraintedSize*0.8);

  const crossSize = constraintedSize*0.8;
  // cross
  line(
    indicatorX - crossSize/2, indicatorY, indicatorX + crossSize/2, indicatorY
  );
  line(
    indicatorX, indicatorY - crossSize/2, indicatorX, indicatorY + crossSize/2
  );
  pop();
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

function getModuleConnections(body) {
  // find connection points for the module

  const cos = Math.cos(body.angle);
  const sin = Math.sin(body.angle);
  
  return [
    {
      x: body.position.x + MODULE_SIZE*cos,
      y: body.position.y + MODULE_SIZE*sin,
      angle: body.angle - HALF_PI,
      side: 'right'
    },
    {
      x: body.position.x - MODULE_SIZE*cos,
      y: body.position.y - MODULE_SIZE*sin,
      angle: body.angle + HALF_PI,
      side: 'left'
    },
    {
      x: body.position.x - MODULE_SIZE*sin,
      y: body.position.y + MODULE_SIZE*cos,
      angle: body.angle,
      side: 'top'
    },
    {
      x: body.position.x + MODULE_SIZE*sin,
      y: body.position.y - MODULE_SIZE*cos,
      angle: body.angle + PI,
      side: 'bottom'
    }
  ];
}

function moduleDragging() {
  if (draggedModule && !draggedModule.type.attached) {
    // no collision with other modules
    draggedModule.body.collisionFilter.category = 0;
    
    // drag module to mouse position
    Matter.Body.setPosition(draggedModule.body, {
      x: mouseX - (width/2 - shipBody.position.x),
      y: mouseY - (height/2 - shipBody.position.y)
    });

    // set variables for checking closest module
    let closestDist = Infinity;
    let closestModule = null;
    let closestSide = null;


    // Check heart module connections
    let heartConnections = getModuleConnections(shipBody);
    for (let connection of heartConnections) {
      let xDist = draggedModule.body.position.x - connection.x;
      let yDist = draggedModule.body.position.y - connection.y;
      let distance = Math.sqrt(xDist*xDist + yDist*yDist);
      
      if (distance < closestDist) {
        closestDist = distance;
        closestModule = shipBody;
        closestSide = connection;
      }
    }

    // Check other module connections
    for (let module of moduleArray) {
      if (module.body !== draggedModule.body && module.type.attached) {
        let connections = getModuleConnections(module.body);
        
        for (let connection of connections) {
          let xDist = draggedModule.body.position.x - connection.x;
          let yDist = draggedModule.body.position.y - connection.y;
          let distance = Math.sqrt(xDist * xDist + yDist * yDist);
          
          if (distance < closestDist) {
            closestDist = distance;
            closestModule = module.body;
            closestSide = connection;
          }
        }
      }
    }

    // Snap to closest side if close enough
    if (closestDist < MODULE_SIZE/2) {
      Matter.Body.setPosition(draggedModule.body, {
        x: closestSide.x,
        y: closestSide.y
      });
      Matter.Body.setAngle(draggedModule.body, closestSide.angle);
    }
  }
}

function mouseReleased() {
  if (draggedModule) {
    // module can now interact with other modules
    draggedModule.body.collisionFilter.category = 1;

    // check if point is close 
    function isCloseTo(x1, y1, x2, y2) {
      return abs(x1 - x2) < MODULE_SIZE/2 && abs(y1 - y2) < MODULE_SIZE/2;
    }

    // check heart module connections
    let heartConnections = getModuleConnections(shipBody);
    for (let connection of heartConnections) {
      if (isCloseTo(draggedModule.body.position.x, draggedModule.body.position.y, connection.x, connection.y)) {
        let options = {
          bodyA: shipBody,
          bodyB: draggedModule.body,
          pointA: {
            x: connection.x - shipBody.position.x,
            y: connection.y - shipBody.position.y
          },
          pointB: {
            x: 0,
            y: 0
          },
          length: 1,
          stiffness: 0.9,
          damping: 0.5
        };
        let constraint = Matter.Constraint.create(options);
        Matter.World.add(world, constraint);
        draggedModule.type.attached = true;
        Matter.Body.setAngle(draggedModule.body, connection.angle);
      }
    }

    // Check connection to other modules
    if (!draggedModule.type.attached) {
      for (let module of moduleArray) {
        if (module.type.attached && module.body !== draggedModule.body) {
          let connections = getModuleConnections(module.body);
          
          for (let connection of connections) {
            if (isCloseTo(draggedModule.body.position.x, draggedModule.body.position.y, connection.x, connection.y)) {
              draggedModule.body.velocity.x = shipBody.velocity.x;
              draggedModule.body.velocity.y = shipBody.velocity.y;
              
              let options = {
                bodyA: module.body,
                bodyB: draggedModule.body,
                pointA: {
                  x: connection.x - module.body.position.x,
                  y: connection.y - module.body.position.y
                },
                pointB: {
                  x: 0,
                  y: 0
                },
                length: 1,
                stiffness: 0.9,
                damping: 0.5
              };
              let constraint = Matter.Constraint.create(options);
              Matter.World.add(world, constraint);
              draggedModule.type.attached = true;
              Matter.Body.setAngle(draggedModule.body, connection.angle);
            }
          }
          if (draggedModule.type.attached);
        }
      }
    }
    // set dragged module speed to 0 
    if (draggedModule.type.attached) {
      Matter.Body.setSpeed(draggedModule.body, 0);
      Matter.Body.setAngularSpeed(draggedModule.body, 0);
    }
  }
  draggedModule = null;
}

function shipControls() {
  // controls for heart module
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

  // controls for boosters
  for (let module of moduleArray) {
    if (module.type.attached) {

      let dx = module.body.position.x - shipBody.position.x;
      let dy = module.body.position.y - shipBody.position.y;

      // rotate to heart ship coordinates
      let localX = dx * cos(-shipBody.angle) - dy * sin(-shipBody.angle);
      let localY = dx * sin(-shipBody.angle) + dy * cos(-shipBody.angle);


      // W
      if (keyIsDown(87)) {
        if (cos(module.body.angle - shipBody.angle) > cos(PI / 4)) {
          module.boost();
        }
          
          
      }
      // A
      if (keyIsDown(65)) {
        if (localX * localY > 0) {
          module.boost();
        }
        
        
      }
      // S
      if (keyIsDown(83)) {
        if (cos(module.body.angle - shipBody.angle) < -cos(PI / 4)) {
          module.boost();
        }
          
          
      }
      // D
      if (keyIsDown(68)) {
        if (localX * localY < 0) {
          module.boost();
        }
      }
    }
  }
}