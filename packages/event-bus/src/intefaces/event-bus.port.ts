import {IEventHandler, IntegrationEvent} from "../events";

export interface IEventBus {
  publish(event: IntegrationEvent): Promise<void>;

  subscribe(event: ClassType<IntegrationEvent>, handler: IEventHandler): Promise<void>;

  register(events: ClassType<IntegrationEvent>[]): Promise<void>;

  destroy(): Promise<void>;
}
