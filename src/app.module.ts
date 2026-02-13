import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { BlogsModule } from './blogs/blogs.module';
import { AwsModule } from './aws/aws.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ManagementModule } from './management/management.module';
import { DocumentsModule } from './documents/documents.module';
import { SearchModule } from './search/search.module';
import { ContactModule } from './contact/contact.module';
import { MembersModule } from './members/members.module';
import { ProjectModule } from './project/project.module';
import { DecisionModule } from './decision/decision.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/GAL_BACKEND'),
		AuthModule,
		AdminModule,
		BlogsModule,
		AwsModule,
		StatisticsModule,
		ManagementModule,
		DocumentsModule,
		SearchModule,
		ContactModule,
		MembersModule,
		ProjectModule,
		DecisionModule,
	]
})
export class AppModule {}
