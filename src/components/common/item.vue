<script>
import { Loading } from 'vant'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
const { ApiPromise, WsProvider } = require('@polkadot/api')
const { typesBundleForPolkadot } = require('@crustio/type-definitions')
import * as solanaWeb3 from '@solana/web3.js'
import getTerraBalanceHandle from '../../utils/getTerraBalance'
import BtcExchangeHandle from '../../utils/getBtcBalance'
import getNFTAsset from '../../utils/getNFTAsset'
import getEOSBalance from '../../utils/getEOSBalance'

export default {
  name: 'item',
  components: {
    Loading,
  },
  props: {
    source: {
      type: Object,
      default() {
        return {}
      },
    },
    currentCoin: {
      type: Object,
      default() {
        return {}
      },
    },
    type: {
      type: String,
      default() {
        return ''
      },
    },
    balanceLoading: {
      type: Boolean,
      default() {
        return true
      },
    },
  },
  computed: {
    showNFTInfo() {
      //判断状态 noOrders 无卖单 Orders 有卖单
      const asset = this.source.asset
      let info = ''
      switch (asset.status) {
        case 'noOrders':
          info = this.$t('noOrder', {
            type: asset.type === 'to' ? '卖' : '买',
          })
          break
        case 'Orders':
          info = this.$t('price') + '：' + asset.info
          break
        case 'noHave':
          info = this.$t('noHave')
          break
        default:
          break
      }
      return info
    },
  },
  watch: {
    balanceLoading(val) {
      this.loading = val
    },
  },
  data() {
    return {
      balance: '',
      loading: true,
    }
  },
  mounted() {
    this.loading = this.balanceLoading
    if (this.source.mainNetwork === 'NFT') {
      this.getNFTBalance()
    } else if (
      this.type === 'from' &&
      (this.$store.state.chainId === '000' ||
        this.$store.state.chainId === '2021' ||
        this.$store.state.chainId === '222' ||
        this.$store.state.chainId === '1993' ||
        this.$store.state.chainId === '1994' ||
        this.$store.state.chainId === '1040')
    ) {
      this.getCoinBalance()
    }
  },
  methods: {
    chooseCoin(data) {
      this.$bus.emit('chooseCoinHandle', data, this.type)
    },
    async getNFTBalance() {
      const asset = await getNFTAsset(this.source, this.type)
      this.$set(this.source, 'asset', asset)
    },
    async getCoinBalance() {
      const coin = this.source
      /* if (coin.mainNetwork === 'TRX') {
        if (!window.tronWeb) {
          Notify({
            color: '#ad0000',
            background: '#ffe1e1',
            message: this.$t('noWallet'),
          })
          return
        }
        let tronWeb = window.tronWeb
        if (coin.coinCode === 'TRX') {
          this.loading = true
          tronWeb.trx
            .getBalance(this.$store.state.walletTRON)
            .then((balance) => {
              this.source.balance = Number(tronWeb.fromSun(balance).toString())
              this.loading = false
            })
        } else {
          this.loading = true
          let data = {
            address: this.$store.state.walletTRON,
            visible: true,
          }
          generalApi
            .getTRC10TokenAccount(data)
            .then(async (res) => {
              let assets = res.assetV2
              if (assets && assets.length !== 0) {
                let token = assets.find((e) => {
                  if (e.key === coin.contact) {
                    return e
                  }
                })
                if (token) {
                  this.handleBalance(coin, token.value)
                } else if (coin.contact.length > 10) {
                  const { abi } = await tronWeb.trx.getContract(coin.contact)
                  const contract = tronWeb.contract(abi.entrys, coin.contact)

                  const trc20 = await contract.methods
                    .balanceOf(this.$store.state.walletTRON)
                    .call()
                  this.handleBalance(coin, trc20)
                } else {
                  this.source.balance = 0
                  this.loading = false
                }
              }
            })
            .catch((error) => {
              console.log(error)
              this.loading = false
            })
        }
      } else  */
      if (
        this.$store.state.chainId === '000' ||
        this.$store.state.chainId === '222'
      ) {
        // Construct
        let wsProvider = null
        let api = null
        if (this.$store.state.chainId === '222') {
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
        const account = this.$store.state.walletPolkadot
        if (account) {
          let acct = null
          if (this.$store.state.chainId === '222') {
            acct = await api.query.system.account(account.addrSS58CRU)
          } else {
            acct = await api.query.system.account(account.addrSS58)
          }
          const freeBalance = acct.data.free.toString(10)
          if (freeBalance == '0') {
            this.source.balance = 0
            this.loading = false
          } else {
            if (this.$store.state.chainId === '222') {
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
            this.source.balance = newBalance
            this.loading = false
          }
        }
      } else if (this.$store.state.chainId === '2021') {
        const connection = new solanaWeb3.Connection(
          solanaWeb3.clusterApiUrl('mainnet-beta'), //devnet   mainnet-beta
          'confirmed',
        )
        if (this.source.contact === '') {
          let account = await connection.getAccountInfo(window.solana.publicKey)
          let balanceSOL = 0
          if (account) {
            balanceSOL = (Number(account.lamports) / 1000000000).toFixed(6)
          }

          this.source.balance = balanceSOL
        } else {
          const account = await window.solana.connect()
          const tokenPublic = new solanaWeb3.PublicKey(this.source.contact) //9pBLiojTZMxbAPcsCWs8TQEiuCedRudzEFFakJFRCAoS
          const tokenAccount = await connection.getParsedTokenAccountsByOwner(
            window.solana.publicKey,
            { mint: tokenPublic },
          )
          const value = tokenAccount.value
          if (value.length > 0) {
            this.source.balance =
              tokenAccount.value[0].account.data.parsed.info.tokenAmount.uiAmount
          } else {
            this.source.balance = 0
          }
        }
        this.loading = false
      } else if (this.$store.state.chainId === '1993') {
        this.source.balance = await getTerraBalanceHandle(
          this.source,
          this.$store.state.wallet.address,
        )
        this.loading = false
      } else if (this.$store.state.chainId === '1994') {
        try {
          const balance = await BtcExchangeHandle.getBtcBalanceHandle()
          this.source.balance = balance
          this.loading = false
        } catch {
          console.log('计算余额出错')
          this.loading = false
        }
      }else if(this.$store.state.chainId === '1040'){
        try {
          const balance = await getEOSBalance(this.source)
          this.source.balance = balance
          this.loading = false
        } catch {
          console.log('计算余额出错')
          this.loading = false
        }
      }
    },
    getNFTOrderBalance(info) {
      return (
        info.current_price.toString() /
          10 ** info.payment_token_contract.decimals +
        ' ' +
        info.payment_token_contract.symbol
      )
    },
    handleBalance(coin, value) {
      let etherString = ethers.utils.formatUnits(value, coin.coinDecimal)
      const number = Number(
        new BigNumber(etherString).toFixed(6, BigNumber.ROUND_DOWN),
      )
      this.source.balance = number
      this.loading = false
    },
  },
  render() {
    if (this.$store.state.toToken) {
      if (
        `${this.type}` === 'from' &&
        this.$store.state.toToken.coinCode === this.source.coinCode
      ) {
        return
      }
    }
    if (this.$store.state.fromToken) {
      if (
        `${this.type}` === 'to' &&
        this.$store.state.fromToken.coinCode === this.source.coinCode
      ) {
        return
      }
    }
    return (
      <div
        id="coin_list"
        onclick={() => {
          this.chooseCoin(this.source)
        }}
        class={
          this.currentCoin && this.currentCoin.coinCode === this.source.coinCode
            ? 'active'
            : ''
        }
      >
        <div class="left">
          {this.source.mainNetwork === 'NFT' ? (
            <img
              class={this.isPC ? 'imgPC' : 'imgM'}
              src={this.source.logoURI}
              alt=""
            />
          ) : (
            <img
              class={this.isPC ? 'imgPC' : 'imgM'}
              src={`https://transfer.swft.pro/swft-v3/images/coins/${this.source.coinCode}.png`}
              alt=""
            />
          )}
          <div class="coin">
            {this.source.coinCode}
            <span>
              {this.source.mainNetwork || this.source.coinCode}
              {this.source.mainNetwork === 'NFT' ? (
                <b class="nft-info">
                  {this.source.asset ? this.showNFTInfo : ''}
                </b>
              ) : (
                ''
              )}
            </span>
          </div>
        </div>
        <div class="right">
          {this.currentCoin &&
          this.currentCoin.coinCode === this.source.coinCode ? (
            <svg
              t="1623379876661"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="1063"
              width="200"
              height="200"
            >
              <path
                d="M512 102.4c226.21184 0 409.6 183.38816 409.6 409.6S738.21184 921.6 512 921.6 102.4 738.21184 102.4 512s183.38816-409.6 409.6-409.6z m180.95104 265.68704h-42.5984c-9.2672 0-18.08384 4.096-23.53152 11.1104L484.02432 561.3568l-64.67584-82.54464c-5.44768-6.94272-14.16192-11.12064-23.52128-11.12064h-42.5984c-5.90848 0-9.35936 6.18496-5.90848 10.61888l113.18272 144.384c11.53024 14.78656 35.4304 14.78656 46.96064 0l191.30368-243.98848c3.54304-4.42368 0.09216-10.60864-5.81632-10.60864z"
                fill="#526EFF"
                p-id="1064"
              ></path>
            </svg>
          ) : (
            ''
          )}
          {this.type === 'from' && this.source.mainNetwork !== 'NFT' ? (
            <div class="blance-box">
              {this.loading ? (
                <Loading color="#1989fa" />
              ) : (
                <span>{this.source.balance}</span>
              )}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    )
  },
}
</script>

<style scoped lang="scss">
/deep/.van-loading__spinner {
  width: 15px;
  height: 15px;
}
.blance-box {
  height: 27px;
  line-height: 27px;
}
#coin_list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 5px 0;
  border-radius: 2px;
  // border-bottom: 1px solid #eee;
  color: #8f98ae;
  &.active {
    // background: #f5f6f7;
    color: #000;
  }
  &.M {
    margin-bottom: 5px;
    padding: 5px 0;
  }
  &:hover {
    // background: #f5f6f7;
    color: #000;
    box-shadow: 0 0 3px 0 #eee;
  }
  .left {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .imgM {
      width: 25px;
      height: 25px;
      margin-right: 15px;
    }
    .imgPC {
      width: 35px;
      height: 35px;
      margin-right: 15px;
    }
    .coin {
      text-align: left;
      font-family: Poppins-SemiBold, Poppins;
      word-break: break-all;
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
.list::-webkit-scrollbar {
  display: none !important;
}
.nft-info {
  display: inline-block;
  margin-left: 10px;
}
</style>
