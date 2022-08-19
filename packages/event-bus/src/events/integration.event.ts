import {UUID} from "@ilotustech/common";

export abstract class IntegrationEvent {
  public readonly id: string;

  public readonly dateOccurred: number;

  constructor() {
    this.id = UUID.generate().unpack();
    this.dateOccurred = Date.now();
  }

  toString() {
    const { ...data } = this;
    return JSON.stringify(data);
  }
  
  abstract getTenantId(): string
}
