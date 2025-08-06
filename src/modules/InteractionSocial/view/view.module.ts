import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { ViewController } from './view.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { CounterService } from '../../../core/common/services/counter.service';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [ViewController],
    providers: [
        ViewService,
        PrismaService,
        {
            provide: CounterService,
            useFactory: (prisma: PrismaService) => new CounterService(prisma),
            inject: [PrismaService]
        }
    ],
    exports: [ViewService]
})
export class ViewModule {}
