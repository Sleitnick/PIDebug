-- PIDebugPlugin
-- Stephen Leitnick
-- December 08, 2020


local CollectionService = game:GetService("CollectionService")
local Selection = game:GetService("Selection")

local PIDSelection = require(script.Parent.PIDSelection)

local button = plugin:CreateToolbar("PIDebug"):CreateButton("pidebug", "PIDebug", "", "PIDebug")
button.ClickableWhenViewportHidden = true

local TAG = "__pidebug__"
local isHooked = false
local selectionChangedHandle

local currentPidSelection = nil

local function ClearCurrentPIDSelection()
	if (currentPidSelection) then
		currentPidSelection:Destroy()
		currentPidSelection = nil
	end
end

local function OnSelectionChanged()
	local selected = Selection:Get()[1]
	if (selected and CollectionService:HasTag(selected, TAG)) then
		if (currentPidSelection) then
			if (currentPidSelection.PID == selected) then return end
			ClearCurrentPIDSelection()
		end
		currentPidSelection = PIDSelection.new(selected)
	else
		ClearCurrentPIDSelection()
	end
end

local function Hook()
	print("PIDebug hooked")
	isHooked = true
	selectionChangedHandle = Selection.SelectionChanged:Connect(OnSelectionChanged)
end

local function Unhook()
	print("PIDebug unhooked")
	isHooked = false
	selectionChangedHandle:Disconnect()
	ClearCurrentPIDSelection()
end

local function OnClick()
	print("Clicked")
	if (isHooked) then
		Unhook()
	else
		Hook()
	end
	button:SetActive(isHooked)
end

-- local function Check()
-- 	local shouldHook = (#CollectionService:GetTagged(TAG) > 0)
-- 	print("ShouldHook", shouldHook)
-- 	if (shouldHook ~= isHooked) then
-- 		if (shouldHook) then
-- 			Hook()
-- 		else
-- 			Unhook()
-- 		end
-- 	end
-- end

-- CollectionService:GetInstanceAddedSignal(TAG, Check)
-- CollectionService:GetInstanceRemovedSignal(TAG, Check)
-- Check()

button.Click:Connect(OnClick)

plugin.Unloading:Connect(function()
	if (isHooked) then
		Unhook()
	end
	ClearCurrentPIDSelection()
	PIDSelection.Cleanup()
end)
