import { Module } from '@nestjs/common'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { AwsModule } from 'src/aws/aws.module'
import { MongooseModule } from '@nestjs/mongoose'
import { Project, ProjectSchema } from 'src/schemas/project.schema'

@Module({
	imports: [AwsModule, MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }])],
	controllers: [ProjectController],
	providers: [ProjectService]
})
export class ProjectModule {}
