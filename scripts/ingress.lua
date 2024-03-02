local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"

local k8s_url = ""

function convert_table_to_string(table)
  local str = ""
  for k,v in pairs(table) do
    str = str .. k .. " => " .. v .. "\n"
  end
  return str
end

function check_table_key_exists(table, key)
  for k,v in pairs(table) do
    if k == key then
      return true
    end
  end
  return false
end

if os.getenv("KUBERNETES_SERVICE_HOST") then
  k8s_url = "https://" .. os.getenv("KUBERNETES_SERVICE_HOST") .. ":" .. os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
else
  k8s_url = os.getenv("ENDPOINT")
end

local token = os.getenv("TOKEN")
local arg = ngx.req.get_uri_args()
local namespace = arg["namespace"]
local url = k8s_url .. "/apis/networking.k8s.io/v1/namespaces/" .. namespace .. "/ingresses"
local decoded = nil

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';

ngx.log(ngx.INFO, "Requesting nodes using this url: " .. url)

local headers = {
  ["Accept"] = "application/json",
  ["Content-Type"] = "application/json",
  ["Authorization"] = "Bearer " .. token,
}

local resp = {}
local host_list = {}
local ok, statusCode, headers, statusText = https.request{
  url = url,
  headers = headers,
  method = "GET",
  sink = ltn12.sink.table(resp)
}

ngx.log(ngx.INFO, "REQUEST LOGS...")
ngx.log(ngx.INFO, ok)
ngx.log(ngx.INFO, statusCode)
ngx.log(ngx.INFO, statusText)
ngx.log(ngx.INFO, "[INGRESS-LIST] resp: " .. convert_table_to_string(resp))

decoded = json.decode(table.concat(resp))
if table.getn(decoded["items"]) == 0 then
  host_list = {"No Ingress found"}
end

for k2,v2 in ipairs(decoded["items"]) do

  if check_table_key_exists(v2["spec"], "tls") then
    for k3,v3 in ipairs(v2["spec"]["tls"]) do
      for i in pairs(v3["hosts"]) do
        ngx.log(ngx.INFO, "Ingress: " .. v3["hosts"][i])
        table.insert(host_list, "https://" .. v3["hosts"][i])
      end
    end
  end

  for k3,v3 in ipairs(v2["spec"]["rules"]) do
    ngx.log(ngx.INFO, "Ingress: " .. v3["host"])
    table.insert(host_list, "http://" .. v3["host"])
  end
end

ngx.say(json.encode(host_list))

