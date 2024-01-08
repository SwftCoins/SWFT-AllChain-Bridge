<template>
  <div>
    <div class="footer">
      <div class="footerContPC">
        <div class="leftFlex">
          <div class="left" :class="isPC ? '' : 'mb'">
            <!-- 推特 -->
            <!-- <span class="flexSpan faq marginR">
              <svg
                @click="linkContact('twitter')"
                class="icon svgIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-tuite"></use>
              </svg>
            </span> -->
            <!-- 电报 -->
            <!-- <span class="flexSpan faq marginR">
              <svg
                @click="linkContact('tg')"
                class="icon svgIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-feiji"></use>
              </svg>
            </span> -->
            <!-- line -->
            <!-- <span class="flexSpan faq marginR">
              <svg
                @click="linkContact('line')"
                class="icon svgIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-line"></use>
              </svg>
            </span> -->
            <!-- discord -->
            <!-- <span class="flexSpan faq marginR">
              <svg
                @click="linkContact('discord')"
                class="icon svgIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-a-bianzu4"></use>
              </svg>
            </span> -->
             <!-- 联系方式 -->
             <span class="flexSpan faq marginR" @click="linkContact('cantact')">
              <svg class="icon svgIcon" aria-hidden="true">
                <use xlink:href="#icon-xiaoxi"></use>
              </svg>
              <span style="font-size:12px"
                >{{$t('contactus')}}</span
              >
            </span>
            <!-- 邮箱 -->
            <!-- <span class="flexSpan faq marginR">
              <svg class="icon svgIcon" aria-hidden="true">
                <use xlink:href="#icon-a-youjian1beifen"></use>
              </svg>
              <span style="font-size:12px"
                >admin@miningtw.com</span
              >
            </span> -->
          </div>
          <!-- <div class="right" :class="isPC ? '' : 'mb'">
            <span class="flexSpan faq marginR" @click="linkContact('faq')">
              <svg class="icon svgIcon" aria-hidden="true">
                <use xlink:href="#icon-faq"></use>
              </svg>
              <span style="font-size:12px"> {{ $t('FAQ') }} </span>
            </span>
            <span class="flexSpan faq marginR" @click="linkContact('docs')">
              <svg class="icon svgIcon" aria-hidden="true">
                <use xlink:href="#icon-doc"></use>
              </svg>
              <span style="font-size:12px"> Docs </span>
            </span>
            <span v-if="lang != 'en'" class="flexSpan faq">
              <svg class="icon svgIcon" aria-hidden="true">
                <use xlink:href="#icon-a-shiyongjiaochengbeifen2"></use>
              </svg>
              <span
                v-if="lang != 'en'"
                style="font-size:12px;margin-right: 20px"
                @click="linkContact('jiaocheng')"
                >使用教程</span
              >
            </span>
          </div> -->

        </div>
        <div class="rightFlex">
          <span class="flexSpan"
            >©2023 MiningTW BlockChain All Rights Reserved</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      bridgersFlag: localStorage.getItem('bridgersFlag'),
      sourceFlag: localStorage.getItem('sourceFlag'),
    }
  },
  // 监听属性 类似于data概念
  computed: {
    lang: {
      get() {
        return this.$store.state.lang
      },
      set(val) {
        this.$store.commit('setLang', val)
      },
    },
  },
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    linkContact(val) {
      if (val == 'twitter') {
        
      } else if (val == 'tg') {
        if (this.lang == 'en') {
          window.open('https://t.me/swfcoin')
        } else {
          window.open('https://t.me/swftswap_CN')
        }
      }else if (val == 'line') {
        window.open('https://line.mining.com.tw')
      } else if (val == 'faq') {
        if (this.lang == 'en') {
          window.open('https://faq.miningtw.xyz')
        } else {
          window.open('https://faq.miningtw.xyz')
        }
      } else if (val == 'jiaocheng') {
        if (this.lang != 'en') {
          window.open('https://use.miningtw.xyz')
        }
      } else if (val == 'docs') {
        window.open('https://docs.miningtw.xyz')
      }else if(val == 'cantact'){
        window.open('https://contact.miningtw.xyz')
      }
    },
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeDestroy() {}, // 生命周期 - 销毁之前
  destroyed() {}, // 生命周期 - 销毁完成
  activated() {}, // 如果页面有keep-alive缓存功能，这个函数会触发
}
</script>
<style lang="scss" scoped>
@import url('../assets/font/iconfont.css');
.footer {
  width: 100%;
  height: 66px;
  padding: 17px 0;
  background-color: #f1f4f9;
  .footerContPC {
    width: 100%;
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    color: #aab0c8;
    font-size: 12px;
    font-family: Poppins-Medium;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 15px;
    .svgIcon {
      width: 20px;
      height: 20px;
    }
    .leftFlex {
      width: 100%;
      flex: 1;
      display: flex;
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: center;
      min-width: 160px;
      flex-wrap: wrap;
      .left,.right{
        display: flex;
        &.mb{
          margin-bottom: 10px;
          width: 100%;
          justify-content: space-around;
        }
      }
      .marginR {
        margin-right: 0.2rem;
      }
      .flexSpan {
        cursor: pointer;
      }
      .faq {
        display: flex;
        align-items: center;
        svg {
          margin-right: 5px;
        }
      }
      .VIPDoc {
        width: 100px;
        flex: 1;
        white-space: nowrap;
        margin-left: 20px;
      }
    }
    .imgText_noVIP {
      width: 250px;
    }
    .imgText_VIP {
      width: 320px;
    }
    .rightFlex {
      flex: 1;
      text-align: right;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      .flexSpan {
        cursor: pointer;
        cursor: pointer;
        &:nth-child(1) {
          // flex: 1;
          text-align: left;
          margin: 0 20px;
          font-family: Poppins-Medium;
          color: #d4dae5;
        }
        &:nth-child(2) {
          display: flex;
          height: 20px;
          line-height: 20px;
          text-align: left;
          justify-content: flex-end;
          svg {
            margin-right: 5px;
          }
        }
      }
    }
  }
}
.router-link-a {
  color: #aab0c8;
}
</style>
