import axios from 'axios'
import store from '../store'
const getSolTokenBalance = async (address, tokenAddress) => {
    // const result = await axios.get('https://api.solscan.io/v2/account/v2/tokens?address=' + address + '&cluster=')
    // const balanceList = result.data
    // const list = balanceList.filter(item => item.tokenAddress.toLowerCase() == tokenAddress.toLowerCase())
    // if (list.length > 0) {
    //     return (list[0].amount / 10 ** list[0].decimals).toFixed(6) - 0
    // } else {
    //     return 0
    // }


    const params = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountsByOwner",
        "params": [
            address,
            { "programId": 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { "encoding": "jsonParsed" }
        ]
    }

    const result = await new Promise(function (resolve, reject) {
        axios.post(store.state.rpcObject.SOL[0], params).then((response) => {
            resolve(response)
        })
    })
    const listBalance = result.result.value

    const list = listBalance.filter(item => item.account.data.parsed.info.mint.toLowerCase() == tokenAddress.toLowerCase())
    console.log(list)
    if (list.length > 0) {
        const num = list[0].account.data.parsed.info.tokenAmount.uiAmount
        return Number(num).toFixed(6)
    } else {
        return 0
    }

}
export default getSolTokenBalance