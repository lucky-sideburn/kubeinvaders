local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"

if os.getenv("KUBERNETES_SERVICE_HOST") then
  k8s_url = "https://" .. os.getenv("KUBERNETES_SERVICE_HOST") .. ":" .. os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
else
  k8s_url = os.getenv("ENDPOINT")
end

local token = os.getenv("TOKEN")
local arg = ngx.req.get_uri_args()
local url = k8s_url.. "/api/v1/nodes"
local decoded = nil
local nodes = {}


if ngx.var.request_method == "GET" and string.match(ngx.var.request_uri, "^.*/chaos[-]node.*$") then
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
end


ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';

ngx.log(ngx.ERR, "Requesting nodes using this url: " .. url)

local headers = {
  ["Accept"] = "application/json",
  ["Content-Type"] = "application/json",
  ["Authorization"] = "Bearer " .. token,
}

local resp = {}

local ok, statusCode, headers, statusText = https.request{
  url = url,
  headers = headers,
  method = "GET",
  sink = ltn12.sink.table(resp)
}

ngx.log(ngx.ERR, "REQUEST LOGS...")
ngx.log(ngx.ERR, ok)
ngx.log(ngx.ERR, statusCode)
ngx.log(ngx.ERR, statusText)

nodes["items"] = {}
for k,v in ipairs(resp) do
  ngx.log(ngx.ERR, k)
  decoded = json.decode(v)
  if decoded["kind"] == "NodeList" then
    for k2,v2 in ipairs(decoded["items"]) do
      -- TODO: masters should be included?
      -- if not v2["metadata"]["labels"]["node-role.kubernetes.io/master"] then
      ngx.log(ngx.ERR, "found node " .. v2["metadata"]["name"])
      table.insert(nodes["items"], v2["metadata"]["name"])
      --end
    end
  end
end
ngx.say(json.encode(nodes))
