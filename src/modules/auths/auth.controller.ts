import { Controller, Post, Body, Req } from '@nestjs/common';
import { Public } from '../../shared/decorators/public-access.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('employee-login')
  employeeLogin(@Body() payload: LoginDto) {
    return this.authService.employeeLogin(payload);
  }

  @Post('hr-login')
  hrLogin(@Body() payload: LoginDto) {
    return this.authService.hrLogin(payload);
  }

  @Post()
  logout(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(token);
  }
}
