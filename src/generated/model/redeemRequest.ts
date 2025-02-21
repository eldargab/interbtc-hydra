import assert from "assert"
import * as marshal from "../marshal"
import {Height} from "./height.model"

export class RedeemRequest {
  private _requestedAmountBacking!: bigint
  private _height!: string
  private _timestamp!: Date

  constructor(props?: Partial<Omit<RedeemRequest, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._requestedAmountBacking = marshal.bigint.fromJSON(json.requestedAmountBacking)
      this._height = marshal.string.fromJSON(json.height)
      this._timestamp = marshal.datetime.fromJSON(json.timestamp)
    }
  }

  get requestedAmountBacking(): bigint {
    assert(this._requestedAmountBacking != null, 'uninitialized access')
    return this._requestedAmountBacking
  }

  set requestedAmountBacking(value: bigint) {
    this._requestedAmountBacking = value
  }

  get height(): string {
    assert(this._height != null, 'uninitialized access')
    return this._height
  }

  set height(value: string) {
    this._height = value
  }

  get timestamp(): Date {
    assert(this._timestamp != null, 'uninitialized access')
    return this._timestamp
  }

  set timestamp(value: Date) {
    this._timestamp = value
  }

  toJSON(): object {
    return {
      requestedAmountBacking: marshal.bigint.toJSON(this.requestedAmountBacking),
      height: this.height,
      timestamp: marshal.datetime.toJSON(this.timestamp),
    }
  }
}
