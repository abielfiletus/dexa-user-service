import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { lookupService } from 'dns';
import { Model } from 'mongoose';
import { Token } from '../../modules/auths/schemas/token.schemas';
import {
  InternalAccessMethod,
  META_INTERNAL_ACCESS,
} from '../decorators/internal-access.decorator';
import { META_SKIP_AUTH } from '../decorators/public-access.decorator';
import { META_ROLE_ACCESS } from '../decorators/role-access.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>,
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly appPort = this.configService.get<number>('PORT');
  private readonly secretKey = this.configService.get<string>('JWT_KEY');
  private readonly internalUrls = this.configService.get<string>('INTERNAL_URLS')?.split(',');

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(META_SKIP_AUTH, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (isPublic) return true;

    const roleAccess = this.reflector.getAllAndOverride<string[]>(META_ROLE_ACCESS, [
      context.getClass(),
      context.getHandler(),
    ]);

    const internalAccess = this.reflector.getAllAndOverride<InternalAccessMethod>(
      META_INTERNAL_ACCESS,
      [context.getClass(), context.getHandler()],
    );

    const request = context.switchToHttp().getRequest();

    if (internalAccess) {
      const checkResult = await this._internalAccessCheck(request, internalAccess);

      if (checkResult) return checkResult;
    }

    const { headers } = request;
    const [type, token] = headers?.authorization?.split(' ') || [];

    if (type !== 'Bearer') return false;

    let role = '';
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.secretKey,
        });

        role = payload.role;
        request['user'] = payload;
      } catch {
        throw new UnauthorizedException();
      }
    }

    await this._validateToken(token);

    if (roleAccess) {
      console.log({ roleAccess, role });
      return roleAccess.some((item) => item === role);
    }

    return true;
  }

  private async _validateToken(token: string) {
    const check = await this.tokenModel.findOne({ token }).lean().exec();

    if (!check) {
      throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
    }
  }

  private async _internalAccessCheck(request: Record<string, any>, method: InternalAccessMethod) {
    if (!this.internalUrls?.length || !this.appPort) return;

    const remoteIp = request.socket.remoteAddress;
    const pass = (await new Promise((resolve, reject) => {
      lookupService(remoteIp, this.appPort, (err, host) => {
        if (err) reject(err);

        host = host === 'localhost' ? `localhost:${this.appPort}` : host;
        if (!new RegExp(this.internalUrls.join('|')).test(host)) resolve(false);

        resolve(true);
      });
    })) as boolean;

    if (!pass) {
      if (method === InternalAccessMethod.STRICT) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    }

    return pass;
  }
}
