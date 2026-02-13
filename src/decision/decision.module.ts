import { Module } from '@nestjs/common';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Decision, DecisionSchema } from 'src/schemas/decision.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Decision.name, schema: DecisionSchema }])],
  controllers: [DecisionController],
  providers: [DecisionService],
})
export class DecisionModule {}
