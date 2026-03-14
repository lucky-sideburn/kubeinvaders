loadfile("/usr/local/openresty/nginx/conf/kubeinvaders/metrics.lua")

local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require "lunajson"
local redis = require "resty.redis"
local arg = ngx.req.get_uri_args()
local incr = 0
local config = require "config_kubeinv"
local chaos_container = ""
local red = redis:new()
local okredis, errredis = red:connect("unix:/tmp/redis.sock")

local function read_all(file)
    local f = assert(io.open(file, "rb"))
    local content = f:read("*all")
    f:close()
    return content
end

local http = require("socket.http")
math.randomseed(os.clock()*100000000000)
local rand = math.random(999, 9999)
local arg = ngx.req.get_uri_args()
local req_headers = ngx.req.get_headers()
local k8s_url = ""
local kube_host = os.getenv("KUBERNETES_SERVICE_HOST")
local kube_port = os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
local endpoint = os.getenv("ENDPOINT")

if kube_host and kube_host ~= "" then
  local port_suffix = ""
  if kube_port and kube_port ~= "" then
    port_suffix = ":" .. kube_port
  end
  k8s_url = "https://" .. kube_host .. port_suffix
else
  k8s_url = endpoint or ""
end

local target = arg['target'] or req_headers["x-k8s-target"] or req_headers["X-K8S-Target"]
if target and target ~= "" then
  if not string.match(target, "^https?://") then
    target = "https://" .. target
  end
  k8s_url = string.gsub(target, "/+$", "")
end

if k8s_url == "" then
  ngx.status = 500
  ngx.say("Missing Kubernetes endpoint configuration. Set KUBERNETES_SERVICE_HOST or ENDPOINT.")
  ngx.exit(ngx.OK)
end

if not string.match(k8s_url, "^https?://") then
  k8s_url = "https://" .. k8s_url
end

k8s_url = string.gsub(k8s_url, "/+$", "")

local header_token = req_headers["x-k8s-token"] or req_headers["X-K8S-Token"]
local token = ""
if header_token and header_token ~= "" then
  token = header_token
else
  token = tostring(os.getenv("TOKEN") or "")
end
if token == "" then
  local f = io.open("/var/run/secrets/kubernetes.io/serviceaccount/token", "r")
  if f then
    token = f:read("*a") or ""
    token = token:gsub("%s+$", "")
    f:close()
  end
end
if token == "" then
  ngx.status = 500
  ngx.say("Missing Kubernetes API token configuration.")
  ngx.exit(ngx.OK)
end

local ca_cert_b64 = req_headers["x-k8s-ca-cert-b64"] or req_headers["X-K8S-CA-CERT-B64"]
local ca_cert = nil
if ca_cert_b64 and ca_cert_b64 ~= "" then
  ca_cert = ngx.decode_base64(ca_cert_b64)
end

local disable_tls_env = string.lower(tostring(os.getenv("DISABLE_TLS") or "false"))
local disable_tls = disable_tls_env == "true" or disable_tls_env == "1" or disable_tls_env == "yes"
local namespace = arg['namespace']
local node_name =  arg['nodename']
local url = k8s_url .. "/apis/batch/v1/namespaces/" .. namespace  .. "/jobs"
local resp = {}

if ngx.var.request_method == "GET" then

  if okredis then
    ngx.log(ngx.INFO, "Connection to Redis is ok")
  else
    ngx.log(ngx.INFO, "Connection to Redis is not ok")
    ngx.log(ngx.INFO, errredis)
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
  
if res ~= ngx.null then
  ngx.log(ngx.INFO, "Found chaos_container defined in Redis!")
  ngx.log(ngx.INFO, res)
  chaos_container = res
else
  ngx.log(ngx.INFO, "Using default chaos container")
  chaos_container = config["default_chaos_container"]
end

local body = [[
{
  "apiVersion": "batch/v1",
  "kind": "Job",
  "metadata": {
    "name": "kubeinvaders-chaos-]] .. rand .. [[",
    "labels": {
      "chaos-controller": "kubeinvaders"
    }
  },
  "spec": {
    "template": {
      "metadata": {
        "labels": {
          "chaos-controller": "kubeinvaders"
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

local function create_request_opts(request_url, request_headers, request_method, request_source)
  local request_opts = {
    url = request_url,
    headers = request_headers,
    method = request_method,
    verify = disable_tls and "none" or "peer",
    sink = ltn12.sink.table(resp)
  }

  if request_source then
    request_opts.source = request_source
  end

  if not disable_tls and ca_cert and ca_cert ~= "" then
    local ca_file_path = "/tmp/kubeinv-custom-ca.crt"
    local ca_file = io.open(ca_file_path, "w")
    if ca_file then
      ca_file:write(ca_cert)
      ca_file:close()
      request_opts.cafile = ca_file_path
    end
  end

  return request_opts
end

local url = k8s_url .. "/apis/batch/v1/namespaces/" .. namespace  .. "/jobs"
ngx.log(ngx.INFO, "Creating chaos_node job kubeinvaders-chaos-" ..rand)

local ok, statusCode, headers, statusText = https.request(
  create_request_opts(url, headers2, "POST", ltn12.source.string(body))
)

ngx.log(ngx.INFO, ok)
ngx.log(ngx.INFO, statusCode)
ngx.log(ngx.INFO, statusText)

local url = k8s_url.. "/apis/batch/v1/namespaces/" .. namespace  .. "/jobs"
ngx.log(ngx.INFO, "Getting JobList" .. rand)

local ok, statusCode, headers, statusText = https.request(
  create_request_opts(url, headers, "GET")
)

ngx.log(ngx.INFO, ok)
ngx.log(ngx.INFO, statusCode)
ngx.log(ngx.INFO, statusText)

for k,v in ipairs(resp) do
  decoded = json.decode(v)
  if decoded["kind"] == "JobList" then
    for k2,v2 in ipairs(decoded["items"]) do
      if v2["status"]["succeeded"] == 1 and v2["metadata"]["labels"]["chaos-controller"] == "kubeinvaders" then
        delete_job = "kubectl delete job " .. v2["metadata"]["name"] .. " --token=" .. token .. " --server=" .. k8s_url .. " --insecure-skip-tls-verify=true -n " .. namespace
        ngx.log(ngx.INFO, delete_pod)
      end
    end
  end
end

local url = k8s_url.. "/api/v1/namespaces/" .. namespace  .. "/pods"
ngx.log(ngx.INFO, "Getting PodList" .. rand)

local ok, statusCode, headers, statusText = https.request(
  create_request_opts(url, headers, "GET")
)

ngx.log(ngx.INFO, ok)
ngx.log(ngx.INFO, statusCode)
ngx.log(ngx.INFO, statusText)

for k,v in ipairs(resp) do
  decoded = json.decode(v)
  if decoded["kind"] == "PodList" then
    for k2,v2 in ipairs(decoded["items"]) do
      if v2["status"]["phase"] == "Succeeded" and v2["metadata"]["labels"]["chaos-controller"] == "kubeinvaders" then
        delete_pod = "kubectl delete pod " .. v2["metadata"]["name"] .. " --token=" .. token .. " --server=" .. k8s_url .. " --insecure-skip-tls-verify=true -n " .. namespace
        ngx.log(ngx.INFO, delete_pod)
      end
    end
  end
end

ngx.say("chaos node")
