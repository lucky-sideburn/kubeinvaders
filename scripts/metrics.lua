local redis = require "resty.redis"
local arg = ngx.req.get_uri_args()
local incr = 0
if ngx.var.request_method == "DELETE" then
  local red = redis:new()
  local okredis, errredis = red:connect("unix:/tmp/redis.sock")
  
  if okredis then
    ngx.log(ngx.ERR, "Connection to Redis is ok")
  else
    ngx.log(ngx.ERR, "Connection to Redis is not ok")
    ngx.log(ngx.ERR, errredis)
  end
  -- Count the total of deleted pods
  local res, err = red:get("deleted_pods_total")
  
  if res == ngx.null then
    ngx.say(err)
    red:set("deleted_pods_total", 1)
  else
      incr = res + 1
      red:set("deleted_pods_total", incr)      
  end

  -- TODO: Make a better regular expression!
  local namespace_pods = string.match(ngx.var.request_uri, '^.*/namespaces/(.*)/.*$')
  local namespace = namespace_pods:gsub("/pods", "")
  
  -- Count the total of deleted pods for namespace
  local res, err = red:get("deleted_pods_total_on_" .. namespace)
  
  if res == ngx.null then
    red:set("deleted_pods_total_on_" .. namespace, 1)
  else
    incr = res + 1
    red:set("deleted_pods_total_on_" .. namespace, incr)
  end
  

elseif ngx.var.request_method == "GET" and string.match(ngx.var.request_uri, "^.*/chaos[-]node.*$") then
  local red = redis:new()
  local okredis, errredis = red:connect("unix:/tmp/redis.sock")
  
  if okredis then
    ngx.log(ngx.ERR, "Connection to Redis is ok")
  else
    ngx.log(ngx.ERR, "Connection to Redis is not ok")
    ngx.log(ngx.ERR, errredis)
  end
  -- Count the total of chaos jobs launched against nodes
  local chaos_node_res, err = red:get("chaos_node_jobs_total")
  
  if chaos_node_res == ngx.null then
    ngx.say(err)
    red:set("chaos_node_jobs_total", 0)
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
  for i, res in ipairs(red:keys("*")) do
    ngx.log(ngx.ERR, res)
    ngx.say(res ..  " " .. red:get(res))
  end
end
