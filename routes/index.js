const fs = require('fs');
const low = require('lowdb')

//https://github.com/typicode/lowdb usage instructions
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

//initiate a blank database if it doesn't exist


const initializeDb = () => {
    let dbTemplate = {
    "queue": []
  }
  db.defaults(dbTemplate).write()
}

initializeDb()


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
  

exports.submit = (req, res, next) => {
  // console.log(req.files)
  // console.log(req.body)
  const uploadTimestamp = Date.now()
  let startTimestamp = uploadTimestamp
  console.log("this stream starts at: " + startTimestamp)
  
  let startToAdd = 0
  let endToAdd = 0
  
  // console.log(req.files.fileupload.name)
  let previousStreams = db.get("queue").filter({ meta:{cameras: req.body.cameras, colors: req.body.colors}}).sortBy('uploadTimestamp').value()
  // console.log(previousStreams)
  
  
  if (previousStreams.length > 0) {
    let firstTimestamp = previousStreams[0].uploadTimestamp
    console.log("the current stream starts at: " + firstTimestamp)
    
    for (let previousStream of previousStreams) {
      let previousDuration = previousStream.meta.duration
      console.log(previousDuration)
      
      startToAdd = convertDuration(previousDuration,startToAdd)
    }
    console.log("all duration before is: " + startToAdd)
    startTimestamp = firstTimestamp + startToAdd
    console.log("this stream starts at: " + startTimestamp)
  }
  endToAdd = convertDuration(req.body.duration,endToAdd)
  console.log("this stream's duration is: " + endToAdd)
  let endTimestamp = startTimestamp + endToAdd
  console.log("this stream ends at: " + endTimestamp)


  const id = `${startTimestamp}_${endTimestamp}_${req.body.cameras}_${req.body.colors}_${req.body.students}_${req.body.duration}`;
  
  // req.files.fileupload.mv(`.data/${filename}`);
  
  let fileData = {
    id: id,
    // name: req.files.fileupload.name,
    // filetype: fileNameExtension,
    // filename: filename,
    // filepath: `/img/${filename}`,
    uploadTimestamp: uploadTimestamp,
    startTimestamp: startTimestamp,
    endTimestamp: endTimestamp,
    meta: req.body
  }

  // //write the file description to the database
  db.get("queue").push(fileData).write()
  // res.json(fileData);
  
  
  let message = `
    Thank you for your submission!
    ------------
    Name: ${fileData.meta.students}
    Title: ${fileData.meta.title}
    Position: ${fileData.meta.cameras}, ${fileData.meta.colors}
    Duration: ${fileData.meta.duration}
    File: ${fileData.name}
  `
  // res.end(message);
  
  res.redirect('/');
  
};



exports.data = (req, res, next) => {

  res.json(db.get("queue").value())

}


// exports.display = async (req, res) => {
//   //list all image names and urls
  
//   let fileData = db.get("queue").value()
  
//   let fileDataList = fileData.map((file)=>{
//     return `<li><a href="${file.filepath}">${file.filename}</a></li>`
//   })
  
//   res.set('Content-Type', 'text/html');
//   return res.end(`<ul>${fileDataList}</ul>`)
// };



exports.preview = async (req, res) => {
  //show all images
  
  let fileData = db.get("queue").sortBy("uploadTimestamp").value().reverse()
  
  let fileDataList = fileData.map((file)=>{
    return `<li>
      <span>${file.filename}</span>
      <a href="${file.filepath}">
        <img width="100%" src="${file.filepath}" />
      </a>
    </li>`
  })

  res.set('Content-Type', 'text/html');
  return res.end(`<ul>${fileDataList}</ul>`)
  
};



// exports.listByFilename = async (req, res) => {
//   //output all image titles
  
//   let fileData = db.get("queue").sortBy("filename").value()
//   res.json(fileData);
  
// };

exports.listByTimestamp = async (req, res) => {
  //output all image titles, most recent first
  
  let fileData = db.get("queue").sortBy("uploadTimestamp").value().reverse()
  res.json(fileData.reverse())
  
};



exports.remove = (req, res) => {
  
  db.get("queue").remove(()=>{return true}).write()
  let files = fs.readdirSync('/app/.data/');
  
  for(let file of files) {
    fs.unlinkSync(`/app/.data/${file}`);
  }
  
  initializeDb()

  res.end("deleted all images");
}



// exports.cancel = (req, res) => {
  
//   console.log(req.body.id)
  
//   let deleteFile = db.get("queue").find({ id: req.body.id }).value().filename
//   console.log(deleteFile)
//   // let name = db.get("queue").find({ id: req.body.id }).value().meta.students
//   // let duration = db.get("queue").find({ id: req.body.id }).value().meta.duration
//   // let stream = `${name}(${duration})`
      
//   db.get("queue").remove({ id: req.body.id }).write()

//   fs.unlinkSync(`/app/.data/${deleteFile}`);
  
//   res.redirect('/');
  
  
//   // res.end("cancelled");
// }

exports.cancel = (req, res) => {
  
  console.log(req.body.id)
  
  // let deleteFile = db.get("queue").find({ id: req.body.id }).value().filename
  // console.log(deleteFile)

  db.get("queue").remove({ id: req.body.id }).write()
  // db.get("queue").remove({ id: req.body.id }).write()
  res.redirect('/')

  // res.end("cancelled");
}
const table = [
  ["cam_01", "red", "green", "black"],
  ["cam_02", "red", "cyan", "blue"],
  ["cam_03", "yellow", "cyan", "magenta"],
  ["cam_04", "blue", "magenta", "black"],
  ["cam_05", "red", "cyan", "black"],
  ["cam_06", "green", "blue", "magenta"]
]

setInterval(function(){ 
  for (let i = 0; i < table.length; i++) {
    for (let j = 1; j < table[i].length; j++) {
      let cam = table[i][0]
      let color = table[i][j]
      let queue = db.get("queue").filter({ meta:{cameras: cam, colors: color}}).sortBy('uploadTimestamp').value()
      
      if (queue.length > 0) {
        let currentStreamId = queue[0].id
        let currentStreamEndTime = queue[0].endTimestamp
        let currentTime = Date.now()

        if (currentTime >= currentStreamEndTime) {
          console.log(currentStreamId)
          db.get("queue").remove({ id: currentStreamId }).write()
        }
      }
    }
  }
  
}, 5000);


