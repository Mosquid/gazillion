const puppeteer = require("puppeteer")
let browser
let page

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
    if (!browser) browser = await puppeteer.launch()

    page = await browser.newPage()
    await page.goto(siteUrl, { waitUntil: "networkidle2" })

    const data = await page.evaluate(analysePage)
    const sanitized = sanitizeData(data)
    const sorted = sanitized.sort(compareNodes)

    await page.close()

    return sorted[0]
  } catch (error) {
    page && await page.close()
    console.log(error)

    return false
  }
}

module.exports.analyzeWebsite = analyzeWebsite
