import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  serveRoot(@Res() res: Response) {
    return res.sendFile(
      join(__dirname, 'frontend', 'browser', 'index.html'),
    );
  }

  @Get('*')
  serveSPA(@Res() res: Response) {
    return res.sendFile(
      join(__dirname, 'frontend', 'browser', 'index.html'),
    );
  }
}
