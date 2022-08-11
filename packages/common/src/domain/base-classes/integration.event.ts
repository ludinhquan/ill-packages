import { UUID } from '@domain';

type OmitBaseType = 'subject' | 'id' | 'dateOccurred' | 'eventName';

export type BaseEventProps<T> = Omit<T, OmitBaseType> &
  Omit<IntegrationEvent, OmitBaseType> & { dateOccurred?: number };

export class IntegrationEvent {
  public readonly id: string;

  public readonly dateOccurred: number;

  constructor(props: BaseEventProps<unknown>) {
    this.id = UUID.generate().unpack();
    this.dateOccurred = props.dateOccurred || Date.now();
  }

  toString() {
    const { ...data } = this;
    return JSON.stringify(data);
  }
}
