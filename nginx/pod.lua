local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'

local k8s_url = os.getenv("ENDPOINT")
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

ngx.log(ngx.ERR, "token: " .. token)
ngx.log(ngx.ERR, "url: " .. url)
ngx.log(ngx.ERR, "namespace: " .. namespace)

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

ngx.log(ngx.ERR, "REQUEST LOGS...")
ngx.log(ngx.ERR, ok)
ngx.log(ngx.ERR, statusCode)
ngx.log(ngx.ERR, statusText)

if action == "list" then
  local i = 1
  pods["items"] = {}
  for k,v in ipairs(resp) do
    decoded = json.decode(v)
    if decoded["kind"] == "PodList" then
      for k2,v2 in ipairs(decoded["items"]) do
        if v2["status"]["phase"] == "Running" and v2["metadata"]["labels"]["approle"] ~= "chaosnode" then
          ngx.log(ngx.ERR, "found pod " .. v2["metadata"]["name"])
          pods["items"][i] = v2["metadata"]["name"]
          i = i + 1
          pods_not_found = false;
        end
      end
    end
  end

  if pods_not_found then
    ngx.log(ngx.ERR, "No pods found into the namespace" .. namespace)
    ngx.say("{\"items\": []}")
  else
    ngx.say(json.encode(pods))
  end

elseif action == "delete" then
  ngx.say(table.concat(resp))
end