// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Identity extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Identity entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Identity must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Identity", id.toString(), this);
    }
  }

  static load(id: string): Identity | null {
    return changetype<Identity | null>(store.get("Identity", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get communicationAddress(): string {
    let value = this.get("communicationAddress");
    return value!.toString();
  }

  set communicationAddress(value: string) {
    this.set("communicationAddress", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value!.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class Message extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Message entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Message must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Message", id.toString(), this);
    }
  }

  static load(id: string): Message | null {
    return changetype<Message | null>(store.get("Message", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get receiver(): Bytes {
    let value = this.get("receiver");
    return value!.toBytes();
  }

  set receiver(value: Bytes) {
    this.set("receiver", Value.fromBytes(value));
  }

  get senderMessage(): string {
    let value = this.get("senderMessage");
    return value!.toString();
  }

  set senderMessage(value: string) {
    this.set("senderMessage", Value.fromString(value));
  }

  get receiverMessage(): string {
    let value = this.get("receiverMessage");
    return value!.toString();
  }

  set receiverMessage(value: string) {
    this.set("receiverMessage", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value!.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}
