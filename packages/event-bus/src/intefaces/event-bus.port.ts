import {IEventHandler, IntegrationEvent} from "../events";

export interface IEventBus {
  publish(event: IntegrationEvent): void;

  subscribe(event: ClassType<IntegrationEvent>, handler: IEventHandler): void;

  register(events: ClassType<IntegrationEvent>[]): void;

  destroy(): Promise<void>;
}
