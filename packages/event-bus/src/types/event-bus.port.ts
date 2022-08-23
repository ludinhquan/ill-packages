import {IEventHandler, IntegrationEvent} from "../events";

export interface IEventBus {
  publish(event: IntegrationEvent): void;

  subscribe(event: ClassType<IntegrationEvent>, handler: IEventHandler): void;

  destroy(): Promise<void>;
}
