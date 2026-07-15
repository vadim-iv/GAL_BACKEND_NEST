import { Module } from '@nestjs/common';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Decision, DecisionSchema } from 'src/schemas/decision.schema';
import { AwsModule } from 'src/aws/aws.module';
import { Member, MemberSchema } from 'src/schemas/member.schema';

@Module({
  imports: [
    AwsModule,
    MongooseModule.forFeature([
      { name: Decision.name, schema: DecisionSchema },
      { name: Member.name, schema: MemberSchema }
    ])
  ],
  controllers: [DecisionController],
  providers: [DecisionService],
})
export class DecisionModule {}
