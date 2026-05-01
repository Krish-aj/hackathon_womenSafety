import express from 'express'
import { getAddress } from '../services/getLocation.js'
const router = express.Router()

router.post('/location', (req, res) => {
    const {lat, log} = req.body
    const data = getAddress(lat, log)
    if(data)
        return res.json(data).status(200)
    else
        return res.status(400)

})

export default router