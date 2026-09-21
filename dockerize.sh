docker rm meu-mindmap
docker build -t mindmap-app .
docker run -d -p 8080:80 --name meu-mindmap mindmap-app