import { Status } from '@grpc/grpc-js/build/src/constants';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class JwtGrpcGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const call = context.switchToRpc().getContext();

      const metadata = call.internalRepr;

      const authHeader = metadata.get('authorization')[0];

      const token = authHeader.split(' ')[1];

      const user = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      // call.setUser(user);
      const req = context.switchToRpc().getData();
      req.user = user;

      return true;
    } catch (e) {
      throw new RpcException({ code: Status.UNAUTHENTICATED });
    }
  }
}
