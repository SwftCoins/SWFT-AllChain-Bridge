// export default 
import { ethers } from "ethers";
import store from '../store'
import abi from './abi'
let provider,windowPlguin;
const contractList = {}
export default function getContract(symbol) {
    let connectType = store.state.wallet.connectType
    if(connectType === 'Nabox'){
        windowPlguin = NaboxWallet
    }else if(connectType === 'MetaXWallet'){
        windowPlguin = okexchain
    }else if(connectType === 'ONTO'){
        windowPlguin = window.onto
    }else{
        windowPlguin = window.ethereum
    }
    provider = new ethers.providers.Web3Provider(windowPlguin, "any");
    if (symbol in contractList) {
        return contractList[symbol];
    } else {
        const contract = new ethers.Contract(symbol, abi, provider);
        contractList[symbol] = contract;
        return contract;
    }
}