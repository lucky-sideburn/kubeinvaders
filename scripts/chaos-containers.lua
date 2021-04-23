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

if ngx.var.request_method == "GET" and action == 'default' then
    ngx.say(config['default_chaos_container'])

elseif ngx.var.request_method == "GET" and action == 'chaos_container' then
    local res, err = red:get("chaos_container")
    if res == ngx.null then
      ngx.say('A custom chaos container has not yet been configured')
    else
      ngx.say(res)
    end

elseif ngx.var.request_method == "POST" and action == 'set' then
    ngx.say('New chaos container has been configured')

    if arg['chaos_container'] == nil then
        ngx.say("Please set the parameter 'chaos_container'")
    else
        red:set("chaos_container", arg['chaos_container'])
        ngx.say("chaos_container has been configured in Redis")
    end
end