local redis = require "resty.redis"

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';
ngx.req.read_body()

local request_body = ngx.req.get_body_data()
local arg = ngx.req.get_uri_args()
local namespace = arg['namespace']
local logid = arg['logid']
local red = redis:new()
local okredis, errredis = red:connect("unix:/tmp/redis.sock")
  
if okredis then
  ngx.log(ngx.INFO, "Connection to Redis is ok")
else
  ngx.log(ngx.INFO, "Connection to Redis is not ok")
  ngx.log(ngx.INFO, errredis)
end

red:set("logs:chaoslogs-" .. logid, "Starting kubelinter...")


local handle = io.popen("/opt/kube-linter-parser.sh " .. namespace)
local result = handle:read("*a")

red:set("logs:chaoslogs-" .. logid, result)

ngx.say(result)