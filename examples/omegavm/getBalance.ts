import "dotenv/config"
import { Odyssey } from "../../src"
import { OmegaVMAPI } from "../../src/apis/omegavm"
import { DELTAAPI } from "../../src/apis/delta"
import { Defaults } from "../../src/utils"

const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()
const main = async (): Promise<any> => {
  const assetID = Defaults.network[networkID].O.dioneAssetID
  console.log(Defaults.network[networkID].A.dioneAssetID)
  console.log(Defaults.network[networkID].O.dioneAssetID)

  const address: string[] = ["O-testnet1n5qrhn6cnqhda5usk8du4s676tjpcvv00j9qth"]
  const addressD: string = "0x26e7CDeb1Eb11C18Fa760dc27C0Aab7653258612";
  const balance: object = await ochain.getBalance(address)
  const balanceD: object = await dchain.getAssetBalance(addressD,"latest",assetID as string);
  console.log(balance)
  const x = 2280001004000 - 2185001004000
  console.log(x)
}

main()
//2185001004000
//2280,001004000
// 100,000000000