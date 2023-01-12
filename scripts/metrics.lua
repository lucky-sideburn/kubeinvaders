local redis = require "resty.redis"
local arg = ngx.req.get_uri_args()
local incr = 0

-- TO DO put all metrics into this metrics.lua. Actually in pod.lua are written other metrics in Redis

if ngx.var.request_method == "GET" and string.match(ngx.var.request_uri, "^.*/chaos[-]node.*$") then
  ngx.log(ngx.INFO, "[kinv][get-metrics] Find metrics ^.*/chaos[-]node.*$ in Redis")
  local red = redis:new()
  local okredis, errredis = red:connect("unix:/tmp/redis.sock")
  
  if okredis then
    ngx.log(ngx.INFO, "Connection to Redis is ok")
  else
    ngx.log(ngx.INFO, "Connection to Redis is not ok")
    ngx.log(ngx.INFO, errredis)
  end
  -- Count the total of chaos jobs launched against nodes
  local chaos_node_res, err = red:get("chaos_node_jobs_total")
  
  if chaos_node_res == ngx.null then
    ngx.say(err)
    red:set("chaos_node_jobs_total", 1)
  else
    local incr = chaos_node_res + 1
    local res, err = red:set("chaos_node_jobs_total",incr)      
  end

  -- Count the total of chaos jobs launched against nodes per node
  local node_name = arg['node_name']
  local chaos_node_res, err = red:get("chaos_node_jobs_total_on_" .. node_name)
  if chaos_node_res == ngx.null then
    ngx.say(err)
    red:set("chaos_node_jobs_total_on_" .. node_name, 1)
  else
    local incr = chaos_node_res + 1
    local res, err = red:set("chaos_node_jobs_total_on_" .. node_name,incr)      
  end

elseif ngx.var.request_method == "GET" and ngx.var.request_uri == "/metrics" then
  ngx.log(ngx.INFO, "[kinv][get-metrics] Find metrics globally in Redis")
  for i, res in ipairs(red:keys("*")) do
    ngx.log(ngx.INFO, "[kinv][get-metrics] Sending this res: " .. res)
    ngx.say(res ..  " " .. red:get(res))
  end
end
