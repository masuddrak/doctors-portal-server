const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000

// mideltwer
app.use(cors())
app.use(express.json())

// collection information
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1kyfa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const serviceCollection=client.db('doctors_portal').collection('services')
        const bookingCollection=client.db('doctors_portal').collection('bookis')

        app.get('/service',async(req,res)=>{
            const query={}
            const cursor = serviceCollection.find(query);
            const services=await cursor.toArray();
            res.send(services)
        })
        // app.get('/booking',async(req,res)=>{
        //     const query={}
        //     const cursor = bookingCollection.find(query);
        //     const bookings=await cursor.toArray();
        //     res.send(bookings)
        // })

        // bookings find query system
        app.get('/booking', async(req,res)=>{
            const patient=req.query.patientee
            const query={patient:patient}
            const bookings= await bookingCollection.find(query).toArray();
            res.send(bookings)
        })
        app.post('/booking',async(req,res)=>{
            const booking=req.body;
            const query={treatmentName:booking.treatmentName, date:booking.date, patient:booking.patient}
            const exists= await bookingCollection.findOne(query);
            if(exists){
                return res.send({success:false, booking:exists})
            }
            const result=await bookingCollection.insertOne(booking)
            return res.send({success:true,result})
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