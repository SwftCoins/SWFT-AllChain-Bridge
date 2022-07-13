<template>
  <div class="home">
    <div class="caontainer" :style="{ 'min-width': isPC ? '1200px' : '320px' }">
      <Header />
      <div class="home-cont" v-if="showTradeBox">
        <div class="home-cont-trade" :class="isPC ? 'pc' : ''">
          <Trade />
        </div>
      </div>
      <Record v-show="showTradeBox" />
      <Records v-if="!showTradeBox" />
      <Order ref="order" />
    </div>
  </div>
</template>

<script>
import Header from './Header'
import Trade from './Trade'
import Record from './Record'
import Records from './Records'
import Order from './Order'
import baseApi from '../api/baseApi'
// import list from "./coinlist";

export default {
  name: 'Home',
  components: {
    Header,
    Trade,
    Record,
    Records,
    Order,
    // TradeDetails
  },
  data() {
    return {
      className: 'home',
      sourceFlag: localStorage.getItem('sourceFlag'),
      timer: null,
      // showTradeBox: true,
    }
  },
  computed: {
    order() {
      return this.$store.state.order
    },
    lang: {
      get() {
        return this.$store.state.lang
      },
      set(val) {
        this.$store.commit('setLang', val)
      },
    },
    showTradeBox: {
      get() {
        return this.$store.state.showTradeBox
      },
      set(val) {
        this.$store.commit('setShowTradeBox', val)
      },
    },
  },
  created() {
    if (this.isPc) {
      this.className = 'home-pc'
    }
    
    this.sourceFlag = localStorage.getItem('sourceFlag')
    if (this.sourceFlag == 'linknft') {
      this.$store.commit('setTabActive', 'NFT')
    }
    if(this.sourceFlag == 'bridgers'){
      console.log('获取bridgers 币种列表')
      this.queryBridgersCoinList()
    }else{
      this.getCoinList()
    }
    // this.$store.commit("setCoinList", list.data);
  },
  methods: {
    queryBridgersCoinList() {
      const CoinList = JSON.parse(localStorage.getItem('CoinList'))
      if (CoinList && CoinList != '') {
        this.$store.commit('setCoinList', CoinList)
      }
      baseApi.queryCoinList().then((res) => {
        const arr = []
        const list = res.data.filter( item => item.mainNetwork === 'ETH'
         || item.mainNetwork === 'BSC'
         || item.mainNetwork === 'HECO'
         || item.mainNetwork === 'POLYGON'
         || item.mainNetwork === 'OKExChain'
         || item.mainNetwork === 'TRX'
         || item.mainNetwork === 'FTM'
        )
        console.log(list)
        list.forEach((e) => {
          const mainNetwork = e.mainNetwork || e.coinCode
          if (!arr.includes(mainNetwork)) {
            arr.push(mainNetwork)
          }
        })
        if (Array.isArray(res && res.data)) {
          this.$store.commit('setCoinList', list)
          localStorage.setItem('CoinList', JSON.stringify(list))
        }
      })
    },
    // 获取币种列表
    getCoinList() {
      const CoinList = JSON.parse(localStorage.getItem('CoinList'))
      if (CoinList && CoinList != '') {
        this.$store.commit('setCoinList', CoinList)
      }
      baseApi.queryCoinList().then((res) => {
        const arr = []
        const list = res.data
        list.forEach((e) => {
          const mainNetwork = e.mainNetwork || e.coinCode
          if (!arr.includes(mainNetwork)) {
            arr.push(mainNetwork)
          }
        })
        if (Array.isArray(res && res.data)) {
          this.$store.commit('setCoinList', res.data)
          localStorage.setItem('CoinList', JSON.stringify(res.data))
        }
      })
    },
    linkContact() {
      window.open(
        'https://www.bangwo8.com/osp2016/im/pc/index.php?vendorID=782460&uid=&customSource=swft',
      )
    },
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
}
</script>
<style lang="scss" scoped>
.caontainer {
  min-height: calc(100% - 100px);
}
.home {
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  .home-cont {
    display: flex;
    justify-content: space-between;
    .home-cont-trade {
      width: calc(100% - 12px);
      box-sizing: border-box;
      padding: 6px;
      margin-left: 6px;
      &.pc {
        width: 560px;
        margin: 0 auto;
      }
      // background-color: #ff0;
    }
  }
}
</style>
<style lang="scss">
input::-webkit-input-placeholder {
  /* WebKit browsers */
  color: #aab0c8;
}
input:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: #ffffff;
}
input::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: #ffffff;
}
input:-ms-input-placeholder {
  /* Internet Explorer 10+ */
  color: #ffffff;
}
</style>
