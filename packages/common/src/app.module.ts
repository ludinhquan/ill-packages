import { Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {
  constructor(){
    console.log('AppModule 1')
  }
}
