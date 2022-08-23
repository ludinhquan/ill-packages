import {connect, Connection, Options} from "amqplib";

export class RabbitMQSingleton {
  private static connection: Connection 
  private constructor(){}

  static async getInstance(connectOptions: string | Options.Connect) {
    if (!this.connection) {
      this.connection = await connect(connectOptions)
    }
    return this.connection
  }
}
