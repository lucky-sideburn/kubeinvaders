local M = {}
local pod_api = require "main.mymodules.pod_api"

function M.print_pod_name()
	pos = go.get_position()
	message_pod_name = {}
	pod_name = ""
	for i,value in ipairs(current_pods) do
		position_of_pod = go.get_position(value["id"])
		if (pos.x > position_of_pod.x and pos.x - position_of_pod.x < 25) or (position_of_pod.x > pos.x and position_of_pod.x - pos.x < 25) then
			pod_name = pod_name .. " " .. value["pod_name"]
			last_pod_position = position_of_pod
		end
	end
	if pod_name ~= "" then
		if pod_name:match("[%a%d%p_]%s[%a%d%p_]") ~= nil then
			pod_name = pod_name:gsub(" ", "\n")
		end
		msg.post("ui#gui","pod_name",{ pod_name = pod_name, position = last_pod_position })			
	end
end

function M.swap_pod(items)
	for i,value in ipairs(current_pods) do
		if value["collision"] == true and value["color"] == "red" then
			current_pods[i]["id"] =	factory.create("/pod_not_running#podfactory", value["old_position"])
			current_pods[i]["color"] = "red"
			current_pods[i]["collision"] = false
			pod_api.delete_pod(value["pod_name"])
			return
		end
	end

	kubeinvaders_pod_not_running = 0						    -- Pods not running in Kubeinvaders
	kubeinvaders_pod_running =  0 								-- Pods running in Kubeinvaders
	
	kubernetes_pod_not_running = 0								-- Pods not running in Kubernetes
	kubernetes_pod_running = 0 									-- Pods running in Kubernetes

	global_kubernetes_pod_size = table.getn(items)			    -- All pods in Kubernetes
	global_kubeinvaders_pod_size = table.getn(current_pods)     -- All pods in Kubeinvaders

	for i,value in ipairs(items) do
		if value['status']['phase'] ~= "Running" or value['metadata']['deletionTimestamp'] ~= nil then
			print("[swap_pod] phase of " .. value['metadata']['name'] .. " is " ..value['status']['phase'])
			print("[swap_pod] " .. value['metadata']['name'] .. " is not running")
			kubernetes_pod_not_running = kubernetes_pod_not_running + 1
		else
			kubernetes_pod_running = kubernetes_pod_running + 1
		end
	end

	print ("[swap_pod]: pods not running pods in Kubernetes: " .. kubernetes_pod_not_running)
	print ("[swap_pod]: pods running pods in Kubernetes: " .. kubernetes_pod_running)
	msg.post("ui#gui", "hello_gui",{ pod_running = kubernetes_pod_running })

	for i,value in ipairs(current_pods) do
		if value["color"] == "red" then
			kubeinvaders_pod_not_running = kubeinvaders_pod_not_running + 1 
		elseif value["color"] == "white" then
			kubeinvaders_pod_running = kubeinvaders_pod_running + 1 
		end
	end

	print ("[swap_pod]: pods not running pods in KubeInvaders: " .. kubeinvaders_pod_not_running)
	print ("[swap_pod]: pods running pods in KubeInvaders: " .. kubeinvaders_pod_running)

	if kubernetes_pod_running < kubeinvaders_pod_running then
		print ("[swap_pod] there are less pod running in kubernetes than kubeinvaders")
		i = global_kubeinvaders_pod_size - 1
		deleted_pods = 0
		while ( i > 0) do
			if  current_pods[i] ~= nil and current_pods[i]["color"] == "white" then
				go.delete(current_pods[i]["id"])
				table.remove(current_pods,i)
				deleted_pods = deleted_pods + 1
				print ("[swap_pod] delete kubeinvaders pod at position " .. tostring(i) .. " of kubeinvaders global pods array")
			end	
			i = i - 1
		end
		msg.post("ui#gui", "error",{ errormessage = "Synchronizing alien ships with Kubernetes pods.." })
		return
	end

	if (kubernetes_pod_running > kubeinvaders_pod_running) then
		for i,value in ipairs(current_pods) do
			go.delete(value["id"])
		end
		current_pods = {}
		pod_api.set_pods()
	end

	if kubeinvaders_pod_not_running > kubernetes_pod_not_running then
		print ("[swap_pod] there are more pod not running in KubeInvaders than Kubernetes")
		diff  = kubeinvaders_pod_not_running - kubernetes_pod_not_running
		a = 0
		while ( a < diff ) do
			for i,value in ipairs(current_pods) do
				if value["color"] == "red" then
					go.delete(value["id"])
					table.remove(current_pods,i)					
				end
			end
			a = a + 1
		end
		msg.post("ui#gui", "error",{ errormessage = "Synchronizing alien ships with Kubernetes pods.." })
	end	
end 

return M