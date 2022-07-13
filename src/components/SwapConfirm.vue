<template>
  <div>
    <Dialog
      :width="isPC ? '500px' : '90%'"
      ref="dialogConfirm"
      v-if="fromToken && toToken"
      @close="closeOrderDialog"
      @open="openOrderDilog"
    >
      <div class="centerDiv">
        <div class="imgDiv">
          <img src="@/assets/img/swapConfirm.png" alt="" />
        </div>
        <div :class="isPC ? 'pc' : ''" class="content">
          <div class="valDiv">
            <div class="top">
              <img
                :src="`https://transfer.swft.pro/swft-v3/images/coins/${fromToken.coinCode}.png`"
              />
              <div class="info">
                <div class="tip">
                  <span class="span12">{{ $t('transferOut') }}</span>
                  <span class="span16"> {{ fromNumber }} </span
                  ><span class="span14">{{ fromToken.coinCode }}</span>
                </div>
                <div class="addr">
                  <span class="addrCut">{{ cutAddress('from') }}</span>
                  <img
                    src="../assets/img/copy.png"
                    v-clipboard:copy="addrCopy('from')"
                    v-clipboard:success="onCopySuccess"
                    v-clipboard:error="onCopyError"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div class="middle">
              <div class="line"></div>
            </div>
            <div class="bottom">
              <img
                :src="`https://transfer.swft.pro/swft-v3/images/coins/${toToken.coinCode}.png`"
              />
              <div class="info">
                <div class="tip">
                  <span class="span12">{{ $t('expectedText') }}</span
                  ><span class="span16"> {{ toNumber - 0 }} </span
                  ><span class="span14">{{ toToken.coinCode }}</span>
                </div>
                <div class="addr">
                  <span class="addrCut">{{ cutAddress('to') }}</span>
                  <img
                    src="../assets/img/copy.png"
                    v-clipboard:copy="$store.state.address"
                    v-clipboard:success="onCopySuccess"
                    v-clipboard:error="onCopyError"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="rate">
            <div class="left">{{ $t('bridge') }}</div>
            <div class="right" v-if="info">
              <div class="bridge">
                <img :src="info.logoUrl" alt="" />&nbsp;<span>{{
                  info.dex
                }}</span>
              </div>
            </div>
          </div>
          <div class="rate">
            <div class="left">{{ $t('rate') }}</div>
            <div class="right" v-if="info">
              1 {{ fromToken.coinCode }} ≈
              {{ Number(info.instantRate).toFixed(8) - 0 }}
              {{ toToken.coinCode }}
            </div>
          </div>
          <div class="rate">
            <div class="left">
              {{
                info &&
                info.dex !== 'SWFT' &&
                info.dex !== 'bridgers1' &&
                info.dex !== 'bridgers2'
                  ? $t('pathfee')
                  : $t('fee')
              }}
              <img
                @mouseover="tipOpen"
                @click="tipOpen"
                src="../assets/img/tip.png"
                id="tips"
              />
              <Popover
                v-model="showPopover"
                theme="dark"
                trigger="click"
                placement="bottom-start"
                :offset="[-10, 8]"
                :get-container="getContainer"
              >
                <div class="tip-content" v-if="info && info.dex === 'SWFT'">
                  {{ $t('feeTip') }}
                </div>
                <div
                  class="tip-content"
                  v-if="
                    info && info.dex === 'bridgers1' && info.dex === 'bridgers2'
                  "
                >
                  {{ $t('sSwapfeeTip') }}
                </div>
                <div
                  class="tip-content"
                  v-if="
                    info &&
                    info.dex !== 'SWFT' &&
                    info.dex !== 'bridgers1' &&
                    info.dex !== 'bridgers2'
                  "
                >
                  {{ $t('pathfeeTip') }}
                </div>
              </Popover>
            </div>
            <div class="right">
              <span v-if="info">
                <span
                  v-if="
                    info.dex === 'SWFT' ||
                    info.dex === 'bridgers1' ||
                    info.dex === 'bridgers2'
                  "
                  :class="info && info.isDiscount === 'Y' ? 'fee-span' : ''"
                  >{{ info ? info.depositCoinFeeRate * 100 : '' }} %</span
                >
                <span
                  v-if="info.dex === 'bridgers1' || info.dex === 'bridgers2'"
                ></span>
                <span v-else>
                  {{
                    sourceFlag === 'kfi'
                      ? ''
                      : sendGas
                      ? (info.dex === 'SWFT' ? ' + ' : '') +
                        sendGas[0] +
                        ' ' +
                        sendGas[1]
                      : ''
                  }}
                </span>
              </span>
            </div>
          </div>
          <div
            class="rate"
            v-if="info && info.dex === 'bridgers1' && info.dex === 'bridgers2'"
          >
            <div class="left">{{ $t('relayerGasfee') }}</div>
            <div class="right" v-if="info">
              {{ sendGas[0] + ' ' + sendGas[1] }}
            </div>
          </div>
          <div class="received">
            <div class="left">{{ $t('expected') }}</div>
            <div class="right" v-if="info">
              <!-- <template v-if="info.dex === 'SWFT'">
                {{
                  toNumber - (sendGas ? sendGas[0] : 0) > 0
                    ? minusHandle(toNumber, sendGas ? sendGas[0] : 0)
                    : 0
                }}
              </template> -->
              <template>
                {{ toNumber }}
              </template>
              {{ toToken.coinCode }}
            </div>
          </div>
          <div
            class="rate"
            v-if="
              info && (info.dex === 'bridgers1' || info.dex === 'bridgers2')
            "
          >
            <div class="left">
              <span class="title"> {{ $t('estimatedTime') }}</span>
            </div>
            <div class="right" v-if="info">
              <span>
                {{
                  info.estimatedTime == 1
                    ? $t('estimatedTime1')
                    : info.estimatedTime == 2
                    ? $t('estimatedTime2')
                    : $t('estimatedTime3')
                }}
              </span>
            </div>
          </div>
          <div class="buttonDiv">
            <Button
              type="primary"
              @click="exchange"
              :loading="submitStatus"
              :loading-text="$t('confirm')"
              >{{ $t('confirm') }}</Button
            >
            <!-- <button @click="exchange" :disabled="submitStatus">{{ $t("confirm") }}</button> -->
          </div>
        </div>
        <div class="closeIcon">
          <img @click="closeOrderDialog" src="../assets/img/close.png" alt="" />
        </div>
      </div>
    </Dialog>
    <xummDialog ref="qrcode" />
    <Approve ref="approve" @approve="approve" />
  </div>
</template>
<script>
import Dialog from './common/dialog'
import Approve from './Approve'
import baseApi from '../api/baseApi'
import { ethers } from 'ethers'
import erc20Abi from '../config/abis/erc20'
import { Button } from 'vant'
import { Toast, Popover, Notify } from 'vant'
import errorCode from '../utils/language.js'
let provider, signer
if (window.ethereum) {
  provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
  signer = provider.getSigner()
}
//import data from './exchange'
import BigNumber from 'bignumber.js'
const { ApiPromise, WsProvider, Uint8Array } = require('@polkadot/api')
const { typesBundleForPolkadot } = require('@crustio/type-definitions')
import { web3FromAddress, web3FromSource } from '@polkadot/extension-dapp'
import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'
import Web3 from 'web3'
import ETH_erc20 from '../utils/eth-erc20'
// path 发币逻辑代码封装
import pathBridgeMethods from '../utils/pathBridgeMethods'
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram,
} from '@solana/web3.js'
import solTokenSend from '../utils/solTokenExchange'
import TerraExchangeHandle from '../utils/TerraExchange'
import getContract from '../utils/contract'
import xummDialog from './common/XUMMDialog.vue'
import eosMethods from '../utils/eosMethods'
let webSocket

export default {
  name: 'Header',
  components: {
    Dialog,
    Button,
    Popover,
    Approve,
    xummDialog,
  },
  props: {
    sendGas: { type: Array, default: null },
  },
  data() {
    return {
      submitStatus: false,
      showPopover: false,
      tipTimer: null,
      sourceFlag: localStorage.getItem('sourceFlag'),
      txData: null, //兑换数据
      pathBridgeExchangeStatus: false, //对合约授权之后监听是否只执行一次兑换
    }
  },
  created() {
    //Notify({ type: 'success', message: '通知内容' });
  },
  computed: {
    info() {
      return this.$store.state.info
    },
    fromToken() {
      return this.$store.state.fromToken
    },
    toToken() {
      return this.$store.state.toToken
    },
    fromNumber() {
      return this.$store.state.fromNumber
    },
    toNumber() {
      return this.$store.state.toNumber - 0
    },
    connectType() {
      return this.$store.state.wallet.connectType
    },
  },
  methods: {
    minusHandle(num1, num2) {
      return new BigNumber(num1)
        .minus(new BigNumber(num2))
        .toFixed(6, BigNumber.ROUND_DOWN)
    },
    cutAddress(type) {
      let adr = this.$store.state.wallet.address
      if (type === 'from') {
        if (
          this.fromToken.mainNetwork === 'DOT' &&
          this.$store.state.walletPolkadot !== null
        ) {
          adr = this.$store.state.walletPolkadot.addrSS58
        } else if (
          this.fromToken.mainNetwork === 'CRU' &&
          this.$store.state.walletPolkadot !== null
        ) {
          adr = this.$store.state.walletPolkadot.addrSS58CRU
        } else if (
          this.fromToken.mainNetwork === 'TRX' &&
          this.$store.state.walletTRON !== null
        ) {
          adr = this.$store.state.walletTRON
        }
      }
      if (type === 'to') {
        adr = this.$store.state.address
      }
      const beforeAdr = adr.substring(0, 10)
      const afterAdr = adr.substring(adr.length - 10, adr.length)
      if (adr.length > 21) {
        return beforeAdr + '.....' + afterAdr
      } else {
        return adr
      }
    },
    addrCopy(type) {
      let adr = this.$store.state.wallet.address
      if (type === 'from') {
        if (
          this.fromToken.mainNetwork === 'DOT' &&
          this.$store.state.walletPolkadot !== null
        ) {
          adr = this.$store.state.walletPolkadot.addrSS58
        } else if (
          this.fromToken.mainNetwork === 'CRU' &&
          this.$store.state.walletPolkadot !== null
        ) {
          adr = this.$store.state.walletPolkadot.addrSS58CRU
        } else if (
          this.fromToken.mainNetwork === 'TRX' &&
          this.$store.state.walletTRON !== null
        ) {
          adr = this.$store.state.walletTRON
        }
      }

      return adr
    },
    onCopySuccess(val) {
      Toast.success(this.$t('copy_success'))
    },
    onCopyError(val) {
      // this.$message.success("复制失败");
    },
    show() {
      this.$refs.dialogConfirm.show = true
    },
    exchange() {
      //兑换 非 SWFT平台拦截
      if (this.info.dex !== 'SWFT') {
        this.submitStatus = true
        pathBridgeMethods.pathBridgeExchange(this)
        return
      }
      let params = {
        depositCoinCode: this.$store.state.fromToken.coinCode, //存币币种
        receiveCoinCode: this.$store.state.toToken.coinCode, //接收币币种
        depositCoinAmt: this.$store.state.fromNumber, //存币数量
        receiveCoinAmt: this.$store.state.toNumber, //接受币数量
        destinationAddr: this.$store.state.address, //收币地址
        refundAddr: this.$store.state.wallet.address, //退币地址
        // equipmentNo:this.$store.state.wallet.address, //设备编号
        // sourceType:'H5', //设备来源
        // sourceFlag:'widget',//订单创建来源
      }
      //DOT链
      if (
        this.$store.state.fromToken.coinCode == 'DOT' &&
        this.$store.state.fromToken.mainNetwork == 'DOT'
      ) {
        params.refundAddr = this.$store.state.walletPolkadot.addrSS58
      }
      if (
        this.$store.state.fromToken.coinCode == 'CRU' &&
        this.$store.state.fromToken.mainNetwork == 'CRU'
      ) {
        params.refundAddr = this.$store.state.walletPolkadot.addrSS58CRU
      }
      if (this.$store.state.fromToken.mainNetwork === 'TRX') {
        params.refundAddr = this.$store.state.walletTRON
      }
      this.submitStatus = true
      baseApi
        .accountExchange(params)
        .then(async (res) => {
          if (res.resCode == '800') {
            let platformAddr = res.data.platformAddr //系统收币地址
            if (this.fromToken.mainNetwork === 'XDC') {
              //xdc 替换复用地址前缀
              platformAddr = platformAddr.replace(/xdc/, '0x')
            }
            const fromNumber = this.$store.state.fromNumber.toString() //换币数量
            const isWalletConnect = this.$store.state.isWalletConnect
            //WalletConnect兑换
            if (isWalletConnect) {
              return this.walletConnectExchange(platformAddr, fromNumber, res)
            }
            //nabox 兑换
            if (this.connectType === 'Nabox') {
              this.naboxExchange(platformAddr, fromNumber, res)
              return
            }
            //OKExWallet 兑换
            if (this.connectType === 'OKExWallet') {
              this.OKExWalletExchange(platformAddr, fromNumber, res)
              return
            }
            //ONTOWallet 兑换
            if (this.connectType === 'ONTO') {
              this.ONTOExchange(platformAddr, fromNumber, res)
              return
            }
            //metamask 兑换
            if (this.connectType === 'MetaMask') {
              console.log('metamask 兑换')
              this.metaMaskExchange(platformAddr, fromNumber, res)
              return
            }
            //TronLink 兑换
            if (this.connectType === 'TronLink') {
              console.log('tronLink 兑换')
              this.TronLinkExchange(platformAddr, fromNumber, res)
              return
            }
            //Polkadot 兑换
            if (this.connectType === 'Polkadot') {
              console.log('Polkadot 兑换')
              if (
                this.$store.state.balance - this.$store.state.fromNumber >
                1
              ) {
                this.polksdotExchange(res)
              } else {
                const conf = window.confirm(this.$t('dotTip'))
                if (conf) {
                  this.polksdotExchange(res)
                } else {
                  this.submitStatus = false
                }
              }
              return
            }
            //Phantom 兑换
            if (this.connectType === 'Phantom') {
              console.log('Phantom兑换')
              this.phantomExchange(platformAddr, fromNumber, res)
            }
            //Terra Station 兑换
            if (this.connectType === 'TerraStation') {
              console.log('TerraStation兑换')
              this.TerraStationExchange(platformAddr, fromNumber, res)
            }
            // BTC 兑换
            if (this.connectType === 'LiqualityWallet') {
              console.log('LiqualityWallet')
              this.LiqualityWalletExchange(platformAddr, fromNumber, res)
            }
            // xrp链兑换
            if (this.connectType === 'XUMM') {
              console.log('XUMM')
              this.XRPXUMMExchange(res)
            }
            //EOS 兑换
            if (this.connectType === 'LeafWallet') {
              console.log('EOS 链兑换')
              this.EOSExchangeHandle(res, fromNumber)
            }
          } else {
            this.submitStatus = false
            errorCode(res.resCode, this)
          }
        })
        .catch((error) => {
          this.submitStatus = false
        })
    },
    closeWebSocket() {
      if (webSocket) {
        webSocket.close()
      }
    },
    async EOSExchangeHandle(res, fromNumber) {
      const fromToken = this.fromToken
      const result = await eosMethods.EOSExchange(
        res,
        this,
        fromNumber,
        fromToken,
      )
      console.log(result)
      if (!result.transaction_id) {
        //报错
        this.submitStatus = false
        this.$refs.dialogConfirm.show = false
        this.closeOrderDialog()
        if (result.code == 402) {
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        } else if (result.code == 500) {
          if (result.error.code == 3080004) {
            Notify({
              message: this.$t('EOSCPU'),
              color: '#ad0000',
              background: '#ffe1e1',
            })
          }
          if (result.error.code == 3040005) {
            Notify({
              message: this.$t('EOSexpired'),
              color: '#ad0000',
              background: '#ffe1e1',
            })
          }
        } else {
          Notify({
            message: result.message,
            color: '#ad0000',
            background: '#ffe1e1',
          })
        }
        return
      } else {
        const data = {
          from: this.$store.state.wallet.address,
          hash: result.transaction_id,
        }
        this.submitStatus = false
        this.$refs.dialogConfirm.show = false
        this.closeOrderDialog()
        this.modifyTxId(data, res.data.orderId, res)
      }
    },
    //xrp链发币
    XRPXUMMExchange(res) {
      if (res.data.xrpInfo) {
        const info = JSON.parse(res.data.xrpInfo)
        const _this = this
        this.$store.commit('setQRcode', info.refs.qr_png)
        // Create WebSocket connection.
        webSocket = new WebSocket(info.refs.websocket_status)

        // Connection opened
        webSocket.addEventListener('open', function (event) {
          //console.log("message for open", event)
        })

        // Listen for messages
        webSocket.addEventListener('message', function (event) {
          //console.log('Message from server ', event.data);
          const data = JSON.parse(event.data)
          if (data.signed) {
            let uuid = data.payload_uuidv4

            baseApi
              .getXUMMWalletInfo(uuid)
              .then((resInfo) => {
                if (resInfo.resCode === '800') {
                  webSocket.close()
                  const params = {
                    from: _this.$store.state.wallet.address,
                    hash: resInfo.data.info.response.txid,
                  }
                  _this.submitStatus = false
                  _this.$refs.dialogConfirm.show = false
                  _this.$refs.qrcode.dismiss()

                  _this.modifyTxId(params, res.data.orderId, res)
                } else {
                  _this.submitStatus = false
                  _this.$refs.dialogConfirm.show = false
                  _this.$refs.qrcode.dismiss()
                  errorCode(resInfo.resCode, _this)
                }
              })
              .catch((err) => {
                _this.submitStatus = false
                _this.$refs.dialogConfirm.show = false
                _this.closeOrderDialog()
                Notify({
                  message: _this.$t('rejectExchange'),
                  color: '#ad0000',
                  background: '#ffe1e1',
                })
              })
          }
        })

        //this.$refs.dialogConfirm.show = false
        this.$refs.qrcode.show()
      }
    },

    //LiqualityWalletExchange 发币
    async LiqualityWalletExchange(platformAddr, fromNumber, res) {
      await window.bitcoin.enable()
      window.bitcoin
        .request({
          method: 'wallet_sendTransaction',
          params: [
            {
              to: platformAddr,
              value: fromNumber * 10 ** 8,
            },
          ],
        })
        .then((data) => {
          console.log(data)
          const params = {
            from: this.$store.state.wallet.address,
            hash: data.hash,
          }
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          this.modifyTxId(params, res.data.orderId, res)
        })
        .catch((err) => {
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        })
    },
    async walletConnectExchange(platformAddr, fromNumber, res) {
      const fromToken = this.$store.state.fromToken
      // const contract = getContract(fromToken.contact)
      // console.log(contract)
      //walletConnect 兑换
      const connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org', // Required
        qrcodeModal: QRCodeModal,
      })
      console.log('walletConnect 兑换', connector)
      let tx = null
      if (fromToken.contact === '') {
        tx = {
          from: this.$store.state.wallet.address, // Required
          to: platformAddr, // Required (for non contract deployments)
          data: `0x`, // Required
          // gasPrice: "0x02540be400", // Optional
          // gas: "0x9c40", // Optional
          value: `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`, // Optional
        }
      } else {
        web3 = new Web3()
        const ethErc20Contract = new web3.eth.Contract(
          ETH_erc20,
          fromToken.contact,
        )
        console.log('ethErc20Contract:::::', ethErc20Contract.methods)
        console.log(
          this.$store.state.wallet.address,
          `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
        )
        const data = await ethErc20Contract.methods
          .transfer(
            platformAddr,
            `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
          )
          .encodeABI()
        console.log('data:::::', data)
        tx = {
          from: this.$store.state.wallet.address, // Required
          to: fromToken.contact, // Required (for non contract deployments)
          data: data, // Required
          // gasPrice: "0x02540be400", // Optional
          // gas: "0x9c40", // Optional
          value: `0x`, // Optional
        }
      }
      console.log(tx)
      connector
        .sendTransaction(tx)
        .then((data) => {
          // Returns transaction id (hash)
          console.log(data)
          const params = {
            from: this.$store.state.wallet.address,
            hash: data,
          }
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          this.modifyTxId(params, res.data.orderId, res)
        })
        .catch((error) => {
          // Error returned when rejected
          console.error(error)
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        })
    },
    //nabox发币
    async naboxExchange(platformAddr, fromNumber, res) {
      const fromToken = this.$store.state.fromToken
      console.log('nabox兑换', platformAddr, fromNumber, res)
      let params = null
      if (fromToken.contact === '') {
        params = [
          {
            from: this.$store.state.wallet.address,
            to: platformAddr,
            //gas: '0x76c0', // 30400
            //gasPrice: '0x9184e72a000', // 10000000000000
            value: `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(
              16,
            )}`, // 2441406250
          },
        ]
      } else {
        web3 = new Web3()
        const ethErc20Contract = new web3.eth.Contract(
          ETH_erc20,
          fromToken.contact,
        )
        console.log('ethErc20Contract:::::', ethErc20Contract.methods)
        console.log(
          this.$store.state.wallet.address,
          `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
        )
        const data = await ethErc20Contract.methods
          .transfer(
            platformAddr,
            `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
          )
          .encodeABI()
        console.log('data:::::', data)
        params = [
          {
            from: this.$store.state.wallet.address, // Required
            to: fromToken.contact, // Required (for non contract deployments)
            data: data, // Required
            // gasPrice: "0x02540be400", // Optional
            // gas: "0x9c40", // Optional
          },
        ]
      }
      NaboxWallet.request({
        method: 'eth_sendTransaction',
        params,
      })
        .then((data) => {
          console.log(data)
          const params = {
            from: this.$store.state.wallet.address,
            hash: data,
          }
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          this.modifyTxId(params, res.data.orderId, res)
        })
        .catch((error) => {
          // Error returned when rejected
          console.error(error)
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        })
    },
    //ONTO发币
    async ONTOExchange(platformAddr, fromNumber, res) {
      const fromToken = this.$store.state.fromToken
      console.log('nabox兑换', platformAddr, fromNumber, res)
      let params = null
      if (fromToken.contact === '') {
        params = [
          {
            from: this.$store.state.wallet.address,
            to: platformAddr,
            //gas: '0x76c0', // 30400
            //gasPrice: '0x9184e72a000', // 10000000000000
            value: `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(
              16,
            )}`, // 2441406250
          },
        ]
      } else {
        web3 = new Web3()
        const ethErc20Contract = new web3.eth.Contract(
          ETH_erc20,
          fromToken.contact,
        )
        console.log('ethErc20Contract:::::', ethErc20Contract.methods)
        console.log(
          this.$store.state.wallet.address,
          `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
        )
        const data = await ethErc20Contract.methods
          .transfer(
            platformAddr,
            `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
          )
          .encodeABI()
        console.log('data:::::', data)
        params = [
          {
            from: this.$store.state.wallet.address, // Required
            to: fromToken.contact, // Required (for non contract deployments)
            data: data, // Required
            // gasPrice: "0x02540be400", // Optional
            // gas: "0x9c40", // Optional
          },
        ]
      }
      onto
        .request({
          method: 'eth_sendTransaction',
          params,
        })
        .then((data) => {
          console.log(data)
          const params = {
            from: this.$store.state.wallet.address,
            hash: data,
          }
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          this.modifyTxId(params, res.data.orderId, res)
        })
        .catch((error) => {
          // Error returned when rejected
          console.error(error)
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        })
    },
    //OKExWallet发币
    async OKExWalletExchange(platformAddr, fromNumber, res) {
      const fromToken = this.$store.state.fromToken
      console.log('OKExWallet兑换', platformAddr, fromNumber, res)
      let params = null
      if (fromToken.contact === '') {
        params = [
          {
            from: this.$store.state.wallet.address,
            to: platformAddr,
            //gas: '0x76c0', // 30400
            //gasPrice: '0x9184e72a000', // 10000000000000
            value: `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(
              16,
            )}`, // 2441406250
          },
        ]
      } else {
        web3 = new Web3()
        const ethErc20Contract = new web3.eth.Contract(
          ETH_erc20,
          fromToken.contact,
        )
        console.log('ethErc20Contract:::::', ethErc20Contract.methods)
        console.log(
          this.$store.state.wallet.address,
          `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
        )
        const data = await ethErc20Contract.methods
          .transfer(
            platformAddr,
            `0x${(fromNumber * 10 ** fromToken.coinDecimal).toString(16)}`,
          )
          .encodeABI()
        console.log('data:::::', data)
        params = [
          {
            from: this.$store.state.wallet.address, // Required
            to: fromToken.contact, // Required (for non contract deployments)
            data: data, // Required
            // gasPrice: "0x02540be400", // Optional
            // gas: "0x9c40", // Optional
            //value: `0x`, // Optional
          },
        ]
      }
      okexchain
        .request({
          method: 'eth_sendTransaction',
          params,
        })
        .then((data) => {
          console.log(data)
          const params = {
            from: this.$store.state.wallet.address,
            hash: data,
          }
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          this.modifyTxId(params, res.data.orderId, res)
        })
        .catch((error) => {
          // Error returned when rejected
          console.error(error)
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        })
    },
    //metaMask发币
    async metaMaskExchange(platformAddr, fromNumber, res) {
      const fromToken = this.$store.state.fromToken
      const ContractAddress = this.$store.state.fromToken.contact //换币地址 From
      console.log('metaMask兑换', platformAddr, fromNumber, res)
      if (
        fromToken.contact === '' ||
        (fromToken.contact === '0x26d5ca2dE2005F42A8B0C785c723E3e286b77cDF' &&
          fromToken.mainNetwork == 'AME')
      ) {
        const tx = signer
          .sendTransaction({
            to: platformAddr,
            value: ethers.utils.parseEther(fromNumber),
          })
          .then((data) => {
            this.submitStatus = false
            this.$refs.dialogConfirm.show = false
            this.closeOrderDialog()
            this.modifyTxId(data, res.data.orderId, res)
          })
          .catch((error) => {
            this.submitStatus = false
            this.$refs.dialogConfirm.show = false
            this.closeOrderDialog()
            Notify({
              message: this.$t('rejectExchange'),
              color: '#ad0000',
              background: '#ffe1e1',
            })
          })
      } else {
        const tokenContract = new ethers.Contract(
          ContractAddress,
          erc20Abi,
          provider,
        )
        const tokenWithSigner = tokenContract.connect(signer)
        const token = ethers.utils.parseUnits(
          fromNumber,
          this.$store.state.fromToken.coinDecimal,
        )
        const tx = tokenWithSigner
          .transfer(platformAddr, token)
          .then((data) => {
            this.submitStatus = false
            this.$refs.dialogConfirm.show = false
            this.closeOrderDialog()
            this.modifyTxId(data, res.data.orderId, res)
          })
          .catch((error) => {
            this.submitStatus = false
            this.$refs.dialogConfirm.show = false
            this.closeOrderDialog()
            Notify({
              message: this.$t('rejectExchange'),
              color: '#ad0000',
              background: '#ffe1e1',
            })
          })
      }
    },
    //TronLink 兑换
    async TronLinkExchange(platformAddr, fromNumber, res) {
      this.$refs.dialogConfirm.show = false
      this.closeOrderDialog()
      this.submitStatus = false
      const code = this.$store.state.fromToken
      const ContractAddress = this.$store.state.fromToken.contact //换币地址 From
      if (!window.tronWeb) {
        Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('noWallet'),
        })
        return
      }
      let tronWeb = window.tronWeb
      if (code.coinCode === 'TRX') {
        var txData = await tronWeb.transactionBuilder.sendTrx(
          platformAddr,
          this.$store.state.fromNumber * Math.pow(10, 6),
          this.$store.state.walletTRON,
        )
        var signedTx = await tronWeb.trx.sign(txData)
        tronWeb.trx
          .sendRawTransaction(signedTx)
          .then((broastTx) => {
            this.modifyTRXTxId(broastTx.txid, res.data.orderId, res)
          })
          .catch((error) => {
            Notify({
              message: this.$t('rejectExchange'),
              color: '#ad0000',
              background: '#ffe1e1',
            })
          })
      } else {
        if (ContractAddress.length < 10) {
          //trc10转账
          const txData = await tronWeb.transactionBuilder.sendToken(
            platformAddr,
            this.toNonExponential(
              this.$store.state.fromNumber *
                Math.pow(10, this.$store.state.fromToken.coinDecimal),
            ),
            ContractAddress,
            this.$store.state.walletTRON,
          )
          var signedTx = await tronWeb.trx.sign(txData)
          tronWeb.trx
            .sendRawTransaction(signedTx)
            .then((broastTx) => {
              this.modifyTRXTxId(broastTx.txid, res.data.orderId, res)
            })
            .catch((error) => {
              Notify({
                message: this.$t('rejectExchange'),
                color: '#ad0000',
                background: '#ffe1e1',
              })
            })
        } else {
          //trc20转账
          const contract = await tronWeb.contract().at(code.contact)
          let value = new BigNumber(this.$store.state.fromNumber).multipliedBy(
            BigNumber(10).pow(this.$store.state.fromToken.coinDecimal),
          )
          contract
            .transfer(platformAddr, this.toNonExponential(value))
            .send()
            .then((txid) => {
              this.modifyTRXTxId(txid, res.data.orderId, res)
            })
            .catch((error) => {
              Notify({
                message: this.$t('rejectExchange'),
                color: '#ad0000',
                background: '#ffe1e1',
              })
            })
        }
      }
    },
    //PolkadotExchange 兑换
    async polksdotExchange(res) {
      let wsProvider = null
      let api = null
      let DOTandCRUDecimal = 10000000000
      if (this.$store.state.fromToken.mainNetwork === 'CRU') {
        wsProvider = new WsProvider('wss://api.decloudf.com/')
        api = await ApiPromise.create({
          provider: wsProvider,
          typesBundle: typesBundleForPolkadot,
        })
        DOTandCRUDecimal = 1000000000000
      } else {
        wsProvider = new WsProvider('wss://rpc.polkadot.io')
        api = await ApiPromise.create({ provider: wsProvider })
      }
      const account = this.$store.state.walletPolkadot
      const injector = await web3FromSource(account.source)

      const num = Number(this.$store.state.fromNumber) * DOTandCRUDecimal
      //判断手续费是否充足
      const info = await api.tx.balances
        .transfer(res.data.platformAddr, num)
        .paymentInfo(
          this.fromToken.mainNetwork === 'CRU'
            ? account.addrSS58CRU
            : account.addrSS58,
        )
      // console.log(info.partialFee.toString()/10000000000)
      // console.log(this.$store.state.balance - this.$store.state.fromNumber < info.partialFee.toString()/10000000000)
      if (
        this.$store.state.balance - this.$store.state.fromNumber <
        info.partialFee.toString() / DOTandCRUDecimal
      ) {
        return Notify({
          color: '#ad0000',
          background: '#ffe1e1',
          message: this.$t('dotInsufficient'),
        })
      }
      api.tx.balances
        .transfer(res.data.platformAddr, num)
        .signAndSend(
          this.fromToken.mainNetwork === 'CRU'
            ? account.addrSS58CRU
            : account.addrSS58,
          { signer: injector.signer },
          (result, t) => {
            if (result.status.isFinalized || result.status.isInBlock) {
              // unsubscribe()
              const dataHash = {
                from:
                  this.fromToken.mainNetwork === 'CRU'
                    ? account.addrSS58CRU
                    : account.addrSS58,
                hash: result.status.asInBlock.toString(),
              }

              result.events
                .filter(({ event: { section } }) => section === 'system')
                .forEach(({ event: { data, method } }) => {
                  if (method === 'ExtrinsicSuccess') {
                    this.modifyTxId(dataHash, res.data.orderId, res)
                    Notify({ type: 'success', message: 'Success' })
                  }
                  this.submitStatus = false
                  this.$refs.dialogConfirm.show = false
                  this.closeOrderDialog()
                })
            }
          },
        )
        .catch((e) => {
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          //基础手续费不够。
          // RPC-CORE: submitAndWatchExtrinsic(extrinsic: Extrinsic): ExtrinsicStatus:: 1010: Invalid Transaction:
          if (e.message === 'Cancelled') {
            Notify({
              color: '#ad0000',
              background: '#ffe1e1',
              message: this.$t('rejectExchange'),
            })
          } else {
            console.log(':( transaction failed', e)
          }
        })
    },
    //phantomExchange 兑换
    async createTransferTransaction(platformAddr, fromNumber) {
      const NETWORK = clusterApiUrl('mainnet-beta')
      const addressPublicKey = window.solana.publicKey
      const connection = new Connection(NETWORK)
      if (!this.$store.state.wallet.address && this.connectType != 'Phantom') {
        return
      }
      let transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: addressPublicKey,
          toPubkey: platformAddr,
          lamports: Number(fromNumber) * 1000000000,
        }),
      )
      transaction.feePayer = addressPublicKey
      const anyTransaction = transaction
      anyTransaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash
      return transaction
    },
    async phantomExchange(platformAddr, fromNumber, res) {
      const fromToken = this.$store.state.fromToken
      //代币
      if (fromToken.contact !== '') {
        const signature = await solTokenSend(
          platformAddr,
          fromToken.contact,
          fromNumber * 10 ** fromToken.coinDecimal,
        )
        if (signature) {
          const dataHash = {
            from: this.$store.state.wallet.address,
            hash: signature,
          }
          console.log(dataHash)
          this.modifyTxId(dataHash, res.data.orderId, res)
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
        } else {
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        }
        return
      }
      //主币
      const NETWORK = clusterApiUrl('mainnet-beta')
      const connection = new Connection(NETWORK)
      const transaction = await this.createTransferTransaction(
        platformAddr,
        fromNumber,
      )
      console.log(transaction, platformAddr, fromNumber)
      if (transaction) {
        try {
          let signed = await window.solana.signTransaction(transaction)
          // console.log('Got signature, submitting transaction')
          let signature = await connection.sendRawTransaction(
            signed.serialize(),
          )
          // console.log(
          //   'Submitted transaction ' + signature + ', awaiting confirmation',
          // )
          await connection.confirmTransaction(signature)
          // console.log('Transaction ' + signature + ' confirmed')
          const dataHash = {
            from: this.$store.state.wallet.address,
            hash: signature,
          }
          this.modifyTxId(dataHash, res.data.orderId, res)
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
        } catch (err) {
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        }
      }
    },
    async TerraStationExchange(platformAddr, fromNumber, res) {
      console.log('发币发币')
      const fromToken = this.$store.state.fromToken
      if (fromToken.contact === '') {
        const fromAddress = this.$store.state.wallet.address
        const result = await TerraExchangeHandle(
          fromAddress,
          platformAddr,
          fromNumber,
        )
        if (result.success) {
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          const dataHash = {
            from: this.$store.state.wallet.address,
            hash: result.result.txhash,
          }
          this.modifyTxId(dataHash, res.data.orderId, res)
        } else {
          this.submitStatus = false
          this.$refs.dialogConfirm.show = false
          this.closeOrderDialog()
          Notify({
            message: this.$t('rejectExchange'),
            color: '#ad0000',
            background: '#ffe1e1',
          })
        }
      }
    },
    toNonExponential(num) {
      var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
      return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
    },
    modifyTxId(data, orderId, order) {
      const self = this
      const params = {
        orderId: orderId, //   订单号
        depositAddress: data.from.toLowerCase(), //  用户地址
        targetAddress: this.$store.state.address, //  用户存币的地址
        depositTxid: data.hash, //  用户存币哈希
      }
      baseApi.modifyTxId(params).then((res) => {
        console.log('res:::::', res)
        if (res.resCode == '800') {
          //发币成功发送订单号成功成功
          //打开兑换详情页
          self.confirmHandle(order)
          //调取兑换记录
          self.$bus.emit('queryAllTradeHandle')
        } else {
          errorCode(res.resCode, this)
        }
      })
    },
    modifyTRXTxId(txid, orderId, order) {
      const self = this
      const params = {
        orderId: orderId, //   订单号
        depositAddress: this.$store.state.walletTRON, //  用户地址
        targetAddress: this.$store.state.address, //  用户存币的地址
        depositTxid: txid, //  用户存币哈希
      }
      baseApi.modifyTxId(params).then((res) => {
        console.log('res:::::', res)
        if (res.resCode == '800') {
          //发币成功发送订单号成功成功
          //打开兑换详情页
          self.confirmHandle(order)
          //调取兑换记录
          self.$bus.emit('queryAllTradeHandle')
        } else {
          errorCode(res.resCode, this)
        }
      })
    },
    confirmHandle(res) {
      this.$store.commit('setOrder', res.data)
      this.$bus.emit('showOrderHandle', true)
      this.$bus.emit('isShowStatus')
      this.$store.commit('setSwapConfirm', false)
      this.$store.commit('setInfo', null)
      this.$bus.emit('clearAddress')
      this.$store.commit('setFromNumber', '')
    },
    tipOpen() {
      const self = this
      clearTimeout(this.tipTimer)
      self.showPopover = true
      this.tipTimer = setTimeout(() => {
        self.showPopover = false
      }, 3000)
    },
    getContainer() {
      return document.querySelector('.centerDiv')
    },
    closeOrderDialog() {
      console.log('关闭兑换窗口')
      this.$store.commit('setSwapConfirm', false)
      this.$refs.dialogConfirm.show = false
      this.submitStatus = false
    },
    //打开兑换窗口
    openOrderDilog() {
      this.$store.commit('setSwapConfirm', true)
      console.log('打开兑换窗口')
    },
    async approve() {
      this.pathBridgeExchangeStatus = false
      if (this.info.dex === 'ClassZZ') {
        approveActions(
          this.info.swapData.from,
          provider.provider,
          this.$store.state.wallets.address,
        )
          .then((resApprove) => {
            console.log(resApprove)
            this.$refs.approve.loading = false
            if (resApprove && resApprove.data.authorization) {
              this.getClassZZData()
              this.$refs.approve.$refs.dialog.show = false
            } else {
              console.log('授权失败')
              this.submitLoading = false
            }
          })
          .catch((error) => {
            console.log('用户取消授权')
            this.$refs.approve.loading = false
            this.submitLoading = false
            this.$AlertError(this.$t('rejected'))
          })
      } else if (this.connectType === 'TronLink') {
        console.log(new BigNumber(1))
        console.log(ethers.constants.MaxUint256)
        const resData = this.txData
        const tronWeb = window.tronWeb
        console.log('TronLink授权')
        const contract = await tronWeb
          .contract()
          .at(this.$store.state.fromToken.contact)
        contract
          .approve(resData.data.txData.to, ethers.constants.MaxUint256)
          .send()
          .then((hash) => {
            console.log('用户授权', hash)
            tronWeb.trx.getTransaction(hash).then((result) => {
              console.log('监听授权成功', result)
              if (!this.pathBridgeExchangeStatus) {
                this.submitStatus = false
                this.$refs.approve.loading = false
                this.$refs.approve.$refs.dialog.show = false
                //pathBridgeMethods.exchange(resData)
                this.pathBridgeExchangeStatus = true
              }
            })
          })
          .catch((err) => {
            console.log('用户取消授权')
            Notify({
              message: this.$t('rejected'),
              color: '#ad0000',
              background: '#ffe1e1',
            })
            this.$refs.approve.loading = false
            this.submitStatus = false
          })
      } else {
        if (this.connectType === 'OKExWallet') {
          provider = new ethers.providers.Web3Provider(okexchain, 'any')
        } else if (this.connectType === 'Nabox') {
          provider = new ethers.providers.Web3Provider(NaboxWallet, 'any')
        } else if (this.connectType === 'ONTO') {
          provider = new ethers.providers.Web3Provider(window.onto, 'any')
        } else {
          provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
        }
        signer = provider.getSigner()
        const resData = this.txData
        const contract = getContract(this.fromToken.contact)
        contract.estimateGas
          .approve(resData.data.txData.to, ethers.constants.MaxUint256, {
            from: this.$store.state.wallet.address,
          })
          .then((res) => {
            const a = contract
              .connect(signer)
              .approve(resData.data.txData.to, ethers.constants.MaxUint256, {
                from: this.$store.state.wallet.address,
              })
              .then((res) => {
                console.log('用户授权')
              })
              .catch((error) => {
                console.log('用户取消授权')
                Notify({
                  message: this.$t('rejected'),
                  color: '#ad0000',
                  background: '#ffe1e1',
                })
                this.$refs.approve.loading = false
                this.submitStatus = false
              })
            let filter = contract.filters.Approval(
              this.returnAddress,
              resData.data.txData.to,
              null,
            )
            contract.on(filter, (from, to, amount, event) => {
              console.log('监听授权成功')
              if (!this.pathBridgeExchangeStatus) {
                this.submitStatus = false
                this.$refs.approve.loading = false
                this.$refs.approve.$refs.dialog.show = false
                //pathBridgeMethods.exchange(resData)
                this.pathBridgeExchangeStatus = true
              }
            })
          })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.centerDiv {
  .imgDiv {
    width: 100%;
    height: auto;
    margin-bottom: 0.185rem;
    img {
      width: 2.98rem;
      margin: 0px auto;
      display: block;
    }
  }
  .content {
    width: 100%;
    margin: 0 auto;
    height: auto;
    &.pc {
      width: 90%;
    }
    .valDiv {
      .top,
      .bottom {
        height: 45px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        img {
          width: 0.66rem;
          height: 0.66rem;
          margin-right: 0.27rem;
        }
        .info {
          width: calc(100% - 0.83rem);
          text-align: left;
          .tip {
            text-align: left;
            min-height: 16px;
            font-size: 10px;
            font-family: Poppins-SemiBold, Poppins;
            font-weight: 600;
            color: #000;
            line-height: 16px;
            // font-weight: 600;
            .span12 {
              font-size: 0.259rem;
              display: inline-block;
            }
            .span16 {
              font-size: 0.37rem;
              padding-left: 3px;
              font-family: Poppins-Bold;
            }
            .span14 {
              font-size: 0.296rem;
              font-family: Poppins-Bold;
            }
          }
          .addr {
            color: #cbcbcb;
            width: 100%;
            position: relative;
            height: 20px;
            .addrCut {
              font-size: 14px;
              font-family: Poppins-Regular;
              width: calc(100% - 25px);
              display: inline-block;
              white-space: nowrap;
              overflow: hidden;
              position: absolute;
            }
            img {
              display: inline-block;
              margin-left: 5px;
              width: 0.296rem;
              height: 0.296rem;
              position: absolute;
              right: 0;
              top: 5px;
            }
          }
        }
      }
      .middle {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .line {
          height: 24px;
          margin-left: 0.314rem;
          border-right: 1px dashed #bfbfbf;
        }
      }
    }
    .divider {
      width: 100%;
      height: 1px;
      background: #e5e5e5;
      margin: 20px auto;
    }
    .rate,
    .received {
      display: flex;
      justify-content: space-between;
      //align-items: center;
      margin: 8px 0;
      width: 100%;
      height: auto;
      .left {
        font-size: 12px;
        font-family: Poppins-Regular, Poppins;
        font-weight: 400;
        color: #aab0c8;
        text-align: left;
        white-space: nowrap;
        position: relative;
        display: flex;
        align-items: center;
        #tips {
          width: 14px;
          height: 14px;
        }
        img {
          margin-left: 5px;
          margin-bottom: 2px;
          cursor: pointer;
        }
      }
      .right {
        text-align: right;
        font-size: 12px;
        font-family: DINPro-Medium, DINPro;
        font-weight: 500;
        color: #292929;
        .bridge {
          cursor: pointer;
          display: flex;
          align-items: center;
          img {
            width: 0.5rem;
            height: 0.5rem;
          }
        }
      }
    }
    .buttonDiv {
      div {
        .left {
          float: left;
        }
        .right {
          float: right;
          font-family: 'DINPro-Medium, DINPro';
          font-weight: 500;
          color: #ffffff;
        }
      }
      button {
        width: 100%;
        background: #277ffa;
        border-radius: 18px;
        font-size: 18px;
        cursor: pointer;
        height: 55px;
        margin-top: 18px;
        font-family: Poppins;
        color: #ffffff;
        line-height: 55px;
        border: 0px;
      }
    }
  }
  .closeIcon {
    width: calc(100% - 32px);
    height: 0.74rem;
    position: absolute;
    bottom: -0.925rem;
    img {
      width: 0.925rem;
      height: 0.925rem;
      cursor: pointer;
    }
  }
  .tip-content {
    text-align: left;
    padding: 8px 8px;
    font-size: 12px;
    font-family: PingFangSC-Semibold, PingFang SC;
  }
}
.fee-span {
  display: inline-block;
  height: 0.351rem;
  background: linear-gradient(180deg, #fad961 0%, #ffc078 100%);
  border-radius: 0.18rem;
  color: #7d5500;
  text-align: center;
  padding: 0 8px;
  line-height: 0.351rem;
  font-weight: 600;
  font-size: 12px;
}
</style>
