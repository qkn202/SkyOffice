import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server, LobbyRoom } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import { RoomType } from '../types/Rooms'

// import socialRoutes from "@colyseus/social/express"

import { SkyOffice } from './rooms/SkyOffice'
import { registerHousePointRoutes } from './housePoints'

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors())
app.use(express.json())
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'skyoffice' }))
registerHousePointRoutes(app)
// app.use(express.static('dist'))

const server = http.createServer(app)
const gameServer = new Server({
  server,
})

// register room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom)
gameServer.define(RoomType.PUBLIC, SkyOffice, {
  name: 'Đại Sảnh công khai',
  description: 'Gặp gỡ bạn mới và làm quen với cách điều khiển',
  password: null,
  autoDispose: false,
})
gameServer.define(RoomType.CUSTOM, SkyOffice).enableRealtimeListing()

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor())

gameServer.listen(port).then(() => {
  console.log(`Listening on ws://localhost:${port}`)
}).catch((error) => {
  console.error('Could not start SkyOffice server:', error)
  process.exit(1)
})
