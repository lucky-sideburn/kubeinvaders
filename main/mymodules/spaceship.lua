-- Put functions in this file to use them in several other scripts.
-- To get access to the functions, you need to put:
-- require "my_directory.my_file"
-- in any script using the functions.

local M = {}

function M.auto()
  local pos = go.get_position()
  local cnt = 0
  
  --msg.post("ui#gui", "error",{ errormessage = "" })  
  --math.randomseed(os.clock()*100000000000)
  pos.y = 300
  go.set_position(pos)
  
  pos.x = automatic_pilot_x
  
  go.animate(go.get_id(), "position.x", go.PLAYBACK_ONCE_FORWARD, pos.x, go.EASING_LINEAR, 0.5, 0, function()
    pos = go.get_position()		
    bullet = factory.create("/bullet#bulletfactory", pos)
    go.animate(bullet, "position.y", go.PLAYBACK_ONCE_FORWARD, 1200, go.EASING_LINEAR, 1, 0, function()
      go.delete(bullet)
    end)	
  end)

  if not automatic_pilot_x_reverse then
    automatic_pilot_x = automatic_pilot_x + 100
  else
    automatic_pilot_x = automatic_pilot_x - 100
  end
  
  if automatic_pilot_x > automatic_pilot_x_limit then
    automatic_pilot_x_reverse = true
  elseif automatic_pilot_x < automatic_pilot_x_start then
    automatic_pilot_x_reverse = false
  end  
end

return M