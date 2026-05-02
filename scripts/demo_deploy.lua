local https = require "ssl.https"
local ltn12 = require "ltn12"
local json = require "lunajson"

local arg = ngx.req.get_uri_args()
local req_headers = ngx.req.get_headers()

ngx.header['Content-Type'] = 'application/json'
ngx.header['Access-Control-Allow-Origin'] = '*'
ngx.header['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
ngx.header['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,X-K8S-Target,X-K8S-Token,X-K8S-CA-CERT-B64'
ngx.header['Access-Control-Expose-Headers'] = 'Content-Length,Content-Range'

if ngx.var.request_method == "OPTIONS" then
  ngx.status = 204
  return
end

local k8s_url = ""
local kube_host = os.getenv("KUBERNETES_SERVICE_HOST")
local kube_port = os.getenv("KUBERNETES_SERVICE_PORT_HTTPS")
local endpoint = os.getenv("ENDPOINT")

if kube_host and kube_host ~= "" then
  local port_suffix = kube_port and kube_port ~= "" and (":" .. kube_port) or ""
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
  ngx.say(json.encode({ok = false, error = "Missing Kubernetes endpoint"}))
  return
end

if not string.match(k8s_url, "^https?://") then
  k8s_url = "https://" .. k8s_url
end
k8s_url = string.gsub(k8s_url, "/+$", "")

local header_token = req_headers["x-k8s-token"] or req_headers["X-K8S-Token"]
local token = header_token and header_token ~= "" and header_token or tostring(os.getenv("TOKEN") or "")
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
  ngx.say(json.encode({ok = false, error = "Missing Kubernetes API token"}))
  return
end

local ca_cert_b64 = req_headers["x-k8s-ca-cert-b64"] or req_headers["X-K8S-CA-CERT-B64"]
local ca_cert = nil
if ca_cert_b64 and ca_cert_b64 ~= "" then
  ca_cert = ngx.decode_base64(ca_cert_b64)
end

local disable_tls_env = string.lower(tostring(os.getenv("DISABLE_TLS") or "false"))
local disable_tls = disable_tls_env == "true" or disable_tls_env == "1" or disable_tls_env == "yes"

local ca_file_path = "/tmp/kubeinv-demo-ca.crt"
if not disable_tls and ca_cert and ca_cert ~= "" then
  local ca_file = io.open(ca_file_path, "w")
  if ca_file then
    ca_file:write(ca_cert)
    ca_file:close()
  end
end

local function k8s_request(url, method, body)
  local resp = {}
  local headers = {
    ["Accept"] = "application/json",
    ["Content-Type"] = "application/json",
    ["Authorization"] = "Bearer " .. token,
  }
  local opts = {
    url = url,
    headers = headers,
    method = method,
    verify = disable_tls and "none" or "peer",
    sink = ltn12.sink.table(resp),
  }
  if body and body ~= "" then
    headers["Content-Length"] = tostring(#body)
    opts.source = ltn12.source.string(body)
  end
  if not disable_tls and ca_cert and ca_cert ~= "" then
    opts.cafile = ca_file_path
  end
  local ok, status_code, _, _ = https.request(opts)
  return ok, status_code, table.concat(resp)
end

local ns_body_fmt = '{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"%s","labels":{"app":"kubeinvaders-demo"}}}'
local deploy_body_fmt = '{"apiVersion":"apps/v1","kind":"Deployment","metadata":{"name":"kubeinvaders-demo","namespace":"%s","labels":{"app":"kubeinvaders-demo"}},"spec":{"replicas":10,"selector":{"matchLabels":{"app":"kubeinvaders-demo"}},"template":{"metadata":{"labels":{"app":"kubeinvaders-demo"}},"spec":{"containers":[{"name":"nginx","image":"nginx:alpine","resources":{"requests":{"memory":"32Mi","cpu":"10m"},"limits":{"memory":"64Mi","cpu":"50m"}}}]}}}}'

local created = {}
local errors = {}

for _, ns in ipairs({"ns-1", "ns-2"}) do
  local ns_body = string.format(ns_body_fmt, ns)
  local ok, status, _ = k8s_request(k8s_url .. "/api/v1/namespaces", "POST", ns_body)

  if not ok then
    table.insert(errors, "namespace " .. ns .. ": request failed")
  elseif status ~= 200 and status ~= 201 and status ~= 409 then
    table.insert(errors, "namespace " .. ns .. ": HTTP " .. tostring(status))
  else
    local deploy_body = string.format(deploy_body_fmt, ns)
    local dok, dstatus, _ = k8s_request(
      k8s_url .. "/apis/apps/v1/namespaces/" .. ns .. "/deployments",
      "POST",
      deploy_body
    )
    if not dok then
      table.insert(errors, "deployment in " .. ns .. ": request failed")
    elseif dstatus ~= 200 and dstatus ~= 201 and dstatus ~= 409 then
      table.insert(errors, "deployment in " .. ns .. ": HTTP " .. tostring(dstatus))
    else
      table.insert(created, ns)
    end
  end
end

if #errors == 0 then
  ngx.status = 200
  ngx.say(json.encode({ok = true, created = created, message = "Deployed ns-1 and ns-2 with 10 nginx pods each"}))
else
  ngx.status = 207
  ngx.say(json.encode({ok = #created > 0, created = created, errors = errors}))
end
