import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  serveRoot(@Res() res: Response) {
    const indexPath = join(__dirname, 'frontend', 'browser', 'index.html');
    return res.sendFile(indexPath);
  }

  @Get('*path')
  serveSpa(@Res() res: Response) {
    const indexPath = join(__dirname, 'frontend', 'browser', 'index.html');
    return res.sendFile(indexPath);
  }
}
