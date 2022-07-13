<template>
  <div class="header" :class="isPC ? 'pc' : ''">
    <div class="logo">
      <a :href="websiteUrl" target="_bank">
        <img :src="logo" alt="" />
      </a>
    </div>
    <div class="app-header-right">
      <!-- 已连接 -->
      <el-popover
        placement="bottom-end"
        trigger="click"
        v-model="showPopover"
        :popper-class="isPC ? 'wallet-popper' : 'wallet-popper mb'"
        :offset="isPC ? -50 : []"
      >
        <div class="popover-content">
          <div class="name">
            {{ walletName }}
          </div>
          <div class="address">{{ cutAddress(walletAddress) }}</div>
          <div class="link">
            <div
              class="link-list"
              v-clipboard:copy="walletAddress"
              v-clipboard:success="onCopySuccess"
              v-clipboard:error="onCopyError"
            >
              <svg class="icon wallet-icon" aria-hidden="true">
                <use xlink:href="#icon-fuzhibeifen"></use></svg
              >&nbsp;{{ $t('copyAddress') }}
            </div>
            <div class="link-list" @click="viewHandler">
              <svg class="icon wallet-icon" aria-hidden="true">
                <use xlink:href="#icon-select"></use></svg
              >&nbsp;{{ $t('viewOn') }}
            </div>
          </div>
          <div class="btns">
            <el-button class="qh" @click="changeConnect">{{
              $t('change')
            }}</el-button>
            <el-button class="dk" @click="logoutConnect">{{
              $t('disconnect')
            }}</el-button>
          </div>
        </div>
        <div
          slot="reference"
          v-show="walletAddress"
          @mouseenter="mouseenter"
          class="wallets"
        >
          <span class="chainName themeDeep">
            <svg
              style="width: 32px"
              class="icon wallet-icon"
              aria-hidden="true"
            >
              <use :xlink:href="'#icon-' + walletName"></use>
            </svg>
            {{
              $store.getters.getChainIdName === 'OKExChain'
                ? 'OKC'
                : $store.getters.getChainIdName === 'ORC'
                ? 'Ontology'
                : $store.getters.getChainIdName
            }}
          </span>
          <span>{{ cutDeepAddress(walletAddress) }}</span>
          <!-- <svg style="width:22px;" class="icon wallet-icon" aria-hidden="true">
              <use xlink:href="#icon-zengjia"></use>
          </svg> -->
        </div>
      </el-popover>
      <!-- 未连接 -->
      <div v-if="!walletAddress" class="wallets" @click="changeWallets">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-lianjie"></use>
        </svg>
        <span>{{ $t('connectWallet') }}</span>
      </div>
      <div class="lang" @click="changeLang('')">
        <svg
          v-if="lang === 'en'"
          t="1618324696346"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1904"
          width="200"
          height="200"
        >
          <path
            d="M404.0192 686.848l13.44-57.7024h-185.6l21.5808-91.9808h157.0048l13.44-57.6768h-157.0048l20.992-89.0112h182.1184L483.4048 332.8H224.256L140.8 686.848zM555.1872 686.848l52.5312-221.2864 107.9808 221.2608h65.3824L864.512 332.8h-77.056l-51.9424 221.7728L626.9952 332.8h-65.3824l-83.456 354.048z"
            fill="#fff"
            p-id="1905"
          ></path>
        </svg>
        <svg
          v-if="lang === 'zh'"
          t="1618325026526"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2176"
          width="200"
          height="200"
        >
          <path
            d="M404.0192 686.848l13.44-57.7024h-185.6l21.5808-91.9808 13.44-57.6768 20.992-89.0112h182.1184L483.4048 332.8H224.256L140.8 686.848zM555.1872 686.848l52.5312-221.2864 107.9808 221.2608h65.3824L864.512 332.8h-77.056l-51.9424 221.7728L626.9952 332.8h-65.3824l-83.456 354.048z"
            fill="#fff"
            p-id="2177"
          ></path>
        </svg>
        <div class="lang-list" v-if="showLangList">
          <ul>
            <li
              @click.stop="changeLang('en')"
              :class="lang === 'en' ? 'active themeBg' : ''"
            >
              <svg
                t="1618324696346"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1904"
                width="200"
                height="200"
              >
                <path
                  d="M404.0192 686.848l13.44-57.7024h-185.6l21.5808-91.9808h157.0048l13.44-57.6768h-157.0048l20.992-89.0112h182.1184L483.4048 332.8H224.256L140.8 686.848zM555.1872 686.848l52.5312-221.2864 107.9808 221.2608h65.3824L864.512 332.8h-77.056l-51.9424 221.7728L626.9952 332.8h-65.3824l-83.456 354.048z"
                  fill="#fff"
                  p-id="1905"
                ></path>
              </svg>
              <div class="line"></div>
              <div class="name">English</div>
            </li>
            <li
              @click.stop="changeLang('zh')"
              :class="lang === 'zh' ? 'active themeBg' : ''"
            >
              <svg
                t="1618325026526"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="2176"
                width="200"
                height="200"
              >
                <path
                  d="M404.0192 686.848l13.44-57.7024h-185.6l21.5808-91.9808 13.44-57.6768 20.992-89.0112h182.1184L483.4048 332.8H224.256L140.8 686.848zM555.1872 686.848l52.5312-221.2864 107.9808 221.2608h65.3824L864.512 332.8h-77.056l-51.9424 221.7728L626.9952 332.8h-65.3824l-83.456 354.048z"
                  fill="#fff"
                  p-id="2177"
                ></path>
              </svg>
              <div class="line"></div>
              <div class="name">简体中文</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="bg">
      <div class="bg-box themeBg"></div>
    </div>
    <ConnectWallet ref="wallet"></ConnectWallet>
  </div>
</template>
<script>
import ConnectWallet from './ConnectWallet.vue'
import logoImg from '../config/logoImg'
import { Toast } from 'vant'
import { supportNetWork } from '../config/index'
export default {
  name: 'Header',
  components: { ConnectWallet },
  data() {
    return {
      showLangList: false,
      showMetamask: false,
      logo: '', //网站logo
      showPopover: false,
      websiteUrl: 'https://www.swft.pro/',
    }
  },
  mounted() {
    //获取标识
    const sourceFlag = localStorage.getItem('sourceFlag')
    let logodata = logoImg['widget']
    if (logoImg[sourceFlag]) {
      logodata = logoImg[sourceFlag]
    }
    this.logo = logodata.logo
  },
  computed: {
    walletName() {
      let name = this.$store.state.wallet.name
      if (this.$store.state.chainId == '000') {
        name = 'DOT'
      } else if (this.$store.state.chainId == '0') {
        name = 'TronLink'
      } else if (this.$store.state.chainId == '222') {
        name = 'CRU'
      }
      return name
    },
    wallet() {
      return this.$store.state.wallet.address
    },
    walletAddress() {
      let addr = this.$store.state.wallet.address
      if (this.$store.state.chainId == '000') {
        addr = this.$store.state.walletPolkadot.addrSS58
      } else if (this.$store.state.chainId == '222') {
        addr = this.$store.state.walletPolkadot.addrSS58CRU
      } else if (this.$store.state.chainId == '0') {
        addr = this.$store.state.walletTRON
      }
      return addr
    },
    lang: {
      get() {
        return this.$store.getters.getLang
      },
      set(val) {
        this.$i18n.locale = val
        this.$store.commit('setLang', val)
      },
    },
  },
  methods: {
    changeLang(val) {
      this.showLangList = !this.showLangList
      if (val) {
        this.lang = val
      }
    },
    changeWallets() {
      if (this.walletAddress === '') {
        //连接钱包
        this.$refs.wallet.$refs.dialog.show = true
      }
    },
    logoutConnect() {
      this.$bus.emit('disConnect')
      this.showPopover = false
    },
    changeConnect() {
      this.showPopover = false
      this.$refs.wallet.$refs.dialog.show = true
    },
    cutAddress(adr) {
      const beforeAdr = adr.substring(0, 15)
      const afterAdr = adr.substring(adr.length - 15, adr.length)
      if (adr.length > 31) {
        return beforeAdr + '...' + afterAdr
      } else {
        return adr
      }
    },
    cutDeepAddress(addr) {
      if (addr) {
        const str1 = addr.substring(0, 2)
        const str2 = addr.substring(addr.length - 4, addr.length)
        return str1 + '...' + str2
      } else {
        return ''
      }
    },
    onCopySuccess(val) {
      Toast.success(this.$t('copy_success'))
    },
    onCopyError(val) {
      // this.$message.success("复制失败");
    },
    viewHandler() {
      //浏览器查看
      const data = supportNetWork.find(
        (e) => this.$store.getters.getChainIdName === e.netWork,
      )
      if (!data) return
      if (
        this.$store.getters.getChainIdName === 'TRON' ||
        this.$store.getters.getChainIdName === 'OKExChain' ||
        this.$store.getters.getChainIdName === 'TT' ||
        this.$store.getters.getChainIdName === 'BSC' ||
        this.$store.getters.getChainIdName === 'ETH' ||
        this.$store.getters.getChainIdName === 'POLYGON' ||
        this.$store.getters.getChainIdName === 'ARB' ||
        this.$store.getters.getChainIdName === 'AVAXC' ||
        this.$store.getters.getChainIdName === 'FTM' ||
        this.$store.getters.getChainIdName === 'SOL' ||
        this.$store.getters.getChainIdName === 'HECO' ||
        this.$store.getters.getChainIdName === 'BTC' ||
        this.$store.getters.getChainIdName === 'LUNA' ||
        this.$store.getters.getChainIdName === 'ORC' ||
        this.$store.getters.getChainIdName === 'SGB' ||
        this.$store.getters.getChainIdName === 'HPB' ||
        this.$store.getters.getChainIdName === 'CRONOS' ||
        this.$store.getters.getChainIdName === 'AME' ||
        this.$store.getters.getChainIdName === 'ECH' ||
        this.$store.getters.getChainIdName === 'CUBE' ||
        this.$store.getters.getChainIdName === 'GNOSIS' ||
        this.$store.getters.getChainIdName === 'CELO'
      ) {
        window.open(data.blockExplorerUrls + '/address/' + this.walletAddress)
      } else if (
        this.$store.getters.getChainIdName === 'CRU' ||
        this.$store.getters.getChainIdName === 'Polkadot' ||
        this.$store.getters.getChainIdName === 'XRP' ||
        this.$store.getters.getChainIdName === 'EOS'
      ) {
        window.open(data.blockExplorerUrls + '/account/' + this.walletAddress)
      }
    },
    mouseenter() {
      if (this.isPC) {
        this.showPopover = true
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  max-width: 750px;
  width: calc(100% - 32px);
  height: 60px;
  padding: 0px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.pc {
    max-width: 1200px !important;
    margin: 0 auto;
    // background: linear-gradient(223deg, #00366F 0%, #00193C 100%);
  }

  .bg {
    height: 270px;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
    z-index: -99;
    .bg-box {
      height: 1000vw;
      width: 1000vw;
      border-radius: 500vw;
      position: absolute;
      bottom: 0;
      left: -450vw;
      z-index: -99;
    }
  }
  .logo {
    width: 68px;
    height: 80px;
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    img {
      width: 68px;
    }
  }
  .app-header-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .wallets:hover {
      span {
        color: #fff;
      }
    }
    .wallets {
      height: 35px;
      margin-left: 0 !important;
      .chainName {
        margin-left: 8px;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        font-size: 12px;
        margin-right: 5px;
        position: relative;
        height: 22px;
        line-height: 22px;
        padding-left: 28px;
        svg {
          margin: 3px 0 0 !important;
          position: absolute;
          left: -6px;
          top: -40%;
        }
      }
    }
    .wallets,
    .lang {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-left: 10px;
      position: relative;
      background: rgba(241, 134, 134, 0.04);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      svg {
        height: 35px;
        width: 32px;
        margin: 0 5px;
      }
      span {
        padding-right: 10px;
        white-space: nowrap;
        -webkit-text-size-adjust: none;
        font-size: 14px;
        font-family: Poppins;
        color: #ffffff;
        cursor: pointer;
      }
      .lang-list {
        padding: 0px 10px;
        position: absolute;
        top: 55px;
        right: 0;
        // width: 150px;
        height: 100px;
        word-break: keep-all;
        background: #f6f9ff;
        border-radius: 13px;
        border: 1px solid rgba(39, 127, 250, 0.64);
        z-index: 99;
        ul {
          li {
            height: 42px;
            padding: 0 10px;
            margin: 5px 0;
            border-radius: 9px;
            display: flex;
            justify-content: space-between;
            color: #277ffa;
            align-items: center;
            cursor: pointer;
            font-size: 18px;
            svg {
              width: 30px;
              height: 30px;
              margin-right: 10px;
            }
            svg path {
              fill: #277ffa;
              transition: 0.2s;
            }
            .line {
              height: 20px;
              width: 1px;
              margin: 0 5px;
              background: #fff;
            }
            .name {
              margin: 0 10px;
              font-family: Poppins;
            }
            &.active {
              border: 0px solid #2980fa;
              color: #ffffff;
              svg path {
                fill: #fff;
                transition: 0.2s;
              }
            }
          }
        }
      }
    }
  }
}
</style>
