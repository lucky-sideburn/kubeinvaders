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
	--msg.post("ui#gui","open_kubelinter_box",{ position = vmath.vector3(850, 550, 0) })
	--kubelinter_read = true
	--kubelinter_index = 0

	--for i,value in ipairs(kubelinter_table) do
	--	kubelintermessage = value
	--	kubelinter_index = kubelinter_index + 1
	--	msg.post("ui#gui", "set_kubelinter_text",{ kubelintermessage = value })
	--	break
	--end
end

function M.http_node_metrics_result(self, _, response)
	print(response.response)
end

function M.get_nodes()
	http.request(endpoint .. "/api/v1/nodes", "GET", M.http_get_nodes_result, headers)
end

function M.http_get_nodes_result(self, _, response)
	kubernetes_nodes = {}
	print("Get nodes output")
	print('/api/v1/nodes response: ' .. response.status)
	nodes = json.decode(response.response)
	node_items = nodes["items"]
	node_items_size = table.getn(node_items)
	print("Node table size: " .. node_items_size)
	pos_x = 80
	pos_y = 500
	nodes_cnt = 1
	for k, v in pairs(node_items) do
		for k1, v2 in pairs(v) do
			if v2["name"] then
				print("Found k8s node: " .. v2["name"])
				pos = vmath.vector3(pos_x, pos_y, 0) 
				new_node = factory.create("/k8s_node#k8s_node_factory", pos)
				table.insert(kubernetes_nodes,{ name = v2["name"], id = new_node })
			
				if ((nodes_cnt % 15 ) == 0) then
					pos_y = pos_y + 200
					pos_x = 80
				else
					pos_x = pos_x + 80
				end
				
				nodes_cnt = nodes_cnt + 1
			end
		end
	end
end

return M