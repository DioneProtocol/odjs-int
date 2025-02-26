import "dotenv/config"
import { Odyssey } from "../src"
import { DELTAAPI } from "../src/apis/delta"
import { OmegaVMAPI } from "../src/apis/omegavm"
import { ALPHAAPI } from "../src/apis/alpha"
import { Defaults } from "../src/utils"
const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const dchain: DELTAAPI = odyssey.DChain()
const ochain: OmegaVMAPI = odyssey.OChain()
const achain: ALPHAAPI = odyssey.AChain()
//console.log(Defaults)

const main = async (): Promise<any> => {
  
    dchain.exportKey("", "","0x26e7CDeb1Eb11C18Fa760dc27C0Aab7653258612").then(
        res=>console.log(res)
    )
    

}

main()
