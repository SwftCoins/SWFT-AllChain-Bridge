import axios from 'axios'
import store from '../store'

let api = ''
let development = process.env.NODE_ENV === 'development'
if (!development) {
  api = 'https://transfer.swft.pro'
}
const pathApi = 'https://api.paths.finance'
const testApi = 'https://www.swftc.info/gt'
const sSwapApi = 'https://sswap.swft.pro'
const bridgersApi= 'https://sswap.swft.pro'
// 增加axios拦截
axios.interceptors.response.use(
  (suc) => {
    if (suc.status == '200') {
      if (suc.data.resCode != '900') {
        return Promise.resolve(suc.data)
      }
    } else {
      return Promise.resolve(suc.statusText)
    }
  },
  (error) => {
    return Promise.reject(error.data, error.resCode)
  },
)

class BaseApi {
  // constructor
  /**
   * @param {string} url 请求地址
   * @param {Object} data 请求参数
   * @param {string} method  http请求方式
   * @param {string} responseType 相应类型
   */
  createRpcToken(url, data, method, path, responseType) {
    method = method || 'post'
    // responseType = responseType || 'application/json';
    if (method.toLowerCase() === 'get') {
      let params = ''
      Object.keys(data).forEach(function(key) {
        if (data[key]) {
          let value = data[key]
          params += key + '=' + value + '&'
        }
      })
      if (params.length > 0) {
        params = params.substr(0, params.length - 1)
        url += '?' + params
        data = {}
      }
    }
    data = JSON.stringify(data)
    return axios({
      url: path ? url : api + url,
      method: method,
      data: data,
      dataType: 'json',
      timeout: 500000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  newBaseRequestData() {
    //从浏览器地址取出sourceFlag
    let sourceFlag = localStorage.getItem('sourceFlag')
    let equipmentNo
    if (sessionStorage.getItem('equipmentNo')) {
      equipmentNo = sessionStorage.getItem('equipmentNo')
      equipmentNo = JSON.parse(equipmentNo)
    } else {
      equipmentNo = this.randomWord()
      let json = JSON.stringify(equipmentNo)
      sessionStorage.setItem('equipmentNo', json)
    }
    let address = ''
    // if (store.state.chainId == '0' || store.state.walletTRON !== null) {
    //   address = store.state.walletTRON
    // } else
    if (store.state.chainId == '000' && store.state.walletPolkadot !== null) {
      address = store.state.walletPolkadot.addrSS58
    } else if (
      store.state.chainId == '222' &&
      store.state.walletPolkadot !== null
    ) {
      address = store.state.walletPolkadot.addrSS58CRU
    } else if (store.state.chainId == '0' && store.state.walletTRON !== null) {
      address = store.state.walletTRON
    } else {
      address = store.state.wallet ? store.state.wallet.address : ''
    }
    if (address.length) {
      equipmentNo = ''
      if (address.length <= 32) {
        let n = 32 - address.length
        for (let i = 0; i < n; i++) {
          equipmentNo += 'x'
        }
        equipmentNo += address
      } else {
        equipmentNo = address.slice(0, 32)
      }
    }
    let data = {
      equipmentNo: equipmentNo,
      sourceType: 'H5',
      userNo: '',
      sessionUuid: '',
      orderId: '',
      sourceFlag: sourceFlag,
    }
    return data
  }
  randomWord() {
    let str = '',
      arr = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ]
    for (let i = 0; i < 32; i++) {
      let pos = Math.round(Math.random() * (arr.length - 1))
      str += arr[pos]
    }
    return str
  }

  // 一下为请求列表-----------------------------------------------------------
  // 获取coin列表
  queryCoinList() {
    return this.createRpcToken(
      testApi + '/swap/v1/queryCoinList',
      this.newBaseRequestData(),
      '',
      'path',
    )
  }
  
  // 获取coin兑换基本信息 
  getBaseInfo(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/v1/queryBaseInfo',
      obj,
      '',
      'path',
    )
  }
  // 获取交易记录
  queryAllTrade(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/v1/queryAllTrade',
      // '/api/v2/queryAllTrade',
      obj,
      '',
      'path',
    )
  }
  // 账户兑换接口
  accountExchange(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/v1/accountExchange',
      obj,
      '',
      'path',
    )
  }
  //修改哈希接口
  modifyTxId(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(testApi + '/swap/v1/modifyTxId', obj, '', 'path')
  }

  //  兑换记录
  queryOrderState(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/v1/queryOrderState',
      // '/api/v2/queryOrderState',
      obj,
      '',
      'path',
    )
  }
  // 矿工费查询接口
  chainFeeList(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/v1/queryChainFeeList',
      obj,
      '',
      'path',
    )
  }
  multiQuote(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(pathApi + '/api/multiQuote', obj, 'get', 'path')
  }
  // 获取NFT
  getAssetsInfo(data) {
    return this.createRpcToken(
      pathApi + '/api/getAssetsInfo',
      data,
      'get',
      'path',
    )
  }
  // 获取NFT
  getRaribleData(data) {
    return this.createRpcToken(
      pathApi + '/api/getRaribleData',
      data,
      'get',
      'path',
    )
  }
  // Path兑换
  commonSwap(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(pathApi + '/api/commonSwap', obj, 'post', 'path')
  }
  //生成NFT兑换记录
  addTransData(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      pathApi + '/api/exchangeRecord/addTransData',
      obj,
      'post',
      'path',
    )
  }
  //
  makerTransferOut(data) {
    return this.createRpcToken(pathApi + '/api/cBridge/makerTransferOut', data)
  }
  //插入path 交易兑换记录接口
  uploadPathRecord(data) {
    return this.createRpcToken(
      'https://transfer.swft.pro/bridge/uploadRecord',
      data,
      '',
      'path',
    )
  }
  //登录XUMM 钱包
  payload(data) {
    return this.createRpcToken(
      'https://pro-network.swftc.be/gt/swap/v1/payload',
      data,
      '',
      'path',
    )
  }

  getXUMMWalletInfo(identifier) {
    const data = {
      uuid: identifier,
    }
    return this.createRpcToken(
      'https://pro-network.swftc.be/gt/swap/v1/queryWalletAddress',
      data,
      '',
      'path',
    )
  }

  getXRPBalance(addr) {
    return this.createRpcToken(
      'https://api.xrpscan.com/api/v1/account/' + addr,
      '',
      'get',
      'path',
    )
  }

  getXRPTokensBalance(addr) {
    return this.createRpcToken(
      'https://api.xrpscan.com/api/v1/account/' + addr + '/assets',
      '',
      'get',
      'path',
    )
  }
  //bridgers1 询价
  getSswapBridgeTradeData(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      sSwapApi + '/api/sswap/quote',
      obj,
      'post',
      'path',
    )
  }
  //bridgers2 询价
  getBridgers2TradeData(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      bridgersApi + '/gt/swap/bridgers2/quote',
      obj,
      'post',
      'path',
    )
  }
  //bridgers1 发起兑换
  sSwapswap(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(sSwapApi + '/api/sswap/swap', obj, 'post', 'path')
  }
  //bridgers2 发起兑换
  Bridgers2swap(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(bridgersApi + '/gt/swap/bridgers2/swap', obj, 'post', 'path')
  }
  //更新bridgers1 交易哈希
  updateDataAndStatus(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      sSwapApi + '/api/exchangeRecord/updateDataAndStatus',
      obj,
      'post',
      'path',
    )
  }
  //更新bridgers2 交易哈希
  updatebridgers2DataAndStatus(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      bridgersApi + '/gt/swap/bridgers2/updateDataAndStatus',
      obj,
      'post',
      'path',
    )
  }
  //获取 bridgers1 交易记录
  getTransData(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      sSwapApi + '/api/exchangeRecord/getTransData',
      obj,
      'post',
      'path',
    )
  }
  //获取 bridgers2 交易记录
  getbridgers2TransData(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      bridgersApi + '/gt/swap/bridgers2/getTransData',
      obj,
      'post',
      'path',
    )
  }
  //查询bridgers1交易记录详情
  getTransDataById(data) {
    return this.createRpcToken(
      sSwapApi + '/api/exchangeRecord/getTransDataById',
      data,
      'post',
      'path',
    )
  }
    //查询bridgers2交易记录详情
    getbridgers2TransDataById(data) {
      return this.createRpcToken(
        bridgersApi + '/gt/swap/bridgers2/getTransDataById',
        data,
        'post',
        'path',
      )
    }
  //linkNFT 接口
  //linkNFT 获取主题跟收藏
  getNFTTypeList(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/path/v1/getBaseInfo',
      obj,
      '',
      'path',
    )
  }
  //linkNFT 获取详情NFT
  getNFTListDetail(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/path/v1/getLists',
      obj,
      '',
      'path',
    )
  }
  //linkNFT 查询拥有的NFT
  getOwnedAssets(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/path/v1/getOwnedAssets',
      obj,
      '',
      'path',
    )
  }
  quote(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(testApi + '/swap/path/v1/quote', obj, '', 'path')
  }
  //linkNFT NFT下单
  getNFTExchange(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/path/v1/placeOrder',
      obj,
      '',
      'path',
    )
  }
  //linkNFT NFT订单详情信息
  queryOrderStateNFT(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/path/v1/queryOrderState',
      obj,
      '',
      'path',
    )
  }
  // linknft 交易记录
  queryAllNftTrade(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/path/v1/queryAllNftTrade',
      obj,
      '',
      'path',
    )
  }
  // linknft 交易记录
  modifyDepositTxId(data) {
    const obj = {
      ...this.newBaseRequestData(),
      ...data,
    }
    return this.createRpcToken(
      testApi + '/swap/path/v1/modifyDepositTxId',
      obj,
      '',
      'path',
    )
  }
}
const baseApi = new BaseApi()
export default baseApi
