FROM nodesource/trusty:4.2.5

# cache package.json and node_modules to speed up builds
ADD package.json /usr/src/app/package.json
RUN npm install

RUN apt-get update && apt-get install -y jq

# Add your source files
ADD app /usr/src/app/app/
ADD config /usr/src/app/config/
ADD test.js /usr/src/app/test/test.js
ADD testable-kpi-monitor.sh /usr/src/app/testable-kpi-monitor.sh
CMD ["node","app/index.js"]
