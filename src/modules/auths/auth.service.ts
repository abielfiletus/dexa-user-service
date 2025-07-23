import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Model } from 'mongoose';
import { EMPLOYEE, HR } from '../../shared/constant/role.constant';
import { EmployeesService } from '../employees/employees.service';
import { LoginDto } from './dto/login.dto';
import { Token } from './schemas/token.schemas';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>,
    private readonly employeeService: EmployeesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly jwtSecret = this.configService.get<string>('JWT_SECRET');

  async employeeLogin(payload: LoginDto) {
    const { email } = payload;
    payload.role = 'employee';

    const exist = await this._validateUserAndPassword(payload);

    const token = await this.jwtService.signAsync(
      { email, role: EMPLOYEE },
      { secret: this.jwtSecret },
    );

    await this.tokenModel.create({
      identifier: email,
      expiredAt: dayjs().add(1, 'days'),
      token,
    });

    delete exist.password;

    return { employee: exist, token };
  }

  async hrLogin(payload: LoginDto) {
    const { email } = payload;
    payload.role = 'hr';

    const exist = await this._validateUserAndPassword(payload);

    const token = await this.jwtService.signAsync({ email, role: HR }, { secret: this.jwtSecret });

    await this.tokenModel.create({
      identifier: email,
      expiredAt: dayjs().add(1, 'days'),
      token,
    });

    delete exist.password;

    return { employee: exist, token };
  }

  async logout(token: string) {
    if (!token) {
      throw new HttpException('Token tidak ditemukan', HttpStatus.UNAUTHORIZED);
    }

    await this.tokenModel.findOneAndDelete({ token }).exec();

    return 'Successfully logged out';
  }

  private async _validateUserAndPassword(payload: LoginDto) {
    const { password, email } = payload;

    const exist = await this.employeeService.getByEmail(email);

    if (!exist) {
      throw new HttpException({ email: 'Email tidak ditemukan' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    if (!bcrypt.compareSync(password, exist.password)) {
      throw new HttpException(
        { password: 'Password tidak sesuai' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return exist.toJSON();
  }
}
