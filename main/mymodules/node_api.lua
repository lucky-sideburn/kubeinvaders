local M = {}

function M.node_metrics(pod_name)
   http.request(endpoint .. "/apis/metrics.k8s.io/v1beta1/nodes", "GET", M.http_node_metrics_result, headers)
end

function M.http_node_metrics_result(self, _, response)
   print(response.response)
end

return M