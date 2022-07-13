<template>
  <div>
    <DialogContent ref="dialog" :width="isPC ? '503px' : '95%'">
      <div class="content" :class="isPC ? '' : 'mbcontent'">
        <div class="title">{{ $t('choseWallet') }}</div>
        <div class="tip">{{ $t('plsLinkWallet') }}</div>
        <ul class="wallets">
          <li
            v-for="(item, index) in wallets"
            :key="index"
            class="wallet border-box"
            :class="wallet === item.name ? 'active' : ''"
            @click.stop="choiceWallets(item.name)"
          >
            <div class="left">
              <svg class="icon wallet-icon" aria-hidden="true">
                <use :xlink:href="'#icon-' + item.name"></use>
              </svg>
              <div class="name">
                {{
                  item.name == 'DOT' || item.name == 'CRU'
                    ? 'polkadot{.js}'
                    : item.name === 'OKExWallet'
                    ? 'OKX Wallet'
                    : item.name
                }}
              </div>
            </div>
            <img
              v-if="wallet === item.name"
              class="choose-icon"
              src="../assets/img/chooseWallet-icon.png"
              alt=""
            />
          </li>
        </ul>
      </div>
    </DialogContent>
    <xummDialog ref="qrcode" />
  </div>
</template>
<script>
import DialogContent from './common/dialog'
import bus from '../eventBus'
import { Notify, Dialog } from 'vant'
import walletConnectHandle from '../utils/walletConnect'
import NaboxConnectHandle from '../utils/naboxConnect'
import OKExWalletConnectHandle from '../utils/OKExWalletConnect'
import PhantomConnectHandle from '../utils/PhantomConnect'
import TerraStationConnectHandle from '../utils/TerraStationConnect'
import BTCWalletConnectHandle from '../utils/BTCWalletConnect'
import XUMMWalletConnetc from '../utils/XUMMWalletConnetc'
import walletList from '../config/walletConfig'
import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import xummDialog from './common/XUMMDialog.vue'
import EOSMethods from '../utils/eosMethods'
import ONTOConnectHandle from '../utils/ONTOConnect'
// const tp = require('tp-js-sdk')
let currentChain = ''
let tp = null
let isTP = false
try {
  tp = require('tp-js-sdk')
  isTP = tp.isConnected()
} catch (error) {
  console.log(error)
}
// const isTP = tp.isConnected()

export default {
  name: 'ConnectWallet',
  components: {
    DialogContent,
    xummDialog,
  },
  data() {
    return {
      wallet: '',
      wallets: [],
      inval: null,
      sourceFlag: '',
    }
  },
  created() {
    this.sourceFlag = localStorage.getItem('sourceFlag')
    if (this.sourceFlag === 'bridgers') {
      this.wallets = walletList.filter((item) => item.isEVM)
    } else {
      this.wallets = walletList
    }
    if (!isTP || localStorage.getItem('utm_source') !== 'tokenpocket') {
      this.autoConnectWallet()
    }
  },
  async mounted() {
    bus.$on('getMetaMask', () => {
      this.show()
    })
    this.$bus.on('checkTronLink', () => {
      this.checkTronLink()
    })
    this.$bus.on('switchEVMNetWork', () => {
      this.getMetaMask()
    })
    this.$bus.on('getPolkadot', (val) => {
      this.polkadotWallet(val)
    })
    this.$bus.on('PolkadotWallet', (val) => {
      this.wallet = val
    })
    this.$bus.on('disConnect', this.disConnect)
    this.$bus.on('connectPhantom', this.PhantomConnect)
    this.$bus.on('connectTerraStation', this.TerraStationConnect)
    this.$bus.on('connectLiqualityWallet', this.connectLiqualityWallet)
    this.$bus.on('connectXUMMWallet', this.connectXUMMWallet)
    this.$bus.on('connectEOS', this.connectEOSWallet)
  },
  methods: {
    async choiceWallets(wallet, auto) {
      if (isTP) {
        const currentChainData = await tp.getCurrentWallet()
        currentChain = currentChainData.data.blockchain
        if (
          !this.isPC &&
          window.tronWeb &&
          window.tronWeb.defaultAddress.base58 &&
          wallet !== 'TronLink' &&
          currentChain == 'tron'
        ) {
          Dialog.alert({
            message: this.$t('useTronLink'),
            theme: 'round-button',
            messageAlign: 'left',
            confirmButtonColor: '#277ffa',
            className: 'noChangeNetwork',
          })
          return
        }

        if (
          !this.isPC &&
          wallet !== 'DOT' &&
          wallet !== 'CRU' &&
          (currentChain == 'dot' || currentChain == 'cru')
        ) {
          const extensions = await web3Enable('my cool dapp')
          const allAccountsSS58 = await web3Accounts({ ss58Format: 0 })
          if (allAccountsSS58.length > 0) {
            Dialog.alert({
              message: this.$t('useDot'),
              theme: 'round-button',
              messageAlign: 'left',
              confirmButtonColor: '#277ffa',
              className: 'noChangeNetwork',
            })
          }
          return
        }
        if (!this.isPC && wallet !== 'Phantom' && currentChain == '27') {
          Dialog.alert({
            message: this.$t('usePhantom'),
            theme: 'round-button',
            messageAlign: 'left',
            confirmButtonColor: '#277ffa',
            className: 'noChangeNetwork',
          })

          return
        }
      }
      switch (wallet) {
        case 'TronLink':
          this.checkTronLink()
          break
        case 'walletConnect':
          if (this.$refs.dialog) {
            this.$refs.dialog.show = false
          }
          walletConnectHandle(this, auto)
          break
        case 'Nabox':
          NaboxConnectHandle(this)
          break
        case 'OKExWallet':
          OKExWalletConnectHandle(this)
          break
        case 'Phantom':
          PhantomConnectHandle(this)
          break
        case 'TerraStation':
          TerraStationConnectHandle(this)
          break
        case 'LiqualityWallet':
          BTCWalletConnectHandle(this)
          break
        case 'DOT':
          this.polkadotWallet(wallet)
          break
        case 'CRU':
          this.polkadotWallet(wallet)
          break
        case 'XUMM':
          this.connectXUMMWallet()
          break
        case 'LeafWallet':
          this.connectEOSWallet()
          break
        case 'ONTO':
          if (this.isPC) {
            ONTOConnectHandle(this, wallet)
          } else {
            this.getMetaMask(wallet)
          }
          break
        default:
          this.getMetaMask(wallet)
          break
      }
    },
    async polkadotWallet(val) {
      if (
        currentChain !== 'dot' &&
        currentChain !== 'cru' &&
        currentChain !== ''
      ) {
        Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('switchDotChian', {
            chainName: 'Polkadot',
            walletExtension: 'polkadot.js extension',
          }),
        })
        return
      }
      const extensions = await web3Enable('my cool dapp')
      if (extensions.length === 0) {
        //判断是否安装polkdot钱包插件
        if (this.isPC) {
          Notify({
            color: '#ad0000',
            background: '#ffe1e1',
            message: this.$t('notInstallMetamask', {
              wallet: 'polkadot.js extension',
            }),
          })
        } else {
          Notify({
            color: '#ad0000',
            background: '#ffe1e1',
            message: this.$t('switchDotChian', {
              chainName: 'Polkadot',
              walletExtension: 'polkadot.js extension',
            }),
          })
        }

        return
      }
      //获取钱包上的所有账户
      const allAccountsSS58 = await web3Accounts({ ss58Format: 0 })
      const allAccountsSS58CRU = await web3Accounts({ ss58Format: 66 })
      const allAccounts = await web3Accounts()
      // if (this.$store.state.walletPolkadot == null) {
      // if (
      //   !this.$store.state.walletPolkadot &&
      //   this.$store.state.chainId == '000'
      // ) {
      const obj = {
        addrSS58: allAccountsSS58,
        addrSS58CRU: allAccountsSS58CRU,
        addr: allAccounts,
        network: val,
      }
      this.$refs.dialog.show = false
      if (allAccountsSS58.length === 0) {
        Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('plsCreateAcct'),
        })
      } else {
        this.$bus.emit('openAcct', obj)
      }

      return
      // }
      // }
    },
    checkTronLink() {
      //window.hasOwnProperty("tronWeb")
      if (this.wallet === 'TronLink') {
        this.$refs.dialog.show = false
        return
      }
      const connectorId = localStorage.getItem('connectorId')
      if (connectorId && connectorId === 'TronLink') {
        this.inval = setInterval(() => {
          if (window && window.tronWeb) {
            //当获取到地址的时候就关掉定时器
            if (window.tronWeb.defaultAddress) {
              window.clearInterval(this.inval)
              this.$store.commit(
                'setWalletTRON',
                window.tronWeb.defaultAddress.base58,
              )
              this.$store.commit('setChainId', '0')
              this.$store.commit('setWalletName', 'TronLink')
              this.$store.commit('setWalletConnectType', 'TronLink')
              localStorage.setItem('connectorId', 'TronLink')
              this.wallet = 'TronLink'
              this.$refs.dialog.show = false
            }
          }
        }, 1000)
      } else {
        if (window && window.tronWeb) {
          window.tronWeb.on('addressChanged', (account) => {
            if (account && account.base58) {
              this.$store.commit('c', account.base58)
            }
          })

          if (window.tronWeb.ready && window.tronWeb.defaultAddress.base58) {
            this.disConnect()
            this.$store.commit(
              'setWalletTRON',
              window.tronWeb.defaultAddress.base58,
            )
            this.$store.commit('setChainId', '0')
            this.$store.commit('setWalletName', 'TronLink')
            this.$store.commit('setWalletConnectType', 'TronLink')
            localStorage.setItem('connectorId', 'TronLink')
            this.wallet = 'TronLink'
            this.$refs.dialog.show = false
          } else {
            if (this.isPC) {
              Notify({
                color: '#ad0000',
                background: '#ffe1e1',
                message: this.$t('loginTronLink'),
              })
            } else {
              Notify({
                color: '#ad0000',
                background: '#ffe1e1',
                message: this.$t('switchTronChian'),
              })
            }
          }
        } else {
          if (this.isPC) {
            Notify({
              color: '#ad0000',
              background: '#ffe1e1',
              message: this.$t('notInstallTronLink'),
            })
          } else {
            Notify({
              color: '#ad0000',
              background: '#ffe1e1',
              message: this.$t('switchTronChian'),
            })
          }
        }
      }
    },
    getMetaMask(walletName) {
      if (!walletName) {
        walletName = 'MetaMask'
      }
      if (!window.ethereum) {
        if (isTP || localStorage.getItem('utm_source') === 'tokenpocket') {
          Notify({
            color: '#ad0000',
            background: '#ffe1e1',
            message: this.$t('tpBTCno'),
          })
          this.disConnect()
          this.$refs.dialog.show = false
          return
        }
        Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('notInstallMetamask', {
            wallet: 'MetaMask',
          }),
        })
        return false
      } else {
        if (this.$store.state.isWalletConnect) return
        //监听链变化
        window.ethereum.on('chainChanged', (chainId) => {
          if (
            this.$store.state.wallet.connectType === 'Nabox' ||
            this.$store.state.wallet.connectType === 'OKExWallet' ||
            this.$store.state.wallet.connectType === 'ONTO'
          )
            return
          this.initEVMChain(walletName)
        })
        //监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
          if (this.$store.state.isWalletConnect) return
          if (
            this.$store.state.wallet.connectType === 'Nabox' ||
            this.$store.state.wallet.connectType === 'OKExWallet' ||
            this.$store.state.wallet.connectType === 'ONTO'
          )
            return

          if (!accounts || accounts.length === 0) {
            this.$store.commit('setWalletAddress', '')
          } else {
            this.$store.commit('setWalletAddress', accounts[0])
          }
        })
        this.initEVMChain(walletName)
      }
    },
    initEVMChain(walletName) {
      window.ethereum
        .request({ method: 'eth_requestAccounts', params: [] })
        .then((res) => {
          if (
            (!res || res.length === 0 || res === null) &&
            (isTP || localStorage.getItem('utm_source') === 'tokenpocket')
          ) {
            Notify({
              color: '#ad0000',
              background: '#ffe1e1',
              message: this.$t('tpBTCno'),
            })
            this.$refs.dialog.show = false
            this.disConnect()
            return
          }
          this.wallet = walletName
          // console.log("eth_requestAccounts", res);
          ethereum.request({ method: 'eth_chainId' }).then((res) => {
            if (
              this.$store.state.fromToken &&
              this.$store.state.fromToken.mainNetwork === 'NFT' &&
              parseInt(res) == 1
            ) {
              this.$store.commit('setChainId', parseInt('10086') + '')
            } else {
              this.$store.commit('setChainId', parseInt(res) + '')
            }
          })
          this.$store.commit('setWalletAddress', res[0])
          this.$store.commit('setWalletName', walletName)
          this.$store.commit('setWalletConnectType', 'MetaMask')
          this.$refs.dialog.show = false
          //存储钱包已连接
          localStorage.setItem('connectorId', walletName)
        })
        .catch((error) => {
          if (error.code === 4001) {
            // EIP-1193 userRejectedRequest error
            console.log('error.code ', error.code)
          } else {
            console.error('eth_getBalance', error)
          }
          this.$refs.dialog.show = false
        })
    },
    autoConnectWallet() {
      const connectorId = localStorage.getItem('connectorId')
      if (
        connectorId === null ||
        connectorId === '' ||
        connectorId === undefined ||
        connectorId === 'TronLink' ||
        connectorId === 'DOT' ||
        connectorId === 'CRU' ||
        connectorId === 'XUMM'
      ) {
        localStorage.setItem('connectorId', '')
      } else {
        this.choiceWallets(connectorId, 'auto')
      }
    },
    connectEOSWallet() {
      EOSMethods.eosConnectHandle(this)
    },
    PhantomConnect() {
      PhantomConnectHandle(this)
    },
    TerraStationConnect() {
      TerraStationConnectHandle(this)
    },
    connectLiqualityWallet() {
      BTCWalletConnectHandle(this)
    },
    connectXUMMWallet() {
      XUMMWalletConnetc.XUMMWalletConnetcHandle(this)
    },
    show() {
      this.$refs.dialog.show = true
    },
    close() {
      this.isShow = false
    },
    choosed(val) {
      return this.wallet && this.wallet.name === val
    },
    //断开连接
    disConnect() {
      console.log('监听钱包断开')
      this.wallet = ''
      this.$store.commit('setChainId', null)
      this.$store.commit('setWalletAddress', '')
      this.$store.commit('setWalletPolkadot', null)
      this.$store.commit('setWalletTRON', null)
      this.$store.commit('setWalletName', '')
      this.$store.commit('setWalletConnectType', '')
      this.$store.commit('setInfo', null)
      this.$store.commit('setBalance', 0)
      localStorage.setItem('connectorId', '')
      this.$store.commit('setIsWalletConnect', false)
      const connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org', // Required
        qrcodeModal: QRCodeModal,
      })
      if (connector.connected) {
        connector.killSession()
      }
      //判断Phantom 连接
      if (window.solana && window.solana.isConnected) {
        window.solana.disconnect()
      }
      this.closeWebSocket()
    },
    closeWebSocket() {
      XUMMWalletConnetc.XUMMConnectClose()
    },
  },
  beforeDestroy() {
    this.$bus.off('getPolkadot', this.polkadotWallet)
    this.$bus.off('PolkadotWallet')
    this.$bus.off('disConnect', this.disConnect)
    this.$bus.off('connectPhantom', this.PhantomConnect)
    this.$bus.off('connectTerraStation', this.TerraStationConnect)
    this.$bus.off('connectLiqualityWallet', this.connectLiqualityWallet)
    this.$bus.off('connectEOS', this.connectEOSWallet)
  }, // 生命周期 - 销毁之前
}
</script>

<style lang="scss" scoped>
.content {
  padding: 20px 0;
  &.mbcontent {
    .wallet {
      width: 24%;
      border-radius: 10px;
      padding: 0 12px;
      margin-top: 15px;
      display: flex;
      color: #a1a4b1;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      border: 1px solid #f5f9ff;
      margin-left: 1%;
      .left {
        width: 100%;
        display: flex;
        flex-direction: column;
        // justify-content: flex-start;
        align-items: center;
        .wallet-icon {
          margin-top: 5px;
          width: 28px;
          height: 28px;
        }
        .name {
          font-size: 10px;
          margin: 0 6px;
          font-family: Poppins-Medium;
          transform: scale(0.8);
          margin-bottom: 3px;
        }
      }
      .choose-icon {
        position: absolute;
        top: -1px;
        right: -1px;
        width: 20px;
      }
    }
  }
}
.title {
  text-align: left;
  height: 25px;
  font-size: 18px;
  font-family: Poppins;
  color: #000;
  line-height: 24px;
  font-weight: bold;
}
.tip {
  text-align: left;
  height: 19px;
  font-size: 11px;
  font-family: Poppins-Medium, Poppins;
  font-weight: 500;
  color: #8f98ae;
}
.wallets {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  overflow-y: auto;
  .wallet {
    width: 23%;
    border-radius: 15px;
    padding: 0 12px;
    margin-top: 15px;
    display: flex;
    color: #a1a4b1;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border: 1px solid #f5f9ff;
    margin-left: 2%;
    position: relative;
    overflow: hidden;
    .left {
      width: 100%;
      display: flex;
      flex-direction: column;
      // justify-content: flex-start;
      align-items: center;
      .wallet-icon {
        margin-top: 5px;
        width: 40px;
        height: 40px;
      }
      .name {
        height: 22px;
        font-size: 12px;
        margin: 0 12px;
        font-family: Poppins-Medium;
        line-height: 22px;
        white-space:nowrap;
      }
    }
    .choose-icon {
      position: absolute;
      top: -1px;
      right: -1px;
      width: 25px;
    }
    &.active,
    &:hover {
      color: #494949;
      border: 1px solid #bdd9ff;
      background: #f0f7ff;
    }
    .checked {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
