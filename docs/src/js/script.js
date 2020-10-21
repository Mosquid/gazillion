;(async () => {
  try {
    const response = await (await fetch("./data/top-1000.json")).json()

    if (!response) return

    const sites = Object.keys(response)

    if (!sites.length) return

    sites
      .map((site) => {
        return { site, ...response[site] }
      })
      .sort(sortData)
      .slice(0, 50)
      .map(renderDataRow)
  } catch (error) {
    console.error(error)
  }
})()

function renderDataRow(siteData) {
  const tpl = document.querySelector("#data-row").innerHTML
  const row = document.createElement("div")

  row.innerHTML = tpl

  const cols = row.querySelectorAll(".col")

  cols[0].innerText = siteData.site
  cols[1].innerText = siteData[1]
  cols[2].innerText = `${Math.round(siteData[1] / 536871)}m`

  document.querySelector('#chart-data').appendChild(row)
}

function sortData(a, b) {
  const aInt = isNaN(parseInt(a[1])) ? 0 : parseInt(a[1])
  const bInt = isNaN(parseInt(b[1])) ? 0 : parseInt(b[1])

  return bInt < aInt ? -1 : 1
}
