<template>
  <div class="receiving-address">
    <div class="title">{{ $t('reAddress') }}</div>
    <input
      class="address"
      :placeholder="this.$t('receivingAddress')"
      v-model="address"
      @focus="focusHandle"
      @blur="blurHandler"
    />
    <div class="toAddress-select" v-if="showToAddress && toAddress !== ''">
      <div class="address-input" @click="clickHandle">
        {{ toAddress }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ReceivingAddress',
  data() {
    return {
      toAddress: '',
      showToAddress: false,
      address: '',
    }
  },
  watch: {
    chainId(val, old) {
      this.changeAddress()
    },
    toToken(val, old) {
      this.changeAddress()
    },
    address(val, old) {
      this.$store.commit('setAddress', val)
    },
    '$store.state.wallet': {
      deep: true,
      handler: function (newV) {
        this.changeAddress()
      },
    },
  },
  created() {
    //this.toAddress = this.$store.state.address
    this.changeAddress()
    this.$bus.on('clearAddress', this.clearAddress)
  },
  computed: {
    // address: {
    //   get() {
    //     //return this.toAddress;
    //   },
    //   set(val) {
    //     return this.$store.commit('setAddress', val);
    //   },
    // },
    chainId() {
      return this.$store.state.chainId
    },
    toToken() {
      return this.$store.state.toToken
    },
    evmList() {
      return this.$store.state.evmList
    },
  },
  methods: {
    clearAddress() {
      this.address = ''
    },
    focusHandle() {
      this.showToAddress = true
    },
    blurHandler(e) {
      setTimeout(() => {
        this.showToAddress = false
      }, 200)
    },
    clickHandle() {
      this.address = this.toAddress
    },
    changeAddress() {
      this.toAddress = ''
      this.address = ''
      const mainNetwork = this.toToken
        ? this.toToken.mainNetwork || this.toToken.coinCode
        : ''
      if (
        mainNetwork === 'ETH' ||
        mainNetwork === 'BSC' ||
        mainNetwork === 'HECO' ||
        mainNetwork === 'POLYGON' ||
        mainNetwork === 'OKExChain' ||
        mainNetwork === 'ARB' ||
        mainNetwork === 'AVAXC' ||
        mainNetwork === 'TT' ||
        mainNetwork === 'DOT' ||
        mainNetwork === 'CRU' ||
        mainNetwork === 'TRX' ||
        mainNetwork === 'XDC' ||
        mainNetwork === 'SOL' ||
        mainNetwork === 'KLAY' ||
        mainNetwork === 'FTM' ||
        mainNetwork === 'CELO' ||
        mainNetwork === 'ORC' ||
        mainNetwork === 'SGB' ||
        mainNetwork === 'HPB' ||
        mainNetwork === 'CUBE' ||
        mainNetwork === 'CRONOS' ||
        mainNetwork === 'ECH' ||
        mainNetwork === 'AME' ||
        mainNetwork === 'GNOSIS' ||
        mainNetwork === 'EOS'
      ) {
        if (
          this.chainId === '1' ||
          this.chainId === '56' ||
          this.chainId === '128' ||
          this.chainId === '137' ||
          this.chainId === '66' ||
          this.chainId === '42161' ||
          this.chainId === '43114' ||
          this.chainId === '108' ||
          this.chainId === '000' ||
          this.chainId === '222' ||
          this.chainId === '0' ||
          this.chainId === '2021' ||
          this.chainId === '50' ||
          this.chainId === '8217' ||
          this.chainId === '250' ||
          this.chainId === '1040' ||
          this.chainId === '58' ||
          this.chainId === '269' ||
          this.chainId === '25' ||
          this.chainId === '180' ||
          this.chainId === '3000' ||
          this.chainId === '1818' ||
          this.chainId === '100' ||
          this.chainId === '42220'
        ) {
          if (
            this.$store.state.walletPolkadot !== null &&
            this.toToken.mainNetwork === 'DOT'
          ) {
            this.toAddress = this.$store.state.walletPolkadot.addrSS58
          } else if (
            this.$store.state.walletPolkadot !== null &&
            this.toToken.mainNetwork === 'CRU'
          ) {
            this.toAddress = this.$store.state.walletPolkadot.addrSS58CRU
          } else if (
            this.$store.state.walletTRON !== null &&
            this.toToken.mainNetwork === 'TRX'
          ) {
            this.toAddress = this.$store.state.walletTRON
          } else if (
            this.$store.state.wallet.address !== null &&
            this.toToken.mainNetwork === 'SOL' &&
            this.$store.state.fromToken.mainNetwork === 'SOL'
          ) {
            this.toAddress = this.$store.state.wallet.address
          } else if (
            this.$store.state.wallet.address !== null &&
            this.evmList.indexOf(this.toToken.mainNetwork) > -1 &&
            this.evmList.indexOf(this.$store.state.fromToken.mainNetwork) > -1
          ) {
            this.toAddress = this.$store.state.wallet.address
          } else if (
            this.$store.state.wallet.address !== null &&
            this.toToken.mainNetwork === 'EOS' &&
            this.$store.state.fromToken.mainNetwork === 'EOS'
          ) {
            this.toAddress = this.$store.state.wallet.address
          } else {
            this.toAddress = ''
          }
        }
      } else {
        this.toAddress = ''
        this.address = ''
      }
    },
  },
  beforeDestroy() {
    this.$bus.off('clearAddress', this.clearAddress)
  },
}
</script>

<style lang="scss" scoped>
.receiving-address {
  margin: 0.37rem 0 0.5rem;
  position: relative;
  .toAddress-select {
    position: absolute;
    bottom: -1.2rem;
    left: 0;
    width: 100%;
    height: -1.2rem;
    background: #f7f8fa;
    box-shadow: 0px 10px 11px 0px rgba(173, 180, 191, 0.34);
    border-radius: 0.265rem;
    border: 1px solid #f1f1f1;
    padding: 0.18rem;
    box-sizing: border-box;
    z-index: 5;
    .address-input {
      width: 100%;
      height: 100%;
      background: #ffffff;
      box-shadow: 0px 17px 19px 0px rgba(242, 247, 255, 0.42);
      border-radius: 12px;
      font-size: 0.25rem;
      font-family: Poppins-Medium;
      font-weight: 500;
      color: #666c82;
      line-height: 0.92rem;
      cursor: pointer;
      text-align: left;
      overflow: hidden;
    }
  }
  .title {
    height: 0.92rem;
    line-height: 0.92rem;
    text-align: left;
    font-size: 0.33rem;
    font-family: Poppins-Bold;
    color: #000000;
  }
  .address {
    font-family: Poppins-Medium;
    height: 0.74rem;
    line-height: 0.74rem;
    width: 100%;
    text-align: left;
    border: none;
    border-bottom: 1px solid #aab0c8;
    font-size: 0.259rem;
    transition: border-bottom 0.5s;
    -webkit-transition: border-bottom 0.5s;
    -webkit-appearance: none;
    padding: 0;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    outline: none;
    border-radius: 0;
    &:hover {
      color: #000000;
      border-bottom: 1px solid #000000;
    }
  }
}
</style>
