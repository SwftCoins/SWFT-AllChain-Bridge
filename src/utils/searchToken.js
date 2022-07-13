// 自定义搜索代币
import Web3 from 'web3'
import TokenABI from '../config/abis/TokenABI.json'
import {list} from '../config/netList'
const searchTokenHandle = async function(network,tokenAddress){
     const rpcUrlList = list.filter( item => item.netWork == network)
     if(rpcUrlList.length === 0){
         return console.log('当前不支持' + network)
     }
     const web3Provider = new Web3.providers.HttpProvider(rpcUrlList[0].rpcUrl);
     const web3 = new Web3(web3Provider);
     const logoUrl = rpcUrlList[0].logoUrl
     //判断地址是否合法 
     const isAddress = web3.utils.isAddress(tokenAddress)
     if(!isAddress){
        return console.log('地址不合法')
     }
     const res = new web3.eth.Contract(
        TokenABI,
        tokenAddress,
      );
    const name = await promisify(res.methods.name().call)
    const symbol = await promisify(res.methods.symbol().call)
    const decimals = (await promisify(res.methods.decimals().call)).valueOf()
    const logo = logoUrl + res._address + '/logo.png'
    const tokenInfo = {
        name: name,
        symbol: symbol,
        decimals: decimals,
        logo: logo,
    }
    console.log(tokenInfo)
}
function promisify (fn, ...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
  export default searchTokenHandle