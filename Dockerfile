FROM nodesource/trusty:0.12.7

# cache package.json and node_modules to speed up builds
ADD package.json /usr/src/app/package.json
RUN npm install

# Add your source files
ADD app /usr/src/app/app/
ADD config /usr/src/app/config/
CMD ["node","app/index.js"]
