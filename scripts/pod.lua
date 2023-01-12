local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"
local incr = 0

local k8s_url = ""

if os.getenv("KUBERNETES_SERVICE_HOST") then
  k8s_url = "https://" .. os.getenv("KUBERNETES_SERVICE_HOST") .. ":" .. os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
else
  k8s_url = os.getenv("ENDPOINT")
end

local token = os.getenv("TOKEN")
local arg = ngx.req.get_uri_args()
local namespace = arg['namespace']
local decoded = nil
local action = arg['action']
local url = ''
local pods = {}
local method = 'GET'
local pods_not_found = true;

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
  -- Count the total of deleted pods

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

--ngx.log(ngx.INFO, "token: " .. token)
ngx.log(ngx.INFO, "url: " .. url)
ngx.log(ngx.INFO, "namespace: " .. namespace)

local headers = {
  ["Accept"] = "application/json",
  ["Content-Type"] = "application/json",
  ["Authorization"] = "Bearer " .. token,
}

local resp = {}

local ok, statusCode, headers, statusText = https.request{
  url = url,
  headers = headers,
  method = method,
  sink = ltn12.sink.table(resp)
}

ngx.log(ngx.INFO, "REQUEST LOGS...")
ngx.log(ngx.INFO, ok)
ngx.log(ngx.INFO, statusCode)
ngx.log(ngx.INFO, statusText)

if action == "list" then
  local i = 1
  local j = 0
  pods["items"] = {}
  for k,v in ipairs(resp) do
    decoded = json.decode(v)
    if decoded["kind"] == "PodList" then
      for k2,v2 in ipairs(decoded["items"]) do
        if v2["status"]["phase"] == "Running" and v2["metadata"]["labels"]["chaos-controller"] ~= "kubeinvaders" then
          ngx.log(ngx.INFO, "found pod " .. v2["metadata"]["name"])
          pods["items"][i] = v2["metadata"]["name"]
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
  end

  local red = redis:new()
  local okredis, errredis = red:connect("unix:/tmp/redis.sock")
  
  local pods_not_running_on, err = red:get("pods_not_running_on_selected_ns")
  local fewer_replicas_seconds, err = red:get("fewer_replicas_seconds")
  local latest_fewer_replicas_seconds, err = red:get("latest_fewer_replicas_seconds")
  local fewer_replicas_time, err = red:get("fewer_replicas_time")

  ngx.log(ngx.INFO, "[METRICS] pods_not_running_on=" .. pods_not_running_on)

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
