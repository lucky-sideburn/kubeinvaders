local M = {}

function M.update_pod()
  http.request(endpoint .. "/api/v1/namespaces/" .. namespace .. "/pods", "GET", M.http_update_pod_result,headers)
end

function M.set_pods()
  http.request(endpoint .. "/api/v1/namespaces/".. namespace .. "/pods", "GET", M.http_pod_result,headers)
end

function M.http_update_pod_result(self, _, response)
  kubernetes_pods = {}
  msg.post("ui#gui", "error",{ errormessage = "K8S status code request: " .. response.status })	
  if response.status == 0 then
    msg.post("ui#gui", "error",{ errormessage = "Error connecting to " .. conf['endpoint'] })
  end
  pods = json.decode(response.response)
  pod_items_size = table.getn(pods["items"])
  pod_items = pods["items"]
  i = 0
  while i <= pod_items_size do
    if pod_items[i] ~= nil then
      table.insert(kubernetes_pods,pod_items[i])
    end
    i = i + 1
  end
end

function M.delete_pod(pod_name)
  print ("[delete_pod] delete pods " .. pod_name .. " in Kubernetes")
  http.request(endpoint .. "/api/v1/namespaces/" .. namespace .. "/pods/" .. pod_name, "DELETE", M.http_pod_delete_result,headers)
end

function M.delete_request_pod()
  http.request(endpoint .. "/api/v1/namespaces/".. namespace .. "/pods", "GET", M.http_pod_delete_request_result,headers)
end

function M.http_pod_delete_result(self, _, response)
  print "[http_pod_delete_result] Request for delete pod on kubernetes has been done"
  print(response.status)
  print(response.response)
  print(response.headers)
  if string.match(response.status, '4.*') or string.match(response.status, '5.*')  then
    msg.post("ui#gui", "error",{ errormessage = "Status code: " .. response.status .. "\n" .. response.response })
  end
end

function M.http_pod_delete_request_result(self, _, response)
  pods = {}
  pods = json.decode(response.response)
  pod_items_size = table.getn(pods["items"])
  a = 0
  while a <= pod_items_size do
    if pod_items[a] ~= nil then
      if pod_items[a]['status']['phase'] == "Running" and pod_items[a]['metadata']['deletionTimestamp'] == nil then
        pod_to_delete = pod_items[a]['metadata']['name']
        break
      end
    end
    a = a + 1
  end
  delete_pod(pod_to_delete)
end

function M.http_pod_result(self, _, response)
  print(response.status)
  print(response.response)
  print(response.headers)

  if string.match(response.status, '4.*') or string.match(response.status, '5.*')  then
    msg.post("ui#gui", "error",{ errormessage = "Status code: " .. response.status .. "\n" .. response.response })
  end

  pods = json.decode(response.response)
  pod_items_size = table.getn(pods["items"])
  pod_items = pods["items"]
  check_above = false
  a = 0
  distance_between_pods = 1000 / pod_items_size
  y_pos = 600
  space_between_factor = 0

  if pod_items_size <= alien_proximity_factor then
    space_between_factor = pod_items_size
  else
    space_between_factor = alien_proximity_factor
  end

  while( a <= pod_items_size )
  do  
    if pod_items[a] ~= nil then
      this_pod = pod_items[a]
      phase = this_pod["status"]["phase"]
      local pos = go.get_position()

      if a <= alien_proximity_factor then
        pos.x = 100 + ( a * (1000 / space_between_factor) )	
      end 

      if (a % alien_proximity_factor == 0) then
        y_pos = y_pos - (( a / alien_proximity_factor ) * 50) 
        check_above = true
      end

      if check_above == true then
        k = alien_proximity_factor - 1
        pos_of_pod_above  = go.get_position(current_pods[a - k]['id'])
        pos.x = pos_of_pod_above.x
      end

      pos.y = y_pos			
      if phase == "Running" and this_pod['metadata']['deletionTimestamp'] == nil then
        local pod = factory.create("/pod#podfactory", pos)				
        table.insert(current_pods, { id = pod , color = "white", pod_name = this_pod['metadata']['name'] })
        check_current_pods = true
      else
        local pod = factory.create("/pod_not_running#podfactory", pos)
        table.insert(current_pods, { id = pod , color = "red", pod_name = this_pod['metadata']['name'] })
        check_current_pods = true				
      end
    end
    a = a+1		
  end
end

return M