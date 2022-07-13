<template>
  <div>
    <Dialog
      :width="isPC ? '500px' : '90%'"
      ref="dialogOrder"
      @close="dialogClose"
    >
      <div class="centerDiv" v-if="data">
        <div class="imgDiv">
          <img
            v-if="
              data.detailState == 'timeout' ||
              data.detailState == 'trade_fail' ||
              data.orderStatus == 'fail'
            "
            src="@/assets/img/exchangeFailorTimeout.png"
            alt=""
          />
          <img
            v-else-if="
              data.detailState == 'receive_complete' ||
              data.detailState == 'complete' ||
              data.detailState == 'refund_complete'
            "
            src="@/assets/img/exchangeSuccess.png"
            alt=""
          />
          <img v-else src="@/assets/img/swapConfirm.png" alt="" />
          <div
            class="status"
            :style="{
              color: data.orderdetailStatus
                ? data.orderdetailStatus[1]
                : '#707B9E',
            }"
          >
            {{
              data.orderdetailStatus
                ? data.orderdetailStatus[0]
                : $t('wait_deposit_send')
            }}
          </div>
        </div>
        <div class="content" :class="isPC ? 'pc' : ''">
          <div class="valDiv">
            <div class="top">
              <img
                v-if="data.isNft === '' || data.orderSide === '1'"
                class="coinimg"
                :src="`https://transfer.swft.pro/swft-v3/images/coins/${data.depositCoinCode}.png`"
              />
              <img
                v-else
                class="coinimg"
                :src="
                  data.isNft === 'sell'
                    ? data.nftLogoUrl || data.nftUrl
                    : data.payTokenUrl
                "
              />
              <div class="info">
                <div class="tip">
                  <span class="span12">{{ $t('transferOut') }}</span>
                  <span class="span16"
                    >{{ Number(data.depositCoinAmt).toFixed(6) - 0 }}
                  </span>
                  <span class="span14">{{
                    data.isNft === 'sell' ? data.nftName : data.depositCoinCode
                  }}</span>
                </div>
                <div class="addr">
                  <span class="addrCut">{{ cutAddress(data.refundAddr) }}</span>
                  <img
                    src="../assets/img/copy.png"
                    v-clipboard:copy="data.refundAddr"
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
                v-if="data.isNft === '' || data.orderSide === '0'"
                class="coinimg"
                :src="
                  data.isNft === 'buy'
                    ? data.nftUrl
                    : `https://transfer.swft.pro/swft-v3/images/coins/${data.receiveCoinCode}.png`
                "
              />
              <img
                v-else
                class="coinimg"
                :src="
                  data.isNft === 'buy'
                    ? data.nftLogoUrl || data.nftUrl
                    : data.payTokenUrl
                "
              />
              <div class="info">
                <div class="tip">
                  <span class="span12">
                    {{
                      data.detailState == 'wait_receive_confirm' ||
                      data.detailState == 'receive_complete' ||
                      data.isNft != ''
                        ? $t('receive')
                        : $t('expected')
                    }}
                  </span>
                  <span class="span16">
                    <template
                      v-if="
                        data.detailState == 'wait_receive_confirm' ||
                        data.detailState == 'receive_complete' ||
                        data.detailState == 'wait_partial_refund' ||
                        data.detailState == 'wait_partial_refund_confirm' ||
                        data.detailState == 'wait_partial_send' ||
                        data.detailState == 'wait_partial_send_confirm' ||
                        data.detailState == 'partial_complete' ||
                        data.detailState == 'wait_partial_send_confirm_error' ||
                        data.detailState ==
                          'wait_partial_refund_confirm_error' ||
                        data.isNft != '' ||
                        (data.router && data.router.router === 'bridgers1') ||
                        (data.router && data.router.router === 'bridgers2')
                      "
                    >
                      {{ Number(data.receiveCoinAmt).toFixed(6) - 0 }}
                    </template>
                    <template v-else>
                      {{
                        (
                          data.depositCoinAmt *
                            data.instantRate *
                            (1 - data.depositCoinFeeRate) -
                          data.chainFee
                        ).toFixed(6) - 0
                      }}
                    </template>
                  </span>
                  <span class="span14">{{
                    data.isNft === 'buy' ? data.nftName : data.receiveCoinCode
                  }}</span>
                </div>
                <div class="addr">
                  <span class="addrCut">{{
                    cutAddress(data.destinationAddr)
                  }}</span>
                  <img
                    src="../assets/img/copy.png"
                    v-clipboard:copy="data.destinationAddr"
                    v-clipboard:success="onCopySuccess"
                    v-clipboard:error="onCopyError"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <!-- 部分成交退币显示 -->

            <div
              class="bottom"
              style="margin-top: 14px"
              v-if="
                data.detailState == 'wait_partial_refund' ||
                data.detailState == 'wait_partial_refund_confirm' ||
                data.detailState == 'partial_complete' ||
                data.detailState == 'wait_partial_send_confirm_error' ||
                data.detailState == 'wait_partial_refund_confirm_error' ||
                data.detailState == 'wait_partial_send' ||
                data.detailState == 'wait_partial_send_confirm'
              "
            >
              <img
                class="coinimg"
                :src="`https://transfer.swft.pro/swft-v3/images/coins/${data.depositCoinCode}.png`"
              />

              <div class="info">
                <div class="tip">
                  <span class="span12">
                    {{ $t('refund') }}
                  </span>

                  <span class="span16">
                    <template>
                      {{ data.refundCoinAmt }}
                    </template>
                  </span>
                  <span class="span14">{{ data.depositCoinCode }}</span>
                </div>
                <div class="addr">
                  <span class="addrCut">{{ cutAddress(data.refundAddr) }}</span>
                  <img
                    src="../assets/img/copy.png"
                    v-clipboard:copy="data.refundAddr"
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
            <div class="left">{{ $t('creteTime') }}</div>
            <div class="right">
              {{ data.createTime }}
            </div>
          </div>
          <div class="rate">
            <div class="left">{{ $t('bridge') }}</div>
            <div class="right">
              <img class="dexlogo" :src="dexLogo" alt="" />
              {{
                this.data.router && this.data.router.router
                  ? this.data.router.router
                  : 'SWFT'
              }}
            </div>
          </div>
          <div class="rate">
            <div class="left">{{ $t('orderId') }}</div>
            <div class="right">
              {{ cutAddress(data.orderId) }}
              <img
                src="../assets/img/copy.png"
                v-clipboard:copy="data.orderId"
                v-clipboard:success="onCopySuccess"
                v-clipboard:error="onCopyError"
                alt=""
              />
            </div>
          </div>
          <div class="rate" v-if="data.isNft == '' && !data.router">
            <div class="left">
              {{ $t('fee') }}
              <img
                id="tips"
                @mouseover="tipOpen"
                @click="tipOpen"
                src="../assets/img/tip.png"
              />
              <Popover
                v-model="showPopover"
                theme="dark"
                trigger="click"
                placement="bottom-start"
                :offset="[-10, 8]"
                :get-container="getContainer"
              >
                <div class="tip-content">{{ $t('feeTip') }}</div>
              </Popover>
            </div>
            <div class="right">
              <span
                ><span :class="data.isDiscoun === 'Y' ? 'fee-span' : ''"
                  >{{ data.depositCoinFeeRate * 100 }}%</span
                >
                {{
                  sourceFlag === 'kfi'
                    ? ''
                    : ' + ' + data.chainFee + ' ' + data.receiveCoinCode
                }}
                <!--  + {{ data.chainFee }}
                {{ data.receiveCoinCode }} -->
              </span>
            </div>
          </div>
          <div class="rate">
            <div class="left">{{ $t('outTxid') }}</div>
            <div class="right">
              <a
                style="color: #2980fa; word-break: break-word"
                :href="data.depositHashExplore"
                target="_bank"
              >
                <span>
                  {{
                    data.depositTxid ? cutAddress(data.depositTxid) : '--'
                  }}</span
                >
              </a>
            </div>
          </div>
          <div class="rate">
            <div class="left">{{ $t('inTxid') }}</div>
            <div class="right" v-if="data.transactionId">
              <a
                style="color: #2980fa; word-break: break-word"
                :href="data.receiveHashExplore"
                target="_bank"
              >
                {{ data.transactionId ? cutAddress(data.transactionId) : '--' }}
              </a>
            </div>
            <div
              class="right"
              v-if="
                data.refundDepositTxid &&
                data.detailState != 'wait_partial_refund' &&
                data.detailState != 'wait_partial_refund_confirm' &&
                data.detailState != 'partial_complete' &&
                data.detailState != 'wait_partial_refund_confirm_error'
              "
            >
              <a
                style="color: #2980fa; word-break: break-word"
                :href="data.refundHashExplore"
                target="_bank"
              >
                {{
                  data.refundDepositTxid
                    ? cutAddress(data.refundDepositTxid)
                    : '--'
                }}
              </a>
            </div>
            <div
              class="right"
              style="color: #2980fa"
              v-if="!data.refundDepositTxid && !data.transactionId"
            >
              --
            </div>
          </div>
          <!-- 部分成交退币哈希 -->
          <div
            class="rate"
            v-if="
              data.detailState == 'wait_partial_refund' ||
              data.detailState == 'wait_partial_refund_confirm' ||
              data.detailState == 'partial_complete' ||
              data.detailState == 'wait_partial_refund_confirm_error' ||
              data.detailState == 'wait_partial_send' ||
              data.detailState == 'wait_partial_send_confirm'
            "
          >
            <div class="left">{{ $t('refundTxid') }}</div>
            <div class="right" v-if="data.refundDepositTxid">
              <a
                style="color: #2980fa; word-break: break-word"
                :href="data.refundHashExplore"
                target="_bank"
              >
                {{
                  data.refundDepositTxid
                    ? cutAddress(data.refundDepositTxid)
                    : '--'
                }}
              </a>
            </div>
            <div
              class="right"
              style="color: #2980fa"
              v-if="!data.refundDepositTxid"
            >
              --
            </div>
          </div>
          <div class="rate" v-if="data.router && data.router !== 'NFT'">
            <template
              v-if="
                (data.router.router == 'bridgers1' ||
                  data.router.router == 'bridgers2') &&
                data.detailState !== 'timeout' &&
                data.detailState !== 'receive_complete' &&
                data.orderStatus !== 'complete' &&
                data.orderStatus !== 'refund_complete' &&
                data.orderStatus !== 'fail' &&
                data.orderStatus !== 'partial_complete'
              "
            >
              <div class="left">{{ $t('estimatedTime') }}</div>
              <div class="right">
                {{
                  data.estimatedTime == 1
                    ? $t('estimatedTime1')
                    : data.estimatedTime == 2
                    ? $t('estimatedTime2')
                    : $t('estimatedTime3')
                }}
              </div>
            </template>
          </div>
        </div>
        <div class="infoText" :class="isPC ? 'pc' : ''">
          {{ $t('orderInfoText') }} &nbsp;<span class="service"
            ><a
              style="color: #2980fa; word-break: break-word"
              :href="$t('orderInfoService')"
              target="_blank"
              rel="noopener noreferrer"
              >{{ $t('orderInfoService') }}</a
            ></span
          >
        </div>
        <div class="closeIcon">
          <img @click="closeOrderDialog" src="../assets/img/close.png" alt="" />
        </div>
      </div>
      <div v-else style="min-height: 200px">
        <Loading color="#1989fa" />
      </div>
    </Dialog>
  </div>
</template>
<script>
import { Toast } from 'vant'
import Dialog from './common/dialog'
import baseApi from '../api/baseApi'
import { Loading } from 'vant'
import { Popover } from 'vant'
import errorCode from '../utils/language.js'
import dexList from '../config/dexLogo'
export default {
  name: 'Order',
  components: {
    Dialog,
    Loading,
    Popover,
  },
  props: { sendGas: { type: String, default: null } },
  data() {
    return {
      isShow: false,
      timer: null,
      loading: true,
      showPopover: false,
      tipTimer: null,
      sourceFlag: localStorage.getItem('sourceFlag'),
    }
  },
  computed: {
    dexLogo() {
      return dexList[
        this.data.router && this.data.router.router
          ? this.data.router.router
          : 'SWFT'
      ]
    },
    data() {
      return this.$store.state.order
    },
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
      return this.$store.state.toNumber
    },
  },
  watch: {
    isShow(val, old) {
      if (val == true) {
        const orderObj = this.$store.state.order
        const status = orderObj.detailState
        //判断 已完成 超时 已退币 兑换失败 状态拦截 轮询
        if (
          status === 'receive_complete' ||
          status === 'partial_complete' ||
          status === 'timeout' ||
          status === 'trade_fail' ||
          status === 'fail' ||
          status === 'refund_complete' ||
          status === 'wait_for_information' ||
          status === 'WAIT_KYC' ||
          status === 'complete'
        )
          return
        this.timer = setInterval(() => {
          this.orderDetail(orderObj)
        }, 3000)
      } else {
        clearInterval(this.timer)
      }
    },
  },
  created() {
    this.$bus.on('showOrderHandle', this.show)
    this.$bus.on('isShowStatus', this.isShowStatus)
  },
  beforeDestroy() {
    this.$bus.off('showOrderHandle', this.show)
    this.$bus.off('isShowStatus', this.isShowStatus)
  },
  methods: {
    cutAddress(adr) {
      const beforeAdr = adr.substring(0, 10)
      const afterAdr = adr.substring(adr.length - 10, adr.length)
      if (adr.length > 21) {
        return beforeAdr + '.....' + afterAdr
      } else {
        return adr
      }
    },
    show(_b, orderId) {
      const self = this
      self.$refs.dialogOrder.show = _b
      if (_b) return
      this.isShow = _b
      // setTimeout(() => {
      //   self.$refs.dialogOrder.show = _b;
      //   this.isShow = _b;
      //   const orderObj = this.$store.state.order;
      //   this.orderDetail(orderObj);
      // },100)
    },
    isShowStatus() {
      this.isShow = true
    },
    closeOrderDialog() {
      this.$refs.dialogOrder.show = false
      this.dialogClose()
    },
    dialogClose() {
      //console.log('监听dialog 关闭事件')
      //接受dialog 关闭事件
      this.isShow = false
      this.$store.commit('setOrder', null)
    },
    onCopySuccess(val) {
      Toast.success(this.$t('copy_success'))
    },
    onCopyError(val) {
      // this.$message.success("复制失败");
    },

    //获取订单详情
    async orderDetail(dataObj) {
      if (dataObj.router && dataObj.router.router === 'bridgers1') {
        const res = await baseApi.getTransDataById({ orderId: dataObj.orderId })
        if (res.resCode == '100') {
          let data = res.data
          this.$set(data, 'orderdetailStatus', this.orderStatus(data.status))
          this.$set(data, 'beginDate', data.createTime)
          this.$set(data, 'isNft', '')
          this.$set(data, 'detailState', data.status)
          this.$set(data, 'fromCoinAmt', data.fromTokenAmount)
          this.$set(data, 'toCoinAmt', data.toTokenAmount)
          this.$set(data, 'refundAddr', data.fromAddress)
          this.$set(data, 'destinationAddr', data.toAddress)
          this.$set(data, 'depositCoinCode', data.fromCoinCode)
          this.$set(data, 'depositCoinAmt', data.fromCoinAmt)
          this.$set(data, 'receiveCoinAmt', data.toCoinAmt)
          this.$set(data, 'receiveCoinCode', data.toCoinCode)
          this.$set(data, 'depositTxid', data.hash)
          this.$set(data, 'transactionId', data.toHash)
          this.$set(data, 'estimatedTime', data.estimatedTime)
          this.$set(data, 'router', {
            router: 'bridgers1',
          })
          this.$store.commit('setOrder', data)
          const status = res.data.detailState
          if (
            status === 'receive_complete' ||
            status === 'timeout' ||
            status === 'trade_fail' ||
            status === 'refund_complete' ||
            status === 'partial_complete' ||
            status === 'wait_for_information' ||
            status === 'complete'
          ) {
            clearInterval(this.timer)
          }
        } else {
        }
        console.log(res)
      } else if (dataObj.router && dataObj.router.router === 'bridgers2') {
        const res = await baseApi.getbridgers2TransDataById({
          orderId: dataObj.orderId,
        })
        if (res.resCode == '100') {
          let data = res.data
          this.$set(data, 'orderdetailStatus', this.orderStatus(data.status))
          this.$set(data, 'beginDate', data.createTime)
          this.$set(data, 'isNft', '')
          this.$set(data, 'detailState', data.status)
          this.$set(data, 'fromCoinAmt', data.fromTokenAmount)
          this.$set(data, 'toCoinAmt', data.toTokenAmount)
          this.$set(data, 'refundAddr', data.fromAddress)
          this.$set(data, 'destinationAddr', data.toAddress)
          this.$set(data, 'depositCoinCode', data.fromCoinCode)
          this.$set(data, 'depositCoinAmt', data.fromCoinAmt)
          this.$set(data, 'receiveCoinAmt', data.toCoinAmt)
          this.$set(data, 'receiveCoinCode', data.toCoinCode)
          this.$set(data, 'depositTxid', data.hash)
          this.$set(data, 'transactionId', data.toHash)
          this.$set(data, 'estimatedTime', data.estimatedTime)
          this.$set(data, 'router', {
            router: 'bridgers2',
          })
          this.$store.commit('setOrder', data)
          const status = res.data.detailState
          if (
            status === 'receive_complete' ||
            status === 'timeout' ||
            status === 'trade_fail' ||
            status === 'refund_complete' ||
            status === 'partial_complete' ||
            status === 'wait_for_information' ||
            status === 'complete'
          ) {
            clearInterval(this.timer)
          }
        } else {
        }
        console.log(res)
      } else if (dataObj.router && dataObj.router === 'NFT') {
        const res = await baseApi.queryOrderStateNFT({
          orderId: dataObj.orderId,
        })
        if (res.resCode == 800) {
          if (!this.isShow) return
          const data = res.data
          this.$set(
            data,
            'orderdetailStatus',
            this.orderStatus(res.data.orderStatus),
          )

          this.$store.commit('setOrder', data)
          const status = res.data.orderStatus
          if (
            status === 'receive_complete' ||
            status === 'timeout' ||
            status === 'trade_fail' ||
            status === 'refund_complete' ||
            status === 'partial_complete' ||
            status === 'wait_for_information' ||
            status === 'complete' ||
            status === 'wait_deposit_send_error' ||
            status === 'fail'
          ) {
            clearInterval(this.timer)
          }
        } else {
          errorCode(res.resCode, this)
        }
      } else {
        const res = await baseApi.queryOrderState({ orderId: dataObj.orderId })
        if (res.resCode == 800) {
          if (!this.isShow) return
          const data = res.data
          this.$set(
            data,
            'orderdetailStatus',
            this.orderStatus(res.data.detailState),
          )
          if (data.isNft != '' && data.router) {
            data.isNft = ''
          }
          this.$store.commit('setOrder', data)
          const status = res.data.detailState
          if (
            status === 'receive_complete' ||
            status === 'timeout' ||
            status === 'trade_fail' ||
            status === 'refund_complete' ||
            status === 'partial_complete' ||
            status === 'wait_for_information' ||
            status === 'wait_deposit_send_error' ||
            status === 'complete'
          ) {
            clearInterval(this.timer)
          }
        } else {
          errorCode(res.resCode, this)
        }
      }
    },

    //解析订单状态
    orderStatus(str) {
      let statusData = [this.$t('wait_deposit_send'), '#707B9E']
      switch (str) {
        case 'wait_deposits':
          statusData[0] = this.$t('wait_deposit_send') //wait_deposit_send   等待存币
          statusData[1] = '#707B9E'
          break
        case 'wait_deposit_send_error':
          statusData[0] = this.$t('trade_fail') //wait_deposit_send_error   存币失败
          statusData[1] = '#FF8484'
          break
        case 'wait_detect':
          statusData[0] = this.$t('wait_deposit_send') //NFT接口  等待存币
          statusData[1] = '#707B9E'
          break
        case 'exchange':
          statusData[0] = this.$t('exchangeIng') //wait_deposit_send   兑换中
          statusData[1] = '#707B9E'
          break
        case 'wait_exchange':
          statusData[0] = this.$t('exchangeIng') //NFT接口 交换中
          statusData[1] = '#707B9E'
          break
        case 'trade_fail':
          statusData[0] = this.$t('trade_fail') //wait_deposit_send   兑换失败
          statusData[1] = '#FF8484'
          break
        case 'fail':
          statusData[0] = this.$t('trade_fail') //wait_deposit_send   兑换失败
          statusData[1] = '#FF8484'
          break
        case 'wait_deposit_send':
          statusData[0] = this.$t('wait_deposit_send') //wait_deposit_send   等待存币
          statusData[1] = '#707B9E'
          break
        case 'wait_receive_send':
          statusData[0] = this.$t('wait_receive_send') //wait_receive_send  等待发币
          statusData[1] = '#707B9E'
          break
        case 'wait_send':
          statusData[0] = this.$t('wait_receive_send') //linknft 等待发币
          statusData[1] = '#707B9E'
          break

        case 'wait_receive_confirm':
          statusData[0] = this.$t('wait_receive_confirm') //wait_receive_confirm  等待发币确认
          statusData[1] = '#707B9E'
          break
        case 'wait_refund_send':
          statusData[0] = this.$t('wait_refund_send') //wait_refund_send  等待退币
          statusData[1] = '#707B9E'
          break
        case 'wait_refund':
          statusData[0] = this.$t('wait_refund_send') //linknft 等待退币
          statusData[1] = '#707B9E'
          break

        case 'wait_exchange_return':
          statusData[0] = this.$t('exchangeIng') //wait_exchange_return  等待交换结果
          statusData[1] = '#707B9E'
          break
        case 'wait_exchange_push':
          statusData[0] = this.$t('exchangeIng') //wait_exchange_push  等待交换推送
          statusData[1] = '#707B9E'
          break
        case 'wait_for_information':
          statusData[0] = this.$t('exchangeIng') // wait_for_information   等待用户联系
          statusData[1] = '#707B9E'
          break
        case 'receive_complete':
          statusData[0] = this.$t('receive_complete') // receive_complete   发币完成
          statusData[1] = '#1eb740'
          break
        case 'complete':
          statusData[0] = this.$t('receive_complete')
          statusData[1] = '#1eb740'
          break
        case 'refund_complete':
          statusData[0] = this.$t('refund_complete') // refund_complete   退币完成
          statusData[1] = '#1eb740'
          break
        case 'fail':
          statusData[0] = this.$t('refund_complete') // linknft 交易失败已退币   退币完成
          statusData[1] = '#1eb740'
          break
        case 'refund_sending':
          statusData[0] = this.$t('refund_sending') // refund_sending   即将退币
          statusData[1] = '#707B9E'
          break
        case 'wait_kyc':
          statusData[0] = this.$t('exchangeIng') //  wait_kyc  需要kyc   WAIT_KYC
          statusData[1] = '#707B9E'
          break
        case 'timeout':
          statusData[0] = this.$t('timeout') // timeout   超时
          statusData[1] = '#FF8484'
          break
        case 'wait_refund_confirm':
          statusData[0] = this.$t('wait_refund_confirm') //wait_refund_confirm  等待退币确认
          statusData[1] = '#707B9E'
          break
        case 'wait_partial_send':
          statusData[0] = this.$t('wait_partial_send') //部分成交发币中…
          statusData[1] = '#707B9E'
          break
        case 'wait_partial_send_confirm':
          statusData[0] = this.$t('wait_partial_send_confirm') // 部分成交发币确认中…
          statusData[1] = '#707B9E'
          break
        case 'wait_partial_refund':
          statusData[0] = this.$t('wait_partial_refund') //部分成交退币中…
          statusData[1] = '#707B9E'
          break
        case 'wait_partial_refund_confirm':
          statusData[0] = this.$t('wait_partial_refund_confirm') //部分成交退币确认中…
          statusData[1] = '#707B9E'
          break
        case 'partial_complete':
          statusData[0] = this.$t('partial_complete') //完成
          statusData[1] = '#1eb740'
          break
        case 'complete':
          statusData[0] = this.$t('receive_complete') //NFT接口 完成
          statusData[1] = '#1eb740'
          break
        case 'wait_partial_send_confirm_error':
          statusData[0] = this.$t('wait_partial_send_confirm_error') //部分成交发币确认中…
          statusData[1] = '#707B9E'
          break
        case 'wait_partial_refund_confirm_error':
          statusData[0] = this.$t('wait_partial_refund_confirm_error') //部分成交退币确认中…
          statusData[1] = '#707B9E'
          break
        default:
          statusData[0] = this.$t('exchangeIng')
          statusData[1] = '#707B9E'
      }
      return statusData
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
  },
}
</script>

<style lang="scss" scoped>
.centerDiv {
  .imgDiv {
    width: 100%;
    height: auto;
    margin-bottom: 10px;
    img {
      width: 2.98rem;
      margin: 0px auto;
      // padding-top: 12px;
      display: block;
    }
  }
  .content {
    width: 100%;
    &.pc {
      width: 90%;
    }
    margin: 0 auto;
    height: auto;
    .valDiv {
      .top,
      .bottom {
        height: 45px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .coinimg {
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
              font-size: 0.33rem;
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
      // align-items: center;
      margin: 8px 0;
      width: 100%;
      height: auto;
      line-height: 16px;

      .left {
        font-size: 0.259rem;
        font-family: Poppins-Regular, Poppins;
        font-weight: 400;
        color: #aab0c8;
        text-align: left;
        white-space: nowrap;
        position: relative;
        img {
          position: absolute;
          cursor: pointer;
        }
        #tips {
          width: 14px;
          height: 14px;
        }
      }
      .right {
        text-align: right;
        font-size: 0.259rem;
        font-family: DINPro-Medium, DINPro;
        font-weight: 500;
        color: #292929;
        display: flex;
        align-items: center;
        img {
          width: 0.296rem;
          height: 0.296rem;
          margin-left: 5px;
        }
        .dexlogo {
          width: 0.4rem;
          height: 0.4rem;
          margin-right: 5px;
        }
      }
    }
    .buttonDiv {
      div {
        width: 100%;
        height: 40px;
        line-height: 40px;
        font-size: 13px;
        font-family: 'Poppins-Regular, Poppins';
        font-weight: 400;
        color: #aab0c8;
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
        border-radius: 40px;
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
    padding: 8px 8px;
    font-size: 12px;
    text-align: left;
    font-family: PingFangSC-Semibold, PingFang SC;
  }
  .infoText {
    box-sizing: border-box;
    margin-left: -0.37rem;
    margin-right: -0.37rem;
    padding: 10px 20px;
    margin-bottom: 3px;
    background: #f2f8ff;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #89aee1;
    line-height: 18px;
    text-align: left;
    &.pc {
      box-sizing: content-box;
      width: 90%;
      padding: 10px calc(20px + 5%);
    }
    .service {
      a {
        color: #287ffa;
      }
    }
  }
}

.fee-span {
  display: inline-block;
  height: 19px;
  background: linear-gradient(180deg, #fad961 0%, #ffc078 100%);
  border-radius: 10px;
  color: #7d5500;
  text-align: center;
  padding: 0 8px;
  line-height: 19px;
  font-weight: 600;
  font-size: 13px;
}
</style>
