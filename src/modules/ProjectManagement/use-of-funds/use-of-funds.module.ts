import { Module } from '@nestjs/common';
import { UseOfFundsService } from './use-of-funds.service';
import { UseOfFundsController } from './use-of-funds.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [UseOfFundsController],
    providers: [UseOfFundsService, PrismaClient],
    exports: [UseOfFundsService]
})
export class UseOfFundsModule {}
