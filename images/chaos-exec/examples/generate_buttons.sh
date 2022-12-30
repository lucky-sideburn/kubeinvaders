for i in $(ls | grep -v generate | sort | uniq)
do 
  echo "<button type=\"button\" id=\"load${i^}\" class=\"btn btn-light btn-sm\" onclick=\"load${i^}()\">${i^}</button>"
done
