import Input from "./Input.js";
import Storage from "./Storage.js";
import Painter from "./Painter.js";
import ResourceManager from "./ResourceManager.js";
import AlertOverlay from "./OverlayManager/AlertOverlay.js";


export default class Game {
	/**
	 * Initialize a new game
	 *
	 * @param {Room} initalRoom - The room that the game starts with
	 */
	constructor(initalRoom, fps=60, storageBackend="localStorage") {
		this._addStyle()

		// TODO move to room?
		this.roomWidth = 1280;
		this.roomHeight = 720;

		this._debug = false;
		this._paused = false;

		this._debugFpsTimeStamp;
		this.debugCurrentFps;

		const canvas = document.createElement("canvas");
		document.body.insertBefore(canvas, document.body.childNodes[0]);
		this.painter = new Painter(canvas);
		window.addEventListener('resize', () => { this.resize(); });
		this.resize();
		// this.resizeTimeoutFunctionId;
		// window.addEventListener('resize', () => {
		// 	console.log(this.resizeTimeoutFunctionId);
		// 	clearTimeout(this.resizeTimeoutFunctionId);

		// 	this.resizeTimeoutFunctionId = setTimeout(() => this.painter.resizeCanvas(this.roomWidth, this.roomHeight), 10);
		// });

		// Counts steps, paused when game is paused
		this.stepCount = 0;

		this.input = new Input(this);
		this.resourceManager = new ResourceManager();
		this.storage = new Storage(storageBackend);

		this.entities = [];

		this.initialRoom = initalRoom;
		this.fps = fps;

		window.alert = this.alert;
	}

	resize() {
		this.painter.resizeCanvas(this.roomWidth, this.roomHeight);

		if (typeof this.room !== "undefined")
			this.setBackground(this.room.background);
	}

	// Enters the inital room and starts the game loop
	start() {
		this.gotoRoom(this.initialRoom);
		setInterval(() => this.step(), 1000/this.fps);
	}

	step() {
		if (this._paused)
			return;

		// step of all global game entities
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].step();
		}

		// step of all entities in current room
		for(var i = 0; i < this.room.entities.length; i++) {
			this.room.entities[i].step();
		}

		this.room.step(this);
		this.stepCount++;
		// this.input.step()

		this.draw();
	}

	draw() {
		// Background
		// this.painter.clearRect(0, 0, this.painter.canvas.width, this.painter.canvas.height);
		this.painter.clearRect(-this.painter.paddingHorz, -this.painter.paddingVert, this.roomWidth + 2*this.painter.paddingHorz, this.roomHeight + 2*this.painter.paddingVert);

		this.room.draw(this);

		// step of all global game entities
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].draw(this);
		}

		// draw of all entities
		for(var i = 0; i < this.room.entities.length; i++) {
			// TODO why is this check necessary
			if(this.room.entities[i] !== undefined) {
				this.room.entities[i].draw(this);
			}
		}

		this.input.draw();

		if (this.getDebug()) {
			if (this.stepCount % this.fps === 0) {
				const secondsPassed = (Date.now() - this._debugFpsTimeStamp) / 1000;
				this._debugFpsTimeStamp = Date.now();

				this.debugCurrentFps = this.fps / secondsPassed;
			}

			this.painter.ctx.font = "16px fnt_Comforta_Bold";
			this.painter.ctx.textAlign = "left";
			this.painter.ctx.fillStyle = "white";
			this.painter.ctx.fillText("window.innner " + window.innerWidth + ", " + window.innerHeight, 16, 16 + 32*0);
			this.painter.ctx.fillText("this.canvas. " + this.painter.canvas.width + ", " + this.painter.canvas.height, 16, 16 + 32*1);
			this.painter.ctx.fillText("this.view " + this.painter.viewWidth + ", " + this.painter.viewHeight, 16, 16 + 32*2);
			this.painter.ctx.fillText(`window.devicePixelRatio: ${window.devicePixelRatio}`, 16, 16 + 32*3);
			this.painter.ctx.fillText(`scaling: ${this.painter.getScaling()}`, 16, 16 + 32*4);
			// this.painter.ctx.fillText(`scaled window-inner: ${window.innerWidth * window.devicePixelRatio}, ${window.innerHeight * window.devicePixelRatio}`, 16, 16 + 32*5)

			this.painter.ctx.textAlign = "right";
			this.painter.ctx.fillText(`FPS: ${Math.round(this.debugCurrentFps)}`, this.roomWidth - 16, 16 + 32*0);
		}
	}

	addObject(obj) {
		obj.parent = this;
		this.entities.push(obj);
		obj.onAdd();

		return obj;
	}

	// Simply removes the object `obj` from game.entities and thus from the
	// game loop.
	removeObject(obj) {
		for (var i = 0; i < this.entities.length; i++) {
			if(this.entities[i] === obj) {
				this.entities.splice(i, 1);
				return true;
			}
		}

		console.error("Attempted to deleted object that is not in g.entities");
		return false;
	}

	// Receives room class, instantiates it and changes room to it
	gotoRoom(newRoom, returnRoom=undefined) {
		console.log(`Going to room ${newRoom.name}`);

		if (typeof this.room !== "undefined")
			this.room.destroyEntities();

		this.input.reset();

		// Set new room
		this.room = new newRoom(this, returnRoom);

		this.setBackground(this.room.background);
	}

	setBackground(background) {
		// TODO scale to room → to room or width?

		document.body.style.background = `url(${background})`;
		document.body.style.backgroundSize = "cover";
		const canvasOrigin = this.painter.canvasToScreen(this.painter.paddingHorz, this.painter.paddingVert);
		// document.body.style.backgroundPosition = `top ${canvasOrigin.y}px left ${canvasOrigin.x}px`;
		document.body.style.backgroundPosition = `top ${canvasOrigin.y}px left 0px`;
	}

	// Pauses game loop
	pause() {
		this._paused = true;
	}

	// Resumes game loop
	unpause() {
		this._paused = false;
	}

	alert(message) {
		const overlay = new AlertOverlay(message);
		overlay.add();
	}

	setDebug(val) {
		this._debug = val;
		this._debugFpsTimeStamp = Date.now();
		this.debugCurrentFps = "-";
	}

	getDebug(val) {
		return this._debug;
	}

	setScaling(val) {
		this.painter.setScaling(val);
	}

	getScaling(val) {
		return this.painter.getScaling();
	}


	_addStyle() {
		const style = `
			.overlay {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(40, 40, 130, 0.3);
				backdrop-filter: blur(20px);

				color: rgba(210, 230, 255, 0.8);
				font-size: 1.2em;
				user-select: none;
			}
			.overlayContent {
				height: 100%;
				width: fit-content;
				max-width: 90%;
				margin: 0 auto;

				overflow-x: hidden;
				overflow-y: auto;
				scrollbar-color: #5566ee transparent;
				scrollbar-width: thin;

				place-items: center;
			}

			.gridTwoCol {
				overlay: auto;
				display: grid;
				grid-template-columns: repeat(2, 50%);
			}

			.gridThreeCol {
				overflow-y: auto;
				display: grid;
				grid-template-columns: repeat(3, 33%);
			}

			.gridThreeCol > *, .gridTwoCol > * {
				padding: .5em 2em;
				display: grid;
			}

			.overlayContent input {
				background: transparent;

				background: #236;
				color: rgba(210, 230, 255, 0.8);
				font-size: 1.4em;

				border-radius: 5px;
				padding: 4px;
				animation: pulse 1s infinite;
				animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
			}
			.overlayContent input:nth-child(1) { animation-delay: .1s; }
			.overlayContent input:nth-child(2) { animation-delay: .3s; }
			.overlayContent input:nth-child(3) { animation-delay: .5s; }
			.overlayContent input:nth-child(4) { animation-delay: .7s; }
			.overlayContent input:nth-child(5) { animation-delay: .9s; }
			.overlayContent input:nth-child(6) { animation-delay: 1.1s; }
			.overlayContent input:nth-child(7) { animation-delay: 1.3s; }
			.overlayContent input:nth-child(8) { animation-delay: 1.5s; }
			.overlayContent input:nth-child(9) { animation-delay: 1.7s; }
			.overlayContent input:nth-child(10) { animation-delay: 1.9s; }


			.overlayContent input[type="button"] {
				background: transparent;
				color: rgba(210, 230, 255, 0.8);
				font-size: 1.2em;

				padding: 0.5em 1em;
				margin: 0.5em 0.5em;
				min-height: 4em;

				border: 4px solid rgba(210, 230, 255, 0.8);
				border-radius: 9999px;
				cursor: pointer;
				transition: all 0.2s ease-in-out;
			}

			.overlayContent input[type="button"]:hover {
				background: rgba(210, 230, 255, 0.8);
				color: #236;
			}

			.overlayContent input[type="checkbox"] {
				width: 1.3em;
				height: 1.3em;

				accent-color: #236;
			}
		`
		const styleElement = document.createElement("style");
		styleElement.textContent = style;
		document.head.appendChild(styleElement);
	}
}
