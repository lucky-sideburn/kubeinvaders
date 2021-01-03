local M = {}

function M.run(pod_name)
	print("Call OpenResty endpoint for Kubelinter")
	http.request(kubelinter_url .. "?namespace=" .. namespace .. "&pod_name=".. pod_name .. "&token=" .. token .. "&k8s_url=" .. endpoint, "GET", M.http_kubelinter_result,headers)	
	print("waiting for a response...")
end

function M.http_kubelinter_result(self, _, response)
	print("Kubelinter output")
	print(response.status)
	print(response.response)
	print(response.headers)
	msg.post("ui#gui","open_kubelinter_box",{ position = vmath.vector3(850, 550, 0) })
	kubelinter_table = json.decode(response.response)
	kubelinter_read = true
	kubelinter_index = 0

	for i,value in ipairs(kubelinter_table) do
		kubelintermessage = value
		kubelinter_index = kubelinter_index + 1
		msg.post("ui#gui", "set_kubelinter_text",{ kubelintermessage = value })
		break
	end
end

return M