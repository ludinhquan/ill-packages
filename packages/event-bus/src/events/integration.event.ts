import {UUID} from "@ilotustech/common";

export abstract class IntegrationEvent {
  public readonly id: string;

  public readonly dateOccurred: number;

  constructor(props?: {id?: string, dateOccurred?: number}) {
    this.id = props?.id ?? UUID.generate().unpack();
    this.dateOccurred = props?.dateOccurred ?? Date.now();
  }

  toString() {
    const { ...data } = this;
    return JSON.stringify(data);
  }
  
  abstract getTenantId(): string
}
