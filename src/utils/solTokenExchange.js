const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
import store from '../store'

// sol代币发送
const solTokenSend = async function(platformAddr,tokenAddress,fromNumber){
	const connection = new solanaWeb3.Connection(
		store.state.rpcObject.SOL[0] || 'https://rpc.ankr.com/solana', // mainnet-beta  devnet
		'confirmed',
	);
	// 连接账户
	const account = await window.solana
	// token转账
	const res = await transferToken(account, platformAddr, tokenAddress, connection, fromNumber);
	return res
}
async function getTokenProgramId(publicKey, tokenAddress, connection) {
  	var tokenAccount = await getTokenAccounts(publicKey, tokenAddress, connection)
  	var programId = tokenAccount.value.length > 0 ? tokenAccount.value[0].account.owner : '';
  	return programId;
}
async function getTokenAccounts(publicKey, tokenAddress, connection) {
  	var tokenPublic = new solanaWeb3.PublicKey(tokenAddress);
  	var tokenAccount = await connection.getParsedTokenAccountsByOwner(publicKey, {'mint':tokenPublic});
  	return tokenAccount;
}

async function transferToken(fromWallet, toWallet, tokenAddress, connection, fromNumber) {
	var programId = await getTokenProgramId(fromWallet.publicKey, tokenAddress, connection);
	var tokenPublic = new solanaWeb3.PublicKey(tokenAddress);
	const token = await new splToken.Token(connection, tokenPublic, programId, fromWallet);
	const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(
    	fromWallet.publicKey,
  	);
	const destPublicKey = new solanaWeb3.PublicKey(toWallet)
	// Get the derived address of the destination wallet which will hold the custom token
	const associatedDestinationTokenAddr = await splToken.Token.getAssociatedTokenAddress(
		token.associatedProgramId,
		token.programId,
		tokenPublic,
		destPublicKey
	);
	const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr);
	const instructions = []; 
	if(receiverAccount  === null){
		instructions.push(
			splToken.Token.createAssociatedTokenAccountInstruction(
				token.associatedProgramId,
				token.programId,
				tokenPublic,
				associatedDestinationTokenAddr,
				destPublicKey,
				fromWallet.publicKey,
			)
		)
	}
	instructions.push(
		splToken.Token.createTransferInstruction(
			programId,
			fromTokenAccount.address,
			associatedDestinationTokenAddr,
			fromWallet.publicKey,
			[],
			BigInt(fromNumber),
		  )
	)
	const transaction = new solanaWeb3.Transaction().add(
	...instructions
  );
  transaction.feePayer = fromWallet.publicKey
  const anyTransaction = transaction
  anyTransaction.recentBlockhash = (
	await connection.getLatestBlockhash()
  ).blockhash
  try{
	if(localStorage.getItem('utm_source') !== 'tokenpocket'){
    await window.solana.connect()
  }
	let signed = await window.solana.signTransaction(transaction)
	let signature = await connection.sendRawTransaction(
    signed.serialize(),
  ) || await window.solana.signAndSendTransaction(transaction)
	//await connection.confirmTransaction(signature)
	return signature
  }catch (err){
		return false
  }
}
export default solTokenSend