local arg = ngx.req.get_uri_args()
local action = arg['action']
local config = require "config_kubeinv"
local redis = require "resty.redis"
local red = redis:new()
local okredis, errredis = red:connect("unix:/tmp/redis.sock")

if okredis then
  ngx.log(ngx.INFO, "Connection to Redis is ok")
else
  ngx.log(ngx.INFO, "Connection to Redis is not ok")
  ngx.log(ngx.INFO, errredis)
end

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range'

if ngx.var.request_method == "GET" and action == 'container_definition' then
    ngx.log(ngx.INFO, "Received request for getting chaos container definition")
    local res, err = red:get("chaos_container")
    if res == ngx.null then
      ngx.log(ngx.INFO, "There is no chaos_container key set in Redis. Taking default chaos container definition")
      ngx.say(config['default_chaos_container'])
    else
      ngx.log(ngx.INFO, "There is chaos_container key set in Redis. Taking custom chaos container definition")
      ngx.say(res)
    end
elseif ngx.var.request_method == "POST" and action == 'set' then
  local body_data = ngx.req.get_body_data()  
  ngx.log(ngx.INFO, "Received new yaml definition for chaos container: " .. body_data)
  red:set("chaos_container", body_data)
  ngx.say("New chaos container definition has been configured in Redis")
  return ngx.exit(ngx.status)

elseif ngx.var.request_method == "POST" and action == "set_log_regex" then
  local body_data = ngx.req.get_body_data()  
  red:set("log_pod_regex:" .. arg['id'], body_data)
  red:set("pods_match_regex:" .. arg['id'], "0")
  red:set("programming_mode", "0")
  ngx.say("Regex has been set => " .. body_data)
  ngx.log(ngx.INFO, "Set Regex for web log tail. Log id " .. arg['id'])
  return ngx.exit(ngx.status)

elseif ngx.var.request_method == "POST" and action == "enable_log_tail" then
  local body_data = ngx.req.get_body_data()  
  red:set("logs_enabled:" .. arg['id'], "1")
  red:expire("logs_enabled:" .. arg['id'], "30")
  ngx.log(ngx.INFO, "Enable Log Tail for log id " .. arg['id'])
  ngx.say("Enable Log Tail for log id " .. arg['id'])
  return ngx.exit(ngx.status)

elseif ngx.var.request_method == "POST" and action == "disable_log_tail" then
  red:set("programming_mode", "0")
  ngx.say("Disable Log Tail for log id " .. arg['id'])
  ngx.log(ngx.INFO, "Disable Log Tail for log id " .. arg['id'])
  return ngx.exit(ngx.status)
end
