local M = {}

function M.get_help()
	msg.post("ui#gui","help",{ position = vmath.vector3(5, 300, 0) })
end

function M.quit_help()
	msg.post("ui#gui","quit_help",{ position = vmath.vector3(-1000, -1000, 0) })
end

return M