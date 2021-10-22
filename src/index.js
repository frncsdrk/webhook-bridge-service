const config = require('config'),
  express = require('express')

const routes = {
  status: require('./routes/status'),
  webhooks: require('./routes/webhooks')
}

const app = express()
const serverConfig = config.get('service.server')

app.use(express.json())
app.use(express.text({ limit: '50mb', type: 'text/*' }))
app.use(express.urlencoded({ extended: false }))

app.use('/status', routes.status)
app.use('/webhooks', routes.webhooks)

const server = app.listen(serverConfig.port, () => {
  console.log('server listening at %s', server.address().hostserver, server.address().port)
})
