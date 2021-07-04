local arg = ngx.req.get_uri_args()
local action = arg['action']
local config = require "config_kubeinv"
local redis = require "resty.redis"
local red = redis:new()
local okredis, errredis = red:connect("unix:/tmp/redis.sock")

if okredis then
  ngx.log(ngx.ERR, "Connection to Redis is ok")
else
  ngx.log(ngx.ERR, "Connection to Redis is not ok")
  ngx.log(ngx.ERR, errredis)
end

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range'

if ngx.var.request_method == "GET" and action == 'container_definition' then
    ngx.log(ngx.ERR, "Received request for getting chaos container definition")
    local res, err = red:get("chaos_container")
    if res == ngx.null then
      ngx.log(ngx.ERR, "There is no chaos_container key set in Redis. Taking default chaos container definition")
      ngx.say(config['default_chaos_container'])
    else
      ngx.log(ngx.ERR, "There is chaos_container key set in Redis. Taking custom chaos container definition")
      ngx.say(res)
    end
elseif ngx.var.request_method == "POST" and action == 'set' then
  local body_data = ngx.req.get_body_data()  
  ngx.log(ngx.ERR, "Received new yaml definition for chaos container: " .. body_data)
  red:set("chaos_container", body_data)
  ngx.say("New chaos container definition has been configured in Redis")
  return ngx.exit(ngx.status)
end