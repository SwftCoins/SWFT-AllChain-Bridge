// 获取nft 详情
import store from '../store/index'
import baseApi from '../api/baseApi'
export default async function getNFTAsset (item,type){
      const res = await baseApi.getAssetsInfo(
         {
            tokenAddress:item.address, // string
            tokenId:item.tokenId, // string | number | null
          }
      )
    if(res.resCode != 100){
        return 
    }
    const OpenSeaAsset = res.data.assetsInfo
    //获取nft 详情 根据 from 和 to 来判断 买卖 //有卖单，有买单，未拥有，无卖单，无买单
    let nftAsset = {status:null,info:null,type:'to'}
    if(type === 'to'){ //买  有卖单  无卖单
        const orders = OpenSeaAsset.sellOrders
        if(orders.length < 1){
            nftAsset = {
                status:'noOrders',info:null,type:'to'
            }
        }else{
            nftAsset = {
                status:'Orders',info:getNFTOrderBalance(orders[0]),type:'to'
            }
        }
    }
    if(type === 'from'){
        //判断是否拥有资产
        const address = store.state.wallet.address
        if(OpenSeaAsset.owner.address.toLocaleLowerCase() == address.toLocaleLowerCase()){
            const orders = OpenSeaAsset.buyOrders
            if(orders.length < 1){
                nftAsset = {
                    status:'noOrders',info:null,type:'from'
                }
            }else{
                nftAsset = {
                    status:'Orders',info:getNFTOrderBalance(orders[0]),type:'from'
                }
            }
        }else{
            nftAsset = {
                status:'noHave',info:null,type:'from'
            }
        }

    }
    return nftAsset
}
function getNFTOrderBalance(info){
    if(info.current_price){
        return info.current_price.toString()/10** info.payment_token_contract.decimals + ' ' + info.payment_token_contract.symbol
    }else{
        return info.currentPrice.toString()/10** info.paymentTokenContract.decimals + ' ' + info.paymentTokenContract.symbol
    }
    
}