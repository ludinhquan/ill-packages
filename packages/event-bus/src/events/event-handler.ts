import {IntegrationEvent} from './integration.event';
import { Result } from 'oxide.ts';

export interface IEventHandler {
  handle(event: IntegrationEvent): Promise<Result<unknown, Error>>;
}
