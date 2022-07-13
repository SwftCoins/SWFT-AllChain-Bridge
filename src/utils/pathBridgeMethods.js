import store from '../store'
import BigNumber from 'bignumber.js'
import baseApi from '../api/baseApi'
import getContract from '../utils/contract'
import { ethers } from 'ethers'
import { Notify, Dialog } from 'vant'
import getAllBalance from './getAllBalance'

import Web3 from 'web3'
import ETH_erc20 from './eth-erc20'
import md5Handle from './hexmd5'
let state, provider, signer, scope //全局state
let cBridgeInfo, transferData // cBridge 兑换参数
const pathBridgeExchange = async function ($scope) {
  state = store.state
  scope = $scope
  //判断
  if (state.info.dex === 'CBridge') {
    cBridgeInfo = state.info.cBridgeInfo
    console.log('CBridge 兑换', state.info)
  }
  // 得到的兑换数量加滑点
  const amount = new BigNumber(
    state.info.toTokenAmount * (1 - state.slidingPoint / 100),
  ).multipliedBy(BigNumber(10).pow(state.toToken.coinDecimal))
  let params = {
    //请求参数
    fromTokenAddress:
      state.fromToken.contact === ''
        ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        : state.fromToken.contact,
    toTokenAddress:
      state.toToken.contact === ''
        ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        : state.toToken.contact,
    fromAddress: state.wallet.address,
    toAddress: state.address,
    amountOutMin: toNonExponential(amount, 'parseInt'),
    routerPath: state.info.path
      ? JSON.parse(JSON.stringify(state.info.path))
      : '',
    amounts: [], //跨链
    dex: state.info.dex,
    aggregator: '', //跨链
    fromTokenChain: changeNetWork(state.fromToken.mainNetwork),
    toTokenChain: changeNetWork(state.toToken.mainNetwork),
    fromTokenAmount: state.info.fromTokenAmount,
    slippage: state.slidingPoint, //滑点
    //"deadline": 15
  }
  if (state.wallet.connectType === 'OKExWallet') {
    provider = new ethers.providers.Web3Provider(okexchain, 'any')
  } else if (state.wallet.connectType === 'ONTO') {
    provider = new ethers.providers.Web3Provider(window.onto, 'any')
  } else {
    provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
  }
  signer = provider.getSigner()

  //判断dex 是否维护
  if (state.info.dexStatus === 'MAINTAIN') {
    $scope.submitStatus = false
    return Dialog.alert({
      message: scope.$t('maintain', {
        dex: state.info.dex,
      }),
      theme: 'round-button',
      messageAlign: 'left',
      confirmButtonColor: '#277FFA',
    })
  }
  //o3拦截手续费是否充足
  if (state.info.dex === 'O3Swap') {
    let fee = state.info.fee //需要手续费
    const tokenChain = state.fromToken.mainNetwork //链
    const coin = {
      contact: '',
    }
    //判断是否主币
    const address = state.fromToken.contact
    if (address === '') {
      fee = new BigNumber(state.fromNumber).plus(new BigNumber(fee)).toString()
    }
    //计算主币余额
    const data = await getAllBalance([coin], tokenChain)
    const balance = new BigNumber(data[0].result)
      .shiftedBy(-18)
      .toFixed(6, BigNumber.ROUND_DOWN)
    console.log('balance:::::', balance, fee)
    let symbol = ''
    if (tokenChain === 'BSC') {
      symbol = 'BNB'
    } else if (tokenChain === 'ETH') {
      symbol = 'ETH'
    } else if (tokenChain === 'HECO') {
      symbol = 'HT'
    } else if (tokenChain === 'POLYGON') {
      symbol = 'MATIC'
    }
    let tip = scope.$t('feeInsufficient', { coin: symbol })
    if (address === '') {
      tip = scope.$t('ownFeeInsufficient', { coin: symbol })
    }
    if (balance < fee) {
      Notify({
        message: tip,
        color: '#ad0000',
        background: '#ffe1e1',
      })
      $scope.submitStatus = false
      return
    }
  }
  //O3 跨链
  if (
    state.fromToken.mainNetwork != state.toToken.mainNetwork &&
    state.info.dex === 'O3Swap'
  ) {
    params.amounts = state.info.chooseSwapPath.amount
    params.aggregator = state.info.chooseSwapPath.aggregator
  }
  //bridgers1 拦截
  if (scope.info.dex === 'bridgers1') {
    console.log('bridgers1兑换', scope.info)
    const amountOutMin = new BigNumber(state.info.amountOutMin)
    let data = {
      fromTokenAddress:
        state.fromToken.contact === ''
          ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          : state.fromToken.contact,
      toTokenAddress:
        state.toToken.contact === ''
          ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          : state.toToken.contact,
      fromAddress:
        changeNetWork(state.fromToken.mainNetwork) === 'TRX'
          ? state.walletTRON
          : state.wallet.address,
      toAddress: state.address,
      fromTokenChain: changeNetWork(state.fromToken.mainNetwork),
      toTokenChain: changeNetWork(state.toToken.mainNetwork),
      fromTokenAmount: state.info.fromTokenAmount,
      amountOutMin:
        toNonExponential(amountOutMin).toString() > 0
          ? toNonExponential(amountOutMin, 'parseInt')
          : toNonExponential(amountOutMin),
      fromCoinCode: state.fromToken.coinCode,
      toCoinCode: state.toToken.coinCode,
    }
    baseApi
      .sSwapswap(data)
      .then((res) => {
        console.log(res)
        if (res.resCode == 100) {
          isApproved(res)
        } else {
          $scope.submitStatus = false
          Notify({
            message: $scope.$t(res.resCode),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        $scope.submitStatus = false
      })
    return
  }
  //bridgers2 拦截
  if (scope.info.dex === 'bridgers2') {
    console.log('bridgers2兑换', scope.info)
    const amountOutMin = new BigNumber(state.info.amountOutMin)
    let data = {
      fromTokenAddress:
        state.fromToken.contact === ''
          ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          : state.fromToken.contact,
      toTokenAddress:
        state.toToken.contact === ''
          ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          : state.toToken.contact,
      fromAddress: state.wallet.address,
      toAddress: state.address,
      fromTokenChain: changeNetWork(state.fromToken.mainNetwork),
      toTokenChain: changeNetWork(state.toToken.mainNetwork),
      fromTokenAmount: state.info.fromTokenAmount,
      amountOutMin:
        toNonExponential(amountOutMin).toString() > 0
          ? toNonExponential(amountOutMin, 'parseInt')
          : toNonExponential(amountOutMin),
      fromCoinCode: state.fromToken.coinCode,
      toCoinCode: state.toToken.coinCode,
      slippage: state.slidingPoint, //滑点
    }
    baseApi
      .Bridgers2swap(data)
      .then((res) => {
        console.log(res)
        if (res.resCode == 100) {
          isApproved(res)
        } else {
          $scope.submitStatus = false
          Notify({
            message: $scope.$t(res.resCode),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        $scope.submitStatus = false
      })
    return
  }
  //请求兑换接口
  baseApi
    .commonSwap(params)
    .then((res) => {
      if (res.resCode == 100) {
        //cBridge 兑换
        transferData = res.data.txData.transferData
        //币安跨链桥
        if (state.info.dex === 'BinanceBridge') {
          BinanceBridgeExchange(res)
        } else {
          //验证是否需要授权
          isApproved(res)
        }
      } else {
        if (state.info.dex === 'BinanceBridge') {
          Notify({
            message: res.resMsg,
            color: '#ad0000',
            background: '#ffe1e1',
          })
        }
        $scope.submitStatus = false
        if(res.resCode == '916' || res.resCode == '1145' || res.resCode == '1146'){
          Notify({
            color: '#ad0000',
            background: '#ffe1e1',
            message: this.$t(res.resCode),
          })
        }else{
              Notify({
              color: '#ad0000',
              background: '#ffe1e1',
              message: this.$t('1001',{
                code:res.resCode
              }),
            })
        }

      }
    })
    .catch((error) => {
      console.log(error)
      $scope.submitStatus = false
    })
}

//币安跨链桥发币
async function BinanceBridgeExchange(res) {
  console.log('币安：：：：', res)
  let params = null
  const fromToken = state.fromToken
  const platformAddr = res.data.txData.depositAddress //收币地址
  const fromNumber = res.data.txData.amount //兑换数量
  if (fromToken.contact === '') {
    params = [
      {
        from: state.wallet.address,
        to: platformAddr,
        //gas: '0x76c0', // 30400
        //gasPrice: '0x9184e72a000', // 10000000000000
        value: `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`, // 2441406250
      },
    ]
  } else {
    web3 = new Web3()
    const ethErc20Contract = new web3.eth.Contract(ETH_erc20, fromToken.contact)
    console.log(
      state.wallet.address,
      `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
    )
    const data = await ethErc20Contract.methods
      .transfer(
        platformAddr,
        `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
      )
      .encodeABI()
    params = [
      {
        from: state.wallet.address, // Required
        to: fromToken.contact, // Required (for non contract deployments)
        data: data, // Required
        // gasPrice: "0x02540be400", // Optional
        // gas: "0x9c40", // Optional
        //value: `0x`, // Optional
      },
    ]
  }
  let mainNetwork = null
  if (scope.connectType === 'OKExWallet') {
    mainNetwork = okexchain
  } else if (scope.connectType === 'Nabox') {
    mainNetwork = NaboxWallet
  } else if (scope.connectType === 'ONTO') {
    mainNetwork = ONTO
  } else {
    mainNetwork = ethereum
  }
  mainNetwork
    .request({
      method: 'eth_sendTransaction',
      params,
    })
    .then((data) => {
      scope.submitStatus = false
      addTransData(data, res.data.txData.id)
      scope.$store.commit('setFromNumber', '')
    })
    .catch((error) => {
      scope.submitStatus = false
      Notify({
        message: scope.$t('rejectExchange'),
        color: '#ad0000',
        background: '#ffe1e1',
      })
    })
}
// 交易
async function exchange(response) {
  //tron 链发币拦截
  if (state.fromToken.mainNetwork === 'TRX' && state.info.dex === 'bridgers1') {
    const tronWeb = window.tronWeb
    let parameter = response.data.txData.parameter
    let options = response.data.txData.options
    const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
      response.data.txData.tronRouterAddrees,
      response.data.txData.functionName,
      options,
      parameter,
      response.data.txData.fromAddress,
    )
    let signedTx
    try {
      signedTx = await tronWeb.trx.sign(transaction.transaction)
    } catch {
      scope.submitStatus = false
      Notify({
        message: scope.$t('rejectExchange'),
        color: '#ad0000',
        background: '#ffe1e1',
      })
    }
    tronWeb.trx
      .sendRawTransaction(signedTx)
      .then((broastTx) => {
        console.log(broastTx)
        scope.submitStatus = false
        addsSwapTransData({ hash: broastTx.txid })
        store.commit('setFromNumber', '')
      })
      .catch((error) => {
        Notify({
          message: scope.$t('rejectExchange'),
          color: '#ad0000',
          background: '#ffe1e1',
        })
      })
    return
  }

  let transactionParameters = {
    to: response.data.txData.to, // Required except during contract publications.
    from: state.wallet.address, // must match user's active address.
    data: response.data.txData.data,
    value: response.data.txData.value,
    //gasPrice: 5000000000, // 6 gwei
    //gas: new BigNumber(1000000), // 1000000
  }
  console.log('transactionParameters:::', transactionParameters)
  signer
    .sendTransaction(transactionParameters)
    .then((res) => {
      console.log('交易', response, state.info.dex)
      if (state.info.dex === 'CBridge') {
        const params = {
          amount: transferData.amount,
          token: cBridgeInfo.token,
          senderAddr: transferData.userAddr,
          transferOutId: transferData.transferOutId,
          transferInId: transferData.transferInId,
          fromChainId: cBridgeInfo.fromChainId,
          toChainId: cBridgeInfo.toChainId,
          relayNodeAddr: cBridgeInfo.relayNodeAddr,
          fee: cBridgeInfo.feeAmount,
          jwt: cBridgeInfo.jwt,
          hashlockTime: transferData.hashLockTime,
        }
        baseApi.makerTransferOut(params).then((result) => {
          scope.submitStatus = false
          addTransData(res.hash, false, transferData)
          scope.$store.commit('setFromNumber', '')
          //scope.$store.commit('setAddress', '')
        })
      } else if (state.info.dex === 'bridgers1') {
        scope.submitStatus = false
        addsSwapTransData(res, response.data.txData.orderId)
        store.commit('setFromNumber', '')
      } else if (state.info.dex === 'bridgers2') {
        scope.submitStatus = false
        updatebridgers2DataAndStatus(res, response.data.txData.orderId)
        store.commit('setFromNumber', '')
      } else {
        scope.submitStatus = false
        scope.dex = 'SWFT'
        addTransData(res.hash)
        store.commit('setFromNumber', '')
        //store.commit('setAddress', '')
      }
    })
    .catch((error) => {
      console.log('用户取消交易', scope)
      scope.submitStatus = false
      console.log('error::::::', error.message)
      //TP钱包回传取消发币 error === cancle
      if (error === 'error') {
        Notify({
          message: scope.$t('rejectExchange'),
          color: '#ad0000',
          background: '#ffe1e1',
        })
        return
      }
      if (error.code === 4001) {
        Notify({
          message: scope.$t('rejectExchange'),
          color: '#ad0000',
          background: '#ffe1e1',
        })
        return
      }
      if (error.code === -32603) {
        //流动性不足
        if (error.data && error.data.code === 3) {
          Notify({
            message: scope.$t('notEnough'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
          return
        }
        //gas 费不足
        if (error.data && error.data.code === -32000) {
          Notify({
            message: scope.$t('notEnoughGas'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
          return
        }
      }
    })
}
//bridgers1 插入记录
function addsSwapTransData(data, orderId) {
  const amountOutMin = new BigNumber(state.info.amountOutMin)
  const params = {
    // orderId: orderId, //   订单号
    hash: data.hash, //  用户存币哈希
    fromTokenAddress:
      state.fromToken.contact === ''
        ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        : state.fromToken.contact,
    toTokenAddress:
      state.toToken.contact === ''
        ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        : state.toToken.contact,
    fromAddress:
      state.fromToken.mainNetwork === 'TRX'
        ? state.walletTRON
        : state.wallet.address,
    toAddress: state.address,
    fromTokenChain: changeNetWork(state.fromToken.mainNetwork),
    toTokenChain: changeNetWork(state.toToken.mainNetwork),
    fromTokenAmount: state.info.fromTokenAmount,
    amountOutMin:
      toNonExponential(amountOutMin).toString() > 0
        ? toNonExponential(amountOutMin, 'parseInt')
        : toNonExponential(amountOutMin),
    fromCoinCode: state.fromToken.coinCode,
    toCoinCode: state.toToken.coinCode,
  }
  baseApi.updateDataAndStatus(params).then(async (res) => {
    if (res.resCode == '100') {
      console.log(res)
      scope.$refs.dialogConfirm.show = false
      store.commit('setInfo', null)
      const orderRes = await baseApi.getTransDataById({
        orderId: res.data.orderId,
      })
      if (orderRes.resCode == '100') {
        let data = orderRes.data
        scope.$set(data, 'orderdetailStatus', orderStatus(data.status))
        scope.$set(data, 'beginDate', data.createTime)
        scope.$set(data, 'isNft', '')
        scope.$set(data, 'detailState', data.status)
        scope.$set(data, 'fromCoinAmt', data.fromTokenAmount)
        scope.$set(data, 'toCoinAmt', data.toTokenAmount)
        scope.$set(data, 'refundAddr', data.fromAddress)
        scope.$set(data, 'destinationAddr', data.toAddress)
        scope.$set(data, 'depositCoinCode', data.fromCoinCode)
        scope.$set(data, 'depositCoinAmt', data.fromCoinAmt)
        scope.$set(data, 'receiveCoinAmt', data.toCoinAmt)
        scope.$set(data, 'receiveCoinCode', data.toCoinCode)
        scope.$set(data, 'depositTxid', data.hash)
        scope.$set(data, 'transactionId', data.toHash)
        scope.$set(data, 'router', {
          router: 'bridgers1',
        })
        scope.$bus.emit('clearAddress')
        scope.$bus.emit('queryAllTradeHandle')
        store.commit('setSwapConfirm', false)
        scope.confirmHandle({ data: data })
      }
    }
  })
}
//bridgers2 插入记录
function updatebridgers2DataAndStatus(data, orderId) {
  const amountOutMin = new BigNumber(state.info.amountOutMin)
  const params = {
    // orderId: orderId, //   订单号
    hash: data.hash, //  用户存币哈希
    fromTokenAddress:
      state.fromToken.contact === ''
        ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        : state.fromToken.contact,
    toTokenAddress:
      state.toToken.contact === ''
        ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        : state.toToken.contact,
    fromAddress: state.wallet.address,
    toAddress: state.address,
    fromTokenChain: changeNetWork(state.fromToken.mainNetwork),
    toTokenChain: changeNetWork(state.toToken.mainNetwork),
    fromTokenAmount: state.info.fromTokenAmount,
    amountOutMin:
      toNonExponential(amountOutMin).toString() > 0
        ? toNonExponential(amountOutMin, 'parseInt')
        : toNonExponential(amountOutMin),
    fromCoinCode: state.fromToken.coinCode,
    toCoinCode: state.toToken.coinCode,
    slippage: state.slidingPoint, //滑点
  }
  baseApi.updatebridgers2DataAndStatus(params).then(async (res) => {
    if (res.resCode == '100') {
      console.log(res)
      scope.$refs.dialogConfirm.show = false
      store.commit('setInfo', null)
      const orderRes = await baseApi.getbridgers2TransDataById({
        orderId: res.data.orderId,
      })
      if (orderRes.resCode == '100') {
        let data = orderRes.data
        scope.$set(data, 'orderdetailStatus', orderStatus(data.status))
        scope.$set(data, 'beginDate', data.createTime)
        scope.$set(data, 'isNft', '')
        scope.$set(data, 'detailState', data.status)
        scope.$set(data, 'fromCoinAmt', data.fromTokenAmount)
        scope.$set(data, 'toCoinAmt', data.toTokenAmount)
        scope.$set(data, 'refundAddr', data.fromAddress)
        scope.$set(data, 'destinationAddr', data.toAddress)
        scope.$set(data, 'depositCoinCode', data.fromCoinCode)
        scope.$set(data, 'depositCoinAmt', data.fromCoinAmt)
        scope.$set(data, 'receiveCoinAmt', data.toCoinAmt)
        scope.$set(data, 'receiveCoinCode', data.toCoinCode)
        scope.$set(data, 'depositTxid', data.hash)
        scope.$set(data, 'transactionId', data.toHash)
        scope.$set(data, 'router', {
          router: 'bridgers2',
        })
        scope.$bus.emit('clearAddress')
        scope.$bus.emit('queryAllTradeHandle')
        store.commit('setSwapConfirm', false)
        scope.confirmHandle({ data: data })
      }
    }
  })
}

//解析订单状态
function orderStatus(str) {
  let statusData = [scope.$t('wait_deposit_send'), '#707B9E']
  switch (str) {
    case 'wait_deposits':
      statusData[0] = scope.$t('wait_deposit_send') //wait_deposit_send   等待存币
      statusData[1] = '#707B9E'
      break
    case 'exchange':
      statusData[0] = scope.$t('exchangeIng') //wait_deposit_send   兑换中
      statusData[1] = '#707B9E'
      break
    case 'trade_fail':
      statusData[0] = scope.$t('trade_fail') //wait_deposit_send   兑换失败
      statusData[1] = '#FF8484'
      break
    case 'fail':
      statusData[0] = scope.$t('trade_fail') //wait_deposit_send   兑换失败
      statusData[1] = '#FF8484'
      break
    case 'wait_deposit_send':
      statusData[0] = scope.$t('wait_deposit_send') //wait_deposit_send   等待存币
      statusData[1] = '#707B9E'
      break
    case 'wait_receive_send':
      statusData[0] = scope.$t('wait_receive_send') //wait_receive_send  等待发币
      statusData[1] = '#707B9E'
      break
    case 'wait_receive_confirm':
      statusData[0] = scope.$t('wait_receive_confirm') //wait_receive_confirm  等待发币确认
      statusData[1] = '#707B9E'
      break
    case 'wait_refund_send':
      statusData[0] = scope.$t('wait_refund_send') //wait_refund_send  等待退币
      statusData[1] = '#707B9E'
      break
    case 'wait_exchange_return':
      statusData[0] = scope.$t('exchangeIng') //wait_exchange_return  等待交换结果
      statusData[1] = '#707B9E'
      break
    case 'wait_exchange_push':
      statusData[0] = scope.$t('exchangeIng') //wait_exchange_push  等待交换推送
      statusData[1] = '#707B9E'
      break
    case 'wait_for_information':
      statusData[0] = scope.$t('exchangeIng') // wait_for_information   等待用户联系
      statusData[1] = '#707B9E'
      break
    case 'receive_complete':
      statusData[0] = scope.$t('receive_complete') // receive_complete   发币完成
      statusData[1] = '#1eb740'
      break
    case 'complete':
      statusData[0] = scope.$t('receive_complete')
      statusData[1] = '#1eb740'
      break
    case 'refund_complete':
      statusData[0] = scope.$t('refund_complete') // refund_complete   退币完成
      statusData[1] = '#1eb740'
      break
    case 'refund_sending':
      statusData[0] = scope.$t('refund_sending') // refund_sending   即将退币
      statusData[1] = '#707B9E'
      break
    case 'wait_kyc':
      statusData[0] = scope.$t('exchangeIng') //  wait_kyc  需要kyc   WAIT_KYC
      statusData[1] = '#707B9E'
      break
    case 'timeout':
      statusData[0] = scope.$t('timeout') // timeout   超时
      statusData[1] = '#FF8484'
      break
    case 'wait_refund_confirm':
      statusData[0] = scope.$t('wait_refund_confirm') //wait_refund_confirm  等待退币确认
      statusData[1] = '#707B9E'
      break
    case 'wait_partial_send':
      statusData[0] = scope.$t('wait_partial_send') //部分成交发币中…
      statusData[1] = '#707B9E'
      break
    case 'wait_partial_send_confirm':
      statusData[0] = scope.$t('wait_partial_send_confirm') // 部分成交发币确认中…
      statusData[1] = '#707B9E'
      break
    case 'wait_partial_refund':
      statusData[0] = scope.$t('wait_partial_refund') //部分成交退币中…
      statusData[1] = '#707B9E'
      break
    case 'wait_partial_refund_confirm':
      statusData[0] = scope.$t('wait_partial_refund_confirm') //部分成交退币确认中…
      statusData[1] = '#707B9E'
      break
    case 'partial_complete':
      statusData[0] = scope.$t('partial_complete') //完成
      statusData[1] = '#1eb740'
      break
    case 'wait_partial_send_confirm_error':
      statusData[0] = scope.$t('wait_partial_send_confirm_error') //部分成交发币确认中…
      statusData[1] = '#707B9E'
      break
    case 'wait_partial_refund_confirm_error':
      statusData[0] = scope.$t('wait_partial_refund_confirm_error') //部分成交退币确认中…
      statusData[1] = '#707B9E'
      break
    default:
      statusData[0] = scope.$t('exchangeIng')
      statusData[1] = '#707B9E'
  }
  return statusData
}
//插入记录
function addTransData(hash, orderId, transferData) {
  let sss = {
    depositCoinAmt:
      state.info.fromTokenAmount / 10 ** state.info.fromTokenDecimal,
    depositCoinCode: state.fromToken.coinCode,
    receiveCoinAmt: state.info.toTokenAmount,
    receiveCoinCode: state.toToken.coinCode,
    destinationAddr: state.address,
    refundAddr: state.wallet.address,
    transactionId: hash,
    router: state.info.dex,
    fromTokenChain: state.fromToken.mainNetwork,
    toTokenChain: state.toToken.mainNetwork,
    timestamp: new Date().getTime(),
    sourceType: 'H5',
    equipmentNo: getEquipmentNo(state.wallet.address),
  }
  let params = {
    depositCoinAmt:
      state.info.fromTokenAmount / 10 ** state.info.fromTokenDecimal,
    depositCoinCode: state.fromToken.coinCode,
    receiveCoinAmt: state.info.toTokenAmount,
    receiveCoinCode: state.toToken.coinCode,
    destinationAddr: state.address,
    refundAddr: state.wallet.address,
    transactionId: hash,
    router: state.info.dex,
    fromTokenChain: state.fromToken.mainNetwork,
    toTokenChain: state.toToken.mainNetwork,
    timestamp: new Date().getTime(),
    sourceType: 'H5',
    sign: md5Handle(sss),
    equipmentNo: getEquipmentNo(state.wallet.address),
  }
  baseApi.uploadPathRecord(params).then((res) => {
    console.log(res)
    scope.$refs.dialogConfirm.show = false
    store.commit('setInfo', null)
    scope.$bus.emit('clearAddress')
    scope.$bus.emit('queryAllTradeHandle')
    store.commit('setSwapConfirm', false)
    scope.confirmHandle(res)
  })
}

//设备号
function getEquipmentNo(address) {
  let equipmentNo = ''
  if (address.length <= 32) {
    let n = 32 - address.length
    for (let i = 0; i < n; i++) {
      equipmentNo += 'x'
    }
    equipmentNo += address
  } else {
    equipmentNo = address.slice(0, 32)
  }
  return equipmentNo
}
// 判断是否需要approve授权
async function isApproved(res) {
  console.log('this.fromToken::::', state.fromToken)
  //主币不需要授权
  if (state.fromToken.contact === '') {
    //不需要授权
    exchange(res)
  } else {
    if (state.fromToken.mainNetwork === 'TRX') {
      console.log('trx授权')
      let tronWeb = window.tronWeb
      const contract = await tronWeb.contract().at(state.fromToken.contact)
      const allowance = contract.allowance(state.walletTRON, res.data.txData.to)
      const allowAmt = await allowance.call()
      const num = new BigNumber(
        ethers.utils.formatUnits(
          allowAmt.remaining || allowAmt,
          state.fromToken.coinDecimal,
        ),
      )
      const fromTokenNum = new BigNumber(state.fromNumber)
      console.log(num.toString())
      console.log(fromTokenNum.toString())
      if (num.gt(fromTokenNum)) {
        console.log('不需要授权')
        exchange(res)
      } else {
        console.log('需要授权')
        scope.txData = res
        scope.$refs.approve.$refs.dialog.show = true
      }
      return
    }
    let contract = getContract(state.fromToken.contact)
    console.log(contract)
    contract
      .allowance(state.wallet.address, res.data.txData.to)
      .then((allowAmt) => {
        const num = new BigNumber(
          ethers.utils.formatUnits(allowAmt, state.fromToken.coinDecimal),
        )
        const fromTokenNum = new BigNumber(state.fromNumber)
        console.log(num.toString())
        console.log(fromTokenNum.toString())
        if (num.gt(fromTokenNum)) {
          console.log('不需要授权')
          exchange(res)
        } else {
          console.log('需要授权')
          scope.txData = res
          scope.$refs.approve.$refs.dialog.show = true
        }
      })
      .catch((err) => {
        console.log(66666, err)
        Notify({
          message: scope.$t('notEnough'),
          color: '#ad0000',
          background: '#ffe1e1',
        })
        scope.submitStatus = false
      })
  }
}

//科学计数法转字符串
function toNonExponential(num, type) {
  var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
  if (type === 'parseInt') {
    let str = num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
    if (str.indexOf('.') === -1) {
      return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
    } else {
      return str.substring(0, str.indexOf('.'))
    }
  } else {
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
  }
}
//主网络修改
function changeNetWork(network) {
  if (network === 'AVAXC') {
    return 'AVALANCHE'
  } else if (network === 'FTM') {
    return 'FANTOM'
  } else if (network === 'ARB') {
    return 'ARBITRUM'
  } else {
    return network.toUpperCase()
  }
}
export default { pathBridgeExchange, exchange }
