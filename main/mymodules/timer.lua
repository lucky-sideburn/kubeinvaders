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

function M.repeat_seconds(seconds, callback)
  M.seconds(seconds, function()
    callback()
    M.repeat_seconds(seconds, callback)
  end)
end

return M