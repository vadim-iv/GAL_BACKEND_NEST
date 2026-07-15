
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import mongoose from 'mongoose'

async function bootstrap() {
    mongoose.Schema.Types.String.checkRequired((v) => v != null)
    const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	app.use(cookieParser())
	app.enableCors({
		origin: ['http://localhost:3000', 'https://www.galstejaruldacilor.md'],
		credentials: true,
		exposedHeaders: ['set-cookie'],
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
		optionsSuccessStatus: 200
	})

	const config = new DocumentBuilder()
		.setTitle('GAL Backend API')
		.setDescription('The GAL Backend API documentation')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: 'Enter JWT token', 
				in: 'header'
			},
			'JWT-auth'
		)
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/docs', app, document, {
		swaggerOptions: {
			persistAuthorization: true
		},
		customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
		customJs: [
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js'
		]
	})

	await app.listen(process.env.PORT || 4200)
	console.log(`Application is running on port ${process.env.PORT || 4200}`)
}
bootstrap()
