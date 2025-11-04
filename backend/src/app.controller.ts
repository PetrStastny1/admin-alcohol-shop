import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  serveFrontend(@Res() res: Response) {
    const indexPath = join(__dirname, '..', 'frontend', 'dist', 'frontend', 'browser', 'index.html');
    res.sendFile(indexPath);
  }
}
