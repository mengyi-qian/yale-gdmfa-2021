const express = require('express')
const app = module.exports = express()

let http = require('http').createServer(app)
let port = process.env.PORT || 3000

// const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')

let io = require('socket.io')(http)
const low = require('lowdb')

// http://expressjs.com/en/starter/static-files.html
app.use(express.urlencoded({extended: true})) 
app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: true })); 
// app.use(fileUpload());

// https://github.com/typicode/lowdb usage instructions
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)


//standard routes for displaying webpages and files
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
// app.get('/live', function(req, res) {
//   res.sendFile(__dirname + '/views/live.html');
// });
// app.get('/panel', function(req, res) {
//   res.sendFile(__dirname + '/views/backend.html');
// });

db.defaults({queue: []}).write()
let queue = db.get('queue')


const table = [
  ["cam_01", "red", "green", "black"],
  ["cam_02", "red", "cyan", "blue"],
  ["cam_03", "yellow", "cyan", "magenta"],
  ["cam_04", "blue", "magenta", "black"],
  ["cam_05", "red", "cyan", "black"],
  ["cam_06", "green", "blue", "magenta"]
]

function convertDuration(duration,timestampToAdd) {
  if (duration === "5m") {timestampToAdd += 300000}
  if (duration === "15m") {timestampToAdd += 900000}
  if (duration === "30m") {timestampToAdd += 1800000}
  if (duration === "1h") {timestampToAdd += 3600000}
  if (duration === "2h") {timestampToAdd += 7200000}
  if (duration === "3h") {timestampToAdd += 10800000}
  if (duration === "4h") {timestampToAdd += 14400000}
  if (duration === "5h") {timestampToAdd += 18000000}
  if (duration === "6h") {timestampToAdd += 21600000}
  return timestampToAdd
}


io.on('connection', (socket) => {
  console.log('a user connected');
  
  io.emit('refresh data', queue)
  
  // check every 5 sec if the current stream has ended
  setInterval(function(){ 
    for (let i = 0; i < table.length; i++) {
      for (let j = 1; j < table[i].length; j++) {
        let cam = table[i][0]
        let color = table[i][j]
        let queueInOrder = queue.filter({ meta: {camera: cam, color: color}}).sortBy('startTimestamp').value()
        
        if (queueInOrder.length > 0) {
          let currentStream = queueInOrder[0].filename
          let currentStreamEndTime = queueInOrder[0].endTimestamp
          let currentTime = Date.now()

          if (currentTime >= currentStreamEndTime) {
            console.log(currentStream)
            queue.remove({ filename: currentStream }).write()
          }
        }
      }
    }

  }, 5000);
  
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  
  socket.on('new submission', (meta) => {
    // console.log(meta)
    // if no current stream, set default starting time the uploading time
    let startTimestamp = meta.uploadTimestamp

    let startToAdd = 0
    let endToAdd = 0
    
    // get all pevious streams in this slot
    let previousStreams = queue.filter({ meta:{camera: meta.camera, color: meta.color}}).sortBy(meta.uploadTimestamp).value()

    // if previous streams exist, set starting time the ending time of previous stream
    if (previousStreams.length > 0) {
      startTimestamp = previousStreams[previousStreams.length - 1].endTimestamp
    }
    console.log("this stream starts at: " + startTimestamp)
    
    // get the duration of this stream
    endToAdd = convertDuration(meta.duration,endToAdd)
    console.log("this stream's duration is: " + endToAdd)
    // calculate the ending time of this stream
    let endTimestamp = startTimestamp + endToAdd
    console.log("this stream ends at: " + endTimestamp)
    
    // generate filename: start_end_camera_color_student_duration
    const filename = `${startTimestamp}_${endTimestamp}_${meta.camera}_${meta.color}_${meta.student}_${meta.duration}`
    
    let submittedItem = {
      "filename": filename,
      "startTimestamp": startTimestamp,
      "endTimestamp": endTimestamp,
      meta
    }
    
    db.get('queue').push(submittedItem).write()
    
    io.emit('generate filename', submittedItem)
  })
  
  
  socket.on('cancel', (cancelledItem) => {
    console.log(cancelledItem)
    queue.remove({ filename: cancelledItem }).write()
    
    io.emit('refresh data', queue)
  })
  
  socket.on('camera switch', (cameraNo) => {
    // console.log(cameraNo)
    let index = cameraNo.slice(-1) - 1
    let colorArray = table[index]
    // console.log(colorArray)
    let captionOutput = ''
    let activeItem = []
    for (let i=1; i<colorArray.length; i++ ) {
      activeItem = queue.filter({ meta:{camera: cameraNo, color: colorArray[i]}}).sortBy("uploadTimestamp").value()
      if (activeItem.length > 0) {
        let name = activeItem[0].meta.student
        let title = activeItem[0].meta.title
        let caption = activeItem[0].meta.caption
        let template = ''
        if (caption === "") {
          template = `\n${name}: ${title}`
        } else {
          template = `\n${name}: ${title} (${caption})`
        }
        captionOutput += template
      }
    }
    // console.log(captionOutput)
    io.emit('set caption', captionOutput)
  })
  
  
})




//launch the server
http.listen(port, ()=>{
  console.log(`listening on port :${port}`)
})
