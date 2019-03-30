--- Module that can be used to get a callback when a certain amount of time has elapsed
--
-- @usage
-- local timer = require "timer"
-- function init(self)
-- 		self.t1 = timer.seconds(2, function()
--			print("2 seconds have elapsed")
--		end)
-- 		self.t2 = timer.seconds(5, function()
--			print("5 seconds have elapsed")
--		end)
-- end
--
-- function update(self, dt)
--		timer.update(dt)
--		print("Time left on timer 1:", timer.time_left(self.t1))
--		print("Time left on timer 2:", timer.time_left(self.t2))
-- end

local M = {}

local timers = {}

local instance_count = 0

--- Get a callback when a certain number of seconds has elapsed
-- @param seconds The number of seconds to wait before invoking the callback
-- @param callback The function to call when the specified number of seconds has elapsed
-- @return Id of the created timer. Can be used to query the time left
function M.seconds(seconds, callback)
	instance_count = instance_count + 1
	timers[instance_count] = { seconds = seconds, callback = callback }
	return instance_count
end

--- Get a callback when a certain number of frames have elapsed
-- @param frames The number of frames to wait before invoking the callback
-- @param callback The function to call when the specified number of frames has elapsed
-- @return Id of the created timer. Can be used to query the time left
function M.frames(frames, callback)
	instance_count = instance_count + 1
	if frames == 0 then
		callback()
	else
		timers[instance_count] = { frames = frames, callback = callback }
	end
	return instance_count
end

--- Get time left for a timer
-- @param id Id of the timer
-- @return The time left (seconds or frames)
function M.time_left(id)
	return timers[id] and (timers[id].seconds or timers[id].frames) or nil
end

--- Cancel all timers. Callbacks will NOT be invoked.
function M.cancel_all()
	timers = {}
end

--- Cancel a single timer. The callback will NOT be invoked
-- @param id Id of the timer to cancel
function M.cancel(id)
	timers[id] = nil
end

--- Call this function once per frame to continuously check for completed timers
-- @param dt Time in seconds that has elapsed since the last call
function M.update(dt)
	for id,timer in pairs(timers) do
		if timer.frames then
			timer.frames = timer.frames - 1
			if timer.frames == 0 then
				timers[id] = nil
				timer.callback()
			end
		elseif timer.seconds then
			timer.seconds = timer.seconds - dt
			if timer.seconds <= 0 then
				timers[id] = nil
				timer.callback()
			end
		end
	end
end


return M