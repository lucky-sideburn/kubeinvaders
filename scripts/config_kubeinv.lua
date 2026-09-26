local json = require "lunajson"
local config = {}
config['default_chaos_container'] = [[
{
    "name": "kubeinvaders-chaos-node",
    "image": "docker.io/luckysideburn/kubeinvaders-stress-ng:latest",
    "command": [
        "stress-ng",
        "--cpu",
        "4",
        "--io",
        "2",
        "--vm",
        "1",
        "--vm-bytes",
        "1G",
        "--timeout",
        "10s",
        "--metrics-brief"
    ]
}
]]

-- Returns the chaos container definition stored in Redis, or the default one
-- when nothing is stored or the stored value is not a valid container (JSON object with name and image)
function config.chaos_container(stored)
  if stored == nil or stored == ngx.null or stored == "" then
    return config['default_chaos_container']
  end
  local ok, decoded = pcall(json.decode, stored)
  if not ok or type(decoded) ~= "table" or type(decoded["name"]) ~= "string" or type(decoded["image"]) ~= "string" then
    ngx.log(ngx.WARN, "Invalid chaos container definition, using the default one")
    return config['default_chaos_container']
  end
  return stored
end

return config