// @ts-nocheck
import addon from "../../build/Release/iforest.node"

type IForestType = {
    predictTransaction: (data: number[]) => { valid: number, score: number }
}

const iforest: IForestType = addon

export { iforest }