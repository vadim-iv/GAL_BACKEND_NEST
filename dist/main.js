"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("mongoose");
async function bootstrap() {
    mongoose_1.default.Schema.Types.String.checkRequired((v) => v != null);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'https://www.galstejaruldacilor.md',
            'https://gal-frontend.vercel.app'
        ],
        credentials: true,
        exposedHeaders: ['set-cookie'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        optionsSuccessStatus: 200
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('GAL Backend API')
        .setDescription('The GAL Backend API documentation')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header'
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true
        },
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js'
        ]
    });
    await app.listen(process.env.PORT || 4200);
    console.log(`Application is running on port ${process.env.PORT || 4200}`);
}
bootstrap();
//# sourceMappingURL=main.js.map