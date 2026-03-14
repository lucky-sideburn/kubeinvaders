local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require 'lunajson'
local redis = require "resty.redis"
local http = require("resty.http")

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

local arg = ngx.req.get_uri_args()
local req_headers = ngx.req.get_headers()
local target = arg["target"] or req_headers["x-k8s-target"] or req_headers["X-K8S-Target"]
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

local token = req_headers["x-k8s-token"] or req_headers["X-K8S-Token"] or tostring(os.getenv("TOKEN") or "")
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
local namespace = arg["namespace"]
local url = k8s_url .. "/apis/kubevirt.io/v1/namespaces/" .. namespace .. "/virtualmachines"
local decoded = nil

ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range';

ngx.log(ngx.INFO, "Requesting nodes using this url: " .. url)

local resp = {}
local request_opts = {
  url = url,
  method = "GET",
  headers = {
    ["Accept"] = "application/json",
    ["Content-Type"] = "application/json",
    ["Authorization"] = "Bearer " .. token
  },
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

local ok, statusCode, response_headers, statusText = https.request(request_opts)
if not ok then
  ngx.status = tonumber(statusCode) or 502
  ngx.say(statusText or "Kubernetes VM request failed")
  return
end

ngx.say(table.concat(resp))