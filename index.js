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
        // pause the readstream
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
            console.log(domain, data)
            stream.resume()

            if (ln > 1000) stream.end()
          })
          .catch(() => {
            stream.resume()
          })
      })
      .on("error", console.error)
      .on("end", () => {
        console.log(domains)
        console.log("Read entire file.")
      })
  )

stream.on("finish", () => {
  console.log("domains")
})
