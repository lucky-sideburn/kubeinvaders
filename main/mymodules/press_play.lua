local M = {}

local h_size = hash("size")

local no_padding = {
	left = 0,
	right = 0,
	bottom = 0,
	top = 0,
}

function M.press_play(sprite_url)
	go.get_position(sprite_url)
	msg.post(sprite_url, "play_animation", {id = hash("press")})
end

return M