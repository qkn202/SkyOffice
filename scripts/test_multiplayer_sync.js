const WebSocket = require('ws')
global.WebSocket = WebSocket
const { Client } = require('colyseus.js')

const SERVER_ENDPOINT = process.env.SERVER_ENDPOINT || 'https://rapid-word-centuries-levy.trycloudflare.com'

const Message = {
  UPDATE_PLAYER: 0,
  UPDATE_PLAYER_NAME: 1,
  READY_TO_CONNECT: 2,
  DISCONNECT_STREAM: 3,
  CONNECT_TO_COMPUTER: 4,
  DISCONNECT_FROM_COMPUTER: 5,
  STOP_SCREEN_SHARE: 6,
  CONNECT_TO_WHITEBOARD: 7,
  DISCONNECT_FROM_WHITEBOARD: 8,
  VIDEO_CONNECTED: 9,
  ADD_CHAT_MESSAGE: 10,
  SEND_ROOM_DATA: 11,
  UPDATE_PLAYER_APPEARANCE: 12,
  PLAYER_EMOTE: 13,
  RELEASE_LANTERN: 26,
  LANTERN_RELEASED: 27,
}

console.log(`Connecting to: ${SERVER_ENDPOINT}`)

async function runMultiplayerTest() {
  const client1 = new Client(SERVER_ENDPOINT)
  const client2 = new Client(SERVER_ENDPOINT)
  const client3 = new Client(SERVER_ENDPOINT)

  console.log('1. Joining public room from 3 simulated players...')
  const room1 = await client1.joinOrCreate('skyoffice')
  console.log(`Player 1 joined room: ${room1.id} (sessionId: ${room1.sessionId})`)

  // Player 1 updates name and position
  room1.send(Message.UPDATE_PLAYER_NAME, { name: 'Harry_HN' })
  room1.send(Message.UPDATE_PLAYER, { x: 1800, y: 1450, anim: 'adam_run_right' })

  // Small delay to simulate sequential joining from different locations
  await new Promise((r) => setTimeout(r, 600))

  const room2 = await client2.joinOrCreate('skyoffice')
  console.log(`Player 2 joined room: ${room2.id} (sessionId: ${room2.sessionId})`)
  room2.send(Message.UPDATE_PLAYER_NAME, { name: 'Hermione_SG' })
  room2.send(Message.UPDATE_PLAYER, { x: 1850, y: 1460, anim: 'lucy_run_left' })

  await new Promise((r) => setTimeout(r, 600))

  const room3 = await client3.joinOrCreate('skyoffice')
  console.log(`Player 3 joined room: ${room3.id} (sessionId: ${room3.sessionId})`)
  room3.send(Message.UPDATE_PLAYER_NAME, { name: 'Ron_DN' })
  room3.send(Message.UPDATE_PLAYER, { x: 1820, y: 1480, anim: 'ash_run_down' })

  // Wait for state sync
  await new Promise((r) => setTimeout(r, 1500))

  console.log('\n--- VERIFYING ROOM IDS ---')
  console.log(`Room 1 ID: ${room1.id}`)
  console.log(`Room 2 ID: ${room2.id}`)
  console.log(`Room 3 ID: ${room3.id}`)
  const sameRoom = room1.id === room2.id && room2.id === room3.id
  console.log(`All players in SAME room: ${sameRoom ? 'YES (PASS)' : 'NO (FAIL)'}`)

  console.log('\n--- VERIFYING PLAYER VISIBILITY ---')
  const p1_sees = []
  room1.state.players.forEach((p, key) => {
    p1_sees.push(`${p.name || 'Unnamed'} (${key}) at (${p.x}, ${p.y})`)
  })
  console.log(`Player 1 sees (${p1_sees.length} players):`, p1_sees)

  const p2_sees = []
  room2.state.players.forEach((p, key) => {
    p2_sees.push(`${p.name || 'Unnamed'} (${key}) at (${p.x}, ${p.y})`)
  })
  console.log(`Player 2 sees (${p2_sees.length} players):`, p2_sees)

  const p3_sees = []
  room3.state.players.forEach((p, key) => {
    p3_sees.push(`${p.name || 'Unnamed'} (${key}) at (${p.x}, ${p.y})`)
  })
  console.log(`Player 3 sees (${p3_sees.length} players):`, p3_sees)

  // Verify chat sync
  console.log('\n--- VERIFYING CHAT & EMOTE BROADCAST ---')
  let p2_received_chat = false
  room2.onMessage(Message.ADD_CHAT_MESSAGE, (msg) => {
    console.log(`Player 2 received proximity chat from ${msg.clientId}: "${msg.content}"`)
    p2_received_chat = true
  })

  // Player 1 sends proximity chat
  room1.send(Message.ADD_CHAT_MESSAGE, { content: 'Xin chao ca phong Hogwarts!' })

  // Verify Wish Lantern broadcast
  let p3_received_lantern = false
  room3.onMessage(Message.LANTERN_RELEASED, (lantern) => {
    console.log(`Player 3 saw lantern released by ${lantern.authorName}: "${lantern.wishText}" (${lantern.color})`)
    p3_received_lantern = true
  })

  room1.send(Message.RELEASE_LANTERN, {
    authorName: 'Harry_HN',
    authorHouse: 'Gryffindor',
    text: 'Chuc moi nguoi Trung Thu am ap va binh an!',
    color: 'gold',
    visibility: 'public'
  })

  await new Promise((r) => setTimeout(r, 1500))

  console.log(`Chat received across network: ${p2_received_chat ? 'YES (PASS)' : 'NO (FAIL)'}`)
  console.log(`Lantern received across network: ${p3_received_lantern ? 'YES (PASS)' : 'NO (FAIL)'}`)

  // Clean up
  await room1.leave()
  await room2.leave()
  await room3.leave()

  console.log('\n--- SUMMARY ---')
  const names1 = p1_sees.filter((s) => s.includes('Harry_HN') || s.includes('Hermione_SG') || s.includes('Ron_DN'))
  const names2 = p2_sees.filter((s) => s.includes('Harry_HN') || s.includes('Hermione_SG') || s.includes('Ron_DN'))
  const names3 = p3_sees.filter((s) => s.includes('Harry_HN') || s.includes('Hermione_SG') || s.includes('Ron_DN'))

  if (sameRoom && names1.length === 3 && names2.length === 3 && names3.length === 3 && p2_received_chat && p3_received_lantern) {
    console.log('✅ ALL MULTIPLAYER CHECKS PASSED 100%! Multiple players on separate connections see each other and interact seamlessly.')
  } else {
    console.error('SOME CHECKS FAILED. Inspect outputs above.')
    process.exit(1)
  }
}

runMultiplayerTest().catch((err) => {
  console.error('Multiplayer test error:', err)
  process.exit(1)
})
