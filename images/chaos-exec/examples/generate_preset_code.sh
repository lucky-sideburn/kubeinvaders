echo "{"
for i in $(ls | grep -v generate | sort | uniq)
do
  base64_code=$(cat $i/run.py | base64)
  echo "\"${i}\":\"${base64_code}\","
done
echo "}"
