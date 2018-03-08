#!/bin/bash
# DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Generate ca key and pem
openssl req -new -x509 -nodes -days 9999 -config ca.cnf -keyout ca.key -out ca.pem

# Generate server key
# openssl genrsa -out server.key 2048
openssl genrsa -out agenttest-key.pem 1024 

# Generate a certificate signing request for server.key
# openssl req -new  -key server.key -out server.csr
openssl req -new -key agenttest-key.pem -out agenttest.csr -config server.cnf 

# Sign the csr with the ca certificate, generating server.pem
openssl x509 -req -extfile server.cnf -days 999 -passin "pass:password" -extensions v3_req -in agenttest.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out agenttest-cert.pem

# openssl req -new -key agenttest-key.pem -out certrequest.csr
rm agenttest.csr ca.srl
# http://www.hacksparrow.com/node-js-https-ssl-certificate.html


