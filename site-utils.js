const puppeteer = require("puppeteer")

let browser
let page
let launchParams = {}
let cycles = 0

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

async function analyzeStyleSheets() {
  let topIndex = {
    selector: null,
    value: 0,
  }
  const sheets = document.styleSheets

  for (let sheet of sheets) {
    try {
      const rules = sheet.cssRules
      for (let rule of rules) {
        if (!rule.cssText.includes("z-index")) continue
        const zIndex = parseInt(rule.style.zIndex)
        if (isNaN(zIndex)) continue
        const { selectorText } = rule
        console.log(zIndex)
        if (topIndex.value < zIndex) {
          topIndex.selector = selectorText
          topIndex.value = zIndex
        }
      }
    } catch (error) {
      continue
    }
  }

  return topIndex
}

async function analyzeWebsite(siteUrl) {
  try {
    cycles++

    if (cycles > 10) {
      cycles = 0
      await browser.close()

      browser = null
    }

    if (!browser) {
      console.log("launching a browser")
      browser = await puppeteer.launch(launchParams)
    }

    page = await browser.newPage()
    await page.setRequestInterception(true)

    page.on("request", (request) => {
      if (["image", "font"].indexOf(request.resourceType()) !== -1) {
        request.abort()
      } else {
        request.continue()
      }
    })

    await page.goto(siteUrl, { waitUntil: "networkidle0", timeout: 35000 })
    const data = await page.evaluate(analyzeStyleSheets)
    await page.close()
    return data
    const sanitized = sanitizeData(data)
    const sorted = sanitized.sort(compareNodes)


    return sorted[0]
  } catch (error) {
    page && (await page.close())

    console.error(error)

    return false
  }
}

module.exports.analyzeWebsite = analyzeWebsite
