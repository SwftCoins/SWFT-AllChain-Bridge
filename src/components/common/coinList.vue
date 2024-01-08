<script>
import DialogContent from "./dialog";
import { supportNetWork } from "../../config";
import { Toast, Notify, Dialog } from "vant";
import VirtualList from "vue-virtual-scroll-list";
import item from "./item";
import getAllBalance from "../../utils/getAllBalance";
import BigNumber from "bignumber.js";
import getTronBalance from "../../utils/getTronBalance";
import getAPTBalance from "../../utils/getAPTBalance";
import baseApi from "../../api/baseApi";
import tronApi from "../../api/BaseGeneralApi";
import getSolTokenBalance from "../../utils/getSolTokenBalance";
import getPolkadotBalance from "../../utils/getPolkadotBalance";
import getDogeBalance from "../../utils/getDogeBalance";
import getFILBalance from "../../utils/getFILBalance";
let currentChain = "";
let tp = null;
let isTP = false;
try {
  tp = require("tp-js-sdk");
  isTP = tp.isConnected();
} catch (error) {
  console.log(error);
}
export default {
  name: "CoinList",
  components: {
    DialogContent,
    "virtual-list": VirtualList,
    item,
  },
  props: {
    type: {
      type: String,
      default: "from",
    },
  },
  data() {
    return {
      search: "",
      activeNetwork: "",
      timer: null,
      width: "330px",
      allAccountsSS58: [],
      balanceLoading: this.chainId ? true : false,
    };
  },
  watch: {
    getChainIdName(val, old) {
      if (this.type === "from") {
        this.ChainIdNameChangeHandle(val);
        if (old) {
          this.openEvent();
        }
      }
    },
    tokens(val) {
      if (val) {
        if (this.type == "from") {
          const netWork = localStorage.getItem("netWork");
          this.activeNetwork = netWork || this.tokens[0].netWork;
        }
      }
    },
  },
  created() {
    this.$bus.on("chooseCoinHandle", this.choiceCoin);
  },
  beforeDestroy() {
    this.$bus.off("chooseCoinHandle", this.choiceCoin);
  },
  computed: {
    tabActive: {
      get() {
        return this.$store.state.tabActive;
      },
    },
    connectType() {
      return this.$store.state.wallet.connectType;
    },
    currentCoin() {
      if (this.type === "from") {
        if (this.tabActive == "gasSwap") {
          return this.$store.state.gasFromToken;
        } else {
          return this.$store.state.fromToken;
        }
      } else {
        return this.$store.state.toToken;
      }
    },
    otherCoin() {
      if (this.type === "to") {
        return this.$store.state.fromToken;
      } else {
        return this.$store.state.toToken;
      }
    },
    getChainIdName: {
      get() {
        return this.activeNetwork;
      },
      set(val) {},
    },
    chainList() {
      return this.$store.state.chainList;
    },
    toShowChain() {
      return this.$store.state.showChainList;
    },
    supportArr() {
      return this.$store.state.supportChianArr;
    },
    supportStr() {
      return this.$store.state.supportChianArr.toString();
    },
    tokens() {
      const coinList = this.$store.state.coinList;
      if (!coinList) {
        return;
      }
      let noSupportCoin =
        this.otherCoin && this.otherCoin.noSupportCoin
          ? this.otherCoin.noSupportCoin.split(",")
          : [];
      if (!noSupportCoin || !noSupportCoin.length) {
        noSupportCoin = [];
      }
      if (this.type == "from") {
        noSupportCoin = [];
      }
      const list = coinList.filter((e) => {
        if (
          !noSupportCoin.includes(e.coinCode) ||
          (this.type === "from" &&
            this.otherCoin &&
            e.coinCode === this.otherCoin.coinCode)
        ) {
          //
          return e;
        }
      });
      const arr = [];
      list.forEach((e) => {
        let netWork =
          (e.mainNetwork == "DOT"
            ? "Polkadot"
            : e.mainNetwork == "TRX"
            ? "TRON"
            : e.mainNetwork) || e.coinCode;

        let isSupport = supportNetWork.some((e) => {
          if (e.netWork === netWork) {
            return true;
          }
        });

        if (!isSupport && this.type === "from") {
          return;
        }
        let obj = arr.find((a) => {
          if (a.netWork === netWork && this.type === "from") {
            return a;
          }
          if (this.type === "to" && a.netWork === netWork) {
            return a;
          }
        });
        if (!obj) {
          if (this.toShowChain.indexOf(netWork) == -1) {
            return;
          } else {
            this.chainList.forEach((x) => {
              if (x.chain == netWork) {
                arr.push({
                  netWork,
                  list: [e],
                  isNew: x.isNew,
                  isHot: x.isHot,
                });
              }
            });
          }
        } else {
          obj.list.push(e);
        }
        if (obj) {
          obj.list = this.coinSort(obj.list);
        }
      });
      arr.sort((next, prev) => {
        return (
          this.supportArr.indexOf(prev.netWork) -
          this.supportArr.indexOf(next.netWork)
        );
      });
      if (this.type === "from") {
        this.$store.commit("setCoinListChain", arr);
      }
      return arr;
    },
    coinList() {
      const coinList = this.$store.state.coinList;
      if (!coinList) {
        return;
      }
      let noSupportCoin =
        this.otherCoin && this.otherCoin.noSupportCoin
          ? this.otherCoin.noSupportCoin.split(",")
          : [];
      let list = coinList.filter((e) => {
        if (!noSupportCoin.includes(e.coinCode)) {
          return e;
        }
      });
      if (this.getChainIdName) {
        const obj = this.tokens.find((e) => {
          if (e.netWork === this.getChainIdName) {
            return e;
          }
        });
        list = obj ? obj.list : [];
      } else {
        if (this.type === "from") {
          let arr = [];
          this.tokens.forEach((e) => {
            const ishas = supportNetWork.some((netWork) => {
              if (netWork.netWork === e.netWork) {
                return true;
              }
            });
            if (ishas) {
              arr.push(e.list);
            }
          });
          list = arr.flat(2);
        }
      }
      list = list.filter(
        (item) => item.isSupportAdvanced || item.mainNetwork === "NFT"
      );
      if (this.search) {
        const arr = [];
        list.forEach((e) => {
          const coinAllCode = e.coinAllCode ? e.coinAllCode.toLowerCase() : "";
          const str = e.coinCode ? e.coinCode.toLowerCase() : "";
          const adr = e.contact ? e.contact.toLowerCase() : "";
          const s = this.search.toLowerCase();
          if (str.indexOf(s) !== -1) {
            arr.push(e);
          }
        });
        return arr;
      } else {
        if (this.getChainIdName === "" || this.getChainIdName === undefined) {
          return list;
        } else {
          return this.coinSort(list);
        }
      }
    },
    rpcObject() {
      return this.$store.state.rpcObject;
    },
    chainId() {
      return this.$store.state.chainId;
    },
  },
  mounted() {
    this.width = this.isPC ? "504px" : "350px";
    if (this.type === "from") {
      this.ChainIdNameChangeHandle(this.getChainIdName);
    }
  },
  methods: {
    choiceCoin(item, type) {
      console.log(JSON.stringify(item));
      if (type === "from") {
        if (this.tabActive == "swap") {
          this.$store.commit("setFromToken", item);
          localStorage.setItem("localFromToken", JSON.stringify(item));
        } else if (this.tabActive == "gasSwap") {
          this.$store.commit("setgasFromToken", item);
        } else if (this.tabActive == "NFT") {
          this.$store.commit("setNFTFromToken", item);
        }
        this.$store.commit("setIsUserChoose", true);
      } else {
        if (this.tabActive == "swap") {
          this.$store.commit("setToToken", item);
          localStorage.setItem("localToToken", JSON.stringify(item));
        } else if (this.tabActive == "NFT") {
          this.$store.commit("setNFTToToken", item);
        }
      }
      this.$refs.dialog.show = false;
    },
    // 关闭弹窗事件
    closeEvent() {
      this.search = "";
    },
    compare(property, desc) {
      return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        if (desc == true) {
          //排序升序排列
          return value1 - value2;
        } else {
          return value2 - value1;
        }
      };
    },
    async openEvent() {
      //判断钱包是否连接
      this.coinList.forEach((item, index) => {
        item.balance = 0;
      });
      if (!this.chainId) return;
      if (
        this.type === "from" &&
        (this.getChainIdName === "TT" ||
          this.getChainIdName === "OKExChain" ||
          this.getChainIdName === "ETH" ||
          this.getChainIdName === "BSC" ||
          this.getChainIdName === "HECO" ||
          this.getChainIdName === "POLYGON" ||
          this.getChainIdName === "DIS" ||
          this.getChainIdName === "ETHW" ||
          this.getChainIdName === "Optimism" ||
          this.getChainIdName === "ARB" ||
          this.getChainIdName === "AVAXC" ||
          this.getChainIdName === "XDC" ||
          this.getChainIdName === "KLAY" ||
          this.getChainIdName === "CELO" ||
          this.getChainIdName === "ORC" ||
          this.getChainIdName === "SGB" ||
          this.getChainIdName === "HPB" ||
          this.getChainIdName === "CRONOS" ||
          this.getChainIdName === "AME" ||
          this.getChainIdName === "ECH" ||
          this.getChainIdName === "CUBE" ||
          this.getChainIdName === "GNOSIS" ||
          this.getChainIdName === "ETC" ||
          this.getChainIdName === "KCC" ||
          this.getChainIdName === "BRISE" ||
          this.getChainIdName === "FTM" ||
          this.getChainIdName === "DRAC" ||
          this.getChainIdName === "FSC" ||
          this.getChainIdName === "FRZ" ||
          this.getChainIdName === "GRC30" ||
          this.getChainIdName === "CORE" ||
          this.getChainIdName === "DC" ||
          this.getChainIdName === "MTR" ||
          this.getChainIdName === "BTTC" ||
          this.getChainIdName === "ZKSYNC" ||
          this.getChainIdName === "CFX" ||
          this.getChainIdName === "FVM" ||
          this.getChainIdName === "EOS(EVM)" ||
          this.getChainIdName === "BASE" ||
          this.getChainIdName === "LINEA" ||
          this.getChainIdName === "PEGO" ||
          this.getChainIdName === "opBNB" ||
          this.getChainIdName === "ETRC20" ||
          this.getChainIdName === "OZO" ||
          this.getChainIdName === "QITMEER" ||
          this.getChainIdName === "PATEX" ||
          this.getChainIdName === "zkEVM" ||
          this.getChainIdName === "SCROLL" ||
          this.getChainIdName === "MNT" ||
          this.getChainIdName === "PulseChain")
      ) {
        const Web3 = require("web3");

        if (
          this.connectType == "LeafWallet" ||
          this.connectType == "LiqualityWallet" ||
          this.connectType == "TokenPocketBTC" ||
          this.connectType == "TokenPocketDoge" ||
          this.connectType == "TerraStation" ||
          this.connectType == "Phantom" ||
          this.connectType == "TronLink" ||
          this.connectType == "Polkadot" ||
          this.connectType == "Petra" ||
          this.connectType == "Unisat" ||
          !Web3.utils.isAddress(this.$store.state.wallet.address)
        ) {
          this.balanceLoading = false;
          return;
        }
        this.balanceLoading = true;
        const data = await getAllBalance(this.coinList, this.getChainIdName);
        this.coinList.forEach((item, index) => {
          if (item.mainNetwork === "CFX") {
            item.balance = data > 0 ? data : 0;
            this.balanceLoading = false;
            return;
          }
          const coinDecimalNum =
            item.coinDecimal == null ? 0 : item.coinDecimal;
          const balance =
            new BigNumber(data[index].result)
              .shiftedBy(-(coinDecimalNum != 0 ? coinDecimalNum : 18))
              .toFixed(6, BigNumber.ROUND_DOWN) - 0;
          item.balance = balance > 0 ? balance : 0;
        });
        this.balanceLoading = false;
      }
      if (this.type === "from" && this.getChainIdName === "TRON") {
        //判断当前连接钱包是否为tronlin 钱包
        if (this.connectType != "TronLink") {
          this.balanceLoading = false;
          return;
        }
        this.balanceLoading = true;
        const reslt = await getTronBalance();
        let tronWeb = window.tronWeb;
        const result = await Promise.all(
          this.coinList.map(async (item) => {
            if (item.coinCode === "TRX") {
              item.balance = Number(tronWeb.fromSun(reslt.balance).toString());
            } else {
              if (item.contact.length > 10) {
                /* const contract = await tronWeb.contract().at(item.contact)
                const trc20 = await contract
                  .balanceOf(this.$store.state.walletTRON)
                  .call() */
                const res = await tronApi.getTRC20TokenBalance(
                  tronWeb.address.toHex(item.contact),
                  tronWeb.address.toHex(this.$store.state.walletTRON)
                );
                let bal = res.constant_result[0].replace(/\b(0+)/gi, "");
                bal = bal === "" ? "0x0" : "0x" + bal;
                const balance = tronWeb
                  .BigNumber(bal)
                  .shiftedBy(
                    -(item.coinDecimal != null ? item.coinDecimal : 18)
                  )
                  .toFixed(6, BigNumber.ROUND_DOWN);
                item.balance = balance > 0 ? balance : 0;
              } else {
                let assets = reslt.assetV2;
                if (assets && assets.length !== 0) {
                  let token = assets.find((e) => {
                    if (e.key === item.contact) {
                      return e;
                    }
                  });
                  if (token) {
                    const balance = new BigNumber(token.value)
                      .shiftedBy(
                        -(item.coinDecimal != null ? item.coinDecimal : 18)
                      )
                      .toFixed(6, BigNumber.ROUND_DOWN);
                    item.balance = balance > 0 ? balance : 0;
                  } else {
                    item.balance = 0;
                  }
                } else {
                  item.balance = 0;
                }
              }
            }
          })
        );
        this.balanceLoading = false;
      }
      if (this.type === "from" && this.getChainIdName === "SOL") {
        //判断当前连接钱包是否为Phantom 钱包
        if (this.connectType != "Phantom") {
          this.balanceLoading = false;
          return;
        }
        this.balanceLoading = true;
        const solanaWeb3 = await import("@solana/web3.js");
        const connection = new solanaWeb3.Connection(
          this.$store.state.rpcObject.SOL[0] || "https://rpc.ankr.com/solana", //devnet   mainnet-beta
          "confirmed"
        );
        const result = await Promise.all(
          this.coinList.map(async (item) => {
            if (item.contact === "") {
              try {
                let account = await connection.getAccountInfo(
                  window.solana.publicKey
                );
                let balanceSOL = 0;
                if (account) {
                  balanceSOL = (Number(account.lamports) / 1000000000).toFixed(
                    6
                  );
                }
                item.balance = balanceSOL;
              } catch (err) {}
            } else {
              const balance = await getSolTokenBalance(
                this.$store.state.wallet.address,
                item.contact
              );
              if (balance > 0) {
                item.balance = balance;
              } else {
                item.balance = 0;
              }
            }
          })
        );
        this.balanceLoading = false;
      }
      if (this.type === "from" && this.getChainIdName === "XRP") {
        if (this.connectType != "XUMM") {
          this.balanceLoading = false;
          return;
        }
        this.balanceLoading = true;
        const xrpBalance = await baseApi.getXRPBalance(
          this.$store.state.wallet.address
        );
        const tokensBalance = await baseApi.getXRPTokensBalance(
          this.$store.state.wallet.address
        );
        this.coinList.forEach((item) => {
          if (item.coinCode === "XRP") {
            let balance = 0;
            if (xrpBalance.xrpBalance) {
              balance =
                Number(xrpBalance.xrpBalance) - xrpBalance.ownerCount * 2 - 10;
            }
            item.balance = Number(balance).toFixed(6) - 0;
          } else {
            if (tokensBalance && tokensBalance.length !== 0) {
              let token = tokensBalance.find(
                (e) => e.counterparty === item.contact
              );
              if (token) {
                const balance = Number(token.value).toFixed(6);
                item.balance = balance > 0 ? balance : 0;
              } else {
                item.balance = 0;
              }
            }
          }
        });
        this.balanceLoading = false;
      }
      if (this.type === "from" && this.getChainIdName === "APT") {
        //判断当前连接钱包是否为Petra钱包
        if (this.connectType != "Petra" && this.connectType != "MSafe") {
          this.balanceLoading = false;
          return;
        }
        this.balanceLoading = true;
        const reslt = await getAPTBalance();
        this.coinList.forEach((item) => {
          if (item.coinCode === "APT") {
            if (reslt) {
              item.balance = Number(reslt).toFixed(6) - 0;
            } else {
              item.balance = 0;
            }
          }
        });
        this.balanceLoading = false;
      }
      if (
        this.type === "from" &&
        (this.getChainIdName === "DOT" ||
          this.getChainIdName === "Polkadot" ||
          this.getChainIdName === "DBC" ||
          this.getChainIdName === "CRU")
      ) {
        //Polkadot
        if (this.connectType != "Polkadot") {
          this.balanceLoading = false;
          return;
        }
        this.balanceLoading = true;
        let newBalance = 0;
        this.coinList.forEach(async (item) => {
          const freeBalance = await getPolkadotBalance(item);
          if (freeBalance == "0") {
            newBalance = 0;
          } else {
            if (item.mainNetwork === "CRU") {
              newBalance =
                freeBalance.slice(0, freeBalance.length - 12) +
                "." +
                freeBalance.slice(1);
            } else if (item.mainNetwork === "DBC") {
              newBalance = freeBalance / 1000000000000000;
            } else {
              newBalance =
                freeBalance.slice(0, freeBalance.length - 10) +
                "." +
                freeBalance.slice(1);
              if (item.contact == "1984") {
                newBalance = new BigNumber(freeBalance)
                  .dividedBy(BigNumber(10).pow(item.coinDecimal))
                  .toFixed(4, BigNumber.ROUND_DOWN);
              }
            }
          }
          // this.$set(item, 'balance', newBalance)
          item.balance = Number(newBalance).toFixed(6);
        });
        this.balanceLoading = false;
      }
      if (this.type === "from" && this.getChainIdName === "DOGE") {
        //判断当前连接钱包是否为TokenPocketDoge钱包
        if (this.connectType != "TokenPocketDoge") {
          this.balanceLoading = false;
          return;
        }
        this.balanceLoading = true;
        const reslt = await getDogeBalance();
        this.coinList.forEach((item) => {
          item.balance = Number(reslt).toFixed(6);
        });
        this.balanceLoading = false;
      }
      if (this.type === "from" && this.getChainIdName === "FIL") {
        //判断当前连接钱包是否为MathWallet钱包
        if (this.connectType != "MathWallet") {
          this.balanceLoading = false;
          return;
        }
        this.balanceLoading = true;
        const reslt = await getFILBalance();
        this.coinList.forEach((item) => {
          item.balance = Number(reslt).toFixed(6);
        });
        this.balanceLoading = false;
        return;
      }
    },
    //切换网络
    async choiceNetWork(val) {
      if (
        val &&
        this.supportStr.indexOf(val.netWork) == -1 &&
        this.type === "from"
      ) {
        Toast(this.$t("comingSoon"));
        return;
      }
      this.activeNetwork = (val && val.netWork) || "";
      if (this.type == "from") {
        localStorage.setItem("netWork", this.activeNetwork);
      }
    },
    //调用polkdot钱包插件
    async polkDotFuc(val) {
      if (
        this.$store.state.walletPolkadot === null &&
        (val.netWork === "Polkadot" ||
          val.netWork === "CRU" ||
          val.netWork === "DBC")
      ) {
        this.$bus.emit("getPolkadot", val.netWork);
      } else {
        if (val.netWork == "CRU") {
          this.$store.commit("setChainId", "222");
        }
        if (val.netWork == "DBC") {
          this.$store.commit("setChainId", "333");
        } else {
          this.$store.commit("setChainId", "000");
        }
        this.$store.commit("setWalletConnectType", "Polkadot");
      }
    },
    setTokenHandle() {
      const list = this.$store.state.coinList;
      const sourceFlag = localStorage.getItem("sourceFlag");
      let token = null;
      let fromtoken = null;
      //这里判断定制化显示目标币
      if (sourceFlag === "Bet") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "BET(HECO)"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "kfi") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "OKT"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "GemProtocol") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "GEM(BSC)"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "BPUNKS") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "BPUNKS"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "KOM") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "KOM(MATIC)"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "HN") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "HN(HECO)"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "THC") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "THC(BSC)"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "ETHF") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter(
          (item) => item.coinCode === "ETF" || item.coinCode === "ETHF"
        ); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "CALORIE") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "CAL"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "RODO") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "RODO"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "JYD") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "JYD(DC)"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          const tokenList = list.filter((item) => item.coinCode === "JYD");
          if (tokenList.length > 0) {
            token = tokenList[0];
          } else {
            token = list[0];
          }
        }
      } else if (sourceFlag === "xdc") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "XDC"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
        const fromList = list.filter((item) => item.coinCode === "ETH"); //
        if (fromList.length > 0) {
          this.$store.commit("setFromToken", fromList[0]);
        }
      } else if (sourceFlag === "igc") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "IGC"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "BXR") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter(
          (item) => item.coinCode === "USDT(BITXOR)"
        ); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "PEPEM") {
        const tokenList = list.filter((item) => item.coinCode === "PEPEM"); //

        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (
        sourceFlag === "swftgpt-plugin" ||
        sourceFlag === "swftgpt-plugin"
      ) {
        const fromUrl = this.$route.query.depositCoinCode;
        const toUrl = this.$route.query.receiveCoinCode;
        const depositCoinAmt = this.$route.query.depositCoinAmt;
        const tokenList = list.filter((item) => item.coinCodeShow === toUrl); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
        const fromtokenList = list.filter(
          (item) => item.coinCodeShow === fromUrl
        ); //
        if (fromtokenList.length > 0) {
          this.$store.commit("setFromToken", fromtokenList[0]);
        } else {
          this.$store.commit("setFromToken", list[0]);
        }

        this.$store.commit("setFromNumber", depositCoinAmt);
      } else if (sourceFlag === "burndex") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "BURN(CORE)"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else if (sourceFlag === "etebridge") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter(
          (item) => item.coinCode === "ETE(ETRC20)"
        ); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
        const fromList = list.filter((item) => item.coinCode === "ETE(ERC20)"); //
        if (fromList.length > 0) {
          this.$store.commit("setFromToken", fromList[0]);
        }
      } else if (
        sourceFlag === "imtoken" &&
        (this.$route.query.type == "swap" || !this.$route.query.type)
      ) {
        const fromUrl = this.$route.query.from;
        const toUrl = this.$route.query.to;
        const depositCoinAmt = this.$route.query.amount;
        const tokenList = list.filter((item) => item.coinCodeShow === toUrl); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
        const fromtokenList = list.filter(
          (item) => item.coinCodeShow === fromUrl
        ); //
        if (fromtokenList.length > 0) {
          this.$store.commit("setFromToken", fromtokenList[0]);
        } else {
          this.$store.commit("setFromToken", list[0]);
        }

        this.$store.commit("setFromNumber", depositCoinAmt);
      } else if (
        sourceFlag === "imtoken" &&
        this.$route.query.type == "gasSwap"
      ) {
        const fromUrl = this.$route.query.from;
        const toUrl = this.$route.query.to;
        const depositCoinAmt = this.$route.query.amount;
        // const tokenList = list.filter((item) => item.coinCodeShow === toUrl); //
        // if (tokenList.length > 0) {
        //   this.$store.commit("setgasToToken", tokenList[0]);
        // }
        const fromtokenList = list.filter(
          (item) => item.coinCodeShow === fromUrl
        ); //
        if (fromtokenList.length > 0) {
          this.$store.commit("setgasFromToken", fromtokenList[0]);
        }

        this.$store.commit("setFromNumber", depositCoinAmt);
      } else if (sourceFlag === "havah") {
        this.$store.commit("setIsUserChoose", true);
        const tokenList = list.filter((item) => item.coinCode === "HVH(HVH)"); //
        if (tokenList.length > 0) {
          token = tokenList[0];
        } else {
          token = list[0];
        }
      } else {
        const localToToken =
          JSON.parse(localStorage.getItem("localToToken")) == "" ||
          !JSON.parse(localStorage.getItem("localToToken")) ||
          null
            ? null
            : JSON.parse(localStorage.getItem("localToToken"));
        token = localToToken || list[0];
      }
      this.$store.commit("setToToken", token);
    },
    ChainIdNameChangeHandle(val) {
      if (!this.tokens) return;
      const arr = this.tokens.find((e) => {
        return e.netWork === val;
      });
      if (!arr) return;
      //过滤自动填入相同币种
      if (this.$store.state.toToken) {
        if (this.$store.state.toToken.coinCode === arr.list[0].coinCode) {
          if (arr.list.length === 1) {
            this.setTokenHandle();
            this.$store.commit("setFromToken", arr.list[0]);
            return;
          } else {
            this.$store.commit("setFromToken", arr.list[1]);
            return;
          }
        }
      }
      if (this.$store.state.fromToken === null) {
        //这里插入链的母币
        const token = arr.list.filter((item) => item.contact === "");
        this.$store.commit(
          "setFromToken",
          token.length > 0 ? token[0] : arr.list[0]
        );
      }

      //判断目标币自动填入
      if (this.$store.state.toToken === null) {
        this.setTokenHandle();
      }
      //}
    },
    //币种 主币排序
    coinSort(list) {
      let newList = new Array();
      const mb = list.filter(
        (item) => item.contact === "" || item.contact == "0x2::sui::SUI"
      ); //母币排在第一个
      const ob = list.filter(
        (item) => item.contact != "" && item.contact != "0x2::sui::SUI"
      );
      // return [...mb, ...ob]
      if (mb.length > 0) {
        newList[0] = mb[0];
      }
      //其他币按余额排序
      ob.sort(this.compare("balance", false));
      newList = [...newList, ...ob];
      return newList;
    },
    netWorkName(network) {
      let _network = network;
      this.chainList.forEach((e) => {
        // if (network === 'ORC') {
        //   _network = 'Ontology'
        // }else
        if (network === e.chain) {
          _network = e.name == "EVM" ? "EOS(EVM)" : e.name;
        }
      });
      return _network;
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
              placeholder={this.$t("search")}
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
                {this.type === "to" ? (
                  <li
                    onclick={() => {
                      this.choiceNetWork();
                    }}
                    class={this.getChainIdName ? "" : "active themeBg"}
                  >
                    {this.$t("allCode")}
                  </li>
                ) : (
                  <li
                    onclick={() => {
                      this.choiceNetWork();
                    }}
                    class={this.getChainIdName ? "" : "active themeBg"}
                  >
                    {this.$t("allCode")}
                  </li>
                )}
                {this.tokens.length > 0
                  ? this.tokens.map((e) => {
                      if (this.type === "to") {
                        return (
                          <li
                            class={
                              this.getChainIdName === e.netWork
                                ? "active themeBg"
                                : ""
                            }
                            onclick={() => {
                              this.choiceNetWork(e);
                            }}
                          >
                            {this.netWorkName(e.netWork)}
                            {this.netWorkName(e.netWork) == "Ontology" ? (
                              <div>EVM</div>
                            ) : (
                              ""
                            )}

                            {e.isNew == "Y" ? (
                              <div class="new">
                                <img
                                  src={require("../../assets/img/chainnew.png")}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                            {e.isHot == "Y" ? (
                              <div class="hot">
                                <img
                                  src={require("../../assets/img/chainhot.png")}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                          </li>
                        );
                      } else {
                        return (
                          <li
                            class={
                              this.getChainIdName === e.netWork &&
                              e.chainId !== ""
                                ? "active themeBg"
                                : this.getChainIdName !== e.netWork &&
                                  this.supportStr.indexOf(e.netWork) == -1
                                ? "notSupport"
                                : "defultList"
                            }
                            onclick={() => {
                              this.choiceNetWork(e);
                            }}
                          >
                            {this.netWorkName(e.netWork)}
                            {this.netWorkName(e.netWork) == "Ontology" ? (
                              <div>EVM</div>
                            ) : (
                              ""
                            )}

                            {e.isNew == "Y" ? (
                              <div class="new">
                                <img
                                  src={require("../../assets/img/chainnew.png")}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                            {e.isHot == "Y" ? (
                              <div class="hot">
                                <img
                                  src={require("../../assets/img/chainhot.png")}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                          </li>
                        );
                      }
                    })
                  : ""}
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
                      isSupportAdvanced={e.isSupportAdvanced}
                      activeNetwork={this.activeNetwork}
                    />
                  );
                })
              ) : this.coinList && this.getChainIdName === "NFT" ? (
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
                ""
              )}
            </div>
          </div>
        </DialogContent>
      );
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
              placeholder={this.$t("search")}
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
                {this.type === "to" ? (
                  <li
                    onclick={() => {
                      this.choiceNetWork();
                    }}
                    class={this.getChainIdName ? "" : "active themeBg"}
                  >
                    {this.$t("allCode")}
                  </li>
                ) : (
                  <li
                    onclick={() => {
                      this.choiceNetWork();
                    }}
                    class={this.getChainIdName ? "" : "active themeBg"}
                  >
                    {this.$t("allCode")}
                  </li>
                )}
                {this.tokens.length > 0
                  ? this.tokens.map((e) => {
                      if (this.type === "to") {
                        return (
                          <li
                            class={
                              this.getChainIdName === e.netWork
                                ? "active themeBg"
                                : ""
                            }
                            onclick={() => {
                              this.choiceNetWork(e);
                            }}
                          >
                            {this.netWorkName(e.netWork)}
                            {this.netWorkName(e.netWork) == "Ontology" ? (
                              <div>EVM</div>
                            ) : (
                              ""
                            )}
                            {e.isNew == "Y" ? (
                              <div class="new">
                                <img
                                  src={require("../../assets/img/chainnew.png")}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                            {e.isHot == "Y" ? (
                              <div class="hot">
                                <img
                                  src={require("../../assets/img/chainhot.png")}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                          </li>
                        );
                      } else {
                        return (
                          <li
                            class={
                              this.getChainIdName === e.netWork &&
                              e.chainId !== ""
                                ? "active themeBg"
                                : this.getChainIdName !== e.netWork &&
                                  this.supportStr.indexOf(e.netWork) == -1
                                ? "notSupport"
                                : "defultList"
                            }
                            onclick={() => {
                              this.choiceNetWork(e);
                            }}
                          >
                            {this.netWorkName(e.netWork)}
                            {this.netWorkName(e.netWork) == "Ontology" ? (
                              <div>EVM</div>
                            ) : (
                              ""
                            )}

                            {e.isNew == "Y" ? (
                              <div class="new">
                                <img
                                  src={require("../../assets/img/chainnew.png")}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                            {e.isHot == "Y" ? (
                              <div class="hot">
                                <img
                                  src={require("../../assets/img/chainhot.png")}
                                />
                              </div>
                            ) : (
                              ""
                            )}
                          </li>
                        );
                      }
                    })
                  : ""}
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
                      isSupportAdvanced={e.isSupportAdvanced}
                      activeNetwork={this.activeNetwork}
                    />
                  );
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
                ""
              )}
            </div>
          </div>
        </DialogContent>
      );
    }
  },
};
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
    overflow-y: auto;
    white-space: nowrap;
    width: 120px;
    height: calc(100%);
    ul {
      li {
        width: 76px;
        padding: 4px 12px;
        line-height: 18px;
        border-radius: 4px;
        margin-bottom: 19px;
        background: #f1f3f5;
        color: #9ea0a5;
        font-weight: bold;
        cursor: pointer;
        font-size: 0.25rem;
        white-space: normal;
        position: relative;
        .new {
          position: absolute;
          top: -10px;
          right: -5px;
          width: 30px;
          img {
            width: 100%;
          }
        }
        .hot {
          position: absolute;
          top: -10px;
          right: -5px;
          width: 30px;
          img {
            width: 100%;
          }
        }
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
    overflow-y: auto;
    white-space: nowrap;
    width: 82px;
    height: calc(100%);
    ul {
      li {
        width: 80px;
        padding: 4px 0;
        line-height: 18px;
        border-radius: 4px;
        margin-bottom: 15px;
        background: #f1f3f5;
        color: #9ea0a5;
        font-weight: bold;
        cursor: pointer;
        white-space: nowrap;
        position: relative;
        .new {
          position: absolute;
          top: -10px;
          right: -2px;
          width: 30px;
          img {
            width: 100%;
          }
        }
        .hot {
          position: absolute;
          top: -10px;
          right: -2px;
          width: 30px;
          img {
            width: 100%;
          }
        }
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
