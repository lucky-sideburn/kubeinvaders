loadfile("/usr/local/openresty/nginx/conf/kubeinvaders/metrics.lua")

local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require "lunajson"
local redis = require "resty.redis"
local arg = ngx.req.get_uri_args()
local incr = 0
local config = require "config_kubeinv"
local chaos_container = ""

function read_all(file)
    local f = assert(io.open(file, "rb"))
    local content = f:read("*all")
    f:close()
    return content
end

local http = require("socket.http")
math.randomseed(os.clock()*100000000000)
local rand = math.random(999, 9999)
local arg = ngx.req.get_uri_args()

if os.getenv("KUBERNETES_SERVICE_HOST") then
  k8s_url = "https://" .. os.getenv("KUBERNETES_SERVICE_HOST") .. ":" .. os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
else
  k8s_url = os.getenv("ENDPOINT")
end

local token = os.getenv("TOKEN")
local namespace = arg['namespace']
local node_name =  arg['nodename']
local url = k8s_url .. "/apis/batch/v1/namespaces/" .. namespace  .. "/jobs"
local resp = {}

if ngx.var.request_method == "GET" then
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
  local node_name = arg['nodename']
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

headers = {
  ["Accept"] = "application/json",
  ["Content-Type"] = "application/json",
  ["Authorization"] = "Bearer " .. token,
}

local res, err = red:get("chaos_container")
  
if res == ngx.null then
  ngx.log(ngx.ERR, "Found chaos_container defined in Redis!")
  ngx.log(ngx.ERR, res)
  chaos_container = res
else
  ngx.log(ngx.ERR, "Using default chaos container")
  chaos_container = config["default_chaos_container"]
end

body = [[
{
  "apiVersion": "batch/v1",
  "kind": "Job",
  "metadata": {
    "name": "kubeinvaders-chaos-]] .. rand .. [[",
    "labels": {
      "app": "kubeinvaders",
      "approle": "chaosnode"
    }
  },
  "spec": {
    "template": {
      "metadata": {
        "labels": {
          "app": "kubeinvaders",
          "approle": "chaosnode"
        }
      },
      "spec": {
        "containers": [ ]] .. chaos_container .. [[ ],
        "restartPolicy": "Never"
      }
    },
    "backoffLimit": null
  }
}
]]

local headers2 = {
  ["Accept"] = "application/json",
  ["Content-Type"] = "application/json",
  ["Authorization"] = "Bearer " .. token,
  ["Content-Length"] = string.len(body)
}

url = k8s_url .. "/apis/batch/v1/namespaces/" .. namespace  .. "/jobs"
ngx.log(ngx.ERR, "Creating chaos_node job kubeinvaders-chaos-" ..rand)

local ok, statusCode, headers, statusText = https.request{
  url = url,
  headers = headers2,
  method = "POST",
  sink = ltn12.sink.table(resp),
  source = ltn12.source.string(body)
}

ngx.log(ngx.ERR, ok)
ngx.log(ngx.ERR, statusCode)
ngx.log(ngx.ERR, statusText)

local url = k8s_url.. "/apis/batch/v1/namespaces/" .. namespace  .. "/jobs"
ngx.log(ngx.ERR, "Getting JobList" .. rand)

local ok, statusCode, headers, statusText = https.request{
  url = url,
  headers = headers,
  method = "GET",
  sink = ltn12.sink.table(resp)
}

ngx.log(ngx.ERR, ok)
ngx.log(ngx.ERR, statusCode)
ngx.log(ngx.ERR, statusText)

for k,v in ipairs(resp) do
  decoded = json.decode(v)
  if decoded["kind"] == "JobList" then
    for k2,v2 in ipairs(decoded["items"]) do
      if v2["status"]["succeeded"] == 1 and v2["metadata"]["labels"]["approle"] == "chaosnode" then
        delete_job = "kubectl delete job " .. v2["metadata"]["name"] .. " --token=" .. token .. " --server=" .. k8s_url .. " --insecure-skip-tls-verify=true -n " .. namespace
        ngx.log(ngx.ERR, delete_pod)
      end
    end
  end
end

local url = k8s_url.. "/api/v1/namespaces/" .. namespace  .. "/pods"
ngx.log(ngx.ERR, "Getting PodList" .. rand)

local ok, statusCode, headers, statusText = https.request{
  url = url,
  headers = headers,
  method = "GET",
  sink = ltn12.sink.table(resp)
}

ngx.log(ngx.ERR, ok)
ngx.log(ngx.ERR, statusCode)
ngx.log(ngx.ERR, statusText)

for k,v in ipairs(resp) do
  decoded = json.decode(v)
  if decoded["kind"] == "PodList" then
    for k2,v2 in ipairs(decoded["items"]) do
      if v2["status"]["phase"] == "Succeeded" and v2["metadata"]["labels"]["approle"] == "chaosnode" then
        delete_pod = "kubectl delete pod " .. v2["metadata"]["name"] .. " --token=" .. token .. " --server=" .. k8s_url .. " --insecure-skip-tls-verify=true -n " .. namespace
        ngx.log(ngx.ERR, delete_pod)
      end
    end
  end
end

ngx.say("chaos node")
