const puppeteer = require("puppeteer")

let browser
let page
let launchParams = {}

if (process.env.PI_MODE) {
  launchParams.args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--ignore-certificate-errors",
  ]
}

if (process.env.EXEC_PATH) {
  launchParams.executablePath = process.env.EXEC_PATH
}

function sanitizeData(data) {
  const output = []

  for (let item of data) {
    const [_, index] = item

    if (isNaN(parseInt(index))) continue

    output.push(item)
  }

  return output
}

function analysePage() {
  const elements = document.body.getElementsByTagName("*")

  return [...elements].map((element) => {
    element.focus()
    const index = window.getComputedStyle(element).getPropertyValue("z-index")

    return [element.className, index]
  })
}

function compareNodes(a, b) {
  return b[1] - a[1]
}

async function analyzeWebsite(siteUrl) {
  try {
    if (!browser) browser = await puppeteer.launch(launchParams)

    page = await browser.newPage()
    await page.goto(siteUrl, { waitUntil: "load", timeout: 0 })

    const data = await page.evaluate(analysePage)
    const sanitized = sanitizeData(data)
    const sorted = sanitized.sort(compareNodes)

    await page.close()

    return sorted[0]
  } catch (error) {
    page && (await page.close())
    console.error(error)

    return false
  }
}

module.exports.analyzeWebsite = analyzeWebsite
