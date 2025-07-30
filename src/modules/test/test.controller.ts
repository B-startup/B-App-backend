import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';

@ApiTags('Test')
@Controller('test')
export class TestController {
    @Get('upload-postmedia')
    @ApiOperation({ 
        summary: 'Page de test pour upload de PostMedia',
        description: '⚠️ Development only - Remove in production'
    })
    @ApiResponse({ status: 200, description: 'Page de test chargée avec succès' })
    getUploadTestPage(@Res() res: Response) {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({ message: 'Not found' });
        }
        
        return res.sendFile(join(process.cwd(), 'public', 'test', 'upload-postmedia.html'));
    }
}
