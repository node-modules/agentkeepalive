openssl genrsa -out agenttest-key.pem 1024 
openssl req -new -key agenttest-key.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey agenttest-key.pem -out agenttest-cert.pem

# http://www.hacksparrow.com/node-js-https-ssl-certificate.html
