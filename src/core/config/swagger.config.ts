import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('Personal Template Nestjs API')
        .setDescription('Business Opportunity Match API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Compter toutes les méthodes (GET, POST, PUT, DELETE, etc.)
    const apiCount = Object.values(document.paths)
        .reduce((count, path: any) => count + Object.keys(path).length, 0);

    SwaggerModule.setup('api/docs', app, document);

    // 👉 Afficher le log en dernier
    setTimeout(() => {
        Logger.log(`🚀 Nombre total d'APIs : ${apiCount}`, 'Swagger');
    }, 0);
}
