local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"
local http = require("resty.http")

local k8s_url = ""

if os.getenv("KUBERNETES_SERVICE_HOST") then
  k8s_url = "https://" .. os.getenv("KUBERNETES_SERVICE_HOST") .. ":" .. os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
else
  k8s_url = os.getenv("ENDPOINT")
end

local token = os.getenv("TOKEN")
local arg = ngx.req.get_uri_args()
local namespace = arg["namespace"]
local url = k8s_url .. "/apis/kubevirt.io/v1/namespaces/" .. namespace .. "/virtualmachines"
local decoded = nil

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';

ngx.log(ngx.INFO, "Requesting nodes using this url: " .. url)

local httpc = http.new()

-- Esegui la richiesta
local res, err = httpc:request_uri(url, {
    method = "GET",
    ssl_verify = false, -- TODO: use a valid certificate
    headers = {
        ["Accept"] = "application/json",
        ["Content-Type"] = "application/json",
        ["Authorization"] = "Bearer " .. token
    }
})

if not res then
    ngx.log(ngx.ERR, "Errore durante la richiesta HTTP: ", err)
    return
end

ngx.say(res.body)