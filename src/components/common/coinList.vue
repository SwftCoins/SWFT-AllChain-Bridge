<script>
import DialogContent from './dialog'
import { supportNetWork } from '../../config'
import { Toast, Notify, Dialog } from 'vant'
import VirtualList from 'vue-virtual-scroll-list'
import item from './item'
import getAllBalance from '../../utils/getAllBalance'
import BigNumber from 'bignumber.js'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import getNFTAsset from '../../utils/getNFTAsset'
import getTronBalance from '../../utils/getTronBalance'
import baseApi from '../../api/baseApi'
import tronApi from '../../api/BaseGeneralApi'

let currentChain = ''
let tp = null
let isTP = false
try {
  tp = require('tp-js-sdk')
  isTP = tp.isConnected()
} catch (error) {
  console.log(error)
}
export default {
  name: 'CoinList',
  components: {
    DialogContent,
    'virtual-list': VirtualList,
    item,
  },
  props: {
    type: {
      type: String,
      default: 'from',
    },
  },
  data() {
    return {
      search: '',
      activeNetwork: '',
      timer: null,
      width: '330px',
      toShowChain:
        '[BTC, ETH, BSC, HECO, OKExChain,ARB, TT, TRON, Polkadot, KSM, EOS, POLYGON, IOST, BNB, FTM, AVAXC,SOL,LUNA,XDC,KLAY, XRP,CRU,CELO,ORC,SGB,HPB,CRONOS,AME,ECH,CUBE,GNOSIS]',
      //supportStr: 'ETH,BSC,HECO,POLYGON,TRX,DOT',
      supportStr:
        'ETH,BSC,HECO,POLYGON,Polkadot,OKExChain,ARB,TT,TRON, FTM,AVAXC,SOL, LUNA, BTC, XDC,KLAY, XRP,CRU,CELO,EOS,ORC,SGB,HPB,CRONOS,AME,ECH,CUBE,GNOSIS',
      allAccountsSS58: [],
      balanceLoading: true,
    }
  },
  watch: {
    getChainIdName(val, old) {
      if (this.type === 'from') {
        this.ChainIdNameChangeHandle(val)
        if (old) {
          this.openEvent()
        }
      }
    },
  },
  created() {
    // 币种刷新
    // this.getCoinList();
    // 定时器循环获取余额
    // setInterval(() => {
    //   this.getBalance();
    // }, 1000);
    this.$bus.on('chooseCoinHandle', this.choiceCoin)
  },
  beforeDestroy() {
    this.$bus.off('chooseCoinHandle', this.choiceCoin)
  },
  computed: {
    tabActive: {
      get() {
        return this.$store.state.tabActive
      },
    },
    connectType() {
      return this.$store.state.wallet.connectType
    },
    currentCoin() {
      if (this.type === 'from') {
        return this.$store.state.fromToken
      } else {
        return this.$store.state.toToken
      }
    },
    otherCoin() {
      if (this.type === 'to') {
        return this.$store.state.fromToken
      } else {
        return this.$store.state.toToken
      }
    },
    getChainIdName: {
      get() {
        if (this.type === 'from') {
          return this.$store.getters.getChainIdName
        } else {
          return this.activeNetwork
        }
      },
      set(val) {},
    },
    tokens() {
      // if (!this.otherCoin) {
      //   return [];
      // }
      const coinList = this.$store.state.coinList
      if (!coinList) {
        return
      }
      let noSupportCoin =
        this.otherCoin && this.otherCoin.noSupportCoin
          ? this.otherCoin.noSupportCoin.split(',')
          : []
      if (!noSupportCoin || !noSupportCoin.length) {
        noSupportCoin = []
      }
      const list = coinList.filter((e) => {
        if (
          (!noSupportCoin.includes(e.coinCode) ||
            (this.type === 'from' &&
              this.otherCoin &&
              e.coinCode === this.otherCoin.coinCode)) &&
          e.isSupportAdvanced === 'Y'
        ) {
          //
          return e
        }
      })
      const arr = []
      list.forEach((e) => {
        let netWork =
          (e.mainNetwork == 'DOT'
            ? 'Polkadot'
            : e.mainNetwork == 'TRX'
            ? 'TRON'
            : e.mainNetwork) || e.coinCode
        // 存币列表暂时支持ETH，BSC，HECO,POLYGON,DOT,TT,ARB,FTM ,AVAXC,ORC
        let isSupport = supportNetWork.some((e) => {
          if (e.netWork === netWork) {
            return true
          }
        })
        if (!isSupport && this.type === 'from') {
          return
        }
        let obj = arr.find((a) => {
          if (a.netWork === netWork && this.type === 'from') {
            return a
          }
          if (this.type === 'to' && a.netWork === netWork) {
            return a
          }
        })
        if (!obj) {
          if (this.toShowChain.indexOf(netWork) == -1) {
            return
          } else {
            arr.push({
              netWork,
              list: [e],
            })
          }
        } else {
          obj.list.push(e)
        }
        if (obj) {
          obj.list = this.coinSort(obj.list)
        }
      })
      //判断NFT 是否存在并添加
      // // const NFTList = this.$store.state.NFTList
      // if (NFTList) {
      //   const obj = {
      //     netWork: 'NFT',
      //     list: NFTList,
      //   }
      //   arr.push(obj)
      // }
      const supportArr = [
        'GNOSIS',
        'CUBE',
        'ECH',
        'AME',
        'CRONOS',
        'HPB',
        'SGB',
        'ORC',
        'EOS',
        'CRU',
        'XRP',
        'XDC',
        'BTC',
        'LUNA',
        'SOL',
        'AVAXC',
        'KLAY',
        'FTM',
        'TRON',
        'CELO',
        'TT',
        'OKExChain',
        'Polkadot',
        'POLYGON',
        'ARB',
        'HECO',
        'BSC',
        'ETH',
      ]
      arr.sort((next, prev) => {
        return (
          supportArr.indexOf(prev.netWork) - supportArr.indexOf(next.netWork)
        )
      })
      if (this.type === 'from') {
        this.$store.commit('setCoinListChain', arr)
      }
      return arr
    },
    coinList() {
      const coinList = this.$store.state.coinList
      if (!coinList) {
        return
      }
      let noSupportCoin =
        this.otherCoin && this.otherCoin.noSupportCoin
          ? this.otherCoin.noSupportCoin.split(',')
          : []
      let list = coinList.filter((e) => {
        if (!noSupportCoin.includes(e.coinCode)) {
          return e
        }
      })
      if (this.getChainIdName) {
        const obj = this.tokens.find((e) => {
          if (e.netWork === this.getChainIdName) {
            return e
          }
        })
        list = obj ? obj.list : []
      } else {
        if (this.type === 'from') {
          let arr = []
          this.tokens.forEach((e) => {
            const ishas = supportNetWork.some((netWork) => {
              if (netWork.netWork === e.netWork) {
                return true
              }
            })
            if (ishas) {
              arr.push(e.list)
            }
          })
          list = arr.flat(2)
        }
      }
      list = list.filter(
        (item) => item.isSupportAdvanced === 'Y' || item.mainNetwork === 'NFT',
      )
      if (this.search) {
        const arr = []
        list.forEach((e) => {
          const coinAllCode = e.coinAllCode ? e.coinAllCode.toLowerCase() : ''
          const str = e.coinCode ? e.coinCode.toLowerCase() : ''
          const adr = e.contact ? e.contact.toLowerCase() : ''
          const s = this.search.toLowerCase()
          if (
            str.indexOf(s) !== -1 ||
            adr.indexOf(s) !== -1 ||
            coinAllCode.indexOf(s) !== -1
          ) {
            arr.push(e)
          }
        })
        return arr
      } else {
        if (this.getChainIdName === '' || this.getChainIdName === undefined) {
          return list
        } else {
          return this.coinSort(list)
        }
      }
    },
  },
  mounted() {
    this.width = this.isPC ? '504px' : '350px'
    if (this.type === 'from') {
      this.ChainIdNameChangeHandle(this.getChainIdName)
    }
  },
  methods: {
    choiceCoin(item, type) {
      if (type === 'from') {
        if (this.tabActive == 'swap') {
          this.$store.commit('setFromToken', item)
        } else if (this.tabActive == 'NFT') {
          this.$store.commit('setNFTFromToken', item)
        }
      } else {
        if (this.tabActive == 'swap') {
          this.$store.commit('setToToken', item)
        } else if (this.tabActive == 'NFT') {
          this.$store.commit('setNFTToToken', item)
        }
        //NFT 交易只能兑换ETH
        // if (this.$store.state.fromToken.mainNetwork === 'NFT') {
        //   Notify({
        //     type: 'danger',
        //     message: this.$t('onlyEth'),
        //   })
        // } else {
        //   this.$store.commit('setToToken', item)
        // }
      }
      console.log(item)
      this.$refs.dialog.show = false
    },
    // 关闭弹窗事件
    closeEvent() {
      this.search = ''
    },
    compare(property, desc) {
      return function (a, b) {
        var value1 = a[property]
        var value2 = b[property]
        if (desc == true) {
          //排序升序排列
          return value1 - value2
        } else {
          return value2 - value1
        }
      }
    },
    async openEvent() {
      if (
        this.type === 'from' &&
        (this.getChainIdName === 'TT' ||
          this.getChainIdName === 'OKExChain' ||
          this.getChainIdName === 'ETH' ||
          this.getChainIdName === 'BSC' ||
          this.getChainIdName === 'HECO' ||
          this.getChainIdName === 'POLYGON' ||
          this.getChainIdName === 'ARB' ||
          this.getChainIdName === 'AVAXC' ||
          this.getChainIdName === 'XDC' ||
          this.getChainIdName === 'KLAY' ||
          this.getChainIdName === 'CELO' ||
          this.getChainIdName === 'ORC' ||
          this.getChainIdName === 'SGB' ||
          this.getChainIdName === 'HPB' ||
          this.getChainIdName === 'CRONOS' ||
          this.getChainIdName === 'AME' ||
          this.getChainIdName === 'ECH' ||
          this.getChainIdName === 'CUBE' ||
          this.getChainIdName === 'GNOSIS' ||
          this.getChainIdName === 'FTM')
      ) {
        this.balanceLoading = true
        const data = await getAllBalance(this.coinList, this.getChainIdName)
        this.coinList.forEach((item, index) => {
          const balance = new BigNumber(data[index].result)
            .shiftedBy(-(item.coinDecimal != null ? item.coinDecimal : 18))
            .toFixed(6, BigNumber.ROUND_DOWN)
          item.balance = balance > 0 ? balance : 0
        })
        this.balanceLoading = false
      }
      if (this.type === 'from' && this.getChainIdName === 'TRON') {
        this.balanceLoading = true
        const reslt = await getTronBalance()
        let tronWeb = window.tronWeb
        this.coinList.forEach(async (item) => {
          if (item.coinCode === 'TRX') {
            item.balance = Number(tronWeb.fromSun(reslt.balance).toString())
          } else {
            if (item.contact.length > 10) {
              /* const contract = await tronWeb.contract().at(item.contact)
                const trc20 = await contract
                  .balanceOf(this.$store.state.walletTRON)
                  .call() */
              tronApi
                .getTRC20TokenBalance(
                  tronWeb.address.toHex(item.contact),
                  tronWeb.address.toHex(this.$store.state.walletTRON),
                )
                .then((res) => {
                  let bal = res.constant_result[0].replace(/\b(0+)/gi, '')
                  bal = bal === '' ? '0x0' : '0x' + bal
                  const balance = tronWeb
                    .BigNumber(bal)
                    .shiftedBy(
                      -(item.coinDecimal != null ? item.coinDecimal : 18),
                    )
                    .toFixed(6, BigNumber.ROUND_DOWN)
                  item.balance = balance > 0 ? balance : 0
                })
                .catch((err) => {
                  item.balance = 0
                })
            } else {
              let assets = reslt.assetV2
              if (assets && assets.length !== 0) {
                let token = assets.find((e) => {
                  if (e.key === item.contact) {
                    return e
                  }
                })
                if (token) {
                  const balance = new BigNumber(token.value)
                    .shiftedBy(
                      -(item.coinDecimal != null ? item.coinDecimal : 18),
                    )
                    .toFixed(6, BigNumber.ROUND_DOWN)
                  item.balance = balance > 0 ? balance : 0
                } else {
                  item.balance = 0
                }
              } else {
                item.balance = 0
              }
            }
          }
        })
        this.balanceLoading = false
      }
      if (this.type === 'from' && this.getChainIdName === 'XRP') {
        this.balanceLoading = true
        const xrpBalance = await baseApi.getXRPBalance(
          this.$store.state.wallet.address,
        )
        const tokensBalance = await baseApi.getXRPTokensBalance(
          this.$store.state.wallet.address,
        )
        this.coinList.forEach((item) => {
          if (item.coinCode === 'XRP') {
            let balance = 0
            if (xrpBalance.xrpBalance) {
              balance =
                Number(xrpBalance.xrpBalance) - xrpBalance.ownerCount * 2 - 10
            }
            item.balance = Number(balance).toFixed(6) - 0
          } else {
            if (tokensBalance && tokensBalance.length !== 0) {
              let token = tokensBalance.find(
                (e) => e.counterparty === item.contact,
              )
              if (token) {
                const balance = Number(token.value).toFixed(6)
                item.balance = balance > 0 ? balance : 0
              } else {
                item.balance = 0
              }
            }
          }
        })
        this.balanceLoading = false
      }
      // if (this.getChainIdName === 'NFT') {
      //   this.coinList.forEach(async (item) => {
      //     if (item.asset) delete item.asset
      //   })
      // }
    },
    //切换网络
    async choiceNetWork(val) {
      if (
        val &&
        this.supportStr.indexOf(val.netWork) == -1 &&
        this.type === 'from'
      ) {
        Toast(this.$t('comingSoon'))
        return
      }
      // 卖NFT 需要metaMask 连接 过滤
      // if (
      //   this.type === 'from' &&
      //   val.netWork === 'NFT' &&
      //   this.connectType != 'MetaMask'
      // ) {
      //   return Dialog.alert({
      //     message: this.$t('useMetaMask'),
      //     theme: 'round-button',
      //     messageAlign: 'left',
      //     confirmButtonColor: '#277ffa',
      //     className: 'noChangeNetwork',
      //   })
      // }
      //walletConnect 连接拦截切换
      if (val && this.$store.state.isWalletConnect && this.type === 'from') {
        const network = this.$store.getters.getChainIdName
        const activeNetWork = val.netWork
        if (network === activeNetWork) {
          return
        } else {
          //判断支持的链 ETH BSC HECO POLYGON OKExChain TT ARB AVAXC
          if (
            activeNetWork === 'ETH' ||
            activeNetWork === 'BSC' ||
            activeNetWork === 'HECO' ||
            activeNetWork === 'POLYGON' ||
            activeNetWork === 'OKExChain' ||
            activeNetWork === 'TT' ||
            activeNetWork === 'ARB' ||
            activeNetWork === 'AVAXC' ||
            activeNetWork === 'ORC' ||
            activeNetWork === 'FTM'
          ) {
            let tip = ''
            if (this.isPC) {
              tip = this.$t('noChangeNetwork', {
                network: activeNetWork,
              })
            } else {
              tip = this.$t('mbnoChangeNetwork', {
                network: activeNetWork,
              })
            }
            Dialog.alert({
              message: tip,
              theme: 'round-button',
              messageAlign: 'left',
              confirmButtonColor: '#277ffa',
              className: 'noChangeNetwork',
            })
          }
          //不支持的 TRON Polkadot
          else if (
            activeNetWork === 'TRON' ||
            activeNetWork === 'Polkadot' ||
            activeNetWork === 'CRU'
          ) {
            Dialog.alert({
              message: this.$t('noUseNetwork'),
              theme: 'round-button',
              messageAlign: 'left',
              confirmButtonColor: '#277ffa',
              className: 'noChangeNetwork',
            })
          }
          return
        }
      }
      //移动端 tron 链 切换拦截
      if (
        !this.isPC &&
        window.tronWeb &&
        window.tronWeb.defaultAddress.base58 &&
        (isTP || localStorage.getItem('utm_source') === 'tokenpocket') &&
        val.netWork == 'TRON' &&
        this.type === 'from'
      ) {
        Dialog.alert({
          message: this.$t('noUseTronLink', {
            network: val.netWork,
          }),
          theme: 'round-button',
          messageAlign: 'left',
          confirmButtonColor: '#277ffa',
          className: 'noChangeNetwork',
        })
        return
      }
      //移动端EOS拦截
      if (
        !this.isPC &&
        (isTP || localStorage.getItem('utm_source') === 'tokenpocket') &&
        val.netWork == 'EOS' &&
        this.type === 'from'
      ) {
        Dialog.alert({
          message: this.$t('noUseEOS', {
            network: val.netWork,
          }),
          theme: 'round-button',
          messageAlign: 'left',
          confirmButtonColor: '#277ffa',
          className: 'noChangeNetwork',
        })
        return
      }
      if (
        this.connectType === 'LeafWallet' &&
        this.type === 'from' &&
        localStorage.getItem('utm_source') === 'tokenpocket'
      ) {
        Dialog.alert({
          message: this.$t('noUseEOS', {
            network: val.netWork,
          }),
          theme: 'round-button',
          messageAlign: 'left',
          confirmButtonColor: '#277ffa',
          className: 'noChangeNetwork',
        })
        return
      }
      //移动端sol 切换拦截
      if (
        !this.isPC &&
        (isTP || localStorage.getItem('utm_source') === 'tokenpocket') &&
        val.netWork == 'SOL' &&
        this.type === 'from'
      ) {
        Dialog.alert({
          message: this.$t('noUseSolana', {
            network: val.netWork,
          }),
          theme: 'round-button',
          messageAlign: 'left',
          confirmButtonColor: '#277ffa',
          className: 'noChangeNetwork',
        })
        return
      }
      if (
        this.connectType === 'Phantom' &&
        this.type === 'from' &&
        localStorage.getItem('utm_source') === 'tokenpocket'
      ) {
        Dialog.alert({
          message: this.$t('noUseSolana', {
            network: val.netWork,
          }),
          theme: 'round-button',
          messageAlign: 'left',
          confirmButtonColor: '#277ffa',
          className: 'noChangeNetwork',
        })
        return
      }
      //移动端 dot 切换拦截
      const extensions = await web3Enable('my cool dapp')
      const allAccountsSS58 = await web3Accounts({ ss58Format: 0 })
      if (
        !this.isPC &&
        allAccountsSS58.length > 0 &&
        (isTP || localStorage.getItem('utm_source') === 'tokenpocket') &&
        (val.netWork == 'DOT' || val.netWork == 'CRU') &&
        this.type === 'from'
      ) {
        Dialog.alert({
          message: this.$t('noUsePolkadot', {
            network: val.netWork,
          }),
          theme: 'round-button',
          messageAlign: 'left',
          confirmButtonColor: '#277ffa',
          className: 'noChangeNetwork',
        })
        return
      }
      if (
        val &&
        (val.netWork === 'Polkadot' || val.netWork === 'CRU') &&
        this.type === 'from'
      ) {
        this.polkDotFuc(val)
        return
      }
      if (val && val.netWork === 'TRON' && this.type === 'from') {
        this.$bus.emit('checkTronLink')
        return
      }
      if (val && val.netWork === 'SOL' && this.type === 'from') {
        this.$bus.emit('connectPhantom')
        return
      }
      if (val && val.netWork === 'LUNA' && this.type === 'from') {
        console.log('LUNA连接')
        this.$bus.emit('connectTerraStation')
        return
      }
      if (val && val.netWork === 'BTC' && this.type === 'from') {
        console.log('BTC连接')
        this.$bus.emit('connectLiqualityWallet')
        return
      }
      if (val && val.netWork === 'XRP' && this.type === 'from') {
        console.log('XRP连接')
        this.$bus.emit('connectXUMMWallet')
        return
      }
      if (val && val.netWork === 'EOS' && this.type === 'from') {
        console.log('EOS连接')
        this.$bus.emit('connectEOS')
        return
      }
      //Nabox 插件
      if (this.connectType === 'Nabox' && this.type === 'from') {
        if (val.netWork !== this.$store.getters.getChainIdName) {
          Dialog.alert({
            message: this.$t('noUseNabox', {
              network: val.netWork,
            }),
            theme: 'round-button',
            messageAlign: 'left',
            confirmButtonColor: '#277ffa',
            className: 'noChangeNetwork',
          })
        }
        return
      }
      //OKExWallet 插件
      if (this.connectType === 'OKExWallet' && this.type === 'from') {
        const network = this.$store.getters.getChainIdName
        if (network !== val.netWork) {
          supportNetWork.some((e) => {
            if (e.netWork === val.netWork) {
              const chainId = okexchain.networkVersion
              if (e.chainId !== chainId) {
                const newChainId = parseInt(e.chainId)
                okexchain
                  .request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: `0x${newChainId.toString(16)}`,
                        chainName:
                          e.netWork == 'ORC' ? 'Ontology EVM' : e.netWork,
                        nativeCurrency: {
                          name: e.symbol,
                          symbol: e.symbol,
                          decimals: e.decimals,
                        },
                        rpcUrls: [e.rpcUrl],
                        blockExplorerUrls: [e.blockExplorerUrls],
                      },
                    ],
                  })
                  .then(() => {
                    const updateChainId = okexchain.networkVersion
                    if (
                      updateChainId !== this.$store.state.chainId &&
                      window.location.href.indexOf('tokenpocket') != -1
                    ) {
                      this.$store.commit(
                        'setChainId',
                        parseInt(updateChainId) + '',
                      )
                    }
                  })
                  .catch((error) => {
                    console.log(error)
                  })
              }
            }
          })
        }
        return
      }
      // onto 切换
      if (this.connectType === 'ONTO' && this.type === 'from') {
        Notify(
          this.$t('noUseONTO', {
            network: val.netWork,
          }),
        )
        return
      }
      if (this.type === 'from') {
        const network = this.$store.getters.getChainIdName
        // if (val.netWork === 'NFT') {
        //   this.$store.commit('setChainId', parseInt(10086) + '')
        //   return
        // }
        if (network !== val.netWork) {
          const res = await ethereum.request({ method: 'eth_chainId' })
          const networkVersion = parseInt(res)
          if (val.netWork === 'ETH') {
            if (
              val.netWork === 'ETH' &&
              networkVersion == 1 &&
              this.connectType === 'MetaMask'
            ) {
              return this.$store.commit('setChainId', parseInt(1) + '')
            }
            if (this.isPC) {
              if (networkVersion == 1) {
                this.$bus.emit('switchEVMNetWork')
                return
              }
              window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${parseInt('1').toString(16)}` }],
              })
              return
            }
            Notify({
              color: '#ad0000',
              background: '#ffe1e1',
              message: this.$t('network', {
                network_old: network,
                network: val.netWork,
              }),
            })
            return
          }

          supportNetWork.some((e) => {
            if (e.netWork === val.netWork) {
              const chainId = networkVersion
              if (e.chainId !== chainId) {
                const newChainId = parseInt(e.chainId)
                window.ethereum
                  .request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: `0x${newChainId.toString(16)}`,
                        chainName:
                          e.netWork == 'ORC' ? 'Ontology EVM' : e.netWork,
                        nativeCurrency: {
                          name: e.symbol,
                          symbol: e.symbol,
                          decimals: e.decimals,
                        },
                        rpcUrls: [e.rpcUrl],
                        blockExplorerUrls: [e.blockExplorerUrls],
                      },
                    ],
                  })
                  .then(() => {
                    const updateChainId = newChainId
                    if (
                      updateChainId !== this.$store.state.chainId &&
                      window.location.href.indexOf('tokenpocket') != -1
                    ) {
                      this.$store.commit(
                        'setChainId',
                        parseInt(updateChainId) + '',
                      )
                    } else {
                      this.$bus.emit('switchEVMNetWork')
                    }
                  })
              } else {
                this.$bus.emit('switchEVMNetWork')
              }
            }
            //Notify({ type: "danger", message: this.$t("network",{network_old:network,network:val.netWork}) });
          })
        }
      } else {
        this.activeNetwork = (val && val.netWork) || ''
      }
    },
    //调用polkdot钱包插件
    async polkDotFuc(val) {
      if (
        this.$store.state.walletPolkadot === null &&
        (val.netWork === 'Polkadot' || val.netWork === 'CRU')
      ) {
        this.$bus.emit('getPolkadot', val.netWork)
      } else {
        if (val.netWork == 'CRU') {
          this.$store.commit('setChainId', '222')
          this.$bus.emit('checkPolkadot', 'CRU')
        } else {
          this.$store.commit('setChainId', '000')
          this.$bus.emit('checkPolkadot', 'DOT')
        }
        this.$store.commit('setWalletConnectType', 'Polkadot')
      }
    },
    setTokenHandle() {
      const list = this.$store.state.coinList
      const sourceFlag = localStorage.getItem('sourceFlag')
      let token = null
      //这里判断定制化显示目标币
      token = list[0]
      this.$store.commit('setToToken', token)
    },
    ChainIdNameChangeHandle(val) {
      if (!this.tokens) return
      const arr = this.tokens.find((e) => {
        return e.netWork === val
      })
      if (!arr) return
      //过滤自动填入相同币种
      if (this.$store.state.toToken) {
        if (this.$store.state.toToken.coinCode === arr.list[0].coinCode) {
          if (arr.list.length === 1) {
            this.setTokenHandle()
            this.$store.commit('setFromToken', arr.list[0])
            return
          } else {
            this.$store.commit('setFromToken', arr.list[1])
            return
          }
        }
      }
      if (
        this.$store.state.wallet.address != '' ||
        this.$store.state.walletPolkadot != null ||
        this.$store.state.walletTRON != null
      ) {
        console.log(this.$store.state.fromToken)
        // if (this.$store.state.fromToken === null) {
        //这里插入链的母币
        const token = arr.list.filter((item) => item.contact === '')
        this.$store.commit(
          'setFromToken',
          token.length > 0 ? token[0] : arr.list[0],
        )
        // }

        //判断目标币自动填入
        if (this.$store.state.toToken === null) {
          this.setTokenHandle()
        }
      }
    },
    //币种 主币排序
    coinSort(list) {
      let newList = new Array()
      const mb = list.filter((item) => item.contact == '') //母币排在第一个
      const ob = list.filter((item) => item.contact != '')
      // return [...mb, ...ob]
      if (mb.length > 0) {
        newList[0] = mb[0]
      }
      //其他币按余额排序
      ob.sort(this.compare('balance', false))
      newList = [...newList, ...ob]
      return newList
    },
    netWorkName(network) {
      let _network = network
      if (network === 'OKExChain') {
        _network = 'OKC'
      }
      if (network === 'ARB') {
        _network = 'Arbitrum'
      }
      if (network === 'FTM') {
        _network = 'Fantom'
      }
      if (network === 'AVAXC') {
        _network = 'AVAX-C'
      }
      if (network === 'SOL') {
        _network = 'Solana'
      }
      if (network === 'LUNA') {
        _network = 'Terra'
      }
      if (network === 'AVAX') {
        _network = 'Avalanche'
      }
      if (network === 'ORC') {
        _network = 'Ontology'
      }
      return _network
    },
  },
  render() {
    if (this.isPC) {
      return (
        <DialogContent
          ref="dialog"
          width={this.width}
          onclose={this.closeEvent}
          onopen={this.openEvent}
        >
          <div class="searchMaxPC">
            <input
              class="search"
              placeholder={this.$t('search')}
              v-model={this.search}
            />
            <svg
              t="1618546697328"
              class="search_icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="1109"
              width="200"
              height="200"
            >
              <path
                d="M797.0048 857.2928l60.8-60.7744 71.9104 72.32a21.504 21.504 0 0 1-0.0512 30.336l-30.3872 30.4128a21.504 21.504 0 0 1-30.464-0.0512l-71.808-72.2432z"
                fill="#000000"
                p-id="1110"
              ></path>
              <path
                d="M506.624 76.8C269.2352 76.8 76.8 269.2352 76.8 506.624s192.4352 429.824 429.824 429.824 429.824-192.4352 429.824-429.824S744.0128 76.8 506.624 76.8z m0 85.9648c189.9008 0 343.8592 153.9584 343.8592 343.8592S696.5248 850.4832 506.624 850.4832 162.7648 696.5248 162.7648 506.624 316.7232 162.7648 506.624 162.7648z"
                fill="#000000"
                p-id="1111"
              ></path>
            </svg>
          </div>
          <div class="coinFlexPC">
            <div class="network">
              <ul>
                {this.type === 'to' ? (
                  <li
                    onclick={() => {
                      this.choiceNetWork()
                    }}
                    class={this.getChainIdName ? '' : 'active themeBg'}
                  >
                    {this.$t('allCode')}
                  </li>
                ) : (
                  ''
                )}
                {this.tokens.length > 0
                  ? this.tokens.map((e) => {
                      if (this.type === 'to') {
                        return (
                          <li
                            class={
                              this.getChainIdName === e.netWork
                                ? 'active themeBg'
                                : ''
                            }
                            onclick={() => {
                              this.choiceNetWork(e)
                            }}
                          >
                            {this.netWorkName(e.netWork)}
                            {this.netWorkName(e.netWork) == 'Ontology' ? (
                              <div>EVM</div>
                            ) : (
                              ''
                            )}
                          </li>
                        )
                      } else {
                        return (
                          <li
                            class={
                              this.getChainIdName === e.netWork &&
                              e.chainId !== ''
                                ? 'active themeBg'
                                : this.getChainIdName !== e.netWork &&
                                  this.supportStr.indexOf(e.netWork) == -1
                                ? 'notSupport'
                                : 'defultList'
                            }
                            onclick={() => {
                              this.choiceNetWork(e)
                            }}
                          >
                            {this.netWorkName(e.netWork)}
                            {this.netWorkName(e.netWork) == 'Ontology' ? (
                              <div>EVM</div>
                            ) : (
                              ''
                            )}
                          </li>
                        )
                      }
                    })
                  : ''}
              </ul>
            </div>
            <div class="line"></div>
            <div class="list">
              {this.coinList ? (
                this.coinList.map((e) => {
                  return (
                    <item
                      currentCoin={this.currentCoin}
                      type={this.type}
                      balanceLoading={this.balanceLoading}
                      source={e}
                      key={e.contact + e.coinCode}
                    />
                  )
                })
              ) : this.coinList && this.getChainIdName === 'NFT' ? (
                <virtual-list
                  class="VirtualList"
                  style=" height: 100%; overflow-y: auto; "
                  data-key="symbol"
                  data-sources={this.coinList}
                  data-component={item}
                  estimate-size={20}
                  keeps={20}
                  extra-props={{
                    currentCoin: this.currentCoin,
                    type: this.type,
                  }}
                />
              ) : (
                ''
              )}
            </div>
          </div>
        </DialogContent>
      )
    } else {
      return (
        <DialogContent
          ref="dialog"
          width={this.width}
          onclose={this.closeEvent}
          onopen={this.openEvent}
        >
          <div class="searchMaxM">
            <input
              class="search"
              placeholder={this.$t('search')}
              v-model={this.search}
            />
            <svg
              t="1618546697328"
              class="search_icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="1109"
              width="200"
              height="200"
            >
              <path
                d="M797.0048 857.2928l60.8-60.7744 71.9104 72.32a21.504 21.504 0 0 1-0.0512 30.336l-30.3872 30.4128a21.504 21.504 0 0 1-30.464-0.0512l-71.808-72.2432z"
                fill="#000000"
                p-id="1110"
              ></path>
              <path
                d="M506.624 76.8C269.2352 76.8 76.8 269.2352 76.8 506.624s192.4352 429.824 429.824 429.824 429.824-192.4352 429.824-429.824S744.0128 76.8 506.624 76.8z m0 85.9648c189.9008 0 343.8592 153.9584 343.8592 343.8592S696.5248 850.4832 506.624 850.4832 162.7648 696.5248 162.7648 506.624 316.7232 162.7648 506.624 162.7648z"
                fill="#000000"
                p-id="1111"
              ></path>
            </svg>
          </div>
          <div class="coinFlexM">
            <div class="network">
              <ul>
                {this.type === 'to' ? (
                  <li
                    onclick={() => {
                      this.choiceNetWork()
                    }}
                    class={this.getChainIdName ? '' : 'active themeBg'}
                  >
                    {this.$t('allCode')}
                  </li>
                ) : (
                  ''
                )}
                {this.tokens.length > 0
                  ? this.tokens.map((e) => {
                      if (this.type === 'to') {
                        return (
                          <li
                            class={
                              this.getChainIdName === e.netWork
                                ? 'active themeBg'
                                : ''
                            }
                            onclick={() => {
                              this.choiceNetWork(e)
                            }}
                          >
                            {this.netWorkName(e.netWork)}
                            {this.netWorkName(e.netWork) == 'Ontology' ? (
                              <div>EVM</div>
                            ) : (
                              ''
                            )}
                          </li>
                        )
                      } else {
                        return (
                          <li
                            class={
                              this.getChainIdName === e.netWork &&
                              e.chainId !== ''
                                ? 'active themeBg'
                                : this.getChainIdName !== e.netWork &&
                                  this.supportStr.indexOf(e.netWork) == -1
                                ? 'notSupport'
                                : 'defultList'
                            }
                            onclick={() => {
                              this.choiceNetWork(e)
                            }}
                          >
                            {this.netWorkName(e.netWork)}
                            {this.netWorkName(e.netWork) == 'Ontology' ? (
                              <div>EVM</div>
                            ) : (
                              ''
                            )}
                          </li>
                        )
                      }
                    })
                  : ''}
              </ul>
            </div>
            <div class="line"></div>
            <div class="list">
              {this.coinList ? (
                this.coinList.map((e) => {
                  return (
                    <item
                      currentCoin={this.currentCoin}
                      type={this.type}
                      balanceLoading={this.balanceLoading}
                      source={e}
                      key={e.contact + e.coinCode}
                    />
                  )
                })
              ) : this.coinList ? (
                <virtual-list
                  class="VirtualList"
                  style=" height: 100%; overflow-y: auto; "
                  data-key="symbol"
                  data-sources={this.coinList}
                  data-component={item}
                  estimate-size={20}
                  keeps={20}
                  extra-props={{
                    currentCoin: this.currentCoin,
                    type: this.type,
                  }}
                />
              ) : (
                ''
              )}
            </div>
          </div>
        </DialogContent>
      )
    }
  },
}
</script>
<style lang="scss" scoped>
.noclick {
  display: none !important;
}
p {
  margin: 0;
}

.searchMaxPC {
  position: relative;
  .search {
    box-sizing: border-box;
    // border: 1px solid rgba(187, 187, 187, 100);
    width: 100%;
    position: relative;
    padding-left: 48px;
    border-radius: 10px;
    font-size: 16px;
    height: 48px;
    background: #f9fafb;
    border-radius: 22px;
    // box-shadow: 0 0 3px 0 #eee;
    border: 1px solid rgba(0, 0, 0, 0.06);
    font-family: Poppins-Medium, Poppins;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    outline: none;
    -webkit-appearance: none;
  }
  .search_icon {
    position: absolute;
    top: 10px;
    left: 15px;
    width: 25px;
    height: 25px;
    color: #000000;
  }
}
.searchMaxM {
  position: relative;
  .search {
    box-sizing: border-box;
    // border: 1px solid rgba(187, 187, 187, 100);
    width: 100%;
    position: relative;
    padding-left: 38px;
    border-radius: 10px;
    font-size: 16px;
    height: 38px;
    background: #f9fafb;
    border-radius: 22px;
    // box-shadow: 0 0 3px 0 #eee;
    border: 1px solid rgba(0, 0, 0, 0.06);
    font-family: Poppins-Medium, Poppins;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    outline: none;
    -webkit-appearance: none;
  }
  .search_icon {
    position: absolute;
    top: 10px;
    left: 15px;
    width: 15px;
    height: 15px;
    color: #000000;
  }
}
.coinFlexPC {
  width: 100%;
  height: 432px;
  margin-top: 22px;
  display: flex;
  justify-content: flex-start;
  .network {
    overflow: auto;
    white-space: nowrap;
    width: 120px;
    height: calc(100%);
    ul {
      li {
        width: 76px;
        padding: 4px 12px;
        line-height: 18px;
        border-radius: 4px;
        margin-bottom: 14px;
        background: #f1f3f5;
        color: #9ea0a5;
        font-weight: bold;
        cursor: pointer;
        font-size: 0.25rem;
        &.active {
          color: #fff;
        }
        &.defultList {
          color: #9ea0a5;
        }
        &.notSupport {
          color: #b8bfcf;
        }
      }
    }
  }
  .line {
    width: 4px;
    height: calc(100%);
    background-color: #f9fafb;
    margin-right: 20px;
  }
  .list {
    width: 300px;
    height: 452px;
    overflow: hidden;
    overflow-y: auto;
    ul {
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding: 5px 0;
        border-radius: 2px;
        // border-bottom: 1px solid #eee;
        color: #8f98ae;
        .left {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          img {
            width: 35px;
            height: 35px;
            margin-right: 15px;
          }
          .coin {
            text-align: left;
            font-family: Poppins-SemiBold, Poppins;
            font-size: 0.296rem;
            span {
              width: 100%;
              display: inherit;
              font-size: 10px;
              color: #8f98ae;
              font-family: Poppins-Regular, Poppins;
            }
          }
        }
        .right {
          text-align: right;
          svg {
            width: 15px;
            height: 15px;
          }
        }
      }
      li {
        &.active {
          // background: #f5f6f7;
          color: #000;
        }
      }
      li:hover {
        // background: #f5f6f7;
        color: #000;
        box-shadow: 0 0 3px 0 #eee;
      }
    }
  }
}
.coinFlexM {
  width: 100%;
  height: 350px;
  margin-top: 15px;
  display: flex;
  justify-content: flex-start;
  font-size: 12px;
  .network {
    overflow: auto;
    white-space: nowrap;
    width: 82px;
    height: calc(100%);
    ul {
      li {
        width: 80px;
        padding: 4px 0;
        line-height: 18px;
        border-radius: 4px;
        margin-bottom: 10px;
        background: #f1f3f5;
        color: #9ea0a5;
        font-weight: bold;
        cursor: pointer;
        &.active {
          color: #fff;
        }
        &.notSupport {
          color: #b8bfcf;
        }
      }
    }
  }
  .line {
    width: 4px;
    height: calc(100%);
    background-color: #f9fafb;
    margin: 0 5px;
  }
  .list {
    width: 200px;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    ul {
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding: 5px 0;
        border-radius: 2px;
        // border-bottom: 1px solid #eee;
        color: #8f98ae;
        .left {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          img {
            width: 35px;
            height: 35px;
            margin-right: 15px;
          }
          .coin {
            text-align: left;
            font-family: Poppins-SemiBold, Poppins;
            span {
              width: 100%;
              display: inherit;
              font-size: 10px;
              color: #8f98ae;
              font-family: Poppins-Regular, Poppins;
            }
          }
        }
        .right {
          text-align: right;
          svg {
            width: 15px;
            height: 15px;
          }
        }
      }
      li {
        &.active {
          // background: #f5f6f7;
          color: #000;
        }
      }
      li:hover {
        // background: #f5f6f7;
        color: #000;
        box-shadow: 0 0 3px 0 #eee;
      }
    }
  }
}
.list::-webkit-scrollbar,
.VirtualList::-webkit-scrollbar {
  display: none !important;
}
</style>
