FROM nginx:stable-alpine3.17

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./index.html /usr/share/nginx/html/index.html
COPY ./.well-known/open-resource-discovery /usr/share/nginx/html/.well-known/open-resource-discovery
COPY ./metadata/* /usr/share/nginx/html/metadata/
