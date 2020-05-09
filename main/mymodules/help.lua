local M = {}

function M.get_help()
  msg.post("ui#gui","help",{ position = vmath.vector3(24, 680, 0) })
end

function M.quit_help()
  msg.post("ui#gui","quit_help",{ position = vmath.vector3(-160, 800, 0) })
end

return M