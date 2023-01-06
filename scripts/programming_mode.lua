local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"
local red = redis:new()
local okredis, errredis = red:connect("unix:/tmp/redis.sock")

if okredis then
  ngx.log(ngx.INFO, "Connection to Redis is ok")
else
  ngx.log(ngx.INFO, "Connection to Redis is not ok")
  ngx.log(ngx.INFO, errredis)
end

local k8s_url = ""

if os.getenv("KUBERNETES_SERVICE_HOST") then
  k8s_url = "https://" .. os.getenv("KUBERNETES_SERVICE_HOST") .. ":" .. os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
else
  k8s_url = os.getenv("ENDPOINT")
end

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';
ngx.req.read_body()

local token = os.getenv("TOKEN")
local arg = ngx.req.get_uri_args()
local body_data = ngx.req.get_body_data() 

ngx.log(ngx.INFO, "[programming_mode]" .. body_data)

math.randomseed(os.clock()*100000000000)
local rand = math.random(999, 9999)
file_name = "/tmp/experiments-".. rand ..".yaml"
file = io.open(file_name, "w")
io.output(file)
io.write(body_data)
io.close(file)

ngx.log(ngx.INFO, "[programming_mode] set programming_mode Redis key")
red:set("programming_mode", "1")

--ngx.log(ngx.INFO, "[programming_mode] remove do_not_clean_log:" ..arg['id'] .. " Redis key")
--red:del("do_not_clean_log:" .. arg['id'])

ngx.log(ngx.INFO, "[programming_mode] set logs_enabled:" .. arg['id'] .. " Redis key")

red:set("logs_enabled:" .. arg['id'], "1")
red:expire("logs_enabled:" .. arg['id'], "10")

local handle = io.popen("python3 /opt/programming_mode/start.py " .. file_name .. " " .. k8s_url)
local result = handle:read("*a")

ngx.say("Chaos program has been started...")
