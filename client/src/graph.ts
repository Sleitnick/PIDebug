import store from "./store";

export interface GraphNode {
    time: number,
    value: number,
    x?: number,
    y?: number
}

type TextItem = {
    text: string
    x: number
    y: number
}

let timeLength = store.getState().time;
let minValue = store.getState().min;
let maxValue = store.getState().max;

const ifNotNaN = (check: number | string, fallback: number) => {
    let n = check;
    if (typeof n === "string") {
        n = parseFloat(n);
    }
    return isNaN(n) ? fallback : n;
};

store.subscribe(() => {
    timeLength = ifNotNaN(store.getState().time, timeLength);
    minValue = ifNotNaN(store.getState().min, minValue);
    maxValue = ifNotNaN(store.getState().max, maxValue);
});

export default class Graph {

    private graph: HTMLCanvasElement;
    private renderCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private ctxRender: CanvasRenderingContext2D;

    private data: Array<GraphNode> = [];

    constructor(graph: HTMLCanvasElement) {
        this.graph = graph;
        this.renderCanvas = document.createElement("canvas");
        const ctx = graph.getContext("2d", {alpha: false});
        const ctxRender = this.renderCanvas.getContext("2d", {alpha: false});
        if (ctx === null || ctxRender === null) {
            throw new Error("No graphics context");
        }
        this.ctx = ctx;
        this.ctxRender = ctxRender;
    }

    setSize(width: number, height: number) {
        this.graph.width = width;
        this.graph.height = height;
        this.renderCanvas.width = width;
        this.renderCanvas.height = height;
        this.ctxRender.textBaseline = "middle";
        this.ctxRender.font = "bold 16px monospace";
    }

    addData(dataPoint: GraphNode) {
        const data = this.data;
        let inserted = false;
        for (let i = 0; i < data.length; i++) {
            const dp = data[i];
            if (dp.time > dataPoint.time) {
                data.splice(i, 0, dataPoint);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            data.push(dataPoint);
        }
        const maxTime = data[data.length - 1].time;
        for (let i = 0; i < data.length; i++) {
            const dp = data[i];
            if ((maxTime - dp.time) > timeLength) {
                if (i < (data.length - 1)) {
                    data.splice(0, i + 1);
                } else {
                    data.splice(0, i);
                }
                break;
            }
        }
    }

    clear() {
        this.ctxRender.fillStyle = "white";
        this.ctxRender.fillRect(0, 0, this.graph.width, this.graph.height);
    }

    draw() {
        const ctx = this.ctxRender;
        const data = this.data;
        // if (data.length === 0) {
        //     this.clear();
        //     return;
        // }
        const width = this.renderCanvas.width;
        const height = this.renderCanvas.height;
        //const minPoint = data[0];
        const maxPoint = data[data.length - 1];
        this.clear();

        // Draw lines:
        const numLines = 20;
        const singleStep = (maxValue - minValue) / numLines;
        const diffValue = (maxValue - minValue);
        const text: TextItem[] = [];
        for (let i = Math.floor(-numLines / 2) + 1; i < Math.floor(numLines / 2); i++) {
            const y = (height / 2) + (i / numLines * height);
            const value = (minValue + (diffValue * (1 - (y / height))));
            ctx.strokeStyle = "rgb(200, 200, 200)";
            ctx.lineWidth = i == 0 ? 3 : 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            let valText: string;
            if (singleStep < 0.001) {
                valText = value.toFixed(4);
            } else if (singleStep < 0.01) {
                valText = value.toFixed(3);
            } else if (singleStep < 0.1) {
                valText = value.toFixed(2);
            } else if (singleStep < 1) {
                valText = value.toFixed(1);
            } else {
                valText = Math.round(value).toString();
            }
            text.push({text: valText, x: 10, y: y});
        }

        // Draw graph:
        ctx.fillStyle = "black";
        ctx.strokeStyle = "rgb(51, 127, 255)";
        ctx.lineWidth = 2;

        for (let i = 0; i < data.length; i++) {
            const dataPoint = data[i];
            const x = Math.floor((1 - ((maxPoint.time - dataPoint.time) / timeLength)) * width);
            const y = Math.floor(((maxValue - dataPoint.value) / diffValue) * height);
            dataPoint.x = x;
            dataPoint.y = y;
            //ctx.fillRect(x - 2, y - 2, 4, 4);
            if (i !== 0) {
                const dp1 = data[i - 1];
                ctx.beginPath();
                ctx.moveTo(dp1.x ?? 0, dp1.y ?? 0);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }

        for (const t of text) {
            ctx.fillStyle = "white";
            ctx.fillRect(8, t.y - 9, ctx.measureText(t.text).width + 4, 16);
            ctx.fillStyle = "rgb(150, 150, 150)";
            ctx.fillText(t.text, t.x, t.y);
        }

    }

    render() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.graph.width, this.graph.height);
        this.ctx.drawImage(this.renderCanvas, 0, 0);
    }

}
