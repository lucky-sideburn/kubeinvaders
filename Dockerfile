FROM nginx
COPY ./js-web/KubeInvaders /var/www/html
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf
RUN sed -i.bak 's/listen\(.*\)80;/listen 8081;/' /etc/nginx/conf.d/default.conf
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx /var/www/html
COPY KubeInvaders.conf  /etc/nginx/conf.d/KubeInvaders.conf
#COPY .KubeInv-example.json /home/web_user/.KubeInv.json
EXPOSE 8080
COPY ./temporary_hack.sh /
RUN chmod a+rwx temporary_hack.sh
ENTRYPOINT ["/temporary_hack.sh"]
