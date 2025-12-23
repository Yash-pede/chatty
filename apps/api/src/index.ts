import 'dotenv/config'
import { clerkMiddleware} from '@clerk/express'
import express from 'express'
import UserRouter from './routes/user.js'

const app = express()
const PORT = process.env.PORT!

app.use(clerkMiddleware())

app.use('/user', UserRouter)

app.get('/', (req, res) => {
  console.log("🔥 Hello World! 🔥");
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})