-- PID
-- Stephen Leitnick
-- January 15, 2021

--[[

	pid = PID.new(min: number, max: number, kp: number, ki: number, kd: number)

	pid:Reset()
	pid:Calculate(dt: number, setpoint: number, pv: number)
	pid:SetMinMax(min: number, max: number)
	pid:Debug(name: string, parent: Instance)
	pid:Destroy()

--]]


local PID = {}
PID.__index = PID


function PID.new(min, max, kp, ki, kd)
	local self = setmetatable({}, PID)
	self._min = min
	self._max = max
	self._kp = kp
	self._kd = kd
	self._ki = ki
	self._preError = 0
	self._integral = 0
	self._debug = false
	self._out = false
	return self
end


function PID:Reset()
	self._preError = 0
	self._integral = 0
end


function PID:Calculate(dt, setpoint, pv)
	local err = (setpoint - pv)
	local pOut = (self._kp * err)
	self._integral += (err * dt)
	local iOut = (self._ki * self._integral)
	local deriv = ((err - self._preError) / dt)
	local dOut = (self._kd * deriv)
	local output = math.clamp((pOut + iOut + dOut), self._min, self._max)
	self._preError = err
	if (self._out) then
		self._out.Value = output
	end
	return output
end


function PID:SetMinMax(min, max)
	self._min = min
	self._max = max
end


function PID:Debug(name, parent)
	if (self._debug or not game:GetService("RunService"):IsStudio()) then return end
	local f = Instance.new("Folder")
	f.Name = name
	local function Map(property, valueName)
		local n = Instance.new("NumberValue")
		n.Name = valueName
		n.Value = self[property]
		n.Parent = f
		n.Changed:Connect(function(newVal)
			self[property] = newVal
			self:Reset()
		end)
	end
	Map("_min", "Min")
	Map("_max", "Max")
	Map("_kp", "KP")
	Map("_ki", "KI")
	Map("_kd", "KD")
	local out = Instance.new("NumberValue")
	out.Name = "Output"
	out.Value = 0
	out.Parent = f
	self._out = out
	f.Parent = parent
	game:GetService("CollectionService"):AddTag(f, "__pidebug__")
	self._debug = f
end


function PID:Destroy()
	if (self._debug) then
		self._debug:Destroy()
		self._debug = nil
	end
end


return PID