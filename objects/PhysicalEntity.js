import DimensionEntity from "./DimensionEntity.js";
import * as math from "../functions/math.js";

export default class PhysicalEntity extends DimensionEntity {
	// TODO default values
	constructor(g, x, y, width, height) {
		super(g, x, y, width, height);

		this.hspeed = 0;
		this.vspeed = 0;
		this.direction = 0; // TODO document starting angle, deg/rad
		this.speed = 0;

		// Set whether objects leaving the room should jump to the other side of
		// the room:
		// 0: off, 1: horizontal, vertical, both
		// TODO camelCase, remove prefix
		this.swapScreen = 0;
	}

	setDirection(direction) {
		this.setDirectionSpeed(direction, this.speed);
	}

	setSpeed(speed) {
		this.setDirectionSpeed(this.direction, speed);
	}

	setDirectionSpeed(direction, speed) {
		this.direction = direction;
		this.speed = speed;

		// Calc horizontal and vertical speeds
		let radDeg = math.degToRad(direction);
		this.vspeed = Math.sin(radDeg) * speed;
		this.hspeed = Math.cos(radDeg) * speed;
	}

	setHspeed(hspeed) {
		this.setSpeeds(hspeed, this.vspeed);
	}

	setVspeed(vspeed) {
		this.setSpeeds(this.hspeed, vspeed);
	}

	setSpeeds(hspeed, vspeed) {
		this.hspeed = hspeed;
		this.vspeed = vspeed;

		this.direction = math.radToDeg(Math.atan2(this.vspeed, this.hspeed));

		// Calc total speed from horizontal and vertical speed
		this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed);
	}

	step() {
		this.x += this.hspeed;
		this.y += this.vspeed;
		if(this.swapScreen !== 0) {
			this.swapScreen();
		}
	}

	// TODO comment
	// TODO test → canvas_width was replaced with roomWidth, also height
	swapScreen() {
		if(this.swapScreen >= 2) {
			if(this.y > g.roomHeight + (this.height/2)) this.y = -(this.height/2);
			if((this.height/2) + this.y < 0) this.y = g.roomHeight + (this.height/2);
		}
		if(this.swapScreen === 2) return;
		if(this.x > g.roomWidth + (this.width/2)) this.x = -(this.width/2);
		if((this.width/2) + this.x < 0) this.x = g.roomWidth + (this.width/2);
	}

	// Sets hspeed and vspeed to move towards (x,y) with speed v
	moveTowardsPoint(x, y, v) {
		let dir = math.pointDirection(this.x, this.y, x, y);

		if(v === undefined)
			this.setDirection(dir);
		else {
			this.setDirectionSpeed(dir, v);
		}
	}
}
