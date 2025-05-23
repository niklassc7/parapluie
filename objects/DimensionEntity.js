import GameEntity from "./GameEntity.js";
import * as collision from "../functions/collision.js";

export default class DimensionEntity extends GameEntity {
	// TODO default values
	constructor(g, x, y, width=0 , height=0, z=0) {
		super(g);

		this.x = x;
		this.y = y;
		this.ox = 0; // Origin
		this.oy = 0;
		this.z = z;

		this.width = width;
		this.height = height;


		this._registeredClickable = false;
	}

	// Registers this entity as clickable, on destruction it will automatically
	// be unregistered
	_registerClickable() {
		if (this._registeredClickable) {
			console.warn("Attempted to register as clickable even though entity was already registered.");
			return;
		}

		this.g.input.registerClickable(this);
		this._registeredClickable = true;
	}

	_unregisterClickable() {
		if (!this._registeredClickable) {
			console.warn("Attempted to unregister as clickable even though entity was not registered.");
			return;
		}

		this._registeredClickable = !this.g.input.unregisterClickable(this);
		return this._registeredClickable;
	}

	destroy() {
		super.destroy();

		if (this._registeredClickable)
			this._unregisterClickable();
	}

	// TODO use origin
	// TODO remove or rename
	isOutsideRoomVert() {
		return (this.x > this.g.roomWidth) || (this.width + this.x < 0);
	}

	// TODO use origin
	isOutsideRoomHorz() {
		return (this.y > this.g.roomHeight) || (this.height + this.y < 0);
	}

	// TODO use origin
	isOutsideRoom() {
		return this.isOutsideRoomVert() || this.isOutsideRoomHorz();
	}

	// For Debugging, draws border around object
	// Set `hover` to also show when the object is hovered
	drawBorder(hover=false) {
		if (hover) {
			let x1 = this.x - this.ox
			let y1 = this.y - this.oy
			let x2 = x1 + this.width
			let y2 = y1 + this.height
			if (collision.pointInRectangle(this.g.input.getX(), this.g.input.getY(), x1, y1, x2, y2)) {
				this.g.painter.ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
				this.g.painter.ctx.fillRect(this.x - this.ox, this.y - this.oy, this.width, this.height);
			}
		}

		this.g.painter.ctx.strokeStyle = "red";
		this.g.painter.ctx.lineWidth = 3;
		this.g.painter.ctx.setLineDash([6]);
		this.g.painter.ctx.strokeRect(this.x - this.ox, this.y - this.oy, this.width, this.height);
		this.g.painter.ctx.setLineDash([]);

	}
	
	// For Debugging, draws (x,y)
	drawXY() {
		this.g.painter.ctx.strokeStyle = "red";
		this.g.painter.ctx.lineWidth = 3;

		this.g.painter.ctx.beginPath();
		this.g.painter.ctx.moveTo(this.x - 10, this.y - 10);
		this.g.painter.ctx.lineTo(this.x + 10, this.y + 10);
		this.g.painter.ctx.stroke();

		this.g.painter.ctx.beginPath();
		this.g.painter.ctx.moveTo(this.x - 10, this.y + 10);
		this.g.painter.ctx.lineTo(this.x + 10, this.y - 10);
		this.g.painter.ctx.stroke();
	}
}
