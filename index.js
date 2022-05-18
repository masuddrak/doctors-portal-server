const express = require('express')
require('dotenv').config()
const app = express()
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000

// mideltwer
app.use(cors())
app.use(express.json())

// collection information
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1kyfa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function accessJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unAuthorization Access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Authorization Access Error' })
        }
        req.decoded = decoded
        next()
    });
}

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('doctors_portal').collection('services')
        const bookingCollection = client.db('doctors_portal').collection('bookis')
        const userCollection = client.db('doctors_portal').collection('users')

        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })


        // bookings find query system
        app.get('/booking', accessJWT, async (req, res) => {
            const patient = req.query.patientee
            const decodedEmail = req.decoded.email
            if (decodedEmail === patient) {
                const query = { patient: patient }
                const bookings = await bookingCollection.find(query).toArray();
                return res.send(bookings)
            } else {
                return res.status(403).send({ message: 'Forbiden Authorization Access' })
            }
        })
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatmentName: booking.treatmentName, date: booking.date, patient: booking.patient }
            const exists = await bookingCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, booking: exists })
            }
            const result = await bookingCollection.insertOne(booking)
            return res.send({ success: true, result })
        })
        // update user
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
            res.send({ result, token })
        })
    } finally {

    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('hello Doctors portal')
})

app.listen(port, () => {
    console.log(`Doctors potal  app listening on port ${port}`)
})