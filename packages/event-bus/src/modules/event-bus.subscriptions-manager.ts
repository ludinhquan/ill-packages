import {IEventBusSubscriptionsManager} from "../intefaces";
import {IEventHandler, IntegrationEvent} from "../events";

export class EventBusSubscriptionsManager implements IEventBusSubscriptionsManager{
  private handlers: Map<string, IEventHandler[]> = new Map()

  addSubscription(event: ClassType<IntegrationEvent>, handler: IEventHandler) {
    const eventName = event.name;
    const handlerName = handler.constructor.name

    if (!this.hasSubscriptionsForEvent(eventName)) this.handlers.set(eventName, []);

    const handlers = this.handlers.get(eventName) as IEventHandler[];
    const existed = handlers.some(item => item.constructor.name === handlerName)

    if (existed) {
      throw new Error(`Handler Type ${handlerName} already registered for '${eventName}'`)
    }
    this.handlers.set(eventName, [...handlers, handler])
  }

  hasSubscriptionsForEvent(eventName: string): boolean {
    return this.handlers.has(eventName)
  }

  getHandlersForEvent(eventName: string): IEventHandler[]{
    return this.handlers.get(eventName) ?? []
  }

  getHandlers(): IEventHandler[] {
    return [...this.handlers].map(item => item[1]).flat()
  }
}
