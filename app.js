const express = require('express')
const path = require('path')
const app = express()
const port = 3000
const XLSX = require("xlsx");
const ejs = require('ejs')
const db = require('./public/firebase/firebase')

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const multer = require('multer')

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")));

//crud 
app.get('/', async (req, res) => {
    // getlist

    let result = ''
        const respon = await db.collection('list').get()
        const {docs} = respon
        result = docs.map(item => ({id: item.id, data: item.data()}))


    // get pets type
        const type = await db.collection('pets-type').get()
        const arr = []
        type.forEach(doc => {arr.push(doc.data())})

    res.render(path.join(__dirname + '/public/views/index'), {
        lists: result,
        type: arr,
    })
})
app.post('/pet', async(req, res) => {
    try{
        const petData = {
            name: req.body.name,
            date: req.body.date,
            subname: req.body.subname,
            phone: req.body.phone,
            type: req.body.types,
        }
        console.log(petData)
        db.collection('list').add(petData)
        res.redirect('/')
    }catch(err){
        console.log(err + ' error POST pet list')
    }
    
})
app.get('/delete/:id', async(req, res) => {
    try{
        let id = req.params.id
        db.collection('list').doc(id).delete()
        res.redirect('/')
    }catch(err){
        console.log(err + ' ERROR DELETE')
    }

})
app.post('/update/:id', async(req, res) => {
    try{
        let id = req.params.id
        const newData = {
            name: req.body.name,
            date: req.body.date,
            subname: req.body.subname,
            phone: req.body.phone,
            type: req.body.types,
        }
        console.log(newData)
        db.collection('list').doc(id).update(newData)
        res.redirect('/')
    }catch(error){
        console.log(error + ' error UPDATE')
    }

})

// add pet type 
app.post('/type', (req, res) => {
    let typePet = {
        type: req.body.type
    }
    db.collection('pets-type').add(typePet)
    res.redirect('/')
})

// multer settings
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/uploads/'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));
app.post('/excel', upload.single("file"), async(req, res) => {
    const file = req.file.path
    const read = XLSX.readFile(file)
    const sheet = read.SheetNames
    const promis = new Promise((resolve, reject) => {
        sheet.forEach((el) => {
            const data = XLSX.utils.sheet_to_json(read.Sheets[sheet[0]])
            console.log(data)
            const result = data.forEach(el => {
                const promis = db.collection('list').add(el)
                setTimeout(resolve, 1000)
            })
        })
        // resolve()
    }).catch(err => console.log(err +' err excel promis'))
    await promis
    res.redirect('/')
})
app.listen(port, () => console.log(`server start on port ${port}`))
module.exports = app