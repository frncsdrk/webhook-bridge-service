webhook-bridge-service
===

a node.js service to receive and bridge (bitbucket) webhook requests to other services

## a word on security

I think pushing changes somewhere is much more elegant than constantly watching for changes somewhere,
but that comes with the cost of having to ensure that no unauthorized party can fake requests to block
the service in the best and hijack it in the worst case.

**So please ensure you restrict access to services like this one.**

Make at least use of the configurable hashes to make finding the correct request scheme as hard as possible.

## usage

after installing of dependencies with `npm i`

- `npm start` - regular node process
- `npm run dev` - nodemon

## routes

### /webhooks/push

POST - webhook push route

req

- query
  - id - service configuration identifier
  - hash - for some mild security
- body - webhook body

### /status

GET - service status

res

- {string} message

## configuration

Configuration of this service is handled by `config`

### default.yml

```yaml
service:
  server:
    id: webhook_bridge_service
    hash: wbs_hash
    logger:
      logs_path: /path/to/webhook-bridge-service/logs/
      error_log_file: error.log
      combined_log_file: combined.log
    port: 9000
  services:
    example:
      push_url: example.com/push
      branch: master
      # tag: true
      hash: default_hash
```

### custom default.yml example

- server id and hash are being sent to the receiving service in the request body to enable verification of request
- multiple services
- branch OR tag (only one per service)

```yaml
service:
  server:
    id: my_webhook_bridge_service
    hash: djhfhbdfhe8322bdnf832
    logger:
      logs_path: /home/server_user/webhook-bridge-service/logs/
      error_log_file: error.log
      combined_log_file: combined.log
    port: 8080
  services:
    user_service:
      push_url: user.yourdomain.com/deploy
      branch: master
      hash: custom_hash
    config_service:
      push_url: config.yourdomain.com/deploy
      tag: true
      hash: custom_hash
```

## credits

- config
- got
- express
- winston
