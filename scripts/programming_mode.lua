local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"
local red = redis:new()
local okredis, errredis = red:connect("unix:/tmp/redis.sock")
local k8s_url = ""
local kube_host = os.getenv("KUBERNETES_SERVICE_HOST")
local kube_port = os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
local endpoint = os.getenv("ENDPOINT")
local req_headers = ngx.req.get_headers()
local target = arg["target"] or req_headers["x-k8s-target"] or req_headers["X-K8S-Target"]
local token = req_headers["x-k8s-token"] or req_headers["X-K8S-Token"] or tostring(os.getenv("TOKEN") or "")
local ca_cert_b64 = req_headers["x-k8s-ca-cert-b64"] or req_headers["X-K8S-CA-CERT-B64"]

if kube_host and kube_host ~= "" then
  local port_suffix = ""
  if kube_port and kube_port ~= "" then
    port_suffix = ":" .. kube_port
  end
  k8s_url = "https://" .. kube_host .. port_suffix
else
  k8s_url = endpoint or ""
end

if target and target ~= "" then
  if not string.match(target, "^https?://") then
    target = "https://" .. target
  end
  k8s_url = string.gsub(target, "/+$", "")
end

if not string.match(k8s_url, "^https?://") then
  k8s_url = "https://" .. k8s_url
end

k8s_url = string.gsub(k8s_url, "/+$", "")

if k8s_url == "" then
  ngx.status = 500
  ngx.say("Missing Kubernetes endpoint configuration. Set KUBERNETES_SERVICE_HOST or ENDPOINT.")
  ngx.exit(ngx.OK)
end

if token == "" then
  ngx.status = 500
  ngx.say("Missing Kubernetes API token configuration.")
  ngx.exit(ngx.OK)
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
local ca_cert_env = ""
if ca_cert_b64 and ca_cert_b64 ~= "" then
  ca_cert_env = ca_cert_b64
end
local token_b64 = ngx.encode_base64(token)
handle = io.popen("K8S_TOKEN_B64='" .. token_b64 .. "' K8S_CA_CERT_B64='" .. ca_cert_env .. "' python3 /opt/programming_mode/start.py " .. file_name .. " " .. k8s_url .. "; echo $? > " .. file_name .. ".check")
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

