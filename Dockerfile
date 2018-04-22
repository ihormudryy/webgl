FROM nginx

COPY compiled /usr/share/nginx/html/compiled
COPY data /usr/share/nginx/html/data
COPY libs /usr/share/nginx/html/libs
COPY shaders /usr/share/nginx/html/shaders
COPY index.html /usr/share/nginx/html