// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class IdentityEvent extends ethereum.Event {
  get params(): IdentityEvent__Params {
    return new IdentityEvent__Params(this);
  }
}

export class IdentityEvent__Params {
  _event: IdentityEvent;

  constructor(event: IdentityEvent) {
    this._event = event;
  }

  get _communicationKey(): string {
    return this._event.parameters[0].value.toString();
  }
}

export class MessageEvent extends ethereum.Event {
  get params(): MessageEvent__Params {
    return new MessageEvent__Params(this);
  }
}

export class MessageEvent__Params {
  _event: MessageEvent;

  constructor(event: MessageEvent) {
    this._event = event;
  }

  get _messageType(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get _receiver(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get _senderMessage(): string {
    return this._event.parameters[2].value.toString();
  }

  get _receiverMessage(): string {
    return this._event.parameters[3].value.toString();
  }
}

export class Echo extends ethereum.SmartContract {
  static bind(address: Address): Echo {
    return new Echo("Echo", address);
  }
}

export class LogIdentityCall extends ethereum.Call {
  get inputs(): LogIdentityCall__Inputs {
    return new LogIdentityCall__Inputs(this);
  }

  get outputs(): LogIdentityCall__Outputs {
    return new LogIdentityCall__Outputs(this);
  }
}

export class LogIdentityCall__Inputs {
  _call: LogIdentityCall;

  constructor(call: LogIdentityCall) {
    this._call = call;
  }

  get _communicationKey(): string {
    return this._call.inputValues[0].value.toString();
  }
}

export class LogIdentityCall__Outputs {
  _call: LogIdentityCall;

  constructor(call: LogIdentityCall) {
    this._call = call;
  }
}

export class LogMessageCall extends ethereum.Call {
  get inputs(): LogMessageCall__Inputs {
    return new LogMessageCall__Inputs(this);
  }

  get outputs(): LogMessageCall__Outputs {
    return new LogMessageCall__Outputs(this);
  }
}

export class LogMessageCall__Inputs {
  _call: LogMessageCall;

  constructor(call: LogMessageCall) {
    this._call = call;
  }

  get _messageType(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _receiver(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _senderMessage(): string {
    return this._call.inputValues[2].value.toString();
  }

  get _receiverMessage(): string {
    return this._call.inputValues[3].value.toString();
  }
}

export class LogMessageCall__Outputs {
  _call: LogMessageCall;

  constructor(call: LogMessageCall) {
    this._call = call;
  }
}
