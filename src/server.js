const express = require("express");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const config = JSON.parse(fs.readFileSync("./pidebug_config.json", {encoding: "utf8"}));

const apiRouter = express.Router();

const app = express();

let dataQueue = [];
const state = {
	kp: 0,
	ki: 0,
	kd: 0,
	min: -5,
	max: 5,
	time: 3,
};

let stateChangedPid = false;
let stateChangedKeysPid = [];

let stateChangedWeb = false;
let stateChangedKeysWeb = [];

app.use("/public", express.static(path.join(ROOT, "public")));

apiRouter.use(express.json());

apiRouter.post("/data", (req, res) => {
	const data = req.body;
	if (typeof data === "object") {
		dataQueue = dataQueue.concat(data.data_points);
		let sendState = {};
		if (stateChangedWeb) {
			stateChangedWeb = false;
			sendState = state;
		}
		res.json({
			ok: true,
			state: sendState
		});
	} else {
		res.sendStatus(400);
	}
});

apiRouter.post("/state", (req, res) => {
	const data = req.body;
	for (const key in data) {
		const value = data[key];
		const oldValue = state[key];
		if (typeof oldValue !== "undefined" && oldValue !== value) {
			state[key] = value;
			stateChangedPid = true;
			stateChangedKeysPid.push(key);
		}
	}
	res.json({ok: true});
});

apiRouter.get("/state", (req, res) => {
	res.json(state);
});

app.use("/api", apiRouter);

app.get("/", (req, res) => {
	res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(config.httpPort, () => {
	console.log(`HTTP server running on port ${config.httpPort}`);
});

const wsWebClient = new WebSocket.Server({ port: config.wsWebPort });
const wsPIDClient = new WebSocket.Server({ port: config.wsPIDPort });

const setState = (data) => {
	for (const key in data) {
		const value = data[key];
		const oldValue = state[key];
		if (typeof oldValue !== "undefined" && oldValue !== value) {
			state[key] = value;
			stateChangedWeb = true;
			stateChangedKeysWeb.push(key);
		}
	}
};

wsWebClient.on("connection", (wsWeb) => {
	let handle;
	wsWeb.on("close", () => {
		clearInterval(handle);
	});
	wsWeb.on("message", (msg) => {
		const data = JSON.parse(msg);
		if (typeof data.type === "string") {
			switch(data.type) {
				case "set_state":
					setState(data.state);
					break;
				default:
					break;
			}
		}
	});
	handle = setInterval(() => {
		if (dataQueue.length > 0) {
			const sendData = {
				data_points: dataQueue,
				state_changed: stateChangedPid,
				state_changed_state: {}
			};
			if (stateChangedPid) {
				stateChangedPid = false;
				for (const key of stateChangedKeysPid) {
					sendData.state_changed_state[key] = state[key];
				}
			}
			wsWeb.send(JSON.stringify(sendData));
			dataQueue = [];
		}
	}, 20);
});

wsPIDClient.on("connection", (wsPid) => {
	wsPid.on("message", (msg) => {
		const data = JSON.parse(msg);
		if (typeof data.type === "string") {
			switch(data.type) {
				case "data":
					dataQueue = dataQueue.concat(data.data_points);
					break;
				case "set_state":
					setState(data.state);
					break;
				default:
					break;
			}
		}
	});
});

console.log(`wsWebClient server running on port ${config.wsPort}`);
