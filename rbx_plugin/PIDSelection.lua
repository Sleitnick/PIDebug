-- PIDSelection
-- Stephen Leitnick
-- December 08, 2020


local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local MAX_REQ_PER_SECOND = math.floor(500 / 60)

local DATA_ENDPOINT = "http://localhost:8080/api/data"
local STATE_ENDPOINT = "http://localhost:8080/api/state"
local COLLECT_INTERVAL = 0.05
local SEND_INTERVAL = (1 / MAX_REQ_PER_SECOND)

local PIDSelection = {}
PIDSelection.__index = PIDSelection

local isRunning = RunService:IsRunning()
local isServer = RunService:IsServer()
local rf

local function SendToDataEndpoint(data)
	local res = HttpService:RequestAsync {
		Url = DATA_ENDPOINT;
		Method = "POST";
		Headers = {["Content-Type"] = "application/json"};
		Body = data;
	}
	local body = HttpService:JSONDecode(res.Body)
	return body
end


local function PostState(data)
	local res = HttpService:RequestAsync {
		Url = STATE_ENDPOINT;
		Method = "POST";
		Headers = {["Content-Type"] = "application/json"};
		Body = data;
	}
	local body = HttpService:JSONDecode(res.Body)
	return body
end


if (isRunning) then
	local rfName = "__pidebug__"
	if (isServer) then
		rf = Instance.new("RemoteFunction")
		rf.Name = rfName
		rf.Archivable = false
		rf.Parent = game:GetService("ReplicatedStorage")
		rf.OnServerInvoke = function(_, data)
			if (data.name == "SendToDataEndpoint") then
				local body = SendToDataEndpoint(data.data)
				return body
			elseif (data.name == "PostState") then
				local body = PostState(data.data)
				return body
			end
		end
	else
		local rfClient = game:GetService("ReplicatedStorage"):WaitForChild(rfName)
		SendToDataEndpoint = function(data)
			return rfClient:InvokeServer({name = "SendToDataEndpoint"; data = data})
		end
		PostState = function(data)
			rfClient:InvokeServer({name = "PostState"; data = data})
		end
	end
end


function PIDSelection.new(pid)
	local self = setmetatable({}, PIDSelection)
	self.PID = pid
	self._handles = {}
	self:_postState()
	self:_streamChanges()
	print("PIDSelection listening for changes")
	return self
end


function PIDSelection:_postState()
	PostState(HttpService:JSONEncode {
		kp = self.PID.KP.Value;
		ki = self.PID.KI.Value;
		kd = self.PID.KD.Value;
		min = self.PID.Min.Value;
		max = self.PID.Max.Value;
	})
end


function PIDSelection:_streamChanges()
	local output = self.PID.Output
	local lastCollect = os.clock()
	local lastSend = os.clock()
	local collected = {}
	self:_hook(output.Changed, function(v)
		local now = os.clock()
		lastCollect = now
		table.insert(collected, {
			time = now;
			value = v;
		})
	end)
	self:_hook(RunService.Heartbeat, function()
		local now = os.clock()
		if ((now - lastCollect) >= COLLECT_INTERVAL) then
			lastCollect = now
			table.insert(collected, {
				time = now;
				value = output.Value;
			})
		end
		if ((now - lastSend) >= SEND_INTERVAL) then
			lastSend = now
			local data = HttpService:JSONEncode {
				data_points = collected;
			}
			table.clear(collected)
			local res = SendToDataEndpoint(data)
			if (res.state and next(res.state)) then
				self.PID.KP.Value = res.state.kp
				self.PID.KI.Value = res.state.ki
				self.PID.KD.Value = res.state.kd
				self.PID.Min.Value = res.state.min
				self.PID.Max.Value = res.state.max
			end
		end
	end)
end


function PIDSelection:_hook(event, funcHandler)
	table.insert(self._handles, event:Connect(funcHandler))
end


function PIDSelection:Destroy()
	for _,h in ipairs(self._handles) do
		h:Disconnect()
	end
	print("PIDSelection cleaned up")
end


function PIDSelection.Cleanup()
	if (rf) then
		rf:Destroy()
		rf = nil
	end
end


return PIDSelection