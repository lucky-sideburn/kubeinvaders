import json
import base64

f = open('./data/presets.json')
data = json.load(f)

for i in data:
  if (i == 'SSH'): 
    print(f" <button type=\"button\" id=\"load{i}\" class=\"btn btn-light btn-sm\" onclick=\"loadPreset('{i}', 'python')\">{i}</button>")
  else:
    print(f" <button type=\"button\" id=\"load{i.capitalize()}\" class=\"btn btn-light btn-sm\" onclick=\"loadPreset('{i}', 'python')\">{i.capitalize()}</button>")

print("****")
print("****")
print("## Test Loading and Chaos Experiment Presets - Python Code orchestrated by Kubeinvaders")
for i in data:
  print(f"### {i.capitalize()}")
  print(f"```python")
  base64_bytes = data[i].encode('ascii')
  message_bytes = base64.b64decode(base64_bytes)
  message = message_bytes.decode('ascii')
  print(message)
  print(f"```")
  print("\n")

f.close()
