import store from '../store/index'
import BigNumber from 'bignumber.js'
import axios from 'axios'
import Web3 from 'web3'
import ETH_erc20 from '../utils/eth-erc20'
import { supportNetWork } from '../config/index'
const wallet = store.state.wallet
export default async function getAllBalance(list, key) {
  if (wallet.address === '') return
  const netWork = supportNetWork.find((e) => {
    return e.netWork === key
  })
  if (netWork === undefined) return
  const api = netWork.rpcUrl
  const params = await getParams(list) //请求参数
  const result = new Promise(function (resolve, reject) {
    axios.post(api, params).then((response) => {
      // 列表插入余额
      resolve(response)
    })
  })
  return result
}
function setBalance(key, list, response) {
  list.forEach((element, index) => {
    let balance = new BigNumber(response[index].result)
      .shiftedBy(-element.decimals)
      .toFixed()
    //balance > 0 && (balance = Number(balance).toFixed(8))
    element.balance = balance
  })

  store.state.coinList[key] = list
}
async function getParams(list) {
  let params = new Array(list.length)
  list.forEach(async (coin, index) => {
    let methodNameEvm = 'eth_getBalance'
    let methodNameEvmDaibi = 'eth_call'
    if (list[0].mainNetwork == 'KLAY') {
      methodNameEvm = 'klay_getBalance'
      methodNameEvmDaibi = 'klay_call'
    }
    // 获取主链余额
    //AME 主网币合约地址 0x26d5ca2dE2005F42A8B0C785c723E3e286b77cDF
    if (
      coin.contact === '' ||
      (list[0].mainNetwork == 'AME' &&
        coin.contact === '0x26d5ca2dE2005F42A8B0C785c723E3e286b77cDF')
    ) {
      params[index] = {
        id: 1,
        jsonrpc: '2.0',
        method: methodNameEvm,
        params: [wallet.address, 'latest'],
      }
    }
    if (coin.mainNetwork == 'XDC') {
      //xdc 替换合约地址前缀
      coin.contact = coin.contact.replace(/xdc/, '0x')
    }

    if (
      coin.contact !== '' &&
      coin.contact !== '0x26d5ca2dE2005F42A8B0C785c723E3e286b77cDF'
    ) {
      const web3 = new Web3()
      const ethErc20Contract = new web3.eth.Contract(ETH_erc20, coin.contact)
      const data = await ethErc20Contract.methods
        .balanceOf(wallet.address)
        .encodeABI()

      params[index] = {
        id: coin.mainNetwork === 'FTM' ? '1' + index : 1,
        jsonrpc: '2.0',
        method: methodNameEvmDaibi,
        params: [
          {
            data: data,
            from: wallet.address,
            to: coin.contact,
          },
          'latest',
        ],
      }
    }
  })
  return params
}
