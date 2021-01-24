local M = {}

function M.node_metrics(pod_name)
	http.request(endpoint .. "/apis/metrics.k8s.io/v1beta1/nodes", "GET", M.http_node_metrics_result, headers)
end

function M.deploy_chaos_node(node_name)
	print("Call OpenResty endpoint for deploy chaos-node")
	http.request(chaos_node_url .. "?namespace=" .. namespace .. "&node_name=".. node_name .. "&token=" .. token .. "&k8s_url=" .. endpoint, "GET", M.deploy_chaos_node_result,headers)	
	print("waiting for a response...")
end

function M.deploy_chaos_node_result(self, _, response)
	print("Deploy Chaos Node output")
	print(response.status)
	print(response.response)
	print(response.headers)
end

function M.http_node_metrics_result(self, _, response)
	print(response.response)
end

function M.get_nodes()
	current_time = os.clock()

	worker_diff_time = current_time - latest_kubernetes_nodes_request_show

	if worker_diff_time > 0.05 then
		kubernetes_nodes_size = table.getn(kubernetes_nodes)
		if kubernetes_nodes_size == 0  and not kubernetes_nodes_request_show then
			print("Show kubernetes nodes...")
			http.request(endpoint .. "/api/v1/nodes", "GET", M.http_get_nodes_result, headers)
			kubernetes_nodes_request_show = true
		else
			print("Kubernetes nodes already present...")
			for k,v in ipairs(kubernetes_nodes) do
				go.delete(v["id"])
			end
			kubernetes_nodes_request_show = false
			kubernetes_nodes = {}
		end
		latest_kubernetes_nodes_request_show = os.clock()
	end
end

function M.http_get_nodes_result(self, _, response)
	kubernetes_nodes = {}
	local kubernetes_nodes_temp = {} 
	local nodes = json.decode(response.response)
	local node_items = nodes["items"]
	local node_items_size = table.getn(node_items)
	local pos_x = 300
	local pos_y = 500
	local nodes_cnt = 1
	local master = false
	print("Get nodes output")
	print('/api/v1/nodes response: ' .. response.status)
	print("Node table size: " .. node_items_size)
	
	nodes_cnt = 1
	for k, v in pairs(node_items) do
		for k1, v2 in pairs(v) do
			if v2["name"] then
				for k3, v3 in pairs(v2["labels"]) do
					if k3 == "node-role.kubernetes.io/master" then
						master = true
					end
				end
				if not master then
					table.insert(kubernetes_nodes_temp,{ name = v2["name"], id = '' })
				end
				master = false
			end
		end
	end
	local node_deleted = 1
	if table.getn(kubernetes_nodes_temp) > max_nodes then
		print("Nodes number are greater than the max_nodes. Going to to select randomly " .. max_nodes .. " nodes")
		while (table.getn(kubernetes_nodes_temp) > max_nodes) do
			math.randomseed(os.clock()*100000000000)
			local interval =  max_nodes - node_deleted
			table.remove(kubernetes_nodes_temp,math.random(1,interval))
			node_deleted  = node_deleted + 1
		end
		print("New size of kubernetes_nodes table is " .. table.getn(kubernetes_nodes_temp))
	end

	kubernetes_nodes = kubernetes_nodes_temp
	
	for k1, v2 in pairs(kubernetes_nodes) do
		if v2["name"] then
			print("Found k8s node: " .. v2["name"])
			pos = vmath.vector3(pos_x, pos_y, 0) 
			new_node = factory.create("/k8s_node#k8s_node_factory", pos)
			kubernetes_nodes[k1] = { name = v2["name"], id = new_node }
			if ((nodes_cnt % 15 ) == 0) then
				pos_y = pos_y + 200
				pos_x = 300
			else
				pos_x = pos_x + 80
			end

			nodes_cnt = nodes_cnt + 1
		end
	end
end

return M