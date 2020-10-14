require("dotenv").config()

const fs = require("fs")
const es = require("event-stream")
const { analyzeWebsite } = require("./site-utils")

const file = "./majestic_million.csv"
let ln = 0

const domains = {}

const stream = fs
  .createReadStream(file)
  .pipe(es.split())
  .pipe(
    es
      .mapSync((line) => {
        stream.pause()

        const domain = line.split(",")[2]
        ln++

        if (ln === 1) {
          stream.resume()
          return
        }

        analyzeWebsite(`https://${domain}`)
          .then((data) => {
            domains[domain] = data
            console.log(ln, domain, data)
            stream.resume()

            if (ln > process.env.SITE_LIMIT) stream.end()
          })
          .catch(() => {
            stream.resume()
          })
      })
      .on("error", console.error)
      .on("end", () => {
        console.log("Read entire file.")

        fs.writeFile("output.json", JSON.stringify(domains), (err) => {
          process.exit(0)
        })
      })
  )

stream.on("finish", () => {
  console.log("domains")
  process.exit()
})
