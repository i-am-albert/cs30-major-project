// Glap.io Recreation
// Albert Auer
// 1/22/2025
//
// Extra for Experts:
// - Using matter.js library
// - Recreating such a lost game
// - 2 game modes

// energy variables
let energy = 1000;
let maxEnergy = 1000;

// Matter.js variables
let engine;
let world;
let shipBody;

let draggedModule = null;

// constants
const MODULE_SIZE = 64;
const FORCE = 0.001;
const TORQUE = 0.001;
const THRUST_MULTIPLIER = 2;
const GRAVITY_CONSTANT = 0.0005;

// image variables
let moduleImages;
let planetImages;

// state variable
let state = "menu";

// booster particles
class Particle {
  constructor(x, y, type, color, size, rotation, dx, dy, lifetime, angle) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.size = size;
    this.rotation = rotation;
    this.dx = dx + shipBody.velocity.x + random(-1,1);
    this.dy = dy + shipBody.velocity.y + random(-1,1);
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
    this.size ++;
    this.age += 8;
  }
}

// general modules
class Module {
  constructor(posx, posy, type) {
    this.type = type;
    this.body = Matter.Bodies.rectangle(posx*MODULE_SIZE, posy*MODULE_SIZE, MODULE_SIZE, MODULE_SIZE, {frictionAir: 0.0});
    Matter.World.add(world, this.body);
    this.attached = false;
    this.initialAngle = 0; 
    // power
    this.powerStorage = 0;
    this.powerUsage = 0;
    this.powerRegen = 0;
  }

  display() {
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    image(this.type, -MODULE_SIZE/2, -MODULE_SIZE/2, MODULE_SIZE, MODULE_SIZE);
    pop();
    if (this.body.attached) {
      this.module.body.collisionFilter.category=1;
    }
    if (this.body.attached) {
      this.module.body.collisionFilter.category=2;
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
    if (this.attached) {
      
      let dx = this.thrust*FORCE*Math.cos(this.body.angle - HALF_PI)*THRUST_MULTIPLIER;
      let dy = this.thrust*FORCE*Math.sin(this.body.angle - HALF_PI)*THRUST_MULTIPLIER;

      // energy check
      if (energy > this.powerUsage) {
        Matter.Body.applyForce(this.body, this.body.position, { x: dx, y: dy });
        particleArray.push(new Particle(this.body.position.x, this.body.position.y, square, color(random(255, 255), random(0, 127), 0), random(10, 15), 0, -dx*5000, -dy*5000, 255, this.body.angle));

        energy -= this.powerUsage/60;
      }
    }
  }
}

let moduleArray = [];
let particleArray = [];

let engineSound;

function preload() {
  backgroundImage = loadImage("assets/background.png"),
  engineSound = loadSound("https://i-am-albert.github.io/cs30-major-project/assets/sounds/engine.mp3"),
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
  planetSymbols = {
    mercury: loadImage("assets/symbols/symbol_mercury.png"),
    venus: loadImage("assets/symbols/symbol_venus.png"),
    earth: loadImage("assets/symbols/symbol_earth.png"),
    moon: loadImage("assets/symbols/symbol_moon.png"),
    mars: loadImage("assets/symbols/symbol_mars.png"),
    jupiter: loadImage("assets/symbols/symbol_jupiter.png"),
    saturn: loadImage("assets/symbols/symbol_saturn.png"),
    uranus: loadImage("assets/symbols/symbol_uranus.png"),
    neptune: loadImage("assets/symbols/symbol_neptune.png"),
    pluto: loadImage("assets/symbols/symbol_pluto.png"),
  };
}

function displayStartScreen() {

  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text("Glap.io Recreation", width/2, height/5);
  image(moduleImages.heart_hub, width/2 - 100, height/2 - 75, 200, 200);

  textSize(24);
  text("HOW TO PLAY:\nW and S to go forward and backward, A and D to turn left and right\nDrag modules to attach to your ship\nBring cargo to planets to turn them into other modules\nClick spacebar to go back to Earth", width/2, height/3);

  fill(0, 200, 0);

  rect(width/2 - 100, height*3/4 - 30, 200, 60, 10);

  fill(0, 0, 200);

  rect(width/2 - 100, height*3/4+80 - 30, 200, 60, 10);

  fill(255);
  textSize(28);
  text("Normal Mode", width/2, height*3/4);
  text("Sandbox Mode", width/2, height*3/4+80);

  textSize(24);
  text("In sandbox, middle click\nto duplicate modules", width/2 + 250, height*3/4 + 80);
}

function drawPlanet(body, planetImage) {
  push();
  translate(body.position.x, body.position.y);

  // Sphere of influence (25% alpha)
  fill(255, 16); // White with 25% alpha for the fill
  noStroke();     // No outline
  circle(0, 0, body.circleRadius*8);

  // Planet drawing
  image(planetImage, -body.circleRadius, -body.circleRadius, body.circleRadius*2, body.circleRadius*2);
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


  // draw modules
  for (let module of moduleArray) {
    module.display(module.type,0,0);
  }
}

function displayPlanets() {
  circle(sunBody.position.x, sunBody.position.y, sunBody.circleRadius*2);
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
}

function displayParticles() {
  push();
  translate(width/2 - shipBody.position.x, height/2 - shipBody.position.y);

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

  // moon distance 250km = 1px
  // other distance 5000km = 1px
  // size 25km = 1px

  // earth to sun: 58884 px

  // hardcode all planets
  shipBody = Matter.Bodies.rectangle(0, 500, MODULE_SIZE, MODULE_SIZE, {frictionAir: 0.0});
  Matter.World.add(world, shipBody);
  sunBody = Matter.Bodies.circle(-29442, 0, 2785, {isStatic: true});
  Matter.World.add(world, sunBody);
  earthBody = Matter.Bodies.circle(0, 0, 255, {isStatic: true});
  Matter.World.add(world, earthBody);
  moonBody = Matter.Bodies.circle(0, 1538, 69, {isStatic: true});
  Matter.World.add(world, moonBody);
  mercuryBody = Matter.Bodies.circle(-15485, 0, 98, {isStatic: true});
  Matter.World.add(world, mercuryBody);
  venusBody = Matter.Bodies.circle(-7898, 0, 242, {isStatic: true});
  Matter.World.add(world, venusBody);
  marsBody = Matter.Bodies.circle(19620, 0, 135, {isStatic: true});
  Matter.World.add(world, marsBody);
  jupiterBody = Matter.Bodies.circle(122740, 0, 2796, {isStatic: true});
  Matter.World.add(world, jupiterBody);
  saturnBody = Matter.Bodies.circle(258358, 0, 2410, {isStatic: true});
  Matter.World.add(world, saturnBody);
  uranusBody = Matter.Bodies.circle(555258, 0, 1014, {isStatic: true});
  Matter.World.add(world, uranusBody);
  neptuneBody = Matter.Bodies.circle(864818, 2000, 984, {isStatic: true});
  Matter.World.add(world, neptuneBody);
  plutoBody = Matter.Bodies.circle(1151834, 2250, 47, {isStatic: true});
  Matter.World.add(world, plutoBody);

  // hardcode all power variables
  moduleImages.heart_hub.powerStorage = 1000;

  moduleImages.cargo.powerStorage = 300;

  moduleImages.landing_booster.powerUsage = 2;
  moduleImages.landing_booster.powerStorage = 150;

  moduleImages.booster.powerUsage = 2;
  moduleImages.booster.powerStorage = 250;

  moduleImages.eco_booster.powerUsage = 1;
  moduleImages.eco_booster.powerStorage = 200;

  moduleImages.hub_booster.powerUsage = 2;
  moduleImages.hub_booster.powerStorage = 300;

  moduleImages.super_booster.powerUsage = 3;
  moduleImages.super_booster.powerStorage = 150;

  moduleImages.solar_panel.powerRegen = 1;
  moduleImages.solar_panel.powerStorage = 200;

  moduleImages.hub.powerStorage = 250;

  moduleImages.power_hub.powerStorage = 900;

  moduleImages.landing_gear.powerStorage = 200;

  // sound
  engineSound.play();
  engineSound.loop();
  engineSound.amp(0);

  textAlign(LEFT, TOP);
}


function draw() {
  resizeCanvas(windowWidth, windowHeight);
  image(backgroundImage, 0, 0, width, height);

  if (state === "normal" || state === "sandbox") {
    displayParticles();
    displayModules();
    displayPlanets();
    shipControls();
    moduleDragging();
    drawPlanetIndicators();
    displayInfo();
    spawnCargo();
    handlePlanetCollisions();
    applyGravity();
    updateEnergy();
  } 
  else if (state === "menu") {
    displayStartScreen();
  }
}

function updateEnergy() {
  // Calculate total power usage, regen, and max storage
  let totalPowerUsage = 0;
  let totalPowerRegen = 0;
  let totalMaxEnergy = 0;

  for (let module of moduleArray) {
    if (module.attached) {
      totalPowerUsage += module.powerUsage;
      totalPowerRegen += module.powerRegen;
      totalMaxEnergy += module.powerStorage;
    }
  }

  // heart ship's power (1000)
  totalMaxEnergy += moduleImages.heart_hub.powerStorage;
  maxEnergy = totalMaxEnergy;

  // regeneration
  energy += totalPowerRegen/60;

  // recharge in sphere of influence
  if (isNearPlanet()) {
    energy = maxEnergy;
  }

  // energy is between 0 and maxEnergy
  energy = constrain(energy, 0, maxEnergy);
}

function isNearPlanet() {
  // checks if in planet's sphere of influence (4x radius of planet)
  for (let module of moduleArray) {
    if (module.attached) {
      for (let planet of [earthBody, moonBody, mercuryBody, venusBody, marsBody, jupiterBody, saturnBody, uranusBody, neptuneBody, plutoBody]) {
        let dx = module.body.position.x - planet.position.x;
        let dy = module.body.position.y - planet.position.y;
        let distance = Math.sqrt(dx*dx + dy*dy);

        if (distance < planet.circleRadius*4) {
          return true;
        }
      }
    }
  }
  return false;
}


function applyGravity() {
  const bodies = [shipBody, ...moduleArray.map(module => module.body)];
  const planets = [earthBody, moonBody, mercuryBody, venusBody, marsBody, jupiterBody, saturnBody, uranusBody, neptuneBody, plutoBody];
  // each module gets affected
  for (let body of bodies) {
    if (body !== draggedModule?.body) {
      // each planet affects
      for (let planet of planets) {
        const GRAVITY_RANGE = planet.circleRadius*4;
        if (body && planet) {
          // distance
          let dx = planet.position.x - body.position.x;
          let dy = planet.position.y - body.position.y;
          let distance = Math.sqrt(dx*dx + dy*dy);
    
          // if in range
          if (distance <= GRAVITY_RANGE) {
            // gravity direction
            let directionX = dx/distance;
            let directionY = dy/distance;
    
            // gravity force
            let forceX = GRAVITY_CONSTANT*directionX;
            let forceY = GRAVITY_CONSTANT*directionY;
    
            // apply gravity
            Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
          }
        }
      }
    }
  }
}
function handlePlanetCollisions() {
  for (let module of moduleArray) {
    if (module.attached) {
      // function to check if module is collided with planet
      function checkCollisionWithPlanet(planetBody, planetName) {
        let dx = module.body.position.x - planetBody.position.x;
        let dy = module.body.position.y - planetBody.position.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
      
        if (distance < planetBody.circleRadius*4) {
          // collision has been done
          if (module.type === moduleImages.cargo) {
            let newType;
            let thrust;
            let moduleClass;
            let powerUsage = 0;
            let powerStorage = 0;
            let powerRegen = 0;
      
            switch (planetName) {
            case "moon":
              newType = moduleImages.landing_booster;
              thrust = 1;
              moduleClass = "booster";
              powerUsage = moduleImages.landing_booster.powerUsage;
              powerStorage = moduleImages.landing_booster.powerStorage;
              break;
            case "jupiter":
              newType = moduleImages.booster;
              thrust = 1;
              moduleClass = "booster";
              powerUsage = moduleImages.booster.powerUsage;
              powerStorage = moduleImages.booster.powerStorage;
              break;
            case "venus":
              newType = moduleImages.eco_booster;
              thrust = 0.9;
              moduleClass = "booster";
              powerUsage = moduleImages.eco_booster.powerUsage;
              powerStorage = moduleImages.eco_booster.powerStorage;
              break;
            case "neptune":
              newType = moduleImages.hub_booster;
              thrust = 0.9;
              moduleClass = "booster";
              powerUsage = moduleImages.hub_booster.powerUsage;
              powerStorage = moduleImages.hub_booster.powerStorage;
              break;
            case "saturn":
              newType = moduleImages.super_booster;
              thrust = 3.5;
              moduleClass = "booster";
              powerUsage = moduleImages.super_booster.powerUsage;
              powerStorage = moduleImages.super_booster.powerStorage;
              break;
            case "mercury":
              newType = moduleImages.solar_panel;
              thrust = 0;
              moduleClass = "module";
              powerRegen = moduleImages.solar_panel.powerRegen;
              powerStorage = moduleImages.solar_panel.powerStorage;
              break;
            case "mars":
              newType = moduleImages.hub;
              thrust = 0;
              moduleClass = "module";
              powerUsage = moduleImages.hub.powerUsage;
              powerStorage = moduleImages.hub.powerStorage;
              break;
            case "uranus":
              newType = moduleImages.power_hub;
              thrust = 0;
              moduleClass = "module";
              powerUsage = moduleImages.power_hub.powerUsage;
              powerStorage = moduleImages.power_hub.powerStorage;
              break;
            case "pluto":
              newType = moduleImages.landing_gear;
              thrust = 0;
              moduleClass = "module";
              powerUsage = moduleImages.landing_gear.powerUsage;
              powerStorage = moduleImages.landing_gear.powerStorage;
              break;
            }
      
            // get constraints attached to the module
            let constraints = Matter.Composite.allConstraints(world).filter(function(constraint) {
              return constraint.bodyA === module.body || constraint.bodyB === module.body;
            });
      
            // Store the connected bodies and connection points
            let connectedBodies = [];
            for (let i = 0; i < constraints.length; i++) {
              let constraint = constraints[i];
              let connectedBody;
              if (constraint.bodyA === module.body) {
                connectedBody = constraint.bodyB;
              }
              else {
                connectedBody = constraint.bodyA;
              }
              let connectionPoint;
              if (constraint.bodyA === module.body) {
                connectionPoint = constraint.pointB;
              }
              else {
                connectionPoint = constraint.pointA;
              }
      
              connectedBodies.push({
                body: connectedBody,
                point: connectionPoint,
                angle: module.body.angle,
              });
      
              // Remove the constraint
              Matter.World.remove(world, constraint);
            }
      
            // Remove the old module
            Matter.World.remove(world, module.body);
            moduleArray.splice(moduleArray.indexOf(module), 1);
      
            // Create the new module
            let newModule;
            if (moduleClass === "booster") {
              newModule = new Booster(0, 0, newType, thrust);
            } 
            else {
              newModule = new Module(0, 0, newType);
            }
            // set the power properties
            newModule.powerUsage = powerUsage;
            newModule.powerStorage = powerStorage;
            newModule.powerRegen = powerRegen;
      
            // Set the position, angle, and attach
            Matter.Body.setPosition(newModule.body, module.body.position);
            Matter.Body.setAngle(newModule.body, module.body.angle);
            newModule.attached = true;
            newModule.initialAngle = newModule.body.angle-shipBody.angle;
            moduleArray.push(newModule);
      
            // Reattach the new module to connected bodies
            for (let j = 0; j < connectedBodies.length; j++) {
              let connection = connectedBodies[j];
              let options = {
                bodyA: connection.body,
                bodyB: newModule.body,
                pointA: connection.point,
                pointB: {
                  x: 0,
                  y: 0,
                },
                length: 0,
                stiffness: 0,
                damping: 0,
              };
              let constraint = Matter.Constraint.create(options);
              Matter.World.add(world, constraint);
              newModule.initialAngle = newModule.body.angle - shipBody.angle;
            }
          }
        }
      }

      // Check collisions with all planets
      checkCollisionWithPlanet(moonBody, "moon");
      checkCollisionWithPlanet(jupiterBody, "jupiter");
      checkCollisionWithPlanet(venusBody, "venus");
      checkCollisionWithPlanet(neptuneBody, "neptune");
      checkCollisionWithPlanet(saturnBody, "saturn");
      checkCollisionWithPlanet(mercuryBody, "mercury");
      checkCollisionWithPlanet(marsBody, "mars");
      checkCollisionWithPlanet(uranusBody, "uranus");
      checkCollisionWithPlanet(plutoBody, "pluto");
    }
  }
}
  


function displayInfo() {
  push();
  textAlign(LEFT, TOP);
  translate(shipBody.position.x - width/2, shipBody.position.y - height/2);
  text(`Velocity: ${Math.round(shipBody.speed*60)}px/s \nEnergy: ${Math.round(energy)}/${Math.round(maxEnergy)}\nFPS: ${Math.round(frameRate())}`, 0, 0);
  pop();
}

function spawnCargo() {
  // checking cargo amount as to not create too many
  let totalCargo = 0;
  for (module of moduleArray) {
    if (module.type === moduleImages.cargo) {
      totalCargo ++;
    }
  }
  // spawning cargo
  if (totalCargo < 8) {
    if (frameCount%160 === 0) {
      moduleArray.push(new Module(random(-1,1), random(-1,1), moduleImages.cargo));
    }
  }
}

function drawPlanetIndicators() {
  const maxIndicatorRadius = 200;
  const maxSize = 200;

  let maskGraphics = createGraphics(maxSize, maxSize);
  maskGraphics.circle(maxSize/2, maxSize/2, maxSize);

  function drawIndicator(planetBody, planetSymbol) {
    const dx = planetBody.position.x - shipBody.position.x;
    const dy = planetBody.position.y - shipBody.position.y;
    const distance = Math.sqrt(dx*dx + dy*dy);

    const angleToPlanet = Math.atan2(dy, dx);
    const indicatorX = maxIndicatorRadius*Math.cos(angleToPlanet);
    const indicatorY = maxIndicatorRadius*Math.sin(angleToPlanet);

    const indicatorSize = 50 + 150*Math.exp(-0.001*distance);
    const alpha = 64 + 96*Math.exp(-0.001*distance);

    push();
    translate(shipBody.position.x + indicatorX, shipBody.position.y + indicatorY);
    // mask so its a circle
    let maskedImage = planetSymbol.get();
    maskedImage.mask(maskGraphics);

    tint(255, alpha);
    image(maskedImage, -indicatorSize/2, -indicatorSize/2, indicatorSize, indicatorSize);

    // Display distance text
    fill(255, alpha); // Set text color and alpha
    textAlign(CENTER, TOP); // Align text above the indicator
    textSize(16); // Set text size
    text(Math.round(distance), 0, indicatorSize/2 + 5); // Display distance below the indicator

    pop();
  }

  const planets = [
    { body: moonBody, symbol: planetSymbols.moon },
    { body: earthBody, symbol: planetSymbols.earth },
    { body: jupiterBody, symbol: planetSymbols.jupiter },
    { body: venusBody, symbol: planetSymbols.venus },
    { body: neptuneBody, symbol: planetSymbols.neptune },
    { body: saturnBody, symbol: planetSymbols.saturn },
    { body: mercuryBody, symbol: planetSymbols.mercury },
    { body: marsBody, symbol: planetSymbols.mars },
    { body: uranusBody, symbol: planetSymbols.uranus },
    { body: plutoBody, symbol: planetSymbols.pluto }
  ];

  for (let planet of planets) {
    drawIndicator(planet.body, planet.symbol);
  }
}







function mousePressed() {
  if (state === "menu") {
    // normal button
    if (
      mouseX > width/2 - 100 &&
      mouseX < width/2 + 100 &&
      mouseY > height*3/4 - 30 &&
      mouseY < height*3/4 + 30
    ) {
      state = "normal";
    }

    // sandbox button
    if (
      mouseX > width/2 - 100 &&
      mouseX < width/2 + 100 &&
      mouseY > height*3/4 + 80 - 30 &&
      mouseY < height*3/4 + 80 + 30
    ) {
      state = "sandbox";
      // adding sandbox modules
      moduleArray.push(new Booster(0, 10, moduleImages.booster, 3));
      moduleArray.push(new Module(1, 10, moduleImages.cargo));
      moduleArray.push(new Booster(2, 10, moduleImages.eco_booster, 2));
      moduleArray.push(new Booster(3, 10, moduleImages.hub_booster, 3));
      moduleArray.push(new Module(4, 10, moduleImages.hub));
      moduleArray.push(new Booster(5, 10, moduleImages.landing_booster, 2));
      moduleArray.push(new Module(6, 10, moduleImages.landing_gear));
      moduleArray.push(new Module(7, 10, moduleImages.power_hub));
      moduleArray.push(new Module(8, 10, moduleImages.solar_panel));
      moduleArray.push(new Booster(9, 10, moduleImages.super_booster, 5));
    }
  }
  if (state === "sandbox" && mouseButton === CENTER) {
    for (let module of moduleArray) {
      if (module.containsPoint(mouseX - (width/2 - shipBody.position.x), mouseY - (height/2 - shipBody.position.y))) {
        let newModule;
        // duplicate module
        if (module instanceof Booster) {
          newModule = new Booster(
            0,
            0,
            module.type,
            module.thrust
          );
        } 
        else {
          newModule = new Module(0, 0, module.type);
        }
        // power properites
        newModule.powerUsage = module.powerUsage;
        newModule.powerStorage = module.powerStorage;
        newModule.powerRegen = module.powerRegen;
        Matter.Body.setPosition(newModule.body, {
          x: mouseX - (width/2 - shipBody.position.x),
          y: mouseY - (height/2 - shipBody.position.y),
        });
        moduleArray.push(newModule);
        draggedModule = newModule;
        break;
      }
    }
  } 
  else if (state === "menu" && mouseButton === LEFT) {
    // Check if the "Start Game" button is clicked
    if (
      mouseX > width/2 - 100 &&
      mouseX < width/2 + 100 &&
      mouseY > height*3/4 - 30 &&
      mouseY < height*3/4 + 30
    ) {
      state = "normal";
    }
  } 
  else {
    for (let module of moduleArray) {
      if (module.containsPoint(mouseX - (width/2 - shipBody.position.x), mouseY - (height/2 - shipBody.position.y))) {
        draggedModule = module;

        // if attached, detatch
        if (draggedModule.attached) {
          // remove connected constraints
          let constraintsToRemove = Matter.Composite.allConstraints(world).filter(
            (constraint) => {
              return (
                constraint.bodyA === draggedModule.body ||
                constraint.bodyB === draggedModule.body
              );
            }
          );

          for (let constraint of constraintsToRemove) {
            Matter.World.remove(world, constraint);
          }

          draggedModule.attached = false;
          detachDisconnectedModules(draggedModule.body);
        }
      }
    }
  }
}

function detachDisconnectedModules(detachedModuleBody) {
  let adjacencyList = buildAdjacencyList();
  let reachableModules = bfsFromShip(adjacencyList);
  for (let module of moduleArray) {
    if (module.attached && module.body !== shipBody && !reachableModules.has(module.body)) {
      detachModule(module.body);
    }
  }
}

function buildAdjacencyList() {
  let adjacencyList = new Map();

  // Add the ship body as a node
  adjacencyList.set(shipBody, []);

  // Add all attached modules as nodes
  for (let module of moduleArray) {
    if (module.attached) {
      adjacencyList.set(module.body, []);
    }
  }

  // Add edges based on constraints
  let constraints = Matter.Composite.allConstraints(world);
  for (let constraint of constraints) {
    if (adjacencyList.has(constraint.bodyA) && adjacencyList.has(constraint.bodyB)) {
      adjacencyList.get(constraint.bodyA).push(constraint.bodyB);
      adjacencyList.get(constraint.bodyB).push(constraint.bodyA);
    }
  }

  return adjacencyList;
}

function bfsFromShip(adjacencyList) {
  // breadth first search function
  let queue = [shipBody];
  let visited = new Set();
  visited.add(shipBody);

  while (queue.length > 0) {
    let current = queue.shift();
    let neighbors = adjacencyList.get(current);

    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

function detachModule(moduleBody) {
  // Remove constraints connected to the module
  let constraintsToRemove = Matter.Composite.allConstraints(world).filter(
    (constraint) => constraint.bodyA === moduleBody || constraint.bodyB === moduleBody
  );

  for (let constraint of constraintsToRemove) {
    Matter.World.remove(world, constraint);
  }

  // Mark the module as detached
  for (let module of moduleArray) {
    if (module.body === moduleBody) {
      module.attached = false;
      break;
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

function isModuleAtPosition(x, y, ignoredModule) {
  // check if module
  for (let module of moduleArray) {
    if (module.body !== ignoredModule && module.attached) {
      if (Matter.Bounds.contains(module.body.bounds, { x: x, y: y })) {
        return true;
      }
    }
  }
  // check if heart
  if (Matter.Bounds.contains(shipBody.bounds, { x: x, y: y })) {
    return true;
  }
  // if none
  return false;
}

function canAttachToSide(module, side) {
  // module rules
  // no side connections
  if (
    module.type === moduleImages.cargo ||
    module.type === moduleImages.booster ||
    module.type === moduleImages.eco_booster ||
    module.type === moduleImages.landing_booster ||
    module.type === moduleImages.super_booster ||
    module.type === moduleImages.landing_gear ||
    module.type === moduleImages.solar_panel
  ) {
    return side === "bottom";
  }
  // hub booster, 2 connections

  if (module.type === moduleImages.hub_booster) {
    let constraint = null;
    let constraints = Matter.Composite.allConstraints(world);
    for (let c of constraints) {
      if ((c.bodyA === module.body || c.bodyB === module.body) && c.bodyA !== c.bodyB) {
        constraint = c;
        break;
      }
    }
    if (constraint) {
      let relativePosition;
      if (constraint.bodyA === module.body) {
        relativePosition = {
          x: constraint.pointA.x,
          y: constraint.pointA.y
        };
      } 
      else {
        relativePosition = {
          x: constraint.pointB.x,
          y: constraint.pointB.y
        };
      }
      if (relativePosition.y < 0 && side === "top") {
        return false;
      }
    }
    return true;
  }

  // all side connections
  if (
    module.type === moduleImages.hub ||
    module.type === moduleImages.power_hub ||
    module.type === moduleImages.heart_hub
  ) {
    return true;
  }

  return true;
}


function moduleDragging() {
  if (draggedModule && !draggedModule.attached) {
    // no collision with other modules
    draggedModule.body.collisionFilter.category = 0;

    // drag module to mouse position
    Matter.Body.setPosition(draggedModule.body, {
      x: mouseX - (width/2 - shipBody.position.x),
      y: mouseY - (height/2 - shipBody.position.y),
    });

    // set variables for checking closest module
    let closestDist = Infinity;
    let closestSide = null;
    let canAttach = false;

    // Check heart module connections
    let heartConnections = getModuleConnections(shipBody);
    for (let connection of heartConnections) {
      let xDist = draggedModule.body.position.x - connection.x;
      let yDist = draggedModule.body.position.y - connection.y;
      let distance = Math.sqrt(xDist*xDist + yDist*yDist);

      if (distance < closestDist && !isModuleAtPosition(connection.x, connection.y, draggedModule.body)) {
        closestDist = distance;
        closestModule = shipBody;
        closestSide = connection;
        canAttach = true;
      }
    }

    // Check other module connections
    for (let module of moduleArray) {
      if (module.body !== draggedModule.body && module.attached) {
        let connections = getModuleConnections(module.body);

        for (let connection of connections) {
          let xDist = draggedModule.body.position.x - connection.x;
          let yDist = draggedModule.body.position.y - connection.y;
          let distance = Math.sqrt(xDist*xDist + yDist*yDist);

          if (distance < closestDist &&!isModuleAtPosition(connection.x, connection.y, draggedModule.body) &&canAttachToSide(module, connection.side)) {
            closestDist = distance;
            closestModule = module.body;
            closestSide = connection;
            canAttach = true;
          }
        }
      }
    }

    // Snap to closest side if close enough and no module is in the way
    if (closestDist < MODULE_SIZE/2 && canAttach) {
      Matter.Body.setPosition(draggedModule.body, {
        x: closestSide.x,
        y: closestSide.y,
      });
      Matter.Body.setAngle(draggedModule.body, closestSide.angle);
    }
  }
  checkModuleRotations();
}

function mouseReleased() {
  if (draggedModule) {
    draggedModule.body.collisionFilter.category = 1;

    // Set variables for checking closest module
    let closestDist = Infinity;
    let closestModule = null;
    let closestSide = null;
    let canAttach = false;

    // Check heart module connections
    let heartConnections = getModuleConnections(shipBody);
    for (let connection of heartConnections) {
      let xDist = draggedModule.body.position.x - connection.x;
      let yDist = draggedModule.body.position.y - connection.y;
      let distance = Math.sqrt(xDist*xDist + yDist*yDist);

      if (distance < closestDist && !isModuleAtPosition(connection.x, connection.y, draggedModule.body)) {
        closestDist = distance;
        closestModule = shipBody;
        closestSide = connection;
        canAttach = true;
      }
    }

    // Check other module connections
    for (let module of moduleArray) {
      if (module.body !== draggedModule.body && module.attached) {
        let connections = getModuleConnections(module.body);

        for (let connection of connections) {
          let xDist = draggedModule.body.position.x - connection.x;
          let yDist = draggedModule.body.position.y - connection.y;
          let distance = Math.sqrt(xDist*xDist + yDist*yDist);

          if (distance < closestDist &&!isModuleAtPosition(connection.x, connection.y, draggedModule.body) &&canAttachToSide(module, connection.side)) {
            closestDist = distance;
            closestModule = module.body;
            closestSide = connection;
            canAttach = true;
          }
        }
      }
    }

    // Connect to the closest side if close enough and no module is in the way
    if (closestDist < MODULE_SIZE/2 && canAttach) {
      connectModules(closestModule, draggedModule.body, closestSide);

      // velocity reset
      Matter.Body.setVelocity(draggedModule.body, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(draggedModule.body, 0);
    }

    // undrag module
    draggedModule = null;

    checkModuleRotations();
  }
}

function connectModules(bodyA, bodyB, connection) {
  let options = {
    bodyA: bodyA,
    bodyB: bodyB,
    pointA: {
      x: connection.x - bodyA.position.x,
      y: connection.y - bodyA.position.y,
    },
    pointB: { x: 0, y: 0 },
    length: 0,
    stiffness: 0,
    damping: 0,
  };
  let constraint = Constraint.create(options);
  Matter.World.add(world, constraint);

  // Update attachment status and angle
  if (bodyB === draggedModule.body) {
    draggedModule.attached = true;
    draggedModule.initialAngle = connection.angle;
    Matter.Body.setAngle(draggedModule.body, connection.angle);
  }
}

function checkModuleRotations() {
  for (let module of moduleArray) {
    if (module.attached) {
      // Calculate the angle difference between the module and the ship
      let angleDifference = module.body.angle - shipBody.angle - module.initialAngle;

      angleDifference = (angleDifference % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);
      if (angleDifference > Math.PI) {
        angleDifference -= 2*Math.PI;
      }

      // Detach the module if the angle difference is great
      if (Math.abs(angleDifference) > Math.PI/2) {
        detachModule(module.body);
        detachDisconnectedModules();
      }
    }
  }
}

function keyPressed() {
  // go to spawn
  if (key === ' ' && (state === "normal" || state === "sandbox")) {
    resetShip();
  }
}

function resetShip() {

  // offset calculation
  let offsetX = -shipBody.position.x;
  let offsetY = 800-shipBody.position.y;

  // Move the ship body
  Matter.Body.setPosition(shipBody, { x: 0, y: 800 });
  Matter.Body.setVelocity(shipBody, { x: 0, y: 0 });


  // Move all attached modules along with the ship
  for (let module of moduleArray) {
    if (module.attached) {
      Matter.Body.setPosition(module.body, {
        x: module.body.position.x + offsetX,
        y: module.body.position.y + offsetY,
      });
      Matter.Body.setVelocity(module.body, { x: 0, y: 0 });
    }
  }
}

function shipControls() {
  let engineActive = false;
  // controls for heart module
  // W
  if (keyIsDown(87)) {
    
    if (energy > 0){
      Matter.Body.applyForce(shipBody, shipBody.position, {x: FORCE*Math.cos(shipBody.angle - HALF_PI), y: FORCE*Math.sin(shipBody.angle - HALF_PI)});
      engineActive = true;
      energy -= 0.1;
    }
  }
  // A
  if (keyIsDown(65)) {
    Matter.Body.setAngularVelocity(shipBody, shipBody.angularVelocity - TORQUE);
    engineActive = true;
  }
  // S
  if (keyIsDown(83)) {
    
    if (energy > 0){
      Matter.Body.applyForce(shipBody, shipBody.position, {x: -FORCE*Math.cos(shipBody.angle - PI/2), y: -FORCE*Math.sin(shipBody.angle - PI/2)});
      engineActive = true;
      energy -= 0.1;
    }
  }
  // D
  if (keyIsDown(68)) {
    Matter.Body.setAngularVelocity(shipBody, shipBody.angularVelocity + TORQUE);
    engineActive = true;
  }

  // controls for boosters
  for (let module of moduleArray) {
    if (module.attached) {

      let dx = module.body.position.x - shipBody.position.x;
      let dy = module.body.position.y - shipBody.position.y;

      // rotate to heart ship coordinates
      let localX = dx*cos(-shipBody.angle) - dy*sin(-shipBody.angle);
      let localY = dx*sin(-shipBody.angle) + dy*cos(-shipBody.angle);

      // W
      if (keyIsDown(87)) {
        if (cos(module.body.angle - shipBody.angle) > cos(PI/4)) {
          module.boost();
        }
          
          
      }
      // A
      if (keyIsDown(65)) {
        Matter.Body.setAngularVelocity(module.body, module.body.angularVelocity - TORQUE);
        if (localX*localY > 10) {
          module.boost();
        }
        
        
      }
      // S
      if (keyIsDown(83)) {
        if (cos(module.body.angle - shipBody.angle) < -cos(PI/4)) {
          module.boost();
        }
          
          
      }
      // D
      if (keyIsDown(68)) {
        Matter.Body.setAngularVelocity(module.body, module.body.angularVelocity + TORQUE);
        if (localX*localY < -10) {
          module.boost();
        }
      }
    }
  }

  // sound system
  if (engineActive) {
    engineSound.amp(0.05);
  }
  else {
    engineSound.amp(0);
  }
}