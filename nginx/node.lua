local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'

local k8s_url = os.getenv("ENDPOINT")
local token = os.getenv("TOKEN")
local arg = ngx.req.get_uri_args()
local url = k8s_url.. "/api/v1/nodes"
local decoded = nil
local nodes = {}

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';

ngx.log(ngx.ERR, "token: " .. token)
ngx.log(ngx.ERR, "url: " .. url)

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

local i = 0
nodes["items"] = {}

for k,v in ipairs(resp) do
  decoded = json.decode(v)
  if decoded["kind"] == "NodeList" then
    for k2,v2 in ipairs(decoded["items"]) do
      if not v2["metadata"]["labels"]["node-role.kubernetes.io/master"] then
        ngx.log(ngx.ERR, "found node " .. v2["metadata"]["name"])
        nodes["items"][i] = v2["metadata"]["name"]
        i = i + 1
      end
    end
  end
end

ngx.say(json.encode(nodes))