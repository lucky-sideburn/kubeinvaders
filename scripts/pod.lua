local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"
local incr = 0

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

if k8s_url == "" then
  ngx.status = 500
  ngx.say("Missing Kubernetes endpoint configuration. Set KUBERNETES_SERVICE_HOST or ENDPOINT.")
  ngx.exit(ngx.OK)
end

if not string.match(k8s_url, "^https?://") then
  k8s_url = "https://" .. k8s_url
end

k8s_url = string.gsub(k8s_url, "/+$", "")

local token = tostring(os.getenv("TOKEN") or "")
if token == "" then
  ngx.status = 500
  ngx.say("Missing Kubernetes API token configuration.")
  ngx.exit(ngx.OK)
end

local disable_tls_env = string.lower(tostring(os.getenv("DISABLE_TLS") or "false"))
local disable_tls = disable_tls_env == "true" or disable_tls_env == "1" or disable_tls_env == "yes"
local arg = ngx.req.get_uri_args()
local req_headers = ngx.req.get_headers()
local target = arg['target'] or req_headers["x-k8s-target"] or req_headers["X-K8S-Target"]
local header_token = req_headers["x-k8s-token"] or req_headers["X-K8S-Token"]
local ca_cert_b64 = req_headers["x-k8s-ca-cert-b64"] or req_headers["X-K8S-CA-CERT-B64"]
local ca_cert = nil

if ca_cert_b64 and ca_cert_b64 ~= "" then
  ca_cert = ngx.decode_base64(ca_cert_b64)
end

if header_token and header_token ~= "" then
  token = header_token
end

local namespace = arg['namespace']
local decoded = nil
local action = arg['action']
local url = ''
local pods = {}
local method = 'GET'
local pods_not_found = true;

if target and target ~= "" then
  if not string.match(target, "^https?://") then
    target = "https://" .. target
  end
  k8s_url = string.gsub(target, "/+$", "")
end

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';

if action == "delete" then
  local red = redis:new()
  local okredis, errredis = red:connect("unix:/tmp/redis.sock")

  if okredis then
    ngx.log(ngx.INFO, "Connection to Redis is ok")
  else
    ngx.log(ngx.INFO, "Connection to Redis is not ok")
    ngx.log(ngx.INFO, errredis)
  end

  local res, err = red:get("deleted_pods_total")

  if res == ngx.null then
    ngx.say(err)
    ngx.log(ngx.INFO, "deleted_pods_total is not present on Redis. Creating it..")
    red:set("deleted_pods_total", 1)
  else
      incr = res + 1
      ngx.log(ngx.INFO, "deleted_pods_total is present on Redis. Incrementing it..")
      red:set("deleted_pods_total", incr)      
  end

  -- Count the total of deleted pods for namespace
  local res, err = red:get("deleted_pods_total_on_" .. namespace)

  if res == ngx.null then
    red:set("deleted_pods_total_on_" .. namespace, 1)
  else
    incr = res + 1
    red:set("deleted_pods_total_on_" .. namespace, incr)
  end
end

if action == "list" then
  url = k8s_url.. "/api/v1/namespaces/" .. namespace  .. "/pods"

elseif action == "delete" then
  local pod_name = arg['pod_name']
  url = k8s_url.. "/api/v1/namespaces/" .. namespace  .. "/pods/" .. pod_name
  method = "DELETE"

else
  ngx.say("Please set the parameter 'action'")
  ngx.exit(ngx.OK)
end

local headers = {
  ["Accept"] = "application/json",
  ["Content-Type"] = "application/json",
  ["Authorization"] = "Bearer " .. token,
}

local resp = {}

local request_opts = {
  url = url,
  headers = headers,
  method = method,
  verify = disable_tls and "none" or "peer",
  sink = ltn12.sink.table(resp)
}

if not disable_tls and ca_cert and ca_cert ~= "" then
  local ca_file_path = "/tmp/kubeinv-custom-ca.crt"
  local ca_file = io.open(ca_file_path, "w")
  if ca_file then
    ca_file:write(ca_cert)
    ca_file:close()
    request_opts.cafile = ca_file_path
  end
end

local ok, statusCode, headers, statusText = https.request(request_opts)

if action == "list" then
  local i = 1
  local j = 0
  pods["items"] = {}
  decoded = json.decode(table.concat(resp))
  if decoded["kind"] == "PodList" then
    for k2,v2 in ipairs(decoded["items"]) do
      if v2["status"]["phase"] == "Running" and v2["metadata"]["labels"]["chaos-controller"] ~= "kubeinvaders" then
        -- ngx.log(ngx.INFO, "found pod " .. v2["metadata"]["name"])
        local status = "pending"
        for _, c in ipairs(v2["status"]["conditions"]) do
          if c["type"] == "ContainersReady" and c["status"] == "True" then
            status = "ready"
            break
          end
        end
        pods["items"][i] = { name = v2["metadata"]["name"], status = status }
        i = i + 1
        pods_not_found = false;
      elseif v2["status"]["phase"] == "ContainerCreating" and v2["metadata"]["labels"]["chaos-controller"] ~= "kubeinvaders" then
        -- ngx.log(ngx.INFO, "found pod " .. v2["metadata"]["name"])
        pods["items"][i] = { name = v2["metadata"]["name"], status = "pending" }
        i = i + 1
        pods_not_found = false;
      elseif v2["status"]["phase"] == "Terminating" and v2["metadata"]["labels"]["chaos-controller"] ~= "kubeinvaders" then
        -- ngx.log(ngx.INFO, "found pod " .. v2["metadata"]["name"])
        pods["items"][i] = { name = v2["metadata"]["name"], status = "killed" }
        i = i + 1
        pods_not_found = false;
      elseif v2["status"]["phase"] ~= "Running" and v2["status"]["phase"] ~= "Completed" and v2["status"]["phase"] ~= "Succeeded" then
        j = j + 1
      end
    end
    local red = redis:new()
    local okredis, errredis = red:connect("unix:/tmp/redis.sock")
    red:set("pods_not_running_on_selected_ns", j)
  end

  local red = redis:new()
  local okredis, errredis = red:connect("unix:/tmp/redis.sock")
  
  local pods_not_running_on, err = red:get("pods_not_running_on_selected_ns")
  local fewer_replicas_seconds, err = red:get("fewer_replicas_seconds")
  local latest_fewer_replicas_seconds, err = red:get("latest_fewer_replicas_seconds")
  local fewer_replicas_time, err = red:get("fewer_replicas_time")

  -- ngx.log(ngx.INFO, "[METRICS] pods_not_running_on=" .. pods_not_running_on)

  if fewer_replicas_seconds == ngx.null then
    red:set("fewer_replicas_seconds", 0)
  end

  if latest_fewer_replicas_seconds == ngx.null then
    red:set("latest_fewer_replicas_seconds", 0)
  end

  if fewer_replicas_time == ngx.null or tonumber(pods_not_running_on) == 0 then
    red:set("fewer_replicas_time", 0)
    
    if fewer_replicas_seconds ~= ngx.null and tonumber(fewer_replicas_seconds) > 0 then
      red:set("latest_fewer_replicas_seconds", fewer_replicas_seconds)
      red:set("fewer_replicas_seconds", 0)
    end
  end

  if pods_not_running_on ~= ngx.null and tonumber(pods_not_running_on) > 1 and tonumber(fewer_replicas_time) == 0 then
    red:set("fewer_replicas_time", tonumber(os.time(os.date("!*t"))))
  elseif tonumber(pods_not_running_on) > 1 and tonumber(fewer_replicas_time) > 1 then
    red:set("fewer_replicas_seconds", tonumber(os.time(os.date("!*t"))) - tonumber(fewer_replicas_time))
  end

  if pods_not_found then
    ngx.log(ngx.INFO, "No pods found into the namespace " .. namespace)
    ngx.say("{\"items\": []}")
  else
    ngx.say(json.encode(pods))
  end

elseif action == "delete" then
  ngx.say(table.concat(resp))
end
