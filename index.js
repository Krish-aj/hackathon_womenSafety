import express from "express"
const app = express()
const PORT = 2000
import locationRouter from './controller/location.js'

app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        status: `Server is running`
    })
    .status(200)
    console.log("Working")
})

app.use('/api', locationRouter)

app.listen(PORT , ()=> {
    console.log("Hello bhai Server")
})