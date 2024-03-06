//获取浏览器地址 sourceFlag
function showWindowHref() {
  var sHref = window.location.href
  var args = sHref.split('?')
  if (args[0] == sHref) {
    return ''
  }
  var arr = args[1].split('&')
  var obj = {}
  for (var i = 0; i < arr.length; i++) {
    var arg = arr[i].split('=')
    obj[arg[0]] = arg[1]
  }
  return obj
}
let sourceFlag = showWindowHref()['sourceFlag']
//动态修改王章title
if (sourceFlag == 'ShibaNFT') {
  document.title = 'ShibaNFT allchain Bridge'
}
if (sourceFlag === undefined || sourceFlag === '' || sourceFlag === null) {
  const urlStr = window.location.href
  const widget1 = 'allchainbridge.com'
  const widget2 = 'defi.swft.pro'
  const widget3 = 'bridgers'
  if (urlStr.indexOf(widget1) !== -1) {
    localStorage.setItem('sourceFlag', 'widget-acb')
  } else if (urlStr.indexOf(widget2) !== -1) {
    localStorage.setItem('sourceFlag', 'widget-defi')
  } else if (urlStr.indexOf(widget3) !== -1) {
    localStorage.setItem('sourceFlag', 'bridgers')
    localStorage.setItem('bridgersFlag', 'bridgers')
  } else {
    localStorage.setItem('sourceFlag', 'widget')
    localStorage.setItem('bridgersFlag', '')
  }
} else {
  const urlStr = window.location.href
  const widget3 = 'bridgers'
  localStorage.setItem(
    'sourceFlag',
    sourceFlag.replace(new RegExp('#/', 'g'), ''),
  )
  if (urlStr.indexOf(widget3) !== -1) {
    localStorage.setItem('bridgersFlag', 'bridgers')
  } else {
    localStorage.setItem('bridgersFlag', '')
  }
}
let actionCode = showWindowHref()['actionCode']
if (actionCode === undefined || actionCode === '' || actionCode === null) {
  localStorage.setItem('actionCode', 'widget')
} else {
  localStorage.setItem(
    'actionCode',
    actionCode.replace(new RegExp('#/', 'g'), ''),
  )
}

let utm_source = showWindowHref()['utm_source']
if (utm_source === undefined || utm_source === '' || utm_source === null) {
  localStorage.setItem('utm_source', '')
} else {
  localStorage.setItem(
    'utm_source',
    utm_source.replace(new RegExp('#/', 'g'), ''),
  )
}

//HN 定制化   包含于 hnswap.cc
{
  const urlStr = window.location.href
  const HNKey = 'hnswap'
  if (urlStr.indexOf(HNKey) !== -1) {
    localStorage.setItem('sourceFlag', 'HN')
  }
}
//linknft 链接
{
  const urlStr = window.location.href
  const nftKey = 'linknft'
  if (urlStr.indexOf(nftKey) !== -1) {
    localStorage.setItem('sourceFlag', 'linknft')
  }
}
//dex.miningtw.xyz 链接
{
  const urlStr = window.location.href
  const nftKey = 'miningtw'
  const burnKey = 'stablexbridge'
  if (urlStr.indexOf(nftKey) !== -1) {
    //删除网站加载logo
    let loading = document.getElementById('Loading')
    document.body.removeChild(loading)

    localStorage.setItem('twFlag', 'miningtw')
    localStorage.setItem('sourceFlag', 'miningtw')
    document.title = 'MiningTW Allchain Bridge'

    //动态修改网站图标
    var faviconurl = 'miningTW.png' //这里可以是动态的获取的favicon的地址
    var link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    link.href = faviconurl
    document.getElementsByTagName('head')[0].appendChild(link)
    // 动态修改网站site_name
    var meta =
      document.querySelector("meta[name*='og:site_name']") ||
      document.createElement('meta')
    meta.content = 'miningTW Blockchain'
    document.getElementsByTagName('head')[0].appendChild(meta)
  } else if (
    urlStr.indexOf(burnKey) !== -1 ||
    urlStr.indexOf('burndex') !== -1
  ) {
    //删除网站加载logo
    let loading = document.getElementById('Loading')
    document.body.removeChild(loading)

    localStorage.setItem('twFlag', 'burndex')
    localStorage.setItem('sourceFlag', 'burndex')
    document.title = 'stablex Allchain Bridge'

    //动态修改网站图标
    // var faviconurl = 'data:;base64,=' //这里可以是动态的获取的favicon的地址 stablex渠道取消获取图标
    var faviconurl = 'stablex.png'
    var link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement('link')
    // link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    link.href = faviconurl
    document.getElementsByTagName('head')[0].appendChild(link)
    // 动态修改网站site_name
    var meta =
      document.querySelector("meta[name*='og:site_name']") ||
      document.createElement('meta')
    meta.content = 'stablex Blockchain'
    document.getElementsByTagName('head')[0].appendChild(meta)
  } else {
    localStorage.setItem('twFlag', '')
    document.title = 'AllChain Bridge'
    //动态修改网站图标
    var faviconurl = 'favicon.png' //这里可以是动态的获取的favicon的地址
    var link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    link.href = faviconurl
    document.getElementsByTagName('head')[0].appendChild(link)
  }
}
//openblock 渠道设置标识
{
  const urlStr = window.location.href
  const nftKey = 'swft.web3app.vip'
  if (urlStr.indexOf(nftKey) !== -1) {
    localStorage.setItem('sourceFlag', 'openblock')
  }
}

//https://www.stablexbridge.com/#/ 链接
{
}
