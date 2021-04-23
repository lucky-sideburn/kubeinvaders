local config = {}
config['default_chaos_container'] = [[
{
    "name": "kubeinvaders-chaos-node",
    "image": "docker.io/luckysideburn/kubeinvaders-stress-ng:latest",
    "command": [
        "stress-ng",
        "--cpu",
        "4",
        "--io",
        "2",
        "--vm",
        "1",
        "--vm-bytes",
        "1G",
        "--timeout",
        "10s",
        "--metrics-brief"
    ]
}
]]

return config