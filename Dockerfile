FROM nginx
COPY ./js-web/KubeInvaders /var/www/html
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf
RUN sed -i.bak 's/listen\(.*\)80;/listen 8081;/' /etc/nginx/conf.d/default.conf
COPY nginx/KubeInvaders.templ /etc/nginx/conf.d/KubeInvaders.templ
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx /var/www/html /etc/nginx/conf.d/KubeInvaders.templ /etc/nginx/conf.d
EXPOSE 8080
COPY ./temporary_hack.sh /
RUN chmod a+rwx temporary_hack.sh
ENTRYPOINT ["/temporary_hack.sh"]
