import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import { InfoAPI } from "../../src/apis/info"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx as UnsignedTxOmegavm,
  Tx as TxOmegavm
} from "../../src/apis/omegavm"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx
} from "../../src/apis/delta"
import { ALPHAAPI } from "../../src/apis/alpha"
import { Web3 } from "web3"
import {
  DefaultLocalGenesisPrivateKey,
  Defaults,
  costExportTx,
  UnixNow
} from "../../src/utils"

const ip = process.env.LOCAL_IP
const port = Number(process.env.LOCAL_PORT)
const protocol = process.env.LOCAL_PROTOCOL
const networkID = Number(process.env.LOCAL_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)

const key = process.env.PRIVATE_KEY1 ?? ""
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)
const privKey: Buffer = new Buffer(key, "hex")

const achain: ALPHAAPI = odyssey.AChain()
const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()

const aKeychain = achain.keyChain()
const oKeychain = ochain.keyChain()
const dKeychain = dchain.keyChain()

aKeychain.importKey(privKey)
oKeychain.importKey(privKey)
dKeychain.importKey(privKey)

const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID
console.log(Defaults.network[networkID])
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const oChainBlockchainIdStr: string = Defaults.network[networkID].O.blockchainID
const dioneAssetID: string = Defaults.network[networkID].O.dioneAssetID
const d: any = ochain.getDIONEAssetID().then(res => console.log(res))
console.log("d", d)
console.log('dioneAssetID', dioneAssetID)
const dHexAddress: string = process.env.PUBLIC_KEY1 ?? ""
const threshold: number = 1

const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildImportTx to import DIONE to the O-Chain from the A-Chain"
)
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
  const achainAddresses = await aKeychain.getAddressStrings()
  const dchainAddresses = await dKeychain.getAddressStrings()
  const ochainAddresses = await oKeychain.getAddressStrings()
  const dHexAddress = process.env.PUBLIC_KEY1 ?? ""

  console.log(`A Address(${achainAddresses[0]})\nD Address(${dHexAddress})\nO Address(${ochainAddresses[0]})`)

  const abalance = await achain.getBalance(achainAddresses[0], Defaults.network[networkID].A.dioneAssetID ?? "")
  const obalance = await ochain.getBalance(ochainAddresses)
  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const dbalance = await web3.eth.getBalance(dHexAddress)
  const nonce = Number(txcount)

  console.log(`A Balance(${abalance.balance.toString()})\nD Balance(${dbalance.toString()})\nO Balance(${obalance.balance.toString()})`)

  console.log('Before total balance')
  // Here we sum A chain and O chain balances.
  // (Depending on your application, you might consider summing D chain + O chain balances instead.)
  const totalDchainOchainBalance = new BN(dbalance.toString()).add(new BN(obalance.balance.toString()))
  console.log(`${totalDchainOchainBalance.toString()}`)

  // ===== Extra Code for Staking Logic =====
  // Watch the user defined stake amount (assumed to be provided via environment variable)
  const stakeAmountStr = process.env.STAKE_AMOUNT ?? "0"
  const stakingAmount = new BN(stakeAmountStr)
  console.log(`Staking amount set to: ${stakingAmount.toString()}`)

  // If the total balance (D + O) is less than the staking amount, log and exit.
  if (totalDchainOchainBalance.lt(stakingAmount)) {
    console.log(
      `Insufficient total balance for staking. Required: ${stakingAmount.toString()}, Available: ${totalDchainOchainBalance.toString()}`
    )
    process.exit(1)
  }

  // If the O chain balance is less than the staking amount, transfer the difference from D chain to O chain.
  const oBalanceBN = new BN(obalance.balance.toString())
  if (oBalanceBN.lt(stakingAmount)) {
    const transferAmount = stakingAmount.sub(oBalanceBN)
    console.log(
      `O chain balance (${oBalanceBN.toString()}) is below staking amount (${stakingAmount.toString()}) by ${transferAmount.toString()}. Initiating transfer from D chain to O chain...`
    )

    const baseFeeResponse: string = await dchain.getBaseFee()
    const baseFee = new BN(parseInt(baseFeeResponse, 16))
    console.log(baseFee.toString())
    const txcount = await web3.eth.getTransactionCount(dHexAddress)
    const nonce: number = Number(txcount)
    const locktime: BN = new BN(0)
    // let stakingAmount: BN = new BN(500000000000000)
    // console.log(stakingAmount.toString())
    let fee: BN = baseFee.div(new BN(1e9))
    console.log(fee.toString())
    fee = fee.add(new BN(1))
    console.log(fee.toString())

    let unsignedTx: UnsignedTx = await dchain.buildExportTx(
      stakingAmount,
      dioneAssetID,
      oChainBlockchainIdStr,
      dHexAddress,
      dAddressStrings[0],
      oAddressStrings,
      nonce,
      locktime,
      threshold,
      fee
    )
    const exportCost: number = costExportTx(unsignedTx)
    fee = fee.mul(new BN(exportCost))

    unsignedTx = await dchain.buildExportTx(
      stakingAmount,
      dioneAssetID,
      oChainBlockchainIdStr,
      dHexAddress,
      dAddressStrings[0],
      oAddressStrings,
      nonce,
      locktime,
      threshold,
      fee
    )

    const tx: Tx = unsignedTx.sign(dKeychain)
    const txid: string = await dchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)


    // IMPORTING THE TRANSACTION ON OTHER CHAIN
    // Now import the transaction
    try {
      const omegaVMUTXOResponse: any = await ochain.getUTXOs(
        oAddressStrings,
        dChainBlockchainID
      )
      const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
      const UnsignedTxOmegavm: UnsignedTxOmegavm = await ochain.buildImportTx(
        utxoSet,
        oAddressStrings,
        dChainBlockchainID,
        oAddressStrings,
        oAddressStrings,
        oAddressStrings,
        memo,
        asOf,
        locktime,
        threshold
      )
      const tx: TxOmegavm = UnsignedTxOmegavm.sign(oKeychain)
      const txid: string = await ochain.issueTx(tx)
      console.log(`Success! TXID: ${txid}`)
    } catch (e) {
      console.log(e)
    }


  } else {
    console.log("O chain balance is sufficient for staking, no transfer needed.")
  }


}

main()
