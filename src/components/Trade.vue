<template>
  <div class="trade" :class="sourceFlag === 'bridgers' ? 'border' : ''">
    <div class="swap-content">
      <div class="trade-boxs">
        <TradeBox
          style="width: calc(50% - 18px)"
          ref="fromToken"
          type="from"
          @getMax="getMax"
        />
        <svg
          t="1623380158754"
          :class="isPC ? 'icon' : 'iconM'"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1319"
          width="200"
          height="200"
          @click="exchangeTokens"
        >
          <path
            d="M955.574857 505.947429c-1.993143 145.627429-27.282286 266.203429-101.229714 338.102857-71.917714 73.947429-192.493714 99.236571-338.102857 101.229714-145.627429-1.993143-266.203429-27.282286-338.121143-101.229714-73.947429-71.899429-99.236571-192.475429-101.229714-338.102857 2.011429-145.627429 27.282286-266.203429 101.229714-338.102858 71.917714-73.947429 192.493714-99.254857 338.102857-101.248 145.627429 2.011429 266.203429 27.300571 338.121143 101.229715 73.947429 71.917714 99.236571 192.493714 101.229714 338.121143z"
            fill="#F8FBFF"
            p-id="1320"
          ></path>
          <path
            d="M438.528 358.089143v-82.779429s0.237714-4.352-8.301714-6.4c-7.021714-1.554286-13.805714 3.328-13.805715 3.328-3.017143 2.304-142.884571 103.533714-142.884571 103.533715s-13.293714 6.930286-13.293714 20.772571c0 13.330286 9.526857 18.962286 9.526857 18.962286l143.634286 100.717714s9.051429 3.346286 16.822857 1.810286c8.301714-1.810286 8.301714-7.954286 8.301714-7.954286v-77.659429h139.849143s110.244571 15.122286 110.244571 56.905143c0 0-1.755429-131.236571-113.737143-131.236571h-136.356571z"
            fill="#000000"
            p-id="1321"
          ></path>
          <path
            d="M581.394286 691.547429v82.779428s1.517714 5.12 10.550857 6.144c6.034286 0.768 9.801143-2.304 11.044571-3.328 3.017143-2.048 143.140571-103.533714 143.140572-103.533714s13.312-6.930286 13.312-20.772572c0-13.586286-9.545143-18.962286-9.545143-18.962285l-143.890286-100.717715s-6.034286-3.602286-14.061714-1.554285c-10.057143 2.56-10.550857 7.954286-10.550857 7.954285v77.403429h-140.617143s-110.226286-15.122286-110.226286-56.905143c0 0 1.755429 131.236571 113.993143 131.236572l136.850286 0.256z"
            fill="#277FFA"
            p-id="1322"
          ></path>
        </svg>
        <TradeBox style="width: calc(50% - 18px)" ref="toToken" type="to" />
      </div>

      <ReceivingAddress />
      <!-- <Preference /> -->
      <Info />
      <div class="btns">
        <!-- <div class="btn" @click="exchange">
          {{ $t("swap") }} {{ !needApprove ? "approev" : "approve过了" }}
        </div> -->
        <div class="btn themeBg" @click="exchange">
          {{ this.walletAddress ? showSwapBtn : this.$t('connectWallet') }}
        </div>
      </div>
    </div>
    <SwapConfirm :sendGas="sendGas" ref="swapConfirm" @comfirm="comfirm" />
  </div>
</template>

<script>
// 组件
import TradeBox from '../components/TradeBox'
import SwapConfirm from './SwapConfirm'
import ReceivingAddress from './ReceivingAddress'
import Info from './Info'
// import Preference from './Preference'
// 插件
import { Notify, Dialog } from 'vant'
import { ethers } from 'ethers'
import Web3 from 'web3'
const web3 = new Web3()
import abi from '../utils/abi'
let provider, signer
if (window.ethereum) {
  provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
  signer = provider.getSigner()
}
import { ApiPromise, WsProvider } from '@polkadot/api'
const { typesBundleForPolkadot } = require('@crustio/type-definitions')
import BigNumber from 'bignumber.js'
import bus from '../eventBus'
import getAllBalance from '../utils/getAllBalance'
import getNFTAsset from '../utils/getNFTAsset'
import * as solanaWeb3 from '@solana/web3.js'
import getTerraBalanceHandle from '../utils/getTerraBalance'
import BtcExchangeHandle from '../utils/getBtcBalance'
import getTronBalance from '../utils/getTronBalance'
import baseApi from '../api/baseApi'
import getEOSBalance from '../utils/getEOSBalance'
export default {
  name: 'Trade',
  components: {
    TradeBox,
    ReceivingAddress,
    Info,
    SwapConfirm,
    // Preference,
  },
  data() {
    return {
      needApprove: false,
      sendGas: null,
      sourceFlag: localStorage.getItem('sourceFlag'),
    }
  },
  watch: {
    // 监听钱包是否激活
    chainId(val, old) {},
    fromToken(val, oldVal) {
      this.$store.commit('setBalance', 0)
      this.init()
    },
  },
  computed: {
    order() {
      return this.$store.state.order
    },
    // 当前链路
    chainId() {
      return this.$store.state.chainId
    },
    walletAddress() {
      if (this.$store.state.chainId == '000') {
        return this.$store.state.walletPolkadot.addrSS58
      }
      if (this.$store.state.chainId == '222') {
        return this.$store.state.walletPolkadot.addrSS58CRU
      } else if (this.$store.state.chainId == '0') {
        return this.$store.state.walletTRON
      } else {
        return this.$store.state.wallet.address
      }
    },
    fromToken: {
      get() {
        return this.$store.state.fromToken
      },
      set(val) {
        this.$store.commit('setFromToken', val)
      },
    },
    toToken: {
      get() {
        return this.$store.state.toToken
      },
      set(val) {
        this.$store.commit('setToToken', val)
      },
    },
    info() {
      return this.$store.state.info
    },
    showSwapBtn() {
      if (this.$store.state.fromNumber > 0) {
        if (this.$store.state.updating) {
          return this.$t('updating')
        } else {
          return this.$t('swap')
        }
      } else if (this.$store.state.NFTChange) {
        return this.$t('swap')
      } else {
        return this.$t('exchangeQuantity')
      }
    },
    getChainIdName: {
      get() {
        return this.$store.getters.getChainIdName
      },
      set(val) {},
    },
    NFTChange() {
      return this.$store.state.NFTChange
    },
  },
  created() {
    this.init()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  mounted() {
    // 页面初始化获取汇率
    this.ratio = new BigNumber(0)
    bus.$on('getSendGas', (res) => {
      this.sendGas = res
    })
  },
  methods: {
    //初始化获取币种余额
    init() {
      clearInterval(this.timer)
      this.getBalance()
      this.timer = setInterval(() => {
        this.getBalance()
      }, 5000)
    },
    // 监听链路变化
    changeFromToken(item) {
      this.fromToken = item
      this.$refs.fromToken.number = this.fromToken.balance
      this.changeToken(item)
    },
    changetoToken(item) {
      this.toToken = item
      this.changeToken(item)
    },
    changeToken(item) {
      this.ratio = 0
      this.init()
      // 获取兑换数额
      this.ratio = new BigNumber(0)
      this.getRatio()
    },
    // 切换币种
    changeTokensBox() {
      // 交换币种
      ;[this.fromToken, this.toToken] = [this.toToken, this.fromToken]
    },
    // 获取最大余额
    getMax() {
      //判断区间范围是否计算出
      let max
      if (this.info !== null) {
        max =
          Number(this.info.depositMax) < Number(this.$store.state.balance)
            ? this.info.depositMax
            : this.$store.state.balance
      } else {
        max = this.$store.state.balance
      }
      this.$store.commit('setFromNumber', max)
    },
    // 获取余额
    async getBalance() {
      const coin = this.$store.state.fromToken
      const wallet = this.$store.state.wallet
      if (
        !coin ||
        !wallet ||
        (!wallet.address &&
          !this.$store.state.walletPolkadot &&
          !this.$store.state.walletTRON)
      ) {
        return
      }
      //dot获取余额
      if (coin.mainNetwork === 'DOT' || coin.mainNetwork === 'CRU') {
        const account = this.$store.state.walletPolkadot
        if (!account || !account.addr) {
          return
        }
        // Construct
        let wsProvider = null
        let api = null
        if (coin.mainNetwork === 'CRU') {
          wsProvider = new WsProvider('wss://api.decloudf.com/')
          api = await ApiPromise.create({
            provider: wsProvider,
            typesBundle: typesBundleForPolkadot,
          })
        } else {
          wsProvider = new WsProvider('wss://rpc.polkadot.io')
          api = await ApiPromise.create({ provider: wsProvider })
        }

        // 查询余额
        let acct = null

        if (coin.mainNetwork === 'CRU') {
          acct = await api.query.system.account(account.addrSS58CRU)
        } else {
          acct = await api.query.system.account(account.addrSS58)
        }
        const freeBalance = acct.data.free.toString(10)
        if (freeBalance == '0') {
          this.setBalance(coin, 0)
        } else {
          if (coin.mainNetwork === 'CRU') {
            var newBalance =
              freeBalance.slice(0, freeBalance.length - 12) +
              '.' +
              freeBalance.slice(1)
          } else {
            var newBalance =
              freeBalance.slice(0, freeBalance.length - 10) +
              '.' +
              freeBalance.slice(1)
          }

          newBalance = Number(newBalance).toFixed(5)
          if (
            this.$store.state.chainId == '000' ||
            this.$store.state.chainId == '222'
          ) {
            //拦截切换链请求返回
            this.setBalance(coin, newBalance)
          }
        }
      }
      //trx获取余额
      if (coin.mainNetwork === 'TRX') {
        const reslt = await getTronBalance()
        let tronWeb = window.tronWeb
        if (coin.coinCode === 'TRX') {
          this.setBalance(coin, tronWeb.fromSun(reslt.balance).toString())
        } else {
          if (coin.contact.length > 10) {
            const contract = await tronWeb.contract().at(coin.contact)
            const trc20 = await contract
              .balanceOf(this.$store.state.walletTRON)
              .call()
            const bal = tronWeb
              .toBigNumber(trc20)
              .shiftedBy(-(coin.coinDecimal != null ? coin.coinDecimal : 18))
              .toFixed(6, BigNumber.ROUND_DOWN)
            this.setBalance(coin, bal > 0 ? bal : 0)
          } else {
            let assets = reslt.assetV2
            if (assets && assets.length !== 0) {
              let token = assets.find((e) => {
                if (e.key === coin.contact) {
                  return e
                }
              })
              if (token) {
                const bal = new BigNumber(token.value)
                  .shiftedBy(
                    -(coin.coinDecimal != null ? coin.coinDecimal : 18),
                  )
                  .toFixed(6, BigNumber.ROUND_DOWN)
                this.setBalance(coin, bal > 0 ? bal : 0)
              } else {
                this.$store.commit('setBalance', 0)
              }
            } else {
              this.$store.commit('setBalance', 0)
            }
          }
        }
      }
      // SOL获取余额
      if (coin.mainNetwork === 'SOL') {
        const connection = new solanaWeb3.Connection(
          solanaWeb3.clusterApiUrl('mainnet-beta'),
          'confirmed',
        )
        if (coin.contact === '') {
          let account = await connection.getAccountInfo(window.solana.publicKey)
          if (account) {
            const balanceSOL = (Number(account.lamports) / 1000000000).toFixed(
              6,
            )
            this.setBalance(coin, balanceSOL)
          } else {
            this.setBalance(coin, 0)
          }
        } else {
          const account = await window.solana.connect()
          const tokenPublic = new solanaWeb3.PublicKey(coin.contact) //9pBLiojTZMxbAPcsCWs8TQEiuCedRudzEFFakJFRCAoS
          const tokenAccount = await connection.getParsedTokenAccountsByOwner(
            window.solana.publicKey,
            { mint: tokenPublic },
          )
          const value = tokenAccount.value
          if (value.length > 0) {
            this.setBalance(
              coin,
              tokenAccount.value[0].account.data.parsed.info.tokenAmount
                .uiAmount,
            )
          } else {
            this.setBalance(coin, 0)
          }
        }
      }
      //terra 获取余额
      if (coin.mainNetwork === 'LUNA') {
        const address = this.$store.state.wallet.address
        const balance = await getTerraBalanceHandle(coin, address)
        this.setBalance(coin, balance)
      }
      //BTC 获取余额
      if (coin.mainNetwork === 'BTC') {
        const balance = await BtcExchangeHandle.getBtcBalanceHandle()
        this.setBalance(coin, balance)
      }
      // EOS 获取余额
      if (coin.mainNetwork === 'EOS') {
        const res = await getEOSBalance(coin)
        this.setBalance(
          coin,
          new BigNumber(res).toFixed(6, BigNumber.ROUND_DOWN),
        )
        return
      }
      if (coin.mainNetwork === 'XRP') {
        if (coin.coinCode === 'XRP') {
          const xrpBalance = await baseApi.getXRPBalance(wallet.address)
          let balance = 0
          if (xrpBalance.xrpBalance) {
            balance =
              Number(xrpBalance.xrpBalance) - xrpBalance.ownerCount * 2 - 10
          }
          this.setBalance(
            coin,
            new BigNumber(balance).toFixed(6, BigNumber.ROUND_DOWN),
          )
          return
        }
        const tokensBalance = await baseApi.getXRPTokensBalance(wallet.address)
        const tokenInfo = tokensBalance.find(
          (e) => e.counterparty === coin.contact,
        )
        if (tokenInfo) {
          this.setBalance(
            coin,
            new BigNumber(tokenInfo.value).toFixed(6, BigNumber.ROUND_DOWN),
          )
        }
        return
      }

      //BSC ETH HECO POLYGON OKExChain TT ARB FTM AVAXC
      if (
        coin.mainNetwork === 'BSC' ||
        coin.mainNetwork === 'ETH' ||
        coin.mainNetwork === 'HECO' ||
        coin.mainNetwork === 'POLYGON' ||
        coin.mainNetwork === 'OKExChain' ||
        coin.mainNetwork === 'ARB' ||
        coin.mainNetwork === 'AVAXC' ||
        coin.mainNetwork === 'TT' ||
        coin.mainNetwork === 'XDC' ||
        coin.mainNetwork === 'KLAY' ||
        coin.mainNetwork === 'CELO' ||
        coin.mainNetwork === 'ORC' ||
        coin.mainNetwork === 'SGB' ||
        coin.mainNetwork === 'HPB' ||
        coin.mainNetwork === 'CRONOS' ||
        coin.mainNetwork === 'ECH' ||
        coin.mainNetwork === 'AME' ||
        coin.mainNetwork === 'CUBE' ||
        coin.mainNetwork === 'GNOSIS' ||
        coin.mainNetwork === 'FTM'
      ) {
        const data = await getAllBalance([coin], coin.mainNetwork)
        const balance = new BigNumber(data[0].result)
          .shiftedBy(-(coin.coinDecimal != null ? coin.coinDecimal : 18))
          .toFixed(7, BigNumber.ROUND_DOWN)
          .slice(0, -1)
        this.$store.commit('setBalance', balance > 0 ? balance : 0)
      }
    },
    // 显示余额
    setBalance(coin, balance) {
      if (
        (this.$store.state.chainId == '000' && coin.coinCode == 'DOT') ||
        (this.$store.state.chainId == '222' && coin.coinCode == 'CRU') ||
        (this.$store.state.chainId == '1993' && coin.mainNetwork == 'LUNA') ||
        (this.$store.state.chainId == '1994' && coin.mainNetwork == 'BTC') ||
        (this.$store.state.chainId == '2021' && coin.mainNetwork == 'SOL') ||
        (this.$store.state.chainId == '1008600' && coin.mainNetwork == 'XRP') ||
        (this.$store.state.chainId == '0' && coin.mainNetwork == 'TRX') ||
        (this.$store.state.chainId == '1040' && coin.mainNetwork == 'EOS')
      ) {
        const list = this.$store.state.coinList
        this.$store.commit('setCoinList', list)
        this.$store.commit('setBalance', Number(balance))
      } else {
        let etherString = ethers.utils.formatUnits(
          balance,
          this.fromToken.coinDecimal,
        )
        const number = Number(
          new BigNumber(etherString).toFixed(6, BigNumber.ROUND_DOWN),
        )
        const list = this.$store.state.coinList
        this.$store.commit('setCoinList', list)
        this.$store.commit('setBalance', number)
      }
    },
    GetAngleRewards(Address, useraddr, callback) {
      const myContract = new web3.eth.Contract(abi, Address)
      const account = useraddr
      sendEtherFrom(account)

      function sendEtherFrom(account) {
        const method = 'eth_sendTransaction'
        let data = web3.eth.abi.encodeFunctionCall(
          {
            name: 'send',
            type: 'function',
            inputs: [],
            outputs: [],
          },
          [],
        )
        const parameters = [
          {
            from: account,
            to: Address,
            data: data,
          },
        ]
        const from = account
        const payload = {
          method: method,
          params: parameters,
          from: from,
        }
        callback(null)
        ethereum.sendAsync(payload, function (err, response) {
          const rejected = 'User denied transaction signature.'
          if (response.error && response.error.message.includes(rejected)) {
            callback('refuse')
          }
          if (response.code == '-32603') {
            callback('fail')
          }
          if (response.error && response.error.code == '-32603') {
            callback('fail')
          }
          if (response.result) {
            timer_takeGain = setInterval(() => {
              number_takeGain++
              // 查询交易是否完成，这里要通过这个方法去一直查询交易是否完成
              web3.eth
                .getTransactionReceipt(response.result)
                .then(function (res) {
                  if (res == null) {
                    callback(res)
                  } else if (res.status) {
                    callback(res.status)
                    clearInterval(timer_takeGain)
                  } else {
                    clearInterval(timer_takeGain)
                  }
                })
              if (number_takeGain > 10) {
                clearInterval(timer_takeGain)
                callback('timeout')
                number_takeGain = 1
              }
            }, 2000)
          }
        })
      }
    },
    // // 交易
    async exchange() {
      if (
        this.$store.state.chainId !== '000' &&
        this.$store.state.chainId !== '222' &&
        this.$store.state.chainId !== '0' &&
        (!this.$store.state.wallet || !this.$store.state.wallet.address)
      ) {
        bus.$emit('getMetaMask')
        return
      }
      if (!this.$store.state.info || this.$store.state.updating) return

      if (
        Number(this.$store.state.fromNumber) > Number(this.$store.state.balance)
      ) {
        Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('insufficient', {
            coin: this.fromToken.coinCode,
          }),
        })
        return
      }
      if (
        Number(this.$store.state.fromNumber) < Number(this.info.depositMin) ||
        Number(this.$store.state.fromNumber) > Number(this.info.depositMax)
      ) {
        Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('rangeTip'),
        })
        return
      }
      if (
        this.$store.state.fromNumber === '' ||
        this.$store.state.fromNumber <= 0
      ) {
        Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('exchangeQuantity'),
        })
        return
      }
      if (!this.$store.state.address) {
        Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('receivingAddress'),
        })
        return
      }
      if (
        this.fromToken.mainNetwork == 'SOL' ||
        this.toToken.mainNetwork == 'SOL'
      ) {
        return Dialog.confirm({
          message: this.$t('solTip'),
          messageAlign: 'left',
          confirmButtonColor: '#277ffa',
          confirmButtonText: this.$t('btnContinue'),
          cancelButtonText: this.$t('btnCancel'),
        })
          .then(() => {
            // on confirm
            this.$refs.swapConfirm.show()
            return
          })
          .catch(() => {
            // on cancel
            return
          })
      }
      if (
        this.fromToken.mainNetwork == 'CUBE' &&
        this.toToken.mainNetwork != 'CUBE'
      ) {
        return Dialog.confirm({
          message: this.$t('cubeTip'),
          messageAlign: 'left',
          confirmButtonColor: '#277ffa',
          confirmButtonText: this.$t('btnContinue'),
          cancelButtonText: this.$t('btnCancel'),
        })
          .then(() => {
            // on confirm
            this.$refs.swapConfirm.show()
            return
          })
          .catch(() => {
            // on cancel
            return
          })
      }

      this.$refs.swapConfirm.show()
      return
    },
    async exchangeTokens() {
      if (this.fromToken && this.toToken) {
        if (this.fromToken.mainNetwork === this.toToken.mainNetwork) {
          ;[this.fromToken, this.toToken] = [this.toToken, this.fromToken]
        } else if (
          (this.fromToken.mainNetwork === 'NFT' &&
            this.toToken.mainNetwork === 'ETH') ||
          (this.fromToken.mainNetwork === 'ETH' &&
            this.toToken.mainNetwork === 'NFT')
        ) {
          const from = this.fromToken
          const to = this.toToken
          if (to.mainNetwork === 'NFT') {
            const asset = await getNFTAsset(to, 'from')
            to.asset = asset
          } else {
            const asset = await getNFTAsset(from, 'to')
            from.asset = asset
          }
          this.$store.commit('setFromToken', to)
          this.$store.commit('setToToken', from)
          if (this.fromToken.mainNetwork === 'NFT') {
            this.$store.commit('setChainId', parseInt(10086) + '')
          } else {
            this.$store.commit('setChainId', parseInt(1) + '')
          }
        } else if (
          this.fromToken &&
          this.toToken &&
          this.fromToken.mainNetwork !== this.toToken.mainNetwork
        ) {
          Notify({
            color: '#ad0000',
            background: '#ffe1e1',
            message: this.$t('changeChainIdTip'),
          })
        }
      } else {
        if (
          !this.fromToken &&
          this.getChainIdName === this.toToken.mainNetwork
        ) {
          ;[this.fromToken, this.toToken] = [this.toToken, this.fromToken]
        }
      }
      //if (!this.fromToken || !this.toToken) return
      // if (this.fromToken && this.toToken && this.fromToken.mainNetwork === this.toToken.mainNetwork) {
      //   ;[this.fromToken, this.toToken] = [this.toToken, this.fromToken]
      // } else if(this.fromToken && this.toToken && this.fromToken.mainNetwork !== this.toToken.mainNetwork) {
      //   Notify({color: '#ad0000',background: '#ffe1e1', message: this.$t('changeChainIdTip') })
      // } else if(){

      // }
    },
    comfirm(_b) {
      this.$refs.order.show(_b)
    },
  },
}
</script>
<style lang="scss" scoped>
.trade {
  box-sizing: border-box;
  width: 100%;
  position: relative;
  z-index: 10;
  background: #ffffff;
  box-shadow: 0px 9px 12px 0px rgba(234, 242, 255, 0.15);
  border-radius: 30px 30px 30px 30px;
  top: -1px;
  &.border {
    border-radius: 30px;
  }
  // padding: 10px 0 10px;
  // display: flex;
  // justify-content: center;
  .swap-content {
    box-sizing: border-box;
    width: 100%;
    position: relative;
    border-radius: 9px;
    padding: 20px;
    .trade-boxs {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      .icon {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 47px;
        left: calc(50% - 20px);
      }
      .iconM {
        width: 29px;
        height: 29px;
        position: absolute;
        top: 36px;
        left: calc(50% - 15px);
      }
      .trade-box {
        flex: 1;
        max-width: calc(50% - 18px);
      }
    }
    .line {
      width: 95%;
      margin: 20px auto;
      min-width: 300px;
      height: 1px;
      background: #1d3354;
    }
    .fee {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 20px;
      .left {
        display: flex;
        justify-content: flex-start;
        .estimated-fee {
          font-size: 10px;
          font-family: Poppins-Regular, Poppins;
          font-weight: 400;
          color: #aab0c8;
        }
        img {
          width: 20px;
          height: 20px;
          margin: 0 5px;
        }
      }
      .right {
        display: flex;
        justify-content: flex-end;
        .coin {
          font-size: 10px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #ffffff;
          margin: 0 5px;
        }
      }
    }

    .btns {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .btn {
        color: #fff;
        flex: 1;
        // margin: 20px 20px 0;
        margin-top: 0.277rem;
        font-size: 0.37rem;
        line-height: 1.259rem;
        border-radius: 1.859rem;
        height: 1.259rem;
        border-radius: 0.37rem;
        cursor: pointer;
        &.gray {
          background: #21314e !important;
          color: #aaa;
        }
      }
      // .btnM {
      //   color: #fff;
      //   flex: 1;
      //   // margin: 20px 20px 0;
      //   margin-top: 15px;
      //   font-size: 20px;
      //   line-height: 53px;
      //   border-radius: 100px;
      //   height: 53px;
      //   border-radius: 20px;
      //   cursor: pointer;
      //   &.gray {
      //     background: #21314e !important;
      //     color: #aaa;
      //   }
      // }
    }
  }
}
</style>
<style lang="scss">
.atooltip.el-tooltip__popper[x-placement^='top'] .popper__arrow {
  border-top-color: rgba(5, 22, 50, 0.93);
}
.atooltip.el-tooltip__popper[x-placement^='top'] .popper__arrow:after {
  border-top-color: rgba(5, 22, 50, 0.93);
}
.atooltip {
  background: rgba(5, 22, 50, 0.93) !important;
}
.el-tooltip__popper {
  max-width: 40% !important; //宽度可根据自己需要进行设置
  line-height: 15px !important;
  letter-spacing: 1px;
}
.approving {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
