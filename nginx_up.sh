docker run --name mm-nginx --rm -v $PWD/dist:/usr/share/nginx/html:ro -p 8008:80 -d nginx