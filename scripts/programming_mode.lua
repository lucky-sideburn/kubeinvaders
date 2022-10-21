local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"

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

ngx.log(ngx.ERR, "[programming_mode]" .. body_data)

math.randomseed(os.clock()*100000000000)
local rand = math.random(999, 9999)
file_name = "/tmp/experiments-".. rand ..".yaml"
file = io.open(file_name, "w")
io.output(file)
io.write(body_data)
io.close(file)

local handle = io.popen("python3 /opt/programming_mode/start.py " .. file_name .. " " .. k8s_url)
local result = handle:read("*a")

ngx.say("Chaos program has been started...")
