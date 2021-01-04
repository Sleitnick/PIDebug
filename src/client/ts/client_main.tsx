import * as React from "react";
import * as ReactDOM from "react-dom";
import Graph from "./graph";
import { Provider } from "react-redux";
import store from "./store"
import Index from "./components/Index"
import * as config from "../../../pidebug_config.json";
import "jquery";
import "popper.js";
import "bootstrap";

import "../style/main.scss";

function waitFor<T extends HTMLElement>(id: string, interval: number = 100, timeout?: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const check = (): boolean => {
			let el = document.getElementById(id);
			if (el) {
				resolve(el as T);
				return true;
			}
			return false;
		};
		if (check()) return;
		let handle: number;
		const start = Date.now();
		const hasTimeout = (typeof timeout === "number");
		handle = window.setInterval(() => {
			if (check()) {
				clearInterval(handle);
			} else if (hasTimeout && (Date.now() - start) > timeout) {
				clearInterval(handle);
				reject("Timeout");
			}
		}, interval);
	});
}


ReactDOM.render(
	<Provider store={store}>
		<Index/>
	</Provider>,
	document.getElementById("app")
);


waitFor<HTMLCanvasElement>("graph", 10, 10000).then((graphCanvas) => {

	const graph = new Graph(graphCanvas);

	const resizeGraphCanvas = () => {
		const width = (window.innerWidth - (graphCanvas.offsetLeft * 2));
		const height = (window.innerHeight - graphCanvas.offsetTop - 20);
		graph.setSize(width, height);
		graph.draw();
		graph.render();
	};

	const render = () => {
		graph.render();
		requestAnimationFrame(render);
	};

	window.addEventListener("resize", resizeGraphCanvas);
	resizeGraphCanvas();
	graph.draw();
	render();

	const ws = new WebSocket(`ws://localhost:${config.wsWebPort}`);
	ws.onmessage = (message) => {
		const data = JSON.parse(message.data);
		for (const dataPoint of data.data_points) {
			graph.addData({
				time: dataPoint.time,
				value: dataPoint.value
			});
		}
		if (data.state_changed) {
			const newState = data.state_changed_state;
			for (const key in newState) {
				const newValue = newState[key];
				store.dispatch({
					type: "num",
					field: key,
					value: newValue
				});
			}
		}
		graph.draw();
	};

	let isDirty = store.getState().dirty;
	store.subscribe(() => {
		const state = store.getState();
		if (state.dirty !== isDirty) {
			isDirty = state.dirty;
			if (isDirty) {
				store.dispatch({type: "dirty", value: 0, field: ""});
				ws.send(JSON.stringify({
					type: "set_state",
					state: state
				}));
			}
		}
	});

});
