<template>
  <div>
    <Dialog :width="isPC ? '500px' : '90%'" ref="dialogPriceList">
      <div>
        <div class="title">
          {{$t('morePrice')}}
        </div>
        <div class="price-list-content" v-if="info">
          <div class="list-info th-title">
            <div class="item item1">{{$t('exchange')}}</div>
            <div class="item item2">{{$t('receivedQuantity')}}</div>
            <div class="item item3">{{$t('diff')}}</div>
          </div>
          <div class="list-info list" @click="changeInfoHandle(item)" :class="info.dex === item.dex ? 'active' : ''" v-for="(item,index) in priceList" :key="index">
              <div class="item item1">
                <img :src="item.logoUrl" alt=""> &nbsp;
                {{item.dex}}
                </div>
              <div class="item item2">{{Number(item.toTokenAmount).toFixed(6)}}</div>
              <div class="item item3" :class="index === 0 ? 'best' : 'err'">{{item.diff}}</div>
          </div>
        </div>
        <div class="closeIcon">
          <img @click="closeOrderDialog" src="../../assets/img/close.png" alt="" />
        </div>
      </div>

    </Dialog>
  </div>
</template>

<script>
import Dialog from './dialog'
export default {
  components: { Dialog },
  data() {
    return {

    }
  },
  props: {
    
  },
  computed: {
    info: {
      get() {
        return this.$store.state.info
      },
      set(obj) {
        this.$store.commit('setInfo', obj)
      },
    },
    priceList(){
        return this.$store.state.priceList
    },
  },
  watch: {},
  methods: {
    closeOrderDialog() {
      this.$refs.dialogPriceList.show = false
    },
    changeInfoHandle(item){
      this.info = item
      this.closeOrderDialog()
      this.$parent.dex = item.dex
    },
  },
  created() {
  },
  mounted() {
    
  },
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeDestroy() {
  }, // 生命周期 - 销毁之前
  destroyed() {}, // 生命周期 - 销毁完成
  activated() {}, // 如果页面有keep-alive缓存功能，这个函数会触发
}
</script>
<style lang="scss" scoped>
.title{
  font-size: .4rem;
  font-family: Poppins;
  color: #000000;
  text-align: left;
  font-weight: bold;
  margin-bottom: .2rem;
}
.price-list-content{
  min-height:50vh;
  .list-info{
    display: flex;
    width: 100%;
    padding: 0 .1rem;
    box-sizing: border-box;
    cursor: pointer;
    &.th-title{
      font-family: Poppins-Regular, Poppins;
      font-weight: 400;
      color: #999999;
    }
    &.list{
      font-family: Poppins-Regular, Poppins;
      color: #292929;
    }
    &.active{
      background: #F0F7FF;
      border: 1px solid #73ACFF;
      border-radius: .25rem;
    }
    .item{
      height: .95rem;
      display: flex;
      align-items: center;
      &.item1{
        width: 45%;
      }
      &.item2{
        width: 40%;
        overflow: hidden;
        overflow-x: auto;
      }
      &.item3{
        width: 15%;
        justify-content: end;
        &.best{
          color:#02BC74;
        }
        &.err{
          color:#CD4444;
        }
      }
      img{
        width: .6rem;
        height:.6rem;
      }
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
</style>
