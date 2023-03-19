const express = require('express')
const path = require('path')
const app = express()
const port = 3000
const ejs = require('ejs')
const db = require('./public/firebase/firebase')
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")


app.use(express.static(path.join(__dirname, "public")));
app.get('/', async (req, res) => {
        // getlist
        const respon = await db.collection('list').get()
        const {docs} = respon
        const result = docs.map(item => ({id: item.id,data: item.data()}))
        console.log(result)
        // get pets type

        
        const type = await db.collection('pets-type').get()
        const arr = []
        type.forEach(doc => {
            // console.log(doc.data())
            arr.push(doc.data())
        })
        console.log(arr)
    res.render(path.join(__dirname + '/public/views/index'), {
        lists: result,
        type: arr,
    })
})
app.get('/petz', async (req, res) => {
    const data = await db.collection('list').get()
    const {
        docs
    } = data
    const dataFromDB = docs.map(el => ({
        id: el.id,
        data: el.data()
    }))
    console.log(dataFromDB)
    res.send(dataFromDB[0])
})
app.listen(port, () => console.log(`server start on port ${port}`))

app.post('/pet', (req, res) => {
    const petData = {
        name: req.body.name,
        subname: req.body.subname,
        type: req.body.types
    }
    db.collection('list').add(petData)
    res.redirect('/')
})
app.get('/delete/:id', (req, res) => {
    let id = req.params.id
    db.collection('list').doc(id).delete()
    res.redirect('/')
})

app.post('/type', (req, res) => {
    let typePet = {
        type: req.body.type
    }
    db.collection('pets-type').add(typePet)
    res.redirect('/')
})

module.exports = app