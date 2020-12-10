# PIDebug

Visualize and tune PID controllers in a moving graph.

## Build Client
To build the client, run:
```sh
npm run client
```

If developing, this can be put into watch mode for the client using `watch`:
```sh
npm run client-watch
```

## Run Server
```sh
npm run server
```
Then navigate to [`http://localhost:8080`](http://localhost:8080). The port may vary depending on the `pidebug_config.json` file.

## Configuration
To change the web server and websocket ports, edit the `pidebug_config.json` file.

## API

### WebSocket (recommended)
(Coming soon)

### HTTP

#### `POST /api/data`
Send PID data.

Request example:
```json
{
	"data_points": [ {"time": 0.0, "value": 0.0}, ... ]
}
```

Response example:
```json
{
	"ok": true,
	"state": {"kp": 0, "ki": 0, "kd": 0, "min": 0, "max": 0}
}
```
**Note:** State might contain no keys if on data has changed. If keys exist, then some of the state has changed and the PID should change these properties for itself.

#### `POST /api/state`
Set the initial state of the PID.

Request example:
```json
{
	"kp": 0,
	"ki": 0,
	"kd": 0,
	"min": 0,
	"max": 0
}
```

Response example:
```json
{
	"ok": true
}
```
