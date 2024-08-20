local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"
local red = redis:new()
local okredis, errredis = red:connect("unix:/tmp/redis.sock")
local k8s_url = ""

if os.getenv("KUBERNETES_SERVICE_HOST") then
  k8s_url = "https://" .. os.getenv("KUBERNETES_SERVICE_HOST") .. ":" .. os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
else
  k8s_url = os.getenv("ENDPOINT")
end

if okredis then
  ngx.log(ngx.INFO, "Connection to Redis is ok")
else
  ngx.log(ngx.INFO, errredis)
  ngx.say("Connection to Redis is not ok")
  ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR) -- 500 Internal Server Error
end

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';
ngx.req.read_body()

local arg = ngx.req.get_uri_args()
local body_data = ngx.req.get_body_data() 

ngx.log(ngx.INFO, "[PROGRAMMING_MODE] Payload sent by client: " .. body_data)

math.randomseed(os.clock()*100000000000)
local rand = math.random(999, 9999)
file_name = "/tmp/experiments-".. rand ..".yaml"
file = io.open(file_name, "w")
io.output(file)
io.write(body_data)
io.close(file)

ngx.log(ngx.INFO, "[PROGRAMMING_MODE] Set programming_mode Redis key to 1")
red:set("programming_mode", "1")

ngx.log(ngx.INFO, "[PROGRAMMING_MODE] Set logs_enabled for " .. arg['id'] .. " as Redis key")
red:set("logs_enabled:" .. arg['id'], "1")
red:expire("logs_enabled:" .. arg['id'], "10")


ngx.log(ngx.INFO, "[PROGRAMMING_MODE] Checking if " .. file_name .. " is a valid YAML file")
local handle = io.popen("python3 -c 'import yaml, sys; print(yaml.safe_load(sys.stdin))' < " .. file_name .. " ; echo $? > " .. file_name .. ".check")
local result = handle:read("*a")

handle = io.popen("cat " .. file_name .. ".check")
result = handle:read("*a")
ngx.log(ngx.INFO, "[PROGRAMMING_MODE] Exit code for checking YAML syntax of " .. file_name .. " is " .. result)

if result == "0\n" then
  ngx.log(ngx.INFO, "[PROGRAMMING_MODE] YAML Syntax is OK")
else
  ngx.log(ngx.INFO, "[PROGRAMMING_MODE] YAML Syntax is NOT OK")
  handle = io.popen("rm -f " .. file_name .. ".check")
  handle:read("*a")
  handle = io.popen("rm -f " .. file_name)
  handle:read("*a")
  ngx.status = 400
  ngx.say("Invalid YAML Chaos Program")
end

ngx.log(ngx.INFO, "[PROGRAMMING_MODE] Starting Chaos Program using /opt/programming_mode/start.py")
handle = io.popen("python3 /opt/programming_mode/start.py " .. file_name .. " " .. k8s_url .. "; echo $? > " .. file_name .. ".check")
result = handle:read("*a")
ngx.log(ngx.INFO, "[PROGRAMMING_MODE] Output for starting Chaos Program is " .. result)
handle = io.popen("cat " .. file_name .. ".check")
result = handle:read("*a")

if result == "0\n" then
  ngx.log(ngx.INFO, "[PROGRAMMING_MODE] Chaos program successfully loaded")
  ngx.say("[PROGRAMMING_MODE] Chaos program successfully loaded")
ngx.exit(ngx.HTTP_OK) -- 200 OK
else
  handle = io.popen("rm -f " .. file_name .. ".check")
  handle:read("*a")
  ngx.status = 500
  ngx.say("[PROGRAMMING_MODE] Error in loading Chaos Program. Please check the YAML syntax of kubeinvaders logs" .. result)
end

